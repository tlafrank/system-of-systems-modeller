
# Run SOSM

This guide collects the **day‑to‑day commands** you’ll use to run, monitor, and troubleshoot the SOSM server and database in dev. It covers both **Docker** and **bare‑Node** workflows.

> Paths below assume you’re at the repo root (the folder that contains `docker-compose.yaml`, `www/`, `scripts/`, and `sql/`).

---

## 0) One‑time setup

- Create your `.env` from the example (optional, the compose file has sane defaults):
  ```bash
  cp .env.example .env
  # Edit values if desired: DB_NAME, DB_USER, DB_PASS, DB_ROOT_PASS, APP_PORT
  ```

- (First run only) the database will auto‑initialise from `./sql/*.sql` via MySQL’s init hook **on a fresh volume**.

---

## 1) Run via Docker (recommended)

### Start (foreground)
```bash
docker compose up
```

### Start (detached)
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

### Rebuild images (after Dockerfile/package changes)
```bash
docker compose build
docker compose up -d
```

### Nuke + re‑init DB volume (⚠️ destroys data)
```bash
docker compose down -v
docker volume ls           # confirm the db volume name if needed
docker compose up -d       # db will re‑seed from ./sql on fresh volume
```

### What’s running?
```bash
docker compose ps
docker ps
```

### Logs
```bash
# tail everything
docker compose logs -f

# service‑specific
docker compose logs -f db
docker compose logs -f adminer
docker compose logs -f www   # if your app service is named "www" in compose
```

> Adminer (optional DB UI) is at **http://localhost:8080** once up. The app listens on **http://localhost:${APP_PORT:-3000}** (default 3000).

---

## 2) Run bare‑Node (without Docker)

This is useful when you want quick, local edits against a running MySQL (dockerised or local).

```bash
# install dependencies
npm --prefix ./www ci

# run once
node ./www/app.js

# or hot‑reload with nodemon (installed as a dependency)
npx nodemon ./www/app.js
```

> Ensure your `.env` (or hard‑coded settings) match how MySQL is reachable. If you’re using the dockerised DB, keep `docker compose up db` running.

---

## 3) Database: common commands

### Shell into the MySQL container
```bash
docker compose exec db bash
```

### MySQL CLI as root
```bash
docker compose exec db mysql -uroot -p${DB_ROOT_PASS:-rootpass}
```

### MySQL CLI as app user
```bash
docker compose exec db mysql -u${DB_USER:-sosmUser} -p${DB_PASS:-sosm_pass} ${DB_NAME:-db_sosm}
```

### Basic MySQL checks
```sql
SHOW DATABASES;
USE db_sosm;
SHOW TABLES;
SELECT COUNT(*) FROM systems LIMIT 1;
```

### Import a dump into the running DB
```bash
# from host terminal (example file under testData/):
docker compose exec -T db sh -c 'mysql -u${DB_USER:-sosmUser} -p${DB_PASS:-sosm_pass} ${DB_NAME:-db_sosm}' < testData/testData.sql
```

### Export a dump from the running DB
```bash
docker compose exec db sh -c 'mysqldump -u${DB_USER:-sosmUser} -p${DB_PASS:-sosm_pass} ${DB_NAME:-db_sosm}' > backup.sql
```

---

## 4) Useful scripts in `/scripts`

> Run from repo root: `bash scripts/<script>.sh`

- `setupEnvironment.sh` – installs server prerequisites (Node, Docker, etc.) on a fresh dev machine.
- `deploySOSM.sh` – prompts to install npm packages in `www/` and sets up a dev server workflow.
- `deployTestData.sh` – loads example/test data into the database.
- `backupTestData.sh` – backs up `/www/images` to `/testData/images` and DB to `/testData/testData.sql`.
- `deployRawSchema.sh` – deploy schema only (no data).

(See each script for prompts/assumptions; some actions are interactive.)

---

## 5) Images & backups via the app

- `GET /backup.txt` – generates SQL insert statements to replicate current DB contents.
- `GET /images.json` – lists images available to the app.
- `/www/assets`, `/www/images` – app‑served static assets.

> With Docker: `curl http://localhost:3000/backup.txt`

---

## 6) Health & monitoring

### Container health
```bash
docker compose ps
docker inspect --format='{{json .State.Health}}' $(docker compose ps -q db) | jq .
```

### Resource usage
```bash
docker stats
```

### Restart a single service
```bash
docker compose restart db
docker compose restart www
```

### Exec into the app container
```bash
docker compose exec www sh
ps aux
node -v
```

---

## 7) Troubleshooting

- **App can’t connect to DB**
  - Check DB is healthy: `docker compose ps`
  - Confirm creds match `.env` or defaults in `docker-compose.yaml`
  - From app container: `nc -zv db 3306`

- **Schema didn’t load on first run**
  - The `./sql/*.sql` init only runs on a **fresh** DB volume.
  - Try: `docker compose down -v && docker compose up -d` (⚠️ data loss).

- **Port already in use**
  - Change `APP_PORT` in `.env` (e.g., 3001) and re‑`up`.

- **Need a clean slate**
  - `docker compose down -v` to remove containers and volumes, then `docker compose up -d`.

---

## 8) Quick reference (copy/paste)

```bash
# Start everything
docker compose up -d

# See containers & health
docker compose ps

# Tail logs
docker compose logs -f

# MySQL shell (root)
docker compose exec db mysql -uroot -p${DB_ROOT_PASS:-rootpass}

# Rebuild & restart
docker compose build && docker compose up -d

# Reset DB (⚠️ wipes data)
docker compose down -v && docker compose up -d
```

---

**That’s it.** This page is meant to be your single‑stop cheat‑sheet for running and monitoring SOSM. If you want any additional commands baked in (e.g., pm2 usage, production reverse‑proxy flow, or CI helpers), we can extend this doc.
