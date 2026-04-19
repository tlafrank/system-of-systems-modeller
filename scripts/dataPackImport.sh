#!/usr/bin/env bash
set -euo pipefail

# Import a portable local data pack for offline development.
# Usage:
#   PACK=<path/to/pack.tar.gz> ./scripts/dataPackImport.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PACK="${PACK:-}"

if [[ -z "${PACK}" ]]; then
  echo "ERROR: PACK is required. Example: PACK=./private/data-packs/local-*.tar.gz ./scripts/dataPackImport.sh" >&2
  exit 1
fi

[[ -f "${PACK}" ]] || { echo "ERROR: Pack not found: ${PACK}" >&2; exit 1; }

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

tar -xzf "${PACK}" -C "${TMP_DIR}"
PACK_DIR="$(find "${TMP_DIR}" -mindepth 1 -maxdepth 1 -type d | head -n1)"

[[ -n "${PACK_DIR}" ]] || { echo "ERROR: Invalid pack archive structure" >&2; exit 1; }
[[ -f "${PACK_DIR}/schema.sql" ]] || { echo "ERROR: schema.sql missing from pack" >&2; exit 1; }

# Deploy using temporary folder structure expected by deployTestData.sh
TMP_TEST_DIR="${REPO_ROOT}/testData/_import_tmp"
rm -rf "${TMP_TEST_DIR}"
mkdir -p "${TMP_TEST_DIR}"
cp "${PACK_DIR}/schema.sql" "${TMP_TEST_DIR}/01_import.sql"
if [[ -d "${PACK_DIR}/images" ]]; then
  cp -R "${PACK_DIR}/images" "${TMP_TEST_DIR}/images"
fi

TEST_NAME="_import_tmp" YES=true "${SCRIPT_DIR}/deployTestData.sh"
rm -rf "${TMP_TEST_DIR}"

echo "Imported data pack: ${PACK}"
