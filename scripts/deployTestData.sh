#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------
# SOSM test data deploy (hybrid dev aware)
# - Works when MySQL runs in Docker (service: db)
# - Works when MySQL runs on host
# - Validates environment and credentials
# - Copies test images into www/
# ----------------------------------------------

# Paths (resolve relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SQL_DIR="${REPO_ROOT}/sql"
TEST_DIR="${REPO_ROOT}/testData"
WWW_DIR="${REPO_ROOT}/www"
ENV_FILE="${REPO_ROOT}/.env"

# Files to run
SCHEMA_SQL="${SQL_DIR}/deploySchema.sql"
TESTDATA_SQL="${TEST_DIR}/alarmSystem.sql"
IMAGES_SRC="${TEST_DIR}/images"
IMAGES_DEST="${WWW_DIR}"

# Options
YES="${YES:-false}"          # non-interactive mode if YES=true
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"  # allow custom compose filename

# ---------------- helpers ----------------------

die() { echo "ERROR: $*" >&2; exit 1; }
info(){ echo ">> $*"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

confirm() {
  if [[ "${YES}" == "true" ]]; then
    return 0
  fi
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
  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi
  if ! command -v docker compose >/dev/null 2>&1; then
    return 1
  fi
  # Run from repo root so compose can see the file
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" ps -q db) >/dev/null 2>&1 || return 1
  local cid
  cid="$(cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" ps -q db || true)"
  [[ -n "${cid}" ]] || return 1
  # Check running status
  local st
  st="$(docker inspect -f '{{.State.Running}}' "${cid}" 2>/dev/null || echo false)"
  [[ "${st}" == "true" ]]
}

mysql_exec_host() {
  # $1 = sql file path (or "-" for stdin)
  local src="${1}"
  local host_opts=( --protocol=TCP -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" --password="${DB_PASS}" "${DB_NAME}" )
  if [[ "${src}" == "-" ]]; then
    mysql "${host_opts[@]}"
  else
    mysql "${host_opts[@]}" < "${src}"
  fi
}

mysql_exec_docker() {
  # $1 = sql file path (or "-" for stdin)
  local src="${1}"
  local cmd=( mysql -u"${DB_USER}" --password="${DB_PASS}" "${DB_NAME}" )
  if [[ "${src}" == "-" ]]; then
    (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db "${cmd[@]}")
  else
    (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db "${cmd[@]}") < "${src}"
  fi
}

check_connectivity() {
  info "Checking database connectivity as ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  local probe="SELECT 1 as ok;"
  if docker_db_running; then
    echo "${probe}" | mysql_exec_docker "-"
  else
    need_cmd mysql
    echo "${probe}" | mysql_exec_host "-"
  fi
  info "Database connectivity OK."
}

run_sql() {
  local file="${1}"
  [[ -f "${file}" ]] || die "SQL file not found: ${file}"
  info "Applying $(basename "${file}")"
  if docker_db_running; then
    mysql_exec_docker "${file}"
  else
    mysql_exec_host "${file}"
  fi
}

copy_images() {
  [[ -d "${IMAGES_SRC}" ]] || die "Images source not found: ${IMAGES_SRC}"
  info "Copying images to ${IMAGES_DEST}"
  cp -R "${IMAGES_SRC}/" "${IMAGES_DEST}/"
}

# ---------------- main -------------------------

main() {
  need_cmd grep
  load_env

  info "Hybrid check: looking for Docker 'db' service…"
  if docker_db_running; then
    info "Hybrid mode detected: MySQL is running in Docker (service: db)."
  else
    info "Docker DB not detected. Will use host MySQL at ${DB_HOST}:${DB_PORT}."
    need_cmd mysql
  fi

  check_connectivity

  info "This operation will rebuild schema and load test data into '${DB_NAME}'."
  if ! confirm "Continue?"; then
    info "Aborted."
    exit 0
  fi

  info "Rebuilding schema"
  run_sql "${SCHEMA_SQL}"

  info "Deploying test data (alarm system)"
  run_sql "${TESTDATA_SQL}"

  copy_images

  info "Done."
}

main "$@"
