# system-of-systems-modeller

System-of-systems-modeller (SOSM) is a NodeJS-based web app supported by an SQL database (MySQL) which allows a user to model nodes, their interfaces and the ways in which they connect. SOSM uses a number of client-side JS libraries which attempts to provide a clean UI, whilst also providing a clear graphical representation of the system, or the particular view of the system that the user is currently interested in.

## SOSM Terms
SOSM defines the following terms:
- Subsystem. The systems which make up the greater system.
- Interface. The means by which a platform (system) connects to other platforms (systems).
- Network. The link established between two or more interfaces.
- Feature. The technology used by a network as well as the technology that can be implemented by an interface.

## Quick start (Docker)

> Default app host port is **3001** so it does not clash with existing services on port 80.

### 1) Create environment file
```bash
cp .env.example .env
```

Optional edits in `.env`:
- `APP_PORT` (default 3001)
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_ROOT_PASS`

### 2) Start SOSM + database
```bash
docker compose up -d
```

### 3) Verify services
```bash
docker compose ps
```

Network note: Compose now creates a dedicated bridge network named `sosm_net` for container-to-container communication (`server` ↔ `db` ↔ `adminer`).

### 4) Open the app
- App: `http://localhost:${APP_PORT:-3001}`
- Adminer (optional): `http://localhost:8080`

### 5) (Optional) Load sample data
```bash
./scripts/deployTestData.sh
```

### 6) Stop
```bash
docker compose down
```

## Quick start (no Docker DB)

If you already run MySQL on the host, SOSM scripts can use that DB instead of Docker:
1. Configure `.env` with your host DB values.
2. Run app with Node:
   ```bash
   npm install
   npm run dev
   ```

## Offline data packs (private local data)

Use data packs to quickly export/import local working data without committing it to Git:

```bash
npm run data:export
PACK=./private/data-packs/<your-pack>.tar.gz npm run data:import
```

See full guide: [`docs/dev/dataPacks.md`](./docs/dev/dataPacks.md).

## SOSM Dependencies
SOSM requires a number of external dependencies to function. Client side external dependencies can be found within /www/index.html. Client side external dependencies include:
- Bootstrap JS ()
- Bootstrap CSS ()
- Cytoscape JS ()
- JQuery ()

Server-side dependencies include
- MySQL ()
- NodeJS
- NPM. With packages:
-- MySQL2
