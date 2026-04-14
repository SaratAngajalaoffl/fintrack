#!/bin/sh
set -e

PGHOST="${PGHOST:-postgres}"
export PGPASSWORD="${PGPASSWORD:-}"

echo "Waiting for PostgreSQL at ${PGHOST}..."
until pg_isready -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" >/dev/null 2>&1; do
  sleep 1
done

echo "Ensuring migration tracking table exists..."
psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -v ON_ERROR_STOP=1 <<'EOSQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
EOSQL

applied=0
skipped=0
for f in $(find /migrations -maxdepth 1 -name '*.sql' -type f 2>/dev/null | sort); do
  [ -f "$f" ] || continue
  version=$(basename "$f")
  exists=$(psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -tAc \
    "SELECT 1 FROM schema_migrations WHERE version = '$version' LIMIT 1" || true)
  if [ "$exists" = "1" ]; then
    echo "Skip (already applied): $version"
    skipped=$((skipped + 1))
    continue
  fi
  echo "Applying: $version"
  psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -v ON_ERROR_STOP=1 -f "$f"
  psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -v ON_ERROR_STOP=1 -c \
    "INSERT INTO schema_migrations (version) VALUES ('$version')"
  applied=$((applied + 1))
done

echo "Migrations finished (applied: $applied, skipped: $skipped)."

seed_file="/seed-data/postgres_seed_data.json"
if [ ! -f "$seed_file" ]; then
  echo "Seed file not found at $seed_file. Skipping seed step."
  exit 0
fi

echo "Checking whether database already has data..."
existing_rows=$(psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -tAc "
SELECT
  (SELECT COUNT(*) FROM users)
  + (SELECT COUNT(*) FROM user_profiles)
  + (SELECT COUNT(*) FROM bank_accounts)
  + (SELECT COUNT(*) FROM bank_account_buckets)
  + (SELECT COUNT(*) FROM credit_cards)
  + (SELECT COUNT(*) FROM credit_card_bills)
  + (SELECT COUNT(*) FROM expense_categories);
")

if [ "$existing_rows" != "0" ]; then
  echo "Database already has data ($existing_rows rows across app tables). Skipping seed."
  exit 0
fi

echo "No existing app data found. Seeding from $seed_file ..."
seed_json=$(tr -d '\n' < "$seed_file")

psql -h "$PGHOST" -U "${PGUSER:-postgres}" -d "${PGDATABASE:-postgres}" -v ON_ERROR_STOP=1 -v seed_json="$seed_json" <<'EOSQL'
BEGIN;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO users (id, email, password_hash, is_approved, created_at, updated_at)
SELECT
  (doc->'user'->>'id')::uuid,
  lower(doc->'user'->>'email'),
  doc->'user'->>'passwordHash',
  COALESCE((doc->'user'->>'isApproved')::boolean, false),
  (doc->'user'->>'createdAt')::timestamptz,
  (doc->'user'->>'updatedAt')::timestamptz
FROM payload
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  is_approved = EXCLUDED.is_approved,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO user_profiles (user_id, name, preferred_currency, created_at, updated_at)
SELECT
  (doc->'userProfile'->>'user_id')::uuid,
  doc->'userProfile'->>'name',
  doc->'userProfile'->>'preferred_currency',
  (doc->'userProfile'->>'created_at')::timestamptz,
  (doc->'userProfile'->>'updated_at')::timestamptz
FROM payload
WHERE doc ? 'userProfile' AND doc->'userProfile' IS NOT NULL
ON CONFLICT (user_id) DO UPDATE
SET
  name = EXCLUDED.name,
  preferred_currency = EXCLUDED.preferred_currency,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO bank_accounts (
  id, user_id, name, description, account_type, initial_balance, balance,
  last_debit_at, last_credit_at, created_at, updated_at
)
SELECT
  (row->>'id')::uuid,
  (row->>'user_id')::uuid,
  row->>'name',
  COALESCE(row->>'description', ''),
  (row->>'account_type')::bank_account_type,
  COALESCE((row->>'initial_balance')::numeric, 0),
  COALESCE((row->>'balance')::numeric, 0),
  NULLIF(row->>'last_debit_at', '')::timestamptz,
  NULLIF(row->>'last_credit_at', '')::timestamptz,
  (row->>'created_at')::timestamptz,
  (row->>'updated_at')::timestamptz
FROM payload, jsonb_array_elements(COALESCE(doc->'bankAccounts', '[]'::jsonb)) AS row
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  account_type = EXCLUDED.account_type,
  initial_balance = EXCLUDED.initial_balance,
  balance = EXCLUDED.balance,
  last_debit_at = EXCLUDED.last_debit_at,
  last_credit_at = EXCLUDED.last_credit_at,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO bank_account_buckets (
  id, bank_account_id, user_id, name, allocated_amount, created_at, updated_at
)
SELECT
  (row->>'id')::uuid,
  (row->>'bank_account_id')::uuid,
  (row->>'user_id')::uuid,
  row->>'name',
  COALESCE((row->>'allocated_amount')::numeric, 0),
  (row->>'created_at')::timestamptz,
  (row->>'updated_at')::timestamptz
FROM payload, jsonb_array_elements(COALESCE(doc->'bankAccountBuckets', '[]'::jsonb)) AS row
ON CONFLICT (id) DO UPDATE
SET
  bank_account_id = EXCLUDED.bank_account_id,
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  allocated_amount = EXCLUDED.allocated_amount,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO credit_cards (
  id, user_id, name, description, max_balance, used_balance, locked_balance,
  preferred_categories, bill_generation_day, bill_due_day,
  created_at, updated_at
)
SELECT
  (row->>'id')::uuid,
  (row->>'user_id')::uuid,
  row->>'name',
  COALESCE(row->>'description', ''),
  COALESCE((row->>'max_balance')::numeric, 0),
  COALESCE((row->>'used_balance')::numeric, 0),
  COALESCE((row->>'locked_balance')::numeric, 0),
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(row->'preferred_categories')), ARRAY[]::text[]),
  (row->>'bill_generation_day')::smallint,
  (row->>'bill_due_day')::smallint,
  (row->>'created_at')::timestamptz,
  (row->>'updated_at')::timestamptz
FROM payload, jsonb_array_elements(COALESCE(doc->'creditCards', '[]'::jsonb)) AS row
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_balance = EXCLUDED.max_balance,
  used_balance = EXCLUDED.used_balance,
  locked_balance = EXCLUDED.locked_balance,
  preferred_categories = EXCLUDED.preferred_categories,
  bill_generation_day = EXCLUDED.bill_generation_day,
  bill_due_day = EXCLUDED.bill_due_day,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO credit_card_bills (
  id, user_id, credit_card_id, bill_generation_date, bill_due_date,
  bill_pdf_url, is_bill_paid, bill_payment_date, created_at, updated_at
)
SELECT
  (row->>'id')::uuid,
  (row->>'user_id')::uuid,
  (row->>'credit_card_id')::uuid,
  (row->>'bill_generation_date')::date,
  (row->>'bill_due_date')::date,
  NULLIF(row->>'bill_pdf_url', ''),
  COALESCE((row->>'is_bill_paid')::boolean, false),
  NULLIF(row->>'bill_payment_date', '')::date,
  (row->>'created_at')::timestamptz,
  (row->>'updated_at')::timestamptz
FROM payload, jsonb_array_elements(COALESCE(doc->'creditCardBills', '[]'::jsonb)) AS row
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  credit_card_id = EXCLUDED.credit_card_id,
  bill_generation_date = EXCLUDED.bill_generation_date,
  bill_due_date = EXCLUDED.bill_due_date,
  bill_pdf_url = EXCLUDED.bill_pdf_url,
  is_bill_paid = EXCLUDED.is_bill_paid,
  bill_payment_date = EXCLUDED.bill_payment_date,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO expense_categories (
  id, user_id, name, description, icon_url, color, created_at, updated_at
)
SELECT
  (row->>'id')::uuid,
  (row->>'user_id')::uuid,
  row->>'name',
  COALESCE(row->>'description', ''),
  row->>'icon_url',
  row->>'color',
  (row->>'created_at')::timestamptz,
  (row->>'updated_at')::timestamptz
FROM payload, jsonb_array_elements(COALESCE(doc->'expenseCategories', '[]'::jsonb)) AS row
ON CONFLICT (id) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  color = EXCLUDED.color,
  updated_at = EXCLUDED.updated_at;

WITH payload AS (
  SELECT :'seed_json'::jsonb AS doc
)
INSERT INTO credit_card_preferred_categories (
  credit_card_id,
  expense_category_id,
  user_id
)
SELECT
  (card_row->>'id')::uuid,
  ec.id,
  (card_row->>'user_id')::uuid
FROM payload,
     jsonb_array_elements(COALESCE(doc->'creditCards', '[]'::jsonb)) AS card_row
JOIN expense_categories ec
  ON ec.user_id = (card_row->>'user_id')::uuid
 AND ec.name = ANY(
   COALESCE(
     ARRAY(SELECT jsonb_array_elements_text(card_row->'preferred_categories')),
     ARRAY[]::text[]
   )
 )
ON CONFLICT (credit_card_id, expense_category_id) DO NOTHING;

COMMIT;
EOSQL

echo "Seed completed from $seed_file."
