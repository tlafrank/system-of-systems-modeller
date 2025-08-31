#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------
# SOSM backup (hybrid dev aware)
# - Copies www/images -> testData/images (sync)
# - Dumps DB -> testData/testData.sql (replace)
# - Works with Dockerized MySQL (service: db) or host MySQL
# ----------------------------------------------

# Paths (resolve relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

WWW_DIR="${REPO_ROOT}/www"
IMG_SRC="${WWW_DIR}/images"
TEST_DIR="${REPO_ROOT}/testData"
IMG_DST="${TEST_DIR}/images"
SQL_OUT="${TEST_DIR}/testData.sql"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
YES="${YES:-false}"

# ---------- helpers ----------

die(){ echo "ERROR: $*" >&2; exit 1; }
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
  if ! command -v docker >/dev/null 2>&1; then return 1; fi
  if ! command -v docker compose >/dev/null 2>&1; then return 1; fi
  local cid
  cid="$(cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" ps -q db || true)"
  [[ -n "${cid}" ]] || return 1
  local st
  st="$(docker inspect -f '{{.State.Running}}' "${cid}" 2>/dev/null || echo false)"
  [[ "${st}" == "true" ]]
}

mysql_probe_host() {
  mysql --protocol=TCP -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" --password="${DB_PASS}" -e "SELECT 1" >/dev/null
}

mysql_probe_docker() {
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db \
    mysql -u"${DB_USER}" --password="${DB_PASS}" -e "SELECT 1") >/dev/null
}

mysqldump_host() {
  mysqldump \
    --protocol=TCP -h"${DB_HOST}" -P"${DB_PORT}" \
    -u"${DB_USER}" --password="${DB_PASS}" \
    --single-transaction --quick --hex-blob --routines --triggers \
    --no-tablespaces \
    "${DB_NAME}"
}

mysqldump_docker() {
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db \
    mysqldump \
      -u"${DB_USER}" --password="${DB_PASS}" \
      --single-transaction --quick --hex-blob --routines --triggers \
      --no-tablespaces \
      "${DB_NAME}")
}

sync_images() {
  [[ -d "${IMG_SRC}" ]] || die "Image source not found: ${IMG_SRC}"
  mkdir -p "${IMG_DST}"
  info "Syncing images: ${IMG_SRC}/ -> ${IMG_DST}/"
  # Use rsync if available for cleaner deletes; fallback to cp -R
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${IMG_SRC}/" "${IMG_DST}/"
  else
    # crude sync: delete and copy
    rm -rf "${IMG_DST:?}/"*
    cp -R "${IMG_SRC}/" "${IMG_DST}/"
  fi
}

dump_db() {
  mkdir -p "${TEST_DIR}"
  local tmp="${SQL_OUT}.tmp"
  info "Dumping database '${DB_NAME}' to ${SQL_OUT}"
  if docker_db_running; then
    mysqldump_docker > "${tmp}"
  else
    need_cmd mysqldump
    mysqldump_host > "${tmp}"
  fi
  mv -f "${tmp}" "${SQL_OUT}"
}

# ---------- main ----------

main() {
  need_cmd grep
  load_env

  info "Checking database connectivity…"
  if docker_db_running; then
    info "Docker DB detected (service: db)."
    mysql_probe_docker
  else
    info "Using host MySQL at ${DB_HOST}:${DB_PORT}."
    need_cmd mysql
    mysql_probe_host
  fi
  info "Database connectivity OK."

  info "This will overwrite:"
  echo "  - ${IMG_DST}/ (to match current www/images)"
  echo "  - ${SQL_OUT}"
  if ! confirm "Proceed?"; then
    info "Aborted."
    exit 0
  fi

  sync_images
  dump_db

  info "Backup complete."
  echo "  Images => ${IMG_DST}/"
  echo "  SQL    => ${SQL_OUT}"
}

main "$@"
