#!/usr/bin/env bash
set -euo pipefail

# Deprecated compatibility wrapper.
# Use ./scripts/dev-up.sh for Docker-based local deployment.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat <<MSG
[DEPRECATED] scripts/deploySOSM.sh is no longer required for Docker-based setup.
Use: ./scripts/dev-up.sh
This wrapper will now call dev-up.sh.
MSG

"${SCRIPT_DIR}/dev-up.sh"
