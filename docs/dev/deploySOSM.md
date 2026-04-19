# Deploy SOSM

This guide explains how to deploy SOSM in a development environment.

## Recommended (Docker)
Use the helper script:

```bash
./scripts/dev-up.sh
```

Equivalent direct command:

```bash
docker compose up --build -d
```

## Legacy wrapper
`./scripts/deploySOSM.sh` is kept as a compatibility wrapper and now delegates to `./scripts/dev-up.sh`.

## Port configuration
If your host already uses port 80, set `APP_PORT` in `.env` (for example `APP_PORT=3001`) before running Compose. The host port is configured in `docker-compose.yaml`; Dockerfile `EXPOSE` does not publish ports by itself.
