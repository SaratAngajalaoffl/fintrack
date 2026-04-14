# Data model (Fintrack)

Domain shapes evolve with migrations and APIs. This document tracks **planned and current** structures so agents and contributors stay aligned.

## Bank accounts

Users configure **bank accounts** as the top-level container for liquid balances. Each account has a running **balance** (seeded from an **initial balance** at creation and updated as transactions post).

> Status: implemented in migrations `004_bank_accounts.sql` (`bank_accounts`, enum `bank_account_type`) and `012_bank_account_preferred_category_links.sql` (`bank_account_preferred_categories`).

| Field / concept             | Type / notes                                                                 |
| --------------------------- | ---------------------------------------------------------------------------- |
| `id`                        | UUID (or bigint), primary key                                                |
| `user_id`                   | FK to auth user — accounts are per user                                      |
| `name`                      | Short label (e.g. “Primary checking”)                                        |
| `description`               | Optional longer text                                                         |
| `account_type`              | Enum: `savings`, `current` (maps to UI “Savings” / “Current”)                |
| `balance`                   | Numeric — current balance (displayed in the user profile preferred currency) |
| `initial_balance`           | Set once at creation; seeds `balance`                                        |
| `last_debit_at`             | `timestamptz`, nullable — last time a debit posted                           |
| `last_credit_at`            | `timestamptz`, nullable — last time a credit posted                          |
| `created_at` / `updated_at` | Standard audit columns                                                       |

**Rollups (derivable or stored):** “Credits this month” and “Debits this month” are aggregates over transactions scoped to the account and current calendar month; initial UI uses placeholder values until a `transactions` (or ledger) model exists.

## Fund buckets

**Fund buckets** are savings goals tied to a bank account (replacing the legacy `bank_account_buckets` table). Allocated amounts stay **locked** and reduce spendable balance conceptually until the bucket is unlocked.

> Status: implemented in migrations `013_fund_buckets.sql` (`fund_buckets`, enum `fund_bucket_priority`) and `014_drop_bank_account_buckets.sql` (drops legacy `bank_account_buckets`).

| Field / concept             | Type / notes                                                                 |
| --------------------------- | ---------------------------------------------------------------------------- |
| `id`                        | UUID primary key                                                             |
| `user_id`                   | FK to `users(id)`; buckets are per user                                      |
| `name`                      | Bucket name (unique per user + bank account)                                 |
| `target_amount`             | Numeric amount goal (> 0)                                                    |
| `bank_account_id`           | FK to `bank_accounts(id)`                                                    |
| `current_value`             | Numeric amount currently allocated/locked (>= 0)                             |
| `is_locked`                 | Boolean lock state; `TRUE` keeps amount reserved, `FALSE` makes it spendable |
| `priority`                  | Enum `fund_bucket_priority`: `high`, `medium`, `low`                         |
| `created_at` / `updated_at` | Standard audit columns                                                       |

Behavioral rules currently implemented by API/service:

- Allocation is only allowed while `is_locked = TRUE`.
- Allocation cannot exceed available account balance after considering other locked buckets on the same bank account.
- Unlock is only allowed once `current_value >= target_amount`.

Preferred category mapping is normalized in a many-to-many table:

| Table                               | Fields / notes                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| `bank_account_preferred_categories` | `bank_account_id` FK, `expense_category_id` FK, `user_id` FK, `created_at`, composite PK pair |

Relationship: **one bank account ↔ many expense categories**, and **one expense category ↔ many bank accounts**.

## List / filter / sort (UI ↔ API)

The bank accounts list page uses query parameters (server-rendered):

| Param  | Meaning                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| `q`    | Search across name, description, and fund bucket names                                                       |
| `type` | `savings` \| `current` — omit or `all` for no filter                                                         |
| `sort` | `name`, `-name`, `balance`, `-balance`, `credits`, `-credits`, `debits`, `-debits` — `-` prefix = descending |

Future REST or server actions should accept equivalent filters for consistency.

## Credit cards

Users can manage **credit cards** with balances, category preferences, and billing-cycle settings.

> Status: implemented in migrations `006_credit_cards.sql` (`credit_cards`), `009_credit_card_preferred_category_links.sql` (`credit_card_preferred_categories`), `010_credit_card_bills.sql` (`credit_card_bills`), and `011_drop_credit_cards_preferred_categories.sql` (drops legacy array column).

| Field / concept             | Type / notes                           |
| --------------------------- | -------------------------------------- |
| `id`                        | UUID primary key                       |
| `user_id`                   | FK to `users(id)`; cards are per user  |
| `name`                      | Credit card display name               |
| `description`               | Optional long-form notes               |
| `max_balance`               | Numeric credit limit                   |
| `used_balance`              | Numeric amount currently used          |
| `locked_balance`            | Numeric amount temporarily locked/held |
| `bill_generation_day`       | Integer day of month (1-31)            |
| `bill_due_day`              | Integer day of month (1-31)            |
| `created_at` / `updated_at` | Standard audit columns                 |

Preferred category mapping is normalized in a many-to-many table:

| Table                              | Fields / notes                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `credit_card_preferred_categories` | `credit_card_id` FK, `expense_category_id` FK, `user_id` FK, `created_at`, composite PK pair |

Relationship: **one credit card ↔ many expense categories**, and **one expense category ↔ many credit cards**.

Credit-card bills are normalized in a dedicated one-to-many table:

| Table               | Fields / notes                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `credit_card_bills` | `id`, `user_id`, `credit_card_id`, `bill_generation_date`, `bill_due_date`, `bill_pdf_url`, `is_bill_paid`, `bill_payment_date`, audit fields |

Relationship: **one credit card → many bills**. The latest bill (by `bill_generation_date`) is used for dashboard billing timeline status.

The dashboard shows:

- Number of cards
- Total balance (`max_balance` sum)
- Total usage (`used_balance` sum)
- Total locked (`locked_balance` sum)

## Expense categories

Users can define personal **expense categories** that power future transaction tagging and reporting.

> Status: implemented in migration `007_expense_categories.sql` (`expense_categories`).

| Field / concept             | Type / notes                                                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                        | UUID primary key (auto-generated)                                                                                                                                             |
| `user_id`                   | FK to `users(id)`; categories are per user                                                                                                                                    |
| `name`                      | Category name (unique per user)                                                                                                                                               |
| `description`               | Optional description text                                                                                                                                                     |
| `icon_url`                  | URL/link to icon asset                                                                                                                                                        |
| `color`                     | One selected Catppuccin Mocha accent: `rosewater`, `flamingo`, `pink`, `mauve`, `red`, `maroon`, `peach`, `yellow`, `green`, `teal`, `sky`, `sapphire`, `blue`, or `lavender` |
| `created_at` / `updated_at` | Standard audit columns                                                                                                                                                        |

## User profiles

Per-user profile details are stored separately from auth credentials and are loaded globally for app UI.

> Status: implemented in migration `005_user_profiles.sql` (`user_profiles`).

| Field / concept             | Type / notes                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| `user_id`                   | UUID PK + FK to `users(id)`                                              |
| `name`                      | Required display name                                                    |
| `preferred_currency`        | Required 3-letter ISO currency code (current UI supports a curated list) |
| `created_at` / `updated_at` | Standard audit columns                                                   |
