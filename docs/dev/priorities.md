# SOSM Priorities

This file tracks the priorities for upgrading and improving the **System of Systems Modeller (SOSM)**.  
Work is ordered from **foundations** (must-haves) → **core features** (to enable intended use) → **advanced features** (enhancements) → **ops & docs** (polish and sustainability).

---

## 1. Foundations (Deployment & Stability)

- [ ] **Containerisation**
    [ ] Add Dockerfile for the app (`www/`).
    [ ] Add `docker-compose.yml` with services: `app`, `db`, (optional) `adminer`.
    [ ] Use `.env` for DB + app config (no hardcoded credentials).
    [ ] Ensure MySQL persistence with named volume (`dbdata`).
    [ ] Modify `helpers/db.js` to read from env vars.

- [x] **Dependencies & fixes**
    [x] Add missing `body-parser` to `package.json`.
    [x] Confirm all dependencies install cleanly with `npm ci`.

- [ ] **Single-command deploy**
    [ ] `docker compose up -d` runs app + DB, seeds schema on first boot.
    [ ] Makefile shortcuts: `make up`, `make down`, `make logs`, `make reset`.

- [ ] **Development workflow**
    [ ] Decide on preferred dev mode (hybrid vs containerised).
    [ ] Add `docker-compose.override.yml` for dev (bind-mount + nodemon).
    [ ] Document workflows in `/docs/user/workflows.md`.

---

## 2. Core Features (Architecture Definition)

- [ ] **Two-layer IERs**
  -  [ ] High-level IER description (decision-maker view).
  -  [ ] Realizations layer (protocols/messages/voice formats).
  -  [ ] Table + UI for mapping IERs → realizations → edges.

- [ ] **Edge assignments**
  -  [ ] Allow attaching IERs (or realizations) directly to edges.

- [ ] **Organisation view**
  -  [ ] Nodes collapsible/expandable by org unit.
  -  [ ] Views toggle between node-centric and org-centric.

- [ ] **Sandpits / Branching**
  -  [ ] Per-user “sandbox views” of a model.
  -  [ ] Merge/diff workflow to bring sandbox changes into main model.

- [ ] **Comms message versioning**
  -  [ ] Table for `message_profile` + `message_profile_version`.
  -  [ ] UI to link realizations to message profiles.

- [ ] **RFI / Threads**
  -  [ ] Add discussion threads scoped to node/edge/IER.
  -  [ ] Support open/closed status.

- [ ] **Docs per node/system**
  -  [ ] Attach links, PDFs, or references to nodes/edges/IERs.
  -  [ ] Store in `docrefs` table.

- [ ] **Exports**
  -  [ ] SVG/PNG/PDF for graphs (with large-graph support).
  -  [ ] CSV/XLSX export for nodes/edges/IERs.
  -  [ ] “Generate pack” option to export a bundle.

- [ ] **Graph persistence**
   - [ ] Autosave graph layouts + filters (`views` table).
   - [ ] Named Views for focus subsets, org view, overlays.

- [ ] **Switch DB to PostgreSQL**
---

## 3. Advanced Features (Analysis & Validation)

- [ ] **IER tracing**
  - Traverse graph for end-to-end realization paths.
  - Compute hop counts, bottleneck latency/bandwidth.

- [ ] **Constraints engine**
  - Define per-IER constraints (latency, throughput, classification).
  - Store spec + pass/fail results.
  - Display unmet constraints in UI.

- [ ] **Spectrum engineering**
  - Region-based spectrum requirements aggregation.
  - Conflict detection (overlapping channels).
  - Export channel plan by region.

- [ ] **IP Address & Asset Management**
  - Tables: vrfs, subnets, addresses, devices, interfaces, identifiers.
  - Allocate + track addresses per asset.
  - Generate IP plans as spreadsheets.

- [ ] **Failure/what-if analysis**
  - Toggle node/edge failure.
  - Recompute IER status (Satisfied/Degraded/Unsatisfied).

- [ ] **Standards catalog**
  - Record technical standards per system/edge.
  - Validate conformance (IER → required standard vs system capabilities).

---

## 4. Ops & Documentation

- [ ] **Documentation system**
  - `/docs/` folder with Markdown: user workflows, ops runbooks, dev architecture.
  - Generate static site (MkDocs) or serve in-app at `/docs`.

- [ ] **Backups**
  - Nightly MySQL dumps to `/backups`.
  - Restore runbook (`docker compose exec db mysql < backup.sql`).
  - Test recovery quarterly.

- [ ] **Production deployment**
  - Harden Compose stack (TLS reverse proxy, firewall).
  - `.env.production` with strong secrets.
  - Healthcheck endpoint monitored externally.
  - Logs rotated, metrics scraped (optional: Prometheus/Grafana).

- [ ] **Release process**
  - Semantic versioning (`v0.1.0` → `v0.1.1`).
  - Tag → build image → deploy.
  - Store release notes in `CHANGELOG.md`.

- [ ] **Sanitised datasets**
  - Tools to dump dev DB, reimport for dev/staging.

- [ ] **Audit logging**
  - Every mutation logged to `audit_event` table.
  - Exportable as JSON/CSV.

- [ ] **Testing**
  - Add Jest/Vitest for unit tests.
  - Cypress for UI smoke tests.
  - k6 for load testing (basic).

---

## 5. Stretch Goals (Future-proofing)

- [ ] **Graph DB adapter** (optional if queries become too complex).
- [ ] **Realtime CRDT collaboration** (Y.js + websocket server).
- [ ] **COA/Scenario comparison packs** (side-by-side views).
- [ ] **Integration with RF modelling tools** (ns-3, EMANE, STK).
- [ ] **Rolling updates** for zero downtime prod.

---

## Notes
- Keep features behind feature flags where possible.  
- Every new module should be added as a small repo folder: `modules/<name>/`.  
- Track progress in PRs; update this file as priorities shift.
