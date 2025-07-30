<div align="center">
  <img src="front-end/public/docker-icon-new.png" alt="Docker Tar Logo" width="120" height="120">
  
  # Docker Tar
  
  **Download Docker Images as Tar Files - No Docker Required**
  
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](https://python.org)
  [![React](https://img.shields.io/badge/React-18.1+-61dafb?style=for-the-badge&logo=react)](https://reactjs.org)
  
</div>

---

## 🚀 What is Docker Tar?

Docker Tar solves a fundamental problem: **downloading Docker images without having Docker installed**. Whether you're on a restricted network, working on a machine without Docker, or need to distribute images offline, Docker Tar provides a simple web interface to download any public Docker image as a tar file.

### ✨ Key Features

- 🔍 **Smart Search** - Search through millions of Docker Hub images with intelligent autocomplete
- 🏷️ **Complete Tag Support** - Browse and select from all available image tags
- ⚡ **Instant Downloads** - Stream images directly to your browser as tar files
- 🎯 **No Installation Required** - Works entirely through your web browser
- 🔒 **Secure & Clean** - Images are automatically cleaned up after download
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🏗️ Architecture Overview

Docker Tar consists of three main components that work together:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │───▶│  Nginx Proxy    │───▶│ FastAPI Backend │
│   (Port 3000)   │    │  (Port 80/443)  │    │   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Docker Hub API │
                    │   (External)    │
                    └─────────────────┘
```

### Component Details

#### Frontend (React)
- **Technology**: React 18 with Tailwind CSS and Ant Design
- **Functionality**: User interface for searching images and managing downloads
- **Communication**: Makes API calls to backend through nginx proxy
- **Build**: Static files served by nginx in production

#### Backend (FastAPI + Python)
- **Technology**: FastAPI with Docker SDK for Python
- **Functionality**: 
  - Pulls Docker images using Docker Engine
  - Streams tar files directly to client
  - Manages image cleanup in background
- **API**: Single endpoint `/install/image-tar`

#### Nginx Reverse Proxy
- **Critical Component**: **Required for CORS handling**
- **Routes**:
  - `/` → Frontend static files
  - `/install` → Backend API
  - `/dockerhub/` → Docker Hub API (CORS proxy)
- **Why needed**: Docker Hub API doesn't allow direct browser requests due to CORS policy

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker Engine (must be running)
- Nginx (for production deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/docker-tar.git
   cd docker-tar
   ```

2. **Configure environment variables**
   ```bash
   # Backend configuration
   cd back-end
   cp .env.example .env
   # Edit .env as needed
   
   # Frontend configuration  
   cd ../front-end
   cp .env.example .env
   # Edit .env as needed
   ```

3. **Start the backend**
   ```bash
   cd back-end
   pip install -r requirements.txt
   python app.py
   ```

4. **Start the frontend**
   ```bash
   cd front-end
   npm install
   npm start
   ```

5. **Configure local development proxy**
   
   Since the Docker Hub API requires CORS handling, you have two options:
   
   **Option A: Use Docker Compose (Recommended)**
   ```bash
   docker-compose up
   ```
   
   **Option B: Configure nginx manually**
   - Use the provided `nginx.conf` example
   - Update paths to match your setup
   - Restart nginx

6. **Open your browser**
   ```
   http://localhost:3000 (development)
   http://localhost (with nginx)
   ```

## 🐳 Docker Compose Setup

The easiest way to run the complete application:

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- Frontend on port 3000
- Backend on port 8080  
- Nginx proxy on port 80
- All services configured with proper networking

## 🔧 Production Deployment

### Environment Configuration

**Backend (.env)**
```bash
HOST=0.0.0.0
PORT=8080
DOCKER_TIMEOUT=650
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env)**
```bash
REACT_APP_API_BASE_URL=https://yourdomain.com
GENERATE_SOURCEMAP=false
```

### Nginx Configuration

The nginx configuration is **critical** for proper operation. Key requirements:

1. **CORS Proxy for Docker Hub API** - Required because browsers can't directly call Docker Hub API
2. **Backend API Routing** - Routes `/install` to FastAPI backend
3. **Frontend Static Files** - Serves React build files
4. **SSL Termination** - Handles HTTPS certificates

See `nginx.conf.example` for a complete configuration template.

### Deployment Steps

1. **Build frontend**
   ```bash
   cd front-end
   npm run build
   ```

2. **Configure nginx**
   ```bash
   # Copy and customize nginx configuration
   cp nginx.conf.example /etc/nginx/sites-available/docker-tar
   ln -s /etc/nginx/sites-available/docker-tar /etc/nginx/sites-enabled/
   ```

3. **Start services**
   ```bash
   # Start backend
   cd back-end
   python app.py &
   
   # Restart nginx
   sudo systemctl restart nginx
   ```

4. **Setup SSL (recommended)**
   ```bash
   # Using certbot for Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

## 📡 API Reference

### Download Image Tar

```http
GET /install/image-tar?image_name={name}&image_tag={tag}
```

**Parameters:**
- `image_name` (required) - Docker image name (e.g., `nginx`, `ubuntu`)
- `image_tag` (optional) - Image tag (defaults to `latest`)

**Response:**
- Content-Type: `application/x-tar`
- Content-Disposition: `attachment; filename="{image_name}.tar"`
- Body: Streaming tar file data

**Example:**
```bash
curl -O "https://yourdomain.com/install/image-tar?image_name=nginx&image_tag=alpine"
```

## 🛠️ Development

### Project Structure
```
docker-tar/
├── back-end/                 # FastAPI server
│   ├── app.py               # Main application  
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
├── front-end/               # React application
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── components/     # UI components
│   │   └── constants/      # Configuration
│   ├── package.json        # Node dependencies
│   └── .env.example        # Environment template
├── docker-compose.yml      # Complete dev environment
├── nginx.conf.example      # Nginx configuration template
└── CLAUDE.md              # Technical documentation
```

### Available Scripts

**Frontend:**
```bash
npm start          # Development server (port 3000)
npm run build      # Production build
npm run build:css  # Build Tailwind CSS
```

**Backend:**
```bash
python app.py      # Start FastAPI server (port 8080)
```

### Environment Variables

**Frontend Configuration:**
- `REACT_APP_API_BASE_URL` - Backend API URL (auto-detected if not set)

**Backend Configuration:**
- `HOST` - Server bind address (default: 0.0.0.0)
- `PORT` - Server port (default: 8080)
- `DOCKER_TIMEOUT` - Docker operations timeout (default: 650s)
- `CORS_ORIGINS` - Allowed CORS origins (default: *)

## ⚠️ Important Notes

### Docker Hub API CORS Requirement

**Critical**: The frontend cannot directly call Docker Hub APIs due to CORS restrictions. The nginx proxy configuration is **mandatory** for the application to work properly. Without it:
- Image search will fail
- Tag fetching will not work
- The application will be non-functional

### Docker Engine Requirement

The backend requires a running Docker Engine to:
- Pull images from Docker Hub
- Save images as tar files
- Manage image cleanup

Ensure Docker is installed and running on the host machine.

### Resource Management

- Images are automatically deleted after download to save disk space
- Large images may require significant bandwidth and storage during processing
- Consider disk space monitoring for production deployments

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)  
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Test your changes with both Docker Compose and manual setup
- Update documentation as needed
- Ensure nginx configuration works with your changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Failed to fetch" errors:**
- Check that nginx proxy is configured correctly
- Verify Docker Hub API routes are accessible
- Check browser console for CORS errors

**Docker pull failures:**
- Ensure Docker Engine is running
- Check network connectivity to Docker Hub
- Verify image name and tag are correct

**Large download timeouts:**
- Increase `DOCKER_TIMEOUT` environment variable
- Check available disk space
- Monitor network connectivity

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/docker-tar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/docker-tar/discussions)

---

<div align="center">
  
**Made with ❤️ for the Docker community**

[⭐ Star this repo](https://github.com/yourusername/docker-tar) if you find it useful!

</div>