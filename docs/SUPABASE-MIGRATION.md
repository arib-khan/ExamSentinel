# MySQL -> Supabase (PostgreSQL)

1. `npm install pg`
2. Copy `config/db.js` over `config/db.js` (drop-in: models keep their `?` / `SET ?` queries, nothing else changes).
3. In `models/studentsAnswer.js` replace `const mysql = require("mysql2");` with `const mysql = { escape: pool.escape };` (it only uses `mysql.escape`).
4. `.env`:  `DATABASE_URL=postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres`
   (Supabase > Connect > **Session pooler**; the direct host is IPv6-only and often fails on Windows).
5. Copy `scripts/migrate-mysql-to-supabase.js`, then: `node scripts/migrate-mysql-to-supabase.js --schema-only` (review the generated .sql), then `node scripts/migrate-mysql-to-supabase.js` (add `--drop` to redo).
   It reads your local MySQL (`MYSQL_HOST/PORT/USER/PASSWORD/DATABASE`, defaults root/root/onlinexam), creates tables, copies rows in FK order inside ONE transaction (all-or-nothing), restores auto-increment counters, FKs, indexes, ON UPDATE triggers, and turns Row Level Security on for every table.
6. It also writes `config/columnCase.json` (keep it: Postgres lowercases `NegativeMark`; the shim maps it back).

Behaviour differences to know: text comparison is case-SENSITIVE in Postgres (MySQL was not), so log in with the exact stored case; tinyint stays numeric 0/1; queries relying on MySQL's loose GROUP BY may need a tweak.
