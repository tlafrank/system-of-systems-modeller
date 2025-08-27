# Database
- Init scripts: `sql/` run once on fresh volume.
- Migrations: add numbered SQL files; record in `schema_migrations` table.
- Dev reset: `docker compose down -v && docker compose up -d` (destroys data).
