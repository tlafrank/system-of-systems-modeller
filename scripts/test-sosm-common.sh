#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_LIB="${SCRIPT_DIR}/lib/sosm-common.sh"

# shellcheck source=lib/sosm-common.sh
source "${COMMON_LIB}"

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

test_load_env_parsing() {
  local tmp_env
  tmp_env="$(mktemp)"
  cat > "${tmp_env}" <<'EOF'
# comment
DB_NAME=db_sosm
DB_USER=sosmUser
DB_PASS=sosm_pass
VALUE_WITH_SPACES=hello world
INVALID KEY=ignored
EOF

  sosm_load_env "${tmp_env}"
  rm -f "${tmp_env}"

  [[ "${DB_NAME}" == "db_sosm" ]] || fail "DB_NAME should be parsed"
  [[ "${DB_USER}" == "sosmUser" ]] || fail "DB_USER should be parsed"
  [[ "${DB_PASS}" == "sosm_pass" ]] || fail "DB_PASS should be parsed"
  [[ "${VALUE_WITH_SPACES}" == "hello world" ]] || fail "VALUE_WITH_SPACES should preserve spaces"
  pass "sosm_load_env parses expected keys"
}

test_resolve_compose_file() {
  local tmp_dir
  tmp_dir="$(mktemp -d)"
  COMPOSE_FILE="docker-compose.yaml"
  touch "${tmp_dir}/docker-compose.yml"

  sosm_resolve_compose_file "${tmp_dir}"
  rm -rf "${tmp_dir}"

  [[ "${COMPOSE_FILE}" == "docker-compose.yml" ]] || fail "COMPOSE_FILE should fallback to .yml"
  pass "sosm_resolve_compose_file handles yaml/yml fallback"
}

main() {
  test_load_env_parsing
  test_resolve_compose_file
  echo "All sosm-common tests passed."
}

main "$@"
