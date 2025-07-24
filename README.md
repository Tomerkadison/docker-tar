<div align="center">
  <img src="front-end/public/docker-icon-new.png" alt="Docker Tar Logo" width="120" height="120">
  
  # Docker Tar
  
  **Download Docker Images as Tar Files - No Docker Required**
  
  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-dockertar.zapto.org-blue?style=for-the-badge)](https://dockertar.zapto.org)
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

## 🎯 Use Cases

- **Offline Environments** - Download images for air-gapped systems
- **CI/CD Pipelines** - Integrate into build processes without Docker daemon
- **Education & Training** - Distribute Docker images to students easily
- **Backup & Archive** - Create local backups of critical images
- **Network Restrictions** - Bypass Docker Hub rate limits or network policies

## 🖥️ Screenshots

<div align="center">
  
### Main Interface
*Search for any Docker image and select your preferred tag*

### Download in Progress  
*Real-time progress with visual feedback*

### Success State
*Your tar file is ready for use*

</div>

## 🏗️ Architecture

Docker Tar is built with modern web technologies for optimal performance and reliability:

### Frontend
- **React 18** - Modern, responsive user interface
- **Turnstone** - Intelligent search with autocomplete
- **Tailwind CSS** - Clean, professional styling
- **Ant Design** - Polished UI components

### Backend
- **FastAPI** - High-performance Python web framework
- **Docker SDK** - Direct integration with Docker engine
- **Streaming Response** - Efficient large file downloads
- **Background Tasks** - Automatic cleanup and resource management

### Infrastructure
- **Nginx** - Reverse proxy with SSL termination
- **Let's Encrypt** - Free SSL certificates

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker Engine
- Nginx (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/docker-tar.git
   cd docker-tar
   ```

2. **Start the backend**
   ```bash
   cd back-end
   pip install -r requirements.txt
   python app.py
   ```

3. **Start the frontend**
   ```bash
   cd front-end
   npm install
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

For production deployment with SSL, configure Nginx as a reverse proxy to the backend and frontend services.

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
curl -O "https://dockertar.zapto.org/install?image_name=nginx&image_tag=alpine"
```

## 🛠️ Development

### Project Structure
```
docker-tar/
├── back-end/          # FastAPI server
│   ├── app.py         # Main application
│   └── requirements.txt
├── front-end/         # React application  
│   ├── src/
│   │   ├── App.js     # Main component
│   │   └── components/
│   └── package.json
└── CLAUDE.md          # Technical documentation
```

### Available Scripts

**Frontend:**
```bash
npm start          # Development server
npm run build      # Production build
npm run build:css  # Build Tailwind CSS
```

**Backend:**
```bash
python app.py      # Start FastAPI server
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Docker Hub** - For providing the public registry API
- **FastAPI** - For the excellent Python web framework
- **React Community** - For the amazing ecosystem of components
- **All Contributors** - Thank you for making this project better!

## 📞 Support

- **Live Demo**: [dockertar.zapto.org](https://dockertar.zapto.org)
- **Issues**: [GitHub Issues](https://github.com/yourusername/docker-tar/issues)
- **Feedback**: [Google Form](https://forms.gle/Mr3vmAk5Fz81VRKh6)

---

<div align="center">
  
**Made with ❤️ for the Docker community**

[⭐ Star this repo](https://github.com/yourusername/docker-tar) if you find it useful!

</div>