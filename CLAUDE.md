# Docker Tar Project - Claude Code Documentation

## Project Overview
**Docker Tar** is a web application that allows users to download Docker images as tar files without requiring a local Docker installation. Users can search for images, select tags, and download complete Docker images directly from their browser.

## Architecture
- **Frontend**: React.js (18.1.0) with Tailwind CSS and Ant Design
- **Backend**: Python FastAPI with Docker SDK
- **Deployment**: Nginx reverse proxy
- **Domain**: dockertar.zapto.org (production)
- **No Database**: Stateless application using Docker Hub APIs

## Directory Structure
```
docker-tar/
├── back-end/
│   ├── app.py              # FastAPI server with Docker integration
│   └── requirements.txt    # Python dependencies
└── front-end/
    ├── src/
    │   ├── App.js         # Main React application
    │   └── components/
    │       ├── SearchBox.js   # Docker Hub search with Turnstone
    │       └── TagSelect.js   # Tag selection with React Select
    ├── package.json       # React dependencies and scripts
    └── public/            # Static assets
```

## Backend (app.py)

### Key Functionality
- **Single API endpoint**: `GET /install/image-tar`
- **Parameters**: `image_name` (required), `image_tag` (required might be empty)
- **Process Flow**:
  1. Pull Docker image using `client.images.pull()`
  2. Save image as tar using `image.save()`
  3. Stream tar file to client as download
  4. Background cleanup removes image to save disk space

### Important Details
- Docker client timeout: 650 seconds
- Uses `DEFAULT_DATA_CHUNK_SIZE` for streaming
- Global timing variables for performance monitoring
- CORS enabled for all origins
- Background task cleanup with `delete_image()` function

## Frontend Components

### App.js (Main Application)
**Three Application States:**
1. **StartingPage**: Search and selection interface
2. **LoadingPage**: Download progress with animated GIF
3. **SuccessPage**: Download completion confirmation

**Key Features:**
- Image search with tag fetching on selection
- Download validation (checks file size > 10 bytes)
- Error handling with user feedback
- Responsive design for mobile/desktop

### SearchBox.js (Docker Hub Search)
- **Library**: Turnstone autocomplete
- **Two search categories**:
  - Verified Images: `official=true&open_source=true`
  - Community Images: `source=community`
- **API**: Docker Hub search v3 API via nginx proxy
- Custom styling with dark theme

### TagSelect.js (Image Tag Selection)
- **Library**: React Select with custom filtering
- **Smart tag loading**: Fetches ALL tags with concurrent pagination
- **Advanced filtering**: Exact match → starts with → contains priority
- **Performance**: Handles large tag lists efficiently
- Real-time search with debouncing

## Local One-Click Run (macOS)

`run-local.command` (double-clickable in Finder) builds and starts the full
stack; `stop-local.command` stops it. Key facts for future changes:

- **Ports:** backend `:8080`, frontend `:3000`, nginx `:8081` (open
  `http://localhost:8081`). nginx uses `8081` instead of production's `80` so
  **no sudo is needed**. Override via `NGINX_PORT` at the top of the script.
- **Runtime artifacts** live in `.local-run/` (gitignored): `logs/`,
  `nginx.local.conf` (generated), `nginx.pid`, `tmp/` (nginx temp dirs),
  `backend.pid`, `frontend.pid`, `.deps-installed` (pip marker).
- **nginx config** is generated from `nginx.conf` by an `awk` block that swaps
  `listen 80` → `listen $NGINX_PORT` and redirects pid/access-log/temp paths
  into `.local-run/` (nginx's compiled defaults under `/opt/homebrew` are not
  user-writable). The error log is set via `nginx -e`. If you edit `nginx.conf`,
  the launcher picks up changes automatically on next run.
- **Backend venv:** `back-end/.venv` (gitignored). Deps reinstall only when
  `requirements.txt` is newer than the marker.
- The script generates `front-end/.env.local` pointing the frontend at
  `http://localhost:$NGINX_PORT`. See the "Configuration (URLs)" section below.
- **Clone portability:** `back-end/config.yaml` is gitignored (secrets), so a
  fresh clone lacks it and the backend cannot start. `back-end/config.yaml.example`
  is the committed template; the launcher preflight-checks for `config.yaml` and
  aborts with guidance if absent. Frontend + nginx need no secrets.

## Configuration (URLs)

All external URLs and endpoints are centralized in `front-end/src/config.js`.
There are **no hardcoded URLs** in the components — `App.js`, `SearchBox.js`, and
`TagSelect.js` all import from `config.js`.

`config.js` is driven by Create React App environment variables (must be prefixed
with `REACT_APP_`), falling back to the production host when unset:
- `REACT_APP_BACKEND_URL` → `installUrl` (`/install`), `reportSuccessUrl` (`/report/success`)
- `REACT_APP_DOCKERHUB_PROXY_URL` → `dockerHubSearchUrl`, `dockerHubTagsUrl(namespace, image)`
- `REACT_APP_TURNSTILE_SITE_KEY` → Cloudflare Turnstile site key

To run locally, copy `front-end/.env.example` to `front-end/.env.local` and set
the values (e.g. `http://localhost:8080`), then restart `npm start`. `.env.local`
is gitignored; `.env.example` is the committed template.

When adding a new external URL, add it to `config.js` rather than hardcoding it.

## API Integration

### Docker Hub APIs (via nginx proxy)
```
Search: /dockerhub/api/search/v3/catalog/search
Tags: /dockerhub/v2/repositories/{namespace}/{image}/tags/
```

### Tag Fetching Strategy
1. Fetch first page (100 tags) to get total count
2. Calculate total pages needed
3. Fetch remaining pages concurrently with Promise.all()
4. Combine and format all results

## Infrastructure

### Nginx Configuration
```
/ → Frontend (localhost:3000)
/install → Backend (localhost:8080/install/image-tar) 
/dockerhub/ → Docker Hub API proxy
```
- CORS headers for Docker Hub proxy
- Reverse proxy setup for production deployment

## Development Commands
```bash
# Frontend
cd front-end
npm start                    # Development server
npm run build               # Production build
npm run build:css           # Tailwind CSS build

# Backend  
cd back-end
python app.py               # Start FastAPI server
```

## Recent Development History
Based on git commits:
- Improved file download error handling with better error messages
- Enhanced tag search functionality for better user experience
- Backend failure handling improvements

## Security & Performance Notes
- No sensitive data stored or logged
- Images are automatically cleaned up after download
- Concurrent tag fetching for better performance
- File size validation prevents empty downloads
- Production deployment with reverse proxy setup

## Key Files to Monitor
- `back-end/app.py:55` - Main server logic
- `front-end/src/App.js:96-102` - Download handling
- `front-end/src/components/TagSelect.js:6-46` - Tag fetching logic

## README Screenshots

The README's Screenshots section is backed by real images in `docs/screenshots/`
(`01-search.png`, `02-tag-select.png`, `03-downloading.png`, `04-success.png`),
captured against the local stack (`http://localhost:8081`).

To regenerate them, a reproducible driver lives at `.local-run/shots/shoot.mjs`
(the whole `.local-run/` tree is gitignored). Key facts:

- The download flow is gated by a **Cloudflare Turnstile** "Verify you are human"
  challenge. A vanilla automated browser fails it (error `600010`) because
  Cloudflare detects automation — so plain Playwright/Puppeteer can't reach the
  Loading/Success pages.
- The script uses **CloakBrowser** (`npm i cloakbrowser playwright-core`), a
  stealth Chromium that passes Turnstile. Launch with `headless:false` +
  `humanize:true`. The Turnstile checkbox is inside a managed iframe/shadow root
  that CSS locators don't reach, so the script clicks it at its fixed on-screen
  position (CSS ≈ `590,308` for the centered VerifyPage layout at a 1440×900
  viewport) and retries every 5s until the LoadingPage appears.
- The Success screenshot requires a **real image pull** by the backend, so Docker
  Desktop must be running and `back-end/config.yaml` present. Run: from
  `.local-run/shots/`, `node shoot.mjs` (screenshots are written to the repo root
  then moved into `docs/screenshots/`).
- Backend note: `install_steps.py:veirfy_token` short-circuits when the token
  equals `turnstile.skip_verify_token` in `config.yaml` — an alternative bypass
  for local testing that doesn't need a real Turnstile token.

## Project Workflow Guidelines
- Make sure to update the readme.md file after every change that may interest the repo visitor

## Documentation Guidelines
- Ensure to document every change that may be relevant to future Claude Code instances in this CLAUDE.md file