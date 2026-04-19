#!/usr/bin/env bash
set -euo pipefail

# Export a portable local data pack for offline development.
# Contents:
#   - schema.sql (data-only dump)
#   - images/
#   - manifest.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
PACK_NAME="${PACK_NAME:-local-${TIMESTAMP}}"
OUT_DIR="${OUT_DIR:-${REPO_ROOT}/private/data-packs}"
WORK_DIR="${OUT_DIR}/${PACK_NAME}"

"${SCRIPT_DIR}/backupTestData.sh" --yes --dest "${WORK_DIR}"

cat > "${WORK_DIR}/manifest.json" <<JSON
{
  "pack_name": "${PACK_NAME}",
  "created_utc": "${TIMESTAMP}",
  "format": "sosm-data-pack-v1",
  "contents": ["schema.sql", "images/"]
}
JSON

(
  cd "${OUT_DIR}"
  tar -czf "${PACK_NAME}.tar.gz" "${PACK_NAME}"
)

echo "Created data pack: ${OUT_DIR}/${PACK_NAME}.tar.gz"
