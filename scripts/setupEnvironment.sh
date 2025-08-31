#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------
# SOSM environment setup (Hybrid or Native)
# - Creates/updates .env
# - Installs Docker (Hybrid) or MySQL Server (Native)
# - Installs Node.js, npm, nodemon
# - Starts DB and verifies connectivity
# - Installs www/ node modules
# ------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"
WWW_DIR="${REPO_ROOT}/www"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
YES="${YES:-false}"

info(){ echo ">> $*"; }
warn(){ echo "!! $*" >&2; }
die(){ echo "ERROR: $*" >&2; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

confirm() {
  if [[ "${YES}" == "true" ]]; then return 0; fi
  read -r -p "$1 [y/N] " ans
  [[ "${ans}" == "y" || "${ans}" == "Y" ]]
}

ask_mode() {
  echo "Choose environment mode:"
  echo "  1) Hybrid  (Node on host, MySQL in Docker)"
  echo "  2) Native  (Node and MySQL on host)"
  local choice
  read -r -p "Enter 1 or 2 [1]: " choice
  case "${choice:-1}" in
    1) MODE="hybrid" ;;
    2) MODE="native" ;;
    *) MODE="hybrid" ;;
  esac
  info "Selected mode: ${MODE}"
}

apt_update_once=false
apt_install() {
  local pkgs=("$@")
  if ! ${apt_update_once}; then
    sudo apt-get update -y
    apt_update_once=true
  fi
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y "${pkgs[@]}"
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1 && command -v docker compose >/dev/null 2>&1; then
    info "Docker + compose already installed."
    return
  fi
  if ! confirm "Docker is not installed. Install Docker Engine + compose plugin now?"; then
    die "Docker is required for Hybrid mode."
  fi
  # Minimal Docker install for Ubuntu
  sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
  apt_install ca-certificates curl gnupg lsb-release
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER" || true
  info "Docker installed. You may need to log out/in for group changes to apply."
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    info "Node.js present: $(node -v)"
  else
    info "Installing Node.js LTS via apt (Ubuntu)..."
    apt_install nodejs npm
  fi
  if ! command -v npx >/dev/null 2>&1; then
    info "Installing npm (for npx)..."
    apt_install npm
  fi
}

ensure_mysql_native() {
  if command -v mysql >/dev/null 2>&1 && command -v mysqldump >/dev/null 2>&1; then
    info "MySQL client/server appears installed."
  else
    if ! confirm "Install MySQL Server locally (native mode)?"; then
      die "MySQL Server required for native mode."
    fi
    apt_install mysql-server
  fi
  sudo systemctl enable --now mysql || true
}

create_env_if_missing() {
  if [[ -f "${ENV_FILE}" ]]; then
    info ".env exists; will reuse. ($(basename "${ENV_FILE}"))"
    return
  fi
  info "Creating default .env at ${ENV_FILE}"
  cat > "${ENV_FILE}" <<'EOF'
APP_PORT=3000
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=db_sosm
DB_USER=sosmUser
DB_PASS=sosm_pass
DB_ROOT_PASS=rootpass
EOF
}

load_env() {
  # shellcheck disable=SC2046
  export $(grep -v '^[[:space:]]*#' "${ENV_FILE}" | grep -E '^[A-Za-z0-9_]+=' | xargs) || true
  : "${DB_NAME:?Missing DB_NAME in .env}"
  : "${DB_USER:?Missing DB_USER in .env}"
  : "${DB_PASS:?Missing DB_PASS in .env}"
  export DB_HOST="${DB_HOST:-127.0.0.1}"
  export DB_PORT="${DB_PORT:-3306}"
}

docker_db_up() {
  if [[ ! -f "${REPO_ROOT}/${COMPOSE_FILE}" ]]; then
    die "docker-compose file not found: ${REPO_ROOT}/${COMPOSE_FILE}"
  }
  info "Starting db service via docker compose"
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" up -d db)
}

docker_db_probe() {
  info "Probing DB (docker)…"
  (cd "${REPO_ROOT}" && docker compose -f "${COMPOSE_FILE}" exec -T db \
    mysql -u"${DB_USER}" --password="${DB_PASS}" -e "SELECT 1" "${DB_NAME}") >/dev/null
}

native_db_prepare() {
  info "Ensuring database and user exist (native)…"
  sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';"
  sudo mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%'; FLUSH PRIVILEGES;"
}

native_db_probe() {
  info "Probing DB (native)…"
  mysql --protocol=TCP -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" --password="${DB_PASS}" -e "SELECT 1" "${DB_NAME}" >/dev/null
}

ensure_dotenv_in_app() {
  local app_js="${WWW_DIR}/app.js"
  if [[ -f "${app_js}" ]]; then
    if ! grep -q "dotenv" "${app_js}"; then
      warn "Ensure www/app.js loads dotenv with repo-root .env, e.g.:
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
"
    fi
  fi
}

install_node_modules() {
  if [[ ! -d "${WWW_DIR}" ]]; then
    die "www directory not found at ${WWW_DIR}"
  fi
  info "Installing Node dependencies in www/"
  (cd "${WWW_DIR}" && npm install && npm install --save dotenv && npx --yes nodemon -v >/dev/null 2>&1 || npm install -D nodemon)
}

main() {
  need_cmd grep
  ask_mode
  create_env_if_missing
  load_env
  ensure_node

  if [[ "${MODE}" == "hybrid" ]]; then
    ensure_docker
    docker_db_up
    # Give MySQL some time to accept connections on first boot
    sleep 3 || true
    docker_db_probe
  else
    ensure_mysql_native
    native_db_prepare
    sleep 2 || true
    native_db_probe
  fi

  install_node_modules
  ensure_dotenv_in_app

  info "Environment setup complete."
  echo
  echo "Next steps:"
  echo "  - Start the API:   (cd www && npx nodemon app.js)"
  echo "  - Seed test data:  scripts/deployTestData.sh"
  echo "  - Backup snapshot: scripts/backupTestData.sh"
}

main "$@"