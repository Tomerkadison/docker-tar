#!/bin/bash
#
# Docker Tar — stop all locally-running services started by run-local.command.
# Double-click in Finder or run ./stop-local.command.

set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$SCRIPT_DIR/.local-run"
GEN_NGINX_CONF="$RUN_DIR/nginx.local.conf"
NGINX_ERR="$RUN_DIR/logs/nginx-error.log"

BACKEND_PORT=8080
FRONTEND_PORT=3000

echo "Stopping Docker Tar local services..."

[[ -f "$GEN_NGINX_CONF" ]] && nginx -e "$NGINX_ERR" -c "$GEN_NGINX_CONF" -s stop 2>/dev/null && echo "  ✔ nginx stopped" || true

for name in backend frontend; do
  f="$RUN_DIR/$name.pid"
  if [[ -f "$f" ]]; then
    pid="$(cat "$f" 2>/dev/null || true)"
    if [[ -n "${pid:-}" ]]; then
      pkill -P "$pid" 2>/dev/null || true
      kill "$pid" 2>/dev/null && echo "  ✔ $name stopped (pid $pid)" || true
    fi
    rm -f "$f"
  fi
done

# Fallback: free the known dev ports if anything is still bound.
for p in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  pids="$(lsof -tiTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null && echo "  ✔ freed port $p"
  fi
done

echo "Done."
