## Database and migrations

- Add new SQL files as `api/migrations/00x_description.sql` (lexicographic order).
- The **Go API** records each filename in **`schema_migrations`** (same as the historical shell runner). Do not rename applied files without a deliberate migration strategy.
- Keep Postgres-specific SQL portable enough for your deployment target; avoid app-only logic in SQL unless necessary.
