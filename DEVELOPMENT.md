# Development Guide

This guide covers the development setup and workflows for the Copilot Audio Notifications VS Code extension using Docker.

## 🐳 Docker Development Environment

We use Docker to ensure a consistent development environment across all platforms, avoiding npm/TypeScript version conflicts.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git installed on your system

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Cerwym/copilot-audio-notifications.git
   cd copilot-audio-notifications
   ```

2. **Build and start the development environment**:
   
   **Linux/macOS**:
   ```bash
   chmod +x dev.sh
   ./dev.sh build
   ./dev.sh start
   ```
   
   **Windows**:
   ```cmd
   dev.bat build
   dev.bat start
   ```

3. **Open a shell in the container**:
   
   **Linux/macOS**: `./dev.sh shell`
   **Windows**: `dev.bat shell`

### Development Scripts

| Command | Linux/macOS | Windows | Description |
|---------|-------------|---------|-------------|
| Build container | `./dev.sh build` | `dev.bat build` | Build the Docker development environment |
| Start container | `./dev.sh start` | `dev.bat start` | Start the development container |
| Stop container | `./dev.sh stop` | `dev.bat stop` | Stop the development container |
| Open shell | `./dev.sh shell` | `dev.bat shell` | Open a bash shell in the container |
| View logs | `./dev.sh logs` | `dev.bat logs` | Show container logs |
| Run tests | `./dev.sh test` | `dev.bat test` | Run the test suite |
| Package extension | `./dev.sh package` | `dev.bat package` | Build .vsix package |
| Clean environment | `./dev.sh clean` | `dev.bat clean` | Clean up containers and volumes |
| Install dependencies | `./dev.sh install` | `dev.bat install` | Install/update npm dependencies |
| Show status | `./dev.sh status` | `dev.bat status` | Show container and system status |

### Development Workflow

1. **Initial Setup**:
   ```bash
   # Build the development environment
   ./dev.sh build
   
   # Start the container with watch mode
   ./dev.sh start
   ```

2. **Active Development**:
   ```bash
   # Open a shell for running commands
   ./dev.sh shell
   
   # Inside the container, you can run:
   npm run watch          # Start TypeScript compiler in watch mode
   npm run lint           # Run ESLint
   npm run test           # Run tests
   npm run compile        # Compile TypeScript
   ```

3. **Testing Changes**:
   ```bash
   # Run tests
   ./dev.sh test
   
   # Or run specific npm commands in the container
   ./dev.sh shell
   npm run test -- --grep "specific test"
   ```

4. **Building for Release**:
   ```bash
   # Package the extension
   ./dev.sh package
   
   # This creates a .vsix file in the project directory
   ```

### Container Architecture

The development container includes:

- **Node.js 18 Alpine**: Lightweight Node.js runtime
- **TypeScript**: Latest TypeScript compiler
- **VS Code Extension Tools**: `@vscode/vsce` for packaging
- **Development Tools**: ESLint, testing frameworks, build tools
- **System Tools**: Git, bash, essential build tools

### Volume Mounts

- **Source Code**: `./` → `/workspace` (live reload)
- **Node Modules**: Persistent volume for better performance
- **VS Code Settings**: `./.vscode` → `/workspace/.vscode`

### Environment Variables

- `NODE_ENV=development`: Development mode
- Working directory: `/workspace`

## 🔧 Local Development (Alternative)

If you prefer to develop without Docker, ensure you have:

- Node.js 18 or later
- npm 8 or later
- VS Code with the Extension Development Host

```bash
# Install dependencies
npm install

# Start development
npm run watch

# Run tests
npm test

# Package extension
npm run package:vsix
```

## 🧪 Testing

### Running Tests

**In Docker**:
```bash
./dev.sh test
```

**Locally**:
```bash
npm test
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test command execution and configuration
- **End-to-End Tests**: Test full user workflows

### Test Files

- `src/test/extension.test.ts`: Main test suite
- Test coverage includes:
  - Extension activation
  - Command registration and execution
  - Configuration management
  - Audio service functionality
  - Error handling

## 📦 Building and Packaging

### Create Extension Package

**Docker**:
```bash
./dev.sh package
```

**Locally**:
```bash
npm run package:vsix
```

This creates a `.vsix` file that can be:
- Installed locally: `code --install-extension copilot-audio-notifications-0.0.1.vsix`
- Published to the marketplace
- Distributed manually

### Publishing to Marketplace

1. **Get a Personal Access Token** from [Azure DevOps](https://dev.azure.com/)

2. **Login to VSCE**:
   ```bash
   ./dev.sh shell
   npx vsce login PeterLockett
   ```

3. **Publish**:
   ```bash
   npm run publish
   # Or for pre-release:
   npm run publish:pre
   ```

## 🐛 Debugging

### VS Code Debugging

1. Open the project in VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Run Extension"
4. Press F5 to launch a new Extension Development Host

### Container Debugging

```bash
# View container logs
./dev.sh logs

# Check container status
./dev.sh status

# Open shell for investigation
./dev.sh shell
```

### Common Issues

**Docker not running**:
- Start Docker Desktop
- Check `docker info` command works

**Permission issues (Linux/macOS)**:
```bash
chmod +x dev.sh
```

**Port conflicts**:
- Check if port 3000 is available
- Modify `docker-compose.yml` if needed

**Node modules issues**:
```bash
# Clean and rebuild
./dev.sh clean
./dev.sh build
./dev.sh install
```

## 🔄 Continuous Integration

The project is set up for CI/CD with:

- **GitHub Actions**: Automated testing and building
- **Docker**: Consistent build environment
- **ESLint**: Code quality checks
- **TypeScript**: Type checking
- **Automated Testing**: Full test suite execution

## 📁 Project Structure

```
copilot-audio-notifications/
├── .github/                 # GitHub templates and workflows
├── .vscode/                 # VS Code settings and launch configs
├── src/                     # Source code
│   ├── extension.ts         # Main extension file
│   └── test/               # Test files
├── docker-compose.yml       # Docker services configuration
├── Dockerfile              # Development container
├── dev.sh                  # Development script (Linux/macOS)
├── dev.bat                 # Development script (Windows)
├── package.json            # Extension manifest and dependencies
├── tsconfig.json           # TypeScript configuration
├── eslint.config.mjs       # ESLint configuration
├── esbuild.js              # Build configuration
└── README.md               # User documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Set up the development environment: `./dev.sh build && ./dev.sh start`
4. Make your changes
5. Run tests: `./dev.sh test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- TypeScript with strict typing
- ESLint for code quality
- Conventional commit messages
- Comprehensive test coverage

### Development Guidelines

- Test all changes thoroughly
- Update documentation as needed
- Follow VS Code extension best practices
- Maintain cross-platform compatibility
- Keep the Docker environment updated

---

**Happy coding! 🎉**
