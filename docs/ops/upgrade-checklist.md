# Upgrade checklist
- [ ] Backups verified (last 24h)
- [ ] Build or load image `<tag>`
- [ ] Healthcheck on current version passes
- [ ] Apply migrations (dry run in staging)
- [ ] `docker compose up -d` (monitor logs)
- [ ] Smoke tests: login, create node, export CSV
- [ ] Note version + time in ops log
