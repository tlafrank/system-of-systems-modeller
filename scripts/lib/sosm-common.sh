#!/usr/bin/env bash

# Shared helpers for SOSM shell scripts.

sosm_die() { echo "ERROR: $*" >&2; exit 1; }
sosm_info() { echo ">> $*"; }

sosm_need_cmd() {
  command -v "$1" >/dev/null 2>&1 || sosm_die "Missing required command: $1"
}

sosm_confirm() {
  local yes="${1}"
  local prompt="${2}"
  if [[ "${yes}" == "true" ]]; then
    return 0
  fi
  local ans
  read -r -p "${prompt} [y/N] " ans
  [[ "${ans}" == "y" || "${ans}" == "Y" ]]
}

sosm_load_env() {
  local env_file="${1}"
  [[ -f "${env_file}" ]] || sosm_die "Missing .env at ${env_file}"
  # shellcheck disable=SC2046
  export $(grep -v '^[[:space:]]*#' "${env_file}" | grep -E '^[A-Za-z0-9_]+=' | xargs) || true
  : "${DB_NAME:?Missing DB_NAME in .env}"
  : "${DB_USER:?Missing DB_USER in .env}"
  : "${DB_PASS:?Missing DB_PASS in .env}"
  export DB_HOST="${DB_HOST:-127.0.0.1}"
  export DB_PORT="${DB_PORT:-3306}"
}

sosm_resolve_compose_file() {
  local repo_root="${1}"

  if [[ -f "${repo_root}/${COMPOSE_FILE}" ]]; then
    return
  fi

  local alt
  if [[ "${COMPOSE_FILE}" == *.yaml ]]; then
    alt="${COMPOSE_FILE%.yaml}.yml"
  elif [[ "${COMPOSE_FILE}" == *.yml ]]; then
    alt="${COMPOSE_FILE%.yml}.yaml"
  else
    alt=""
  fi

  if [[ -n "${alt}" && -f "${repo_root}/${alt}" ]]; then
    sosm_info "Compose file '${COMPOSE_FILE}' not found, using '${alt}'"
    COMPOSE_FILE="${alt}"
  fi
}
