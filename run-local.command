#!/bin/bash
#
# Docker Tar — local one-click launcher.
#
# Double-click this file in Finder (or run ./run-local.command in a terminal)
# to build and start all three services locally:
#
#   • backend  (FastAPI / uvicorn)  ->  http://localhost:8080
#   • frontend (React dev server)   ->  http://localhost:3000
#   • nginx    (reverse proxy)      ->  http://localhost:8081   <-- open this one
#
# The browser opens automatically. Press Ctrl+C in this window (or just close
# it) to stop everything. You can also run stop-local.command any time.
#
# Requirements: Docker Desktop, Homebrew, Node/npm, Python 3. nginx is installed
# automatically via Homebrew on first run if it is missing.

set -uo pipefail

# ---------------------------------------------------------------------------
# Config — change the nginx port here if 8081 is taken. 8081 is used (instead
# of the production port 80) so no sudo/password is ever required.
# ---------------------------------------------------------------------------
NGINX_PORT="${NGINX_PORT:-8081}"
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Finder launches .command files with a minimal PATH — add the usual tool dirs.
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/Frameworks/Python.framework/Versions/Current/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RUN_DIR="$SCRIPT_DIR/.local-run"
LOG_DIR="$RUN_DIR/logs"
NGINX_TMP="$RUN_DIR/tmp"
NGINX_ERR="$LOG_DIR/nginx-error.log"
GEN_NGINX_CONF="$RUN_DIR/nginx.local.conf"
BACKEND_PID_FILE="$RUN_DIR/backend.pid"
FRONTEND_PID_FILE="$RUN_DIR/frontend.pid"
DEPS_MARKER="$RUN_DIR/.deps-installed"
mkdir -p "$LOG_DIR" "$NGINX_TMP"

# ---- pretty logging --------------------------------------------------------
c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_red=$'\033[1;31m'; c_yellow=$'\033[1;33m'; c_reset=$'\033[0m'
log()  { echo "${c_blue}▶${c_reset} $*"; }
ok()   { echo "${c_green}✔${c_reset} $*"; }
warn() { echo "${c_yellow}⚠${c_reset} $*"; }
die()  { echo "${c_red}✖ $*${c_reset}" >&2; echo; echo "Press Return to close this window."; read -r _; exit 1; }

kill_by_port() {
  local p="$1"; local pids
  pids="$(lsof -tiTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)"
  [[ -n "$pids" ]] && kill $pids 2>/dev/null || true
}

stop_all() {
  echo
  log "Stopping services..."
  [[ -f "$GEN_NGINX_CONF" ]] && nginx -e "$NGINX_ERR" -c "$GEN_NGINX_CONF" -s stop 2>/dev/null && ok "nginx stopped" || true
  for pf in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
    if [[ -f "$pf" ]]; then
      pid="$(cat "$pf" 2>/dev/null || true)"
      if [[ -n "${pid:-}" ]]; then
        pkill -P "$pid" 2>/dev/null || true
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$pf"
    fi
  done
  kill_by_port "$FRONTEND_PORT"   # react-scripts child that npm spawned
  kill_by_port "$BACKEND_PORT"
  ok "All services stopped."
}
trap 'stop_all; exit 0' INT TERM

wait_for_port() {
  local port="$1" name="$2" tries="${3:-60}" i
  for ((i=0; i<tries; i++)); do
    lsof -iTCP:"$port" -sTCP:LISTEN -P >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}

echo
echo "${c_green}=== Docker Tar — local deploy ===${c_reset}"
echo

# ---------------------------------------------------------------------------
# 1. Prerequisites
# ---------------------------------------------------------------------------
log "Checking prerequisites..."
command -v python3 >/dev/null || die "python3 not found. Install Python 3."
command -v node    >/dev/null || die "node not found. Install Node.js."
command -v npm     >/dev/null || die "npm not found. Install Node.js."
command -v brew    >/dev/null || die "Homebrew not found. Install from https://brew.sh"
command -v docker  >/dev/null || die "docker not found. Install Docker Desktop."

if ! command -v nginx >/dev/null; then
  log "nginx not installed — installing via Homebrew (one-time)..."
  brew install nginx || die "brew install nginx failed."
fi
ok "Tooling present."

# Docker daemon must be running (backend pulls images through it).
if ! docker info >/dev/null 2>&1; then
  warn "Docker is not running — launching Docker Desktop..."
  open -a Docker 2>/dev/null || true
  for _ in $(seq 1 60); do docker info >/dev/null 2>&1 && break; sleep 2; done
  docker info >/dev/null 2>&1 || die "Docker did not start. Open Docker Desktop and retry."
fi
ok "Docker is running."

# Backend needs a config.yaml with secrets (Docker Hub token, etc.). It is
# gitignored, so a fresh clone won't have it — fail early with clear guidance.
if [[ ! -f "$SCRIPT_DIR/back-end/config.yaml" ]]; then
  echo
  warn "Missing back-end/config.yaml — the backend cannot start without it."
  echo "    Create it from the template and fill in your values:"
  echo "        cp back-end/config.yaml.example back-end/config.yaml"
  echo "    At minimum set a valid Docker Hub username + token under docker_client."
  die "back-end/config.yaml not found."
fi
ok "Backend config present."

# ---------------------------------------------------------------------------
# 2. Stop any previous run started by this script, then ensure ports are free
# ---------------------------------------------------------------------------
[[ -f "$GEN_NGINX_CONF" ]] && nginx -e "$NGINX_ERR" -c "$GEN_NGINX_CONF" -s stop 2>/dev/null || true
for pf in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
  if [[ -f "$pf" ]]; then
    pid="$(cat "$pf" 2>/dev/null || true)"
    [[ -n "${pid:-}" ]] && { pkill -P "$pid" 2>/dev/null || true; kill "$pid" 2>/dev/null || true; }
    rm -f "$pf"
  fi
done
sleep 1
for p in "$BACKEND_PORT" "$FRONTEND_PORT" "$NGINX_PORT"; do
  if lsof -iTCP:"$p" -sTCP:LISTEN -P >/dev/null 2>&1; then
    die "Port $p is already in use by another process. Free it (or change the port in this script) and retry."
  fi
done

# ---------------------------------------------------------------------------
# 3. Backend — venv + dependencies
# ---------------------------------------------------------------------------
VENV="$SCRIPT_DIR/back-end/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  log "Creating Python virtual environment..."
  python3 -m venv "$VENV" || die "Failed to create venv."
fi
REQ="$SCRIPT_DIR/back-end/requirements.txt"
if [[ ! -f "$DEPS_MARKER" || "$REQ" -nt "$DEPS_MARKER" ]]; then
  log "Installing backend dependencies (first run / changed requirements)..."
  "$VENV/bin/pip" install --quiet --upgrade pip || true
  "$VENV/bin/pip" install --quiet -r "$REQ" || die "pip install failed."
  touch "$DEPS_MARKER"
fi
ok "Backend dependencies ready."

# ---------------------------------------------------------------------------
# 4. Frontend — dependencies + local env pointing at nginx
# ---------------------------------------------------------------------------
if [[ ! -d "$SCRIPT_DIR/front-end/node_modules" ]]; then
  log "Installing frontend dependencies (npm install)..."
  ( cd "$SCRIPT_DIR/front-end" && npm install ) || die "npm install failed."
fi
cat > "$SCRIPT_DIR/front-end/.env.local" <<EOF
# Auto-generated by run-local.command — API calls go through the local nginx.
REACT_APP_BACKEND_URL=http://localhost:$NGINX_PORT
REACT_APP_DOCKERHUB_PROXY_URL=http://localhost:$NGINX_PORT
REACT_APP_TURNSTILE_SITE_KEY=0x4AAAAAAB02nGeNdVYltnlB
EOF
ok "Frontend configured (API base: http://localhost:$NGINX_PORT)."

# ---------------------------------------------------------------------------
# 5. Generate the local nginx config (same as nginx.conf, just a local port)
# ---------------------------------------------------------------------------
# Start from nginx.conf but: swap the port, and redirect the pid / access log /
# temp dirs into .local-run so nginx never needs to write under /opt/homebrew
# (which requires root). The error log is set via -e on the command line.
awk -v port="$NGINX_PORT" -v acclog="$LOG_DIR/nginx-access.log" \
    -v pid="$RUN_DIR/nginx.pid" -v tmp="$NGINX_TMP" '
  BEGIN { print "pid " pid ";" }
  { gsub(/listen 80;/, "listen " port ";"); print }
  /^http[[:space:]]*\{/ {
    print "    access_log " acclog ";"
    print "    client_body_temp_path " tmp "/client_body;"
    print "    proxy_temp_path "       tmp "/proxy;"
    print "    fastcgi_temp_path "     tmp "/fastcgi;"
    print "    uwsgi_temp_path "       tmp "/uwsgi;"
    print "    scgi_temp_path "        tmp "/scgi;"
  }
' "$SCRIPT_DIR/nginx.conf" > "$GEN_NGINX_CONF"
nginx -t -e "$NGINX_ERR" -c "$GEN_NGINX_CONF" >/dev/null 2>&1 || die "Generated nginx config failed validation. See $GEN_NGINX_CONF"

# ---------------------------------------------------------------------------
# 6. Start everything
# ---------------------------------------------------------------------------
log "Starting backend (uvicorn) on :$BACKEND_PORT ..."
( cd "$SCRIPT_DIR/back-end" && exec "$VENV/bin/python" app.py ) >"$LOG_DIR/backend.log" 2>&1 &
echo $! > "$BACKEND_PID_FILE"

log "Starting frontend (react-scripts) on :$FRONTEND_PORT ..."
( cd "$SCRIPT_DIR/front-end" && exec env BROWSER=none npm start ) >"$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$FRONTEND_PID_FILE"

log "Starting nginx on :$NGINX_PORT ..."
nginx -e "$NGINX_ERR" -c "$GEN_NGINX_CONF" || die "nginx failed to start. See $NGINX_ERR"

# ---------------------------------------------------------------------------
# 7. Wait for health, then open the browser
# ---------------------------------------------------------------------------
wait_for_port "$BACKEND_PORT"  backend  90  || die "Backend did not come up. See $LOG_DIR/backend.log"
ok "Backend up."
log "Waiting for frontend to compile (first build can take ~30s)..."
wait_for_port "$FRONTEND_PORT" frontend 180 || die "Frontend did not come up. See $LOG_DIR/frontend.log"
ok "Frontend up."
wait_for_port "$NGINX_PORT"    nginx    15  || die "nginx did not come up."
ok "nginx up."

APP_URL="http://localhost:$NGINX_PORT"
echo
echo "${c_green}=======================================================${c_reset}"
echo "${c_green}  Docker Tar is running!${c_reset}"
echo "     App (via nginx):  ${APP_URL}"
echo "     Frontend direct:  http://localhost:$FRONTEND_PORT"
echo "     Backend API:      http://localhost:$BACKEND_PORT"
echo
echo "  Logs: $LOG_DIR/{backend,frontend}.log"
echo "  Stop: press Ctrl+C here, or run stop-local.command"
echo "${c_green}=======================================================${c_reset}"
echo
open "$APP_URL" 2>/dev/null || true

log "Streaming logs (Ctrl+C to stop everything)..."
echo
tail -n +1 -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
