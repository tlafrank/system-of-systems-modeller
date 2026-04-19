# Update Interface Redesign Checklist

## Architecture & UX (set the direction)
- [x] Define target UX: drawer (off-canvas) or split-pane sidebar for editing Interfaces (no blocking modals).
- [ ] List the exact fields and widgets for Interface edit (name, description, image/icon, features dual-list, etc.).
- [ ] Identify which views exist: “Create”, “Edit”, “Read-only preview”.
- [ ] Decide on state strategy: optimistic save vs. explicit Save/Cancel; draft autosave (Y/N).

## Client–Server contract (what data flows)
- [ ] Draft a View Model for Interface Edit (one GET returns everything the editor needs):  
      `{ interface?, interfaces[], featuresAttached[], featuresAvailable[] }`.
- [ ] Draft Save payloads: `POST /interfaces` (create) and `PATCH /interfaces/:id` (update) with JSON body.  
      `{ name, description?, image?, features: number[] }`
- [ ] Enumerate error shapes for validation and server faults:  
      `{ error: { code, message, fields? } }` with `fields` mapping `id -> message`.

## API design (resource-ish routes)
- [ ] Define endpoints:
  - [ ] `GET /api/interfaces/edit-view` (new)
  - [ ] `GET /api/interfaces/:id/edit-view` (existing)
  - [ ] `POST /api/interfaces`
  - [ ] `PATCH /api/interfaces/:id`
- [ ] Decide on auth/session (if applicable): headers, CSRF, etc.
- [ ] Versioning stance (simple for now; no `/v1` unless you need it).

## Server implementation (layers with single responsibility)
- [ ] **Repo layer** (SQL only): interfaces, features, interface_features (many-to-many).
  - [ ] `listInterfaces()`, `getInterfaceById(id)`, `listAllFeatures()`, `listFeaturesForInterface(id)`
  - [ ] `insertInterface(dto)`, `updateInterface(id, dto)`, `replaceInterfaceFeatures(id, featureIds)`
- [ ] **Service layer** (business logic + transactions):
  - [ ] `getEditView(id?)` builds the full view model in one go.
  - [ ] `upsertInterface(payload)` wraps insert/update + feature mapping in a transaction.
- [ ] **Validation** (e.g., zod / joi / yup):
  - [ ] `id` schema (coerce to int; ≥ 0)
  - [ ] `upsertInterface` schema (field lengths, requireds, `features[]` numeric).
- [ ] **Controller + routes**:
  - [ ] `GET :edit-view` → `service.getEditView`
  - [ ] `POST/PATCH` → `service.upsertInterface`
  - [ ] Consistent error handler that emits `{error:{...}}`.

## Database readiness
- [ ] Confirm/upgrade schema for `interfaces`, `features`, `interface_features` with constraints:
  - [ ] Unique name on interfaces/features.
  - [ ] PK on (id_interface, id_feature) and `ON DELETE CASCADE`.
- [ ] Add migration scripts (SQL files or a migration tool).

## Client code organization
- [ ] Create `public/js/api/interfaces.js` for thin fetch wrappers (`getEditView`, `create`, `update`).
- [ ] Build a **Drawer/Sidebar editor** component (`public/js/ui/interfaceEditor.js`):
  - [ ] Render form fields (reuse your `addFormElement`, `getFormElement`, `setFormElement` or replace with minimal DOM utils).
  - [ ] Dual-list attach/remove with small helpers (no jQuery needed).
  - [ ] “Icon picker” integration point (open lightweight picker; no modal if possible).
  - [ ] Validation messages inline; sticky footer Save/Cancel.
- [ ] Wire the editor open/close to navbar or node selection events (no modals).

## State management & UX details
- [ ] Keep editor open while interacting with graph (don’t block context).
- [ ] Disable Save if no changes (dirty-state tracking).
- [ ] Show non-blocking toasts/snackbars on success; inline errors on failure.
- [ ] Keyboard/a11y: focus management, ESC closes drawer, tab order sane.

## Performance & robustness
- [ ] Replace multi-request chains with **one** `getEditView` call.
- [ ] Cache read-only lists in memory for the session (e.g., features) to avoid reloading every open.
- [ ] Debounce icon search / type-ahead if you add it.
- [ ] Guard against duplicate clicks (disable Save while pending).

## Testing plan
- [ ] Unit test service layer (success, validation error, transaction rollback).
- [ ] Integration test API endpoints (supertest).
- [ ] UI smoke tests: open editor, load view model, attach/remove features, save, error display.
- [ ] Manual test with real DB: create, update, rename conflicts, detach all features.

## Migration from existing modals
- [ ] Identify all call sites of `updateInterfaceModal` and replace with `openInterfaceEditor({id})`.
- [ ] Keep the old modal code behind a feature flag for one iteration; remove once stable.
- [ ] Remove jQuery-specific helpers (or provide DOM equivalents) to keep consistency.

## Observability & logging
- [ ] Server: structured logs around `upsertInterface` (inputs, duration, row counts).
- [ ] Client: log errors to a central handler; surface user-friendly messages.
- [ ] Optional: simple metrics — count of creates/updates; error rates.

## Deployment & rollback
- [ ] Ship server endpoints first (backward-compatible; doesn’t break current UI).
- [ ] Then deploy client with the new editor; keep a toggle to revert to modals for a day.
- [ ] Have a quick rollback plan (static asset switch or env flag).

---

## Teaching path
1. **Sketch UX & View Model** (2 short steps; review + refine).
2. **Stand up API stubs** (controllers/routes return mock data).
3. **Build the drawer editor** against mock API (no DB yet).
4. **Fill in service/repo + validation**; point the client to real endpoints.
5. **Replace modal call sites**; test flows; remove legacy bits.
6. **Polish (a11y, toasts, autosave)** and add tests.
