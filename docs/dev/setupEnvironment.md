# Setup Environment
This guide explains how to prepare a **development environment** for SOSM in two modes and then run the automated setup script.

- **Hybrid** (recommended): Node.js runs on your host; MySQL runs in Docker. Best for easy resets and future PostgreSQL migration.
- **Native**: Node.js **and** MySQL run on your host machine directly.

Once complete, deploy the app following **`docs/dev/deploySOSM.md`** (or your `deployTestData.sh` helper scripts).

---

## Prerequisites (before running the script)

- Ubuntu (VM or WSL) with `sudo` access
- Git installed and repository cloned:
  ```bash
  sudo apt-get update && sudo apt-get install -y git
  git clone https://github.com/tlafrank/system-of-systems-modeller
  cd system-of-systems-modeller
  ```

> If you are on Windows, use **WSL2 + Ubuntu** or a Linux VM (VirtualBox).

---

## One-time setup script

Run the environment setup script from the repo root:

```bash
chmod +x scripts/setupEnvironment.sh
scripts/setupEnvironment.sh
```

The script will:

1. Ask whether you want **Hybrid** or **Native**.
2. Install required tooling (Docker for Hybrid; MySQL for Native; Node.js, npm, and nodemon in both).
3. Create or update a **`.env`** at the repo root with sensible defaults.
4. For **Hybrid**: start the **db** container via `docker compose` and verify connectivity.
5. For **Native**: ensure MySQL is installed, create the **database & user**, and verify connectivity.
6. Install Node deps in **`www/`** (`npm install`) and ensure `dotenv` is present.
7. Print next steps (start the API, seed test data, etc.).

---

## Default environment values

The script will create `.env` if missing and set these defaults (you can edit later):

```
APP_PORT=3000
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=db_sosm
DB_USER=sosmUser
DB_PASS=sosm_pass
DB_ROOT_PASS=rootpass
```

---

## What gets created/used

- **`docker-compose.yml`** (if present): used to start the `db` service (Hybrid). The script won’t overwrite existing files.
- **MySQL (Native)**: the script can install `mysql-server` and create DB & user if you opt in.
- **Node modules**: `www/node_modules/` via `npm install`.
- **Validation checks**: the script runs a DB probe (`SELECT 1`) using your `.env`.

---

## Troubleshooting

- If you see *“Access denied for user … (using password: NO)”*, ensure `.env` is loaded and `www/app.js` begins with:
  ```js
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  ```
- If Docker isn’t detected in Hybrid mode, the script will offer to install it.
- On WSL, ensure the Docker Desktop integration is enabled **or** install Docker inside WSL.

---

## Next steps

- Start API in dev:
  ```bash
  cd www
  npx nodemon app.js
  ```
- Seed test data (optional):
  ```bash
  scripts/deployTestData.sh
  ```
- Backup snapshot (optional):
  ```bash
  scripts/backupTestData.sh
  ```