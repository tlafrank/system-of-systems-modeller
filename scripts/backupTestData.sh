#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------
# SOSM backup (hybrid dev aware) with destination choice
# - Copies www/images -> <DEST>/images (sync)
# - Dumps DB -> <DEST>/testData.sql (replace)
# - Works with Dockerized MySQL (service: db) or host MySQL
# - DEST can be passed via --dest or chosen interactively
# ----------------------------------------------

# Paths (resolve relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

WWW_DIR="${REPO_ROOT}/public"
IMG_SRC="${WWW_DIR}/images"

# Defaults (can be overridden)
DEFAULT_DEST="${REPO_ROOT}/testData"
DEST_DIR="${DEST_DIR:-}"                       # env override
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
YES="${YES:-false}"

# ---------- helpers ----------

die(){ echo "ERROR: $*" >&2; exit 1; }
info(){ echo ">> $*"; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

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
  if ! command -v docker >/dev/null 2>&1; then return 1; fi
  docker compose version >/dev/null 2>&1 || return 1
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
    --no-tablespaces --no-create-info\
    "${DB_NAME}"
}

mysqldump_docker() {
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db \
    mysqldump \
      -u"${DB_USER}" --password="${DB_PASS}" \
      --single-transaction --quick --hex-blob --routines --triggers \
      --no-tablespaces --no-create-info\
      "${DB_NAME}")
}

choose_destination() {
  if [[ -n "${DEST_DIR}" ]]; then
    return
  fi

  echo "Select backup base directory:"
  echo "  1) /private"
  echo "  2) /testData"
  read -r -p "Enter 1 or 2 [2]: " base_choice
  case "${base_choice:-2}" in
    1) base="${REPO_ROOT}/private" ;;
    2) base="${REPO_ROOT}/testData" ;;
    *) base="${REPO_ROOT}/testData" ;;
  esac

  read -r -p "Enter the name of the folder to use inside ${base}: " folder_name
  [[ -n "${folder_name}" ]] || die "Folder name cannot be empty."

  DEST_DIR="${base}/${folder_name}"
}

ensure_destination() {
  if [[ -d "${DEST_DIR}" ]]; then
    info "Destination '${DEST_DIR}' already exists."
    if ! confirm "Do you want to overwrite its contents?"; then
      die "Aborted by user."
    fi
  fi
  mkdir -p "${DEST_DIR}"
}

sync_images() {
  local dst="${DEST_DIR}/images"
  [[ -d "${IMG_SRC}" ]] || die "Image source not found: ${IMG_SRC}"
  mkdir -p "${dst}"
  info "Syncing images: ${IMG_SRC}/ -> ${dst}/"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${IMG_SRC}/" "${dst}/"
  else
    rm -rf "${dst:?}/"* 2>/dev/null || true
    cp -R "${IMG_SRC}/" "${dst}/"
  fi
}

dump_db() {
  local out="${DEST_DIR}/schema.sql"
  mkdir -p "${DEST_DIR}"
  local tmp="${out}.tmp"
  info "Dumping database '${DB_NAME}' to ${out}"
  if docker_db_running; then
    mysqldump_docker > "${tmp}"
  else
    need_cmd mysqldump
    mysqldump_host > "${tmp}"
  fi
  mv -f "${tmp}" "${out}"
}

print_summary() {
  echo "Backup complete."
  echo "  Images => ${DEST_DIR}/images/"
  echo "  SQL    => ${DEST_DIR}/schema.sql"
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [--dest <path>] [--yes]

Options:
  --dest <path>   Destination folder for backup (default: ./testData).
                  If it exists, you'll be asked to confirm overwrite unless --yes is set.
  --yes           Non-interactive mode; assume 'yes' to confirmations.

Environment:
  DEST_DIR        Same as --dest
  YES=true        Same as --yes
  COMPOSE_FILE    Compose file to use (default: docker-compose.yml)

Examples:
  $0                             # overwrite ./testData
  $0 --dest ./backups/$(date +%F)   # write into a new dated folder
  YES=true $0 --dest ./backups/nightly
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dest)
        shift; [[ $# -gt 0 ]] || die "--dest requires a path"
        DEST_DIR="$1"; shift;;
      --yes)
        YES=true; shift;;
      -h|--help)
        usage; exit 0;;
      *)
        die "Unknown argument: $1 (use --help)";;
    esac
  done
}

# ---------- main ----------

main() {
  need_cmd grep
  parse_args "$@"
  load_env

  info "Checking database connectivity…"
  if docker_db_running; then
    if ! docker info >/dev/null 2>&1; then
      die "Docker is installed but not accessible by this user. Try running with sudo or add your user to the docker group."
    fi
    info "Docker DB detected (service: db)."
    mysql_probe_docker
  else
    info "Using host MySQL at ${DB_HOST}:${DB_PORT}."
    need_cmd mysql
    mysql_probe_host
  fi
  info "Database connectivity OK."

  choose_destination
  ensure_destination

  sync_images
  dump_db
  print_summary
}

main "$@"
