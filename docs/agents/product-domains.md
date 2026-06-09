## Product

**Fintrack** is a responsive personal finance web app (Next.js). Core domains will include accounts, transactions, categories, and reporting — implement incrementally; keep changes scoped to the task.

### Domain: bank accounts

- **Routes:** `/dashboard/bank-accounts/my-bank-accounts` (**My Bank Accounts**) and `/dashboard/bank-accounts/statements` (**Bank Statements**). Keep `/dashboard/bank-accounts` as a redirect-only compatibility route.
- **Code:** Domain types, URL state parsing, and mock rows live under **`web/src/lib/bank-accounts/`**. Composed screen UI lives under **`web/src/components/ui/bank-accounts/`**. Shared primitives for this area: **`ChipComponent`** (`web/src/components/ui/common/chip/`) and **`TableComponent`** (`web/src/components/ui/common/table-component/`) — export from `@/components/ui`.
- **API:** **`GET`/`POST /api/bank-accounts`**, **`GET`/`PATCH`/`DELETE /api/bank-accounts/:id`** — implemented in **`api/`**; **`getApiRoute()`** (see **`web/src/configs/api-routes.ts`**). Client helpers: **`web/src/services/bank-accounts/bank-accounts-api.ts`**.
- **Persistence:** Core account settings live in `bank_accounts`; preferred categories are normalized in `bank_account_preferred_categories` (migration `012_bank_account_preferred_category_links.sql`). Planned/implemented fields are documented in **[docs/api/data-model.md](../api/data-model.md)**. Update that file when migrations or API shapes change.

### Domain: credit cards

- **Routes:** `/dashboard/credit-cards/my-credit-cards` (**My Credit Cards**) and `/dashboard/credit-cards/bills` (**Credit Card Bills**). Keep `/dashboard/credit-cards` as a redirect-only compatibility route.
- **Code:** Domain types and list URL state live under **`web/src/lib/credit-cards/`**. Composed screen UI lives under **`web/src/components/ui/credit-cards/`**.
- **API:** **`GET`/`POST /api/credit-cards`**, **`GET`/`PATCH`/`DELETE /api/credit-cards/:id`** — implemented in **`api/`**; **`getApiRoute()`**. Client helpers: **`web/src/services/credit-cards/credit-cards-api.ts`**.
- **Persistence:** Core card settings live in `credit_cards`; preferred categories are normalized in **`credit_card_preferred_categories`** (migration `009_credit_card_preferred_category_links.sql`); bill records are normalized in **`credit_card_bills`** (migration `010_credit_card_bills.sql`). Do not reintroduce `preferred_categories` or `previous_bill_*` fields on `credit_cards`.

### Domain: expense categories

- **Routes:** `/dashboard/organisation/expense-categories` (**Expense Categories**).
- **Code:** Types and UI live under **`web/src/lib/expense-categories/`** and **`web/src/components/ui/expense-categories/`**.
- **API:** **`GET`/`POST /api/expense-categories`**, **`GET`/`PATCH`/`DELETE /api/expense-categories/:id`** — implemented in **`api/`**; **`getApiRoute()`**. Client helpers: **`web/src/services/expense-categories/expense-categories-api.ts`**. Allowed **`color`** tokens match **`CATPPUCCIN_MOCHA_COLOR_OPTIONS`** in **`web/src/lib/expense-categories/types.ts`** (and DB check in migration `008_expense_category_colors_palette.sql`).

### Domain: fund buckets

- **Routes:** `/dashboard/organisation/fund-buckets` (**Fund Buckets**).
- **Code:** Domain types live under **`web/src/lib/fund-buckets/`**.
- **API:** **`/api/fund-buckets`** (`GET`/`POST`) and **`/api/fund-buckets/:id/allocate`**, **`unlock`**, **`priority`** — implemented in **`api/`**; **`getApiRoute()`**. Client: **`web/src/services/fund-buckets/fund-buckets-api.ts`**.
- **Persistence:** Fund buckets live in **`fund_buckets`** (migration `013_fund_buckets.sql`) with lock state (`is_locked`), progress (`current_value`), and priority (`high`/`medium`/`low`).

### Dashboard navigation map

- **Bank Accounts:** `/dashboard/bank-accounts/my-bank-accounts` (My Bank Accounts), `/dashboard/bank-accounts/statements` (Bank Statements).
- **Credit Cards:** `/dashboard/credit-cards/my-credit-cards` (My Credit Cards), `/dashboard/credit-cards/bills` (Credit Card Bills).
- **Expenses:** `/dashboard/expenses/my-expenses` (My Expenses), `/dashboard/expenses/emis` (EMIs), `/dashboard/expenses/loans` (Loans).
- **Receivables:** `/dashboard/receivables/income` (Income), `/dashboard/receivables/lending` (Lending).
- **Transactions:** `/dashboard/transactions/internal` (Internal), `/dashboard/transactions/credits` (Credits), `/dashboard/transactions/debits` (Debits).
- **Organisation:** `/dashboard/organisation/expense-categories` (Expense Categories), `/dashboard/organisation/fund-buckets` (Fund Buckets), `/dashboard/organisation/expense-groups` (Expense Groups).
