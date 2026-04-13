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
