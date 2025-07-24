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
- **Parameters**: `image_name` (required), `image_tag` (default: "latest")
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

## Project Workflow Guidelines
- Make sure to update the readme.md file after every change that may interest the repo visitor

## Documentation Guidelines
- Ensure to document every change that may be relevant to future Claude Code instances in this CLAUDE.md file