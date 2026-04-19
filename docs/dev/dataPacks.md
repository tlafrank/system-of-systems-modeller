# Offline Data Packs

Data packs are a fast import/export mechanism for private local development data.

## Why
- Keep private modelling data out of Git.
- Reduce downtime during refactor by quickly restoring a known dataset.
- Support air-gapped and offline workflows.

## Export
From repo root:

```bash
npm run data:export
```

Optional environment variables:
- `PACK_NAME=<name>` custom output folder/archive name.
- `OUT_DIR=<path>` output base directory (default `./private/data-packs`).

Output:
- `<OUT_DIR>/<PACK_NAME>.tar.gz`
- Archive contains:
  - `schema.sql`
  - `images/`
  - `manifest.json`

## Import
From repo root:

```bash
PACK=./private/data-packs/<PACK_NAME>.tar.gz npm run data:import
```

Import process:
1. Unpacks archive into a temp folder.
2. Creates temporary test-case folder under `testData/_import_tmp`.
3. Uses existing `scripts/deployTestData.sh` workflow.
4. Cleans up temporary files.

## Notes
- `.gitignore` already excludes `private/`; keep private data packs there.
- Data packs are data-only snapshots and should be treated as sensitive.
