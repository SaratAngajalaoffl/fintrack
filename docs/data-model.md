# Data model (Fintrack)

Domain shapes evolve with migrations and APIs. This document tracks **planned and current** structures so agents and contributors stay aligned.

## Bank accounts

Users configure **bank accounts** as the top-level container for liquid balances. Each account has a running **balance** (seeded from an **initial balance** at creation and updated as transactions post).

> Status: implemented in migration `004_bank_accounts.sql` (`bank_accounts`, `bank_account_buckets`, enum `bank_account_type`).

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

## Buckets (virtual divisions)

**Buckets** subdivide an account’s balance for planning (e.g. “iPhone purchase”, “Bangkok trip”, “Tax”). They do not represent separate bank accounts; allocations sum within the parent account.

| Field / concept             | Type / notes                                                |
| --------------------------- | ----------------------------------------------------------- |
| `id`                        | Primary key                                                 |
| `bank_account_id`           | FK to bank account                                          |
| `user_id`                   | Denormalized or implied via account — align with RLS policy |
| `name`                      | Label shown as chips in the accounts table                  |
| `allocated_amount`          | Optional numeric cap or assigned amount (product rules TBD) |
| `created_at` / `updated_at` | Audit                                                       |

Relationship: **one bank account → many buckets**. Deleting an account should cascade or block per product rules (TBD).

## List / filter / sort (UI ↔ API)

The bank accounts list page uses query parameters (server-rendered):

| Param  | Meaning                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| `q`    | Search across name, description, and bucket names                                                            |
| `type` | `savings` \| `current` — omit or `all` for no filter                                                         |
| `sort` | `name`, `-name`, `balance`, `-balance`, `credits`, `-credits`, `debits`, `-debits` — `-` prefix = descending |

Future REST or server actions should accept equivalent filters for consistency.

## User profiles

Per-user profile details are stored separately from auth credentials and are loaded globally for app UI.

> Status: implemented in migration `005_user_profiles.sql` (`user_profiles`).

| Field / concept             | Type / notes                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| `user_id`                   | UUID PK + FK to `users(id)`                                              |
| `name`                      | Required display name                                                    |
| `preferred_currency`        | Required 3-letter ISO currency code (current UI supports a curated list) |
| `created_at` / `updated_at` | Standard audit columns                                                   |
