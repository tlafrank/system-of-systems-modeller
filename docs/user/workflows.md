# Workflows

## 1) Development
- App runs locally with `npm run dev` (nodemon).
- DB runs via Docker: `docker compose up db`.
- `.env.development` used; never production secrets.

## 2) Packaging
- Build image locally: `docker build -t sosm-app:<ver> ./www`
- (Air-gapped) Save/load: `docker save -o sosm-app-<ver>.tar sosm-app:<ver>`

## 3) Database sanitisation
- Dump prod: `mysqldump ... > prod.sql`
- Sanitize: run `tools/sanitize.sql` (masks names, emails, tokens).
- Import to staging: `mysql ... < prod_sanitized.sql`

## 4) Updates
- Back up DB.
- Deploy new app:
  - Build or load new image
  - `docker compose up -d`
- Apply migrations: `docker compose exec app node tools/migrate.js` (or SQL)
