#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------
# SOSM test data deploy (multi-case aware)
# - Prompts for a test case folder under testData/
# - Executes all *.sql in that folder (sorted)
# - Copies that folder's /images into public/images (if present)
# - Works with MySQL in Docker (service: db) or on host
# ----------------------------------------------

# Paths (resolve relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SQL_DIR="${REPO_ROOT}/server/sql"
TEST_DIR="${REPO_ROOT}/testData"
WWW_DIR="${REPO_ROOT}/public"
ENV_FILE="${REPO_ROOT}/.env"

# Options / env overrides
YES="${YES:-false}"                               # non-interactive confirm: YES=true
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yaml}" # docker compose file name
TEST_NAME="${TEST_NAME:-}"                        # choose test folder non-interactively

# ---------------- helpers ----------------------

die() { echo "ERROR: $*" >&2; exit 1; }
info(){ echo ">> $*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

confirm() {
  if [[ "${YES}" == "true" ]]; then return 0; fi
  read -r -p "$1 [y/N] " ans
  [[ "${ans}" == "y" || "${ans}" == "Y" ]]
}

load_env() {
  [[ -f "${ENV_FILE}" ]] || die "Missing .env at ${ENV_FILE}"
  # shellcheck disable=SC2046
  export $(grep -v '^[[:space:]]*#' "${ENV_FILE}" | grep -E '^[A-Za-z0-9_]+=' | xargs) || true
  : "${DB_NAME:?Missing DB_NAME in .env}"
  : "${DB_USER:?Missing DB_USER in .env}"
  : "${DB_PASS:?Missing DB_PASS in .env}"
  export DB_HOST="${DB_HOST:-127.0.0.1}"
  export DB_PORT="${DB_PORT:-3306}"
}

docker_db_running() {
  # Returns 0 if a Compose service named "db" is up
  if ! command -v docker >/dev/null 2>&1; then return 1; fi
  docker compose version >/dev/null 2>&1 || return 1
  # Run from repo root so compose can see the file
  info "Running: docker compose -f ${COMPOSE_FILE} ps -q db"
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" ps -q db) >/dev/null 2>&1 || return 1
  local cid
  cid="$(cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" ps -q db || true)"
  [[ -n "${cid}" ]] || return 1
  # Check running status
  local st
  st="$(docker inspect -f '{{.State.Running}}' "${cid}" 2>/dev/null || echo false)"
  [[ "${st}" == "true" ]]
}

ensure_docker_db() {
  command -v docker >/dev/null 2>&1 || return 1
  docker compose version >/dev/null 2>&1 || return 1
  if docker_db_running; then return 0; fi
  info "Docker Compose detected but 'db' is not running. Attempting to start it…"
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" up -d db) >/dev/null
  docker_db_running
}

mysql_exec_host() {
  local src="${1}"
  local host_opts=( --protocol=TCP -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" --password="${DB_PASS}" "${DB_NAME}" )
  if [[ "${src}" == "-" ]]; then mysql "${host_opts[@]}"; else mysql "${host_opts[@]}" < "${src}"; fi
}

mysql_exec_docker() {
  local src="${1}"
  local cmd=( mysql -u"${DB_USER}" --password="${DB_PASS}" "${DB_NAME}" )
  if [[ "${src}" == "-" ]]; then
    (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db "${cmd[@]}")
  else
    (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db "${cmd[@]}") < "${src}"
  fi
}

check_connectivity() {
  info "Checking DB connectivity as ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  local probe="SELECT 1 as ok;"
  if docker_db_running; then
    echo "${probe}" | mysql_exec_docker "-"
  else
    need_cmd mysql
    echo "${probe}" | mysql_exec_host "-"
  fi
  info "Database connectivity OK."
}

run_sql_file() {
  local file="${1}"
  [[ -f "${file}" ]] || die "SQL file not found: ${file}"
  info "Applying $(basename "${file}")"
  if docker_db_running; then mysql_exec_docker "${file}"; else mysql_exec_host "${file}"; fi
}

copy_images_from() {
  local src_images="${1}/images"
  local dest_images="${WWW_DIR}/images"
  if [[ -d "${src_images}" ]]; then
    info "Copying images from ${src_images} -> ${dest_images}"
    mkdir -p "${dest_images}"
    cp -R "${src_images}/." "${dest_images}/"
  else
    info "No images folder in ${1}; skipping image copy."
  fi
}

select_test_case() {
  [[ -d "$TEST_DIR" ]] || { echo "ERROR: testData folder not found at: $TEST_DIR" >&2; return 1; }
  echo ">> Scanning test cases in: $TEST_DIR" >&2

  # Build array of case folder names
  local cases=()
  while IFS= read -r d; do
    [[ -n "$d" ]] || continue
    cases+=("$(basename "$d")")
  done < <(find "$TEST_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

  if [[ ${#cases[@]} -eq 0 ]]; then
    cat >&2 <<EOF
ERROR: No test case folders found in: $TEST_DIR
Hint: expected structure like:
  ${TEST_DIR}/CaseA/*.sql
  ${TEST_DIR}/CaseA/images/
  ${TEST_DIR}/CaseB/*.sql
EOF
    return 1
  fi

  # Allow preselection via TEST_NAME / --case (match by basename)
  if [[ -n "$TEST_NAME" ]]; then
    for c in "${cases[@]}"; do
      if [[ "$c" == "$TEST_NAME" ]]; then
        printf '%s\n' "${TEST_DIR}/$c"   # final result to stdout
        return 0
      fi
    done
    echo "ERROR: TEST_NAME='$TEST_NAME' not found under $TEST_DIR" >&2
    return 1
  fi

  # Show options BEFORE prompting (to stderr so they are visible)
  echo "Available test cases:" >&2
  local i=1
  for c in "${cases[@]}"; do
    printf '  [%d] %s\n' "$i" "$c" >&2
    ((i++))
  done

  # Prompt until a valid number is chosen
  local choice
  while true; do
    read -r -p "Select a test case by number: " choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice>=1 && choice<=${#cases[@]} )); then
      printf '%s\n' "${TEST_DIR}/${cases[$((choice-1))]}"   # final result to stdout
      return 0
    fi
    echo "Invalid selection. Try again." >&2
  done
}

run_all_sql_in_folder() {
  local case_dir="${1}"
  mapfile -t files < <(find "${case_dir}" -maxdepth 1 -type f -name "*.sql" | sort)
  if [[ ${#files[@]} -eq 0 ]]; then
    info "No .sql files found in ${case_dir}"
    return 0
  fi
  info "Executing ${#files[@]} SQL file(s) from $(basename "${case_dir}")"
  for f in "${files[@]}"; do run_sql_file "${f}"; done
}

# ---------------- main -------------------------

main() {
  need_cmd grep
  load_env

  info "Hybrid check: detecting Docker 'db' service…"
  if ensure_docker_db; then
    info "MySQL is running in Docker (service: db)."
  else
    info "Docker DB not detected. Will use host MySQL at ${DB_HOST}:${DB_PORT}."
    need_cmd mysql
  fi

  check_connectivity

  local case_name
  case_name="$(select_test_case)"
  local case_dir="${TEST_DIR}/${case_name}"

  echo "----------------------------------------"
  echo "Test case: ${case_name}"
  echo "SQL dir : ${case_name}"
  echo "Images  : ${case_name}/images (if present)"
  echo "Target  : DB=${DB_NAME}  public/images/"
  echo "----------------------------------------"

  if ! confirm "Proceed with loading '${case_name}' into '${DB_NAME}'?"; then
    info "Aborted."
    exit 0
  fi

  run_all_sql_in_folder "${case_name}"
  copy_images_from "${case_name}"

  info "Done."
}

main "$@"
