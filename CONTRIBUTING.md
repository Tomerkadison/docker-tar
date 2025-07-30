# Contributing to Docker Tar

Thank you for your interest in contributing to Docker Tar! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/docker-tar.git
cd docker-tar
```

### 2. Set Up Development Environment
```bash
# Create environment files
cp front-end/.env.example front-end/.env
cp back-end/.env.example back-end/.env

# Option A: Docker Compose (Recommended)
docker-compose up

# Option B: Manual setup
# Terminal 1 - Backend
cd back-end
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend  
cd front-end
npm install
npm start
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow existing code style and conventions
- Test your changes thoroughly
- Update documentation if needed

### 5. Test Your Changes
```bash
# Test frontend
cd front-end
npm test

# Test backend functionality
cd back-end
python -m pytest  # if tests exist

# Test full integration with Docker Compose
docker-compose up
# Visit http://localhost and test functionality
```

### 6. Commit and Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 7. Create Pull Request
- Open a Pull Request from your fork to the main repository
- Provide a clear description of your changes
- Reference any related issues

## 📋 Development Guidelines

### Code Style

**Frontend (React/JavaScript)**
- Use functional components with hooks
- Follow existing naming conventions
- Use Tailwind CSS for styling
- Keep components focused and reusable

**Backend (Python)**
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Keep functions focused and well-documented
- Handle errors gracefully

### Commit Messages
Follow conventional commit format:
- `feat:` new feature
- `fix:` bug fix  
- `docs:` documentation changes
- `style:` formatting, no code change
- `refactor:` code restructuring
- `test:` adding tests
- `chore:` maintenance tasks

### Architecture Considerations

**Frontend Changes**
- Maintain compatibility with the environment variable system
- Test with different API base URLs
- Ensure responsive design works on mobile
- Consider loading states and error handling

**Backend Changes**
- Maintain Docker SDK compatibility
- Consider resource cleanup and memory usage
- Test with large Docker images
- Ensure streaming functionality works properly

**Infrastructure Changes**
- Test nginx configuration changes thoroughly
- Verify CORS handling for Docker Hub API
- Consider both development and production setups
- Document any new deployment requirements

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Operating system
   - Docker version
   - Browser version (for frontend issues)
   - Python version (for backend issues)

2. **Steps to Reproduce**
   - Clear, step-by-step instructions
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error Messages**
   - Full error messages or stack traces
   - Browser console errors (if applicable)
   - Server logs (if applicable)

## 💡 Feature Requests

When requesting features:

1. **Problem Description**
   - What problem does this solve?
   - Who would benefit from this feature?

2. **Proposed Solution**
   - How should this work?
   - Any implementation ideas?

3. **Alternatives Considered**
   - What other approaches did you consider?
   - Why is this the best approach?

## 🔍 Areas for Contribution

### High Priority
- **Performance Improvements** - Optimize large image downloads
- **Error Handling** - Better user feedback for failures
- **Testing** - Add comprehensive test coverage
- **Documentation** - Improve setup and deployment guides

### Medium Priority  
- **UI/UX Enhancements** - Improve user experience
- **Additional Features** - Image inspection, metadata display
- **Security** - Security audits and improvements
- **Monitoring** - Add logging and metrics

### Low Priority
- **Internationalization** - Multi-language support
- **Themes** - Dark/light mode toggle
- **Analytics** - Usage statistics (privacy-conscious)

## ⚠️ Important Notes

### Production Safety
- Never commit changes that could break the production deployment
- Test nginx configuration changes thoroughly
- Consider backwards compatibility

### Security
- Never commit secrets, API keys, or passwords
- Be mindful of potential security vulnerabilities
- Follow secure coding practices

### Dependencies
- Keep dependencies up to date
- Consider security implications of new dependencies
- Document any new system requirements

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Image search functionality works
- [ ] Tag selection and loading works
- [ ] Image download completes successfully
- [ ] Large images (>1GB) download without issues
- [ ] Error states display helpful messages
- [ ] Responsive design works on mobile
- [ ] CORS proxy functionality works correctly

### Automated Testing
- Add unit tests for new functions
- Add integration tests for API endpoints
- Consider end-to-end tests for critical user flows

## 📝 Documentation

### Code Documentation
- Comment complex logic
- Update function docstrings
- Keep inline comments concise and helpful

### User Documentation
- Update README.md for new features
- Update CLAUDE.md for technical changes
- Add deployment notes if needed

## 🙋‍♀️ Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Code Reviews** - Don't hesitate to ask for feedback in PRs

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Docker Tar! 🐳