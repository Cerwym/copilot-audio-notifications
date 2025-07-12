@echo off
REM Copilot Audio Notifications - Development Script for Windows
REM This script manages the Docker development environment

setlocal EnableDelayedExpansion

set CONTAINER_NAME=copilot-audio-notifications-dev
set PROJECT_NAME=copilot-audio-notifications

echo 🔔 Copilot Audio Notifications Development Environment
echo ====================================================

if "%1"=="" (
    call :print_usage
    exit /b 0
)

call :check_docker
if errorlevel 1 exit /b 1

if "%1"=="build" (
    call :build_container
) else if "%1"=="start" (
    call :start_container
) else if "%1"=="stop" (
    call :stop_container
) else if "%1"=="restart" (
    call :restart_container
) else if "%1"=="shell" (
    call :open_shell
) else if "%1"=="logs" (
    call :show_logs
) else if "%1"=="test" (
    call :run_tests
) else if "%1"=="package" (
    call :package_extension
) else if "%1"=="clean" (
    call :clean_environment
) else if "%1"=="install" (
    call :install_dependencies
) else if "%1"=="status" (
    call :show_status
) else (
    echo ❌ Unknown command: %1
    call :print_usage
    exit /b 1
)
exit /b 0

:print_usage
echo Usage: dev.bat [command]
echo.
echo Commands:
echo   build     - Build the Docker development environment
echo   start     - Start the development container
echo   stop      - Stop the development container
echo   restart   - Restart the development container
echo   shell     - Open a shell in the development container
echo   logs      - Show container logs
echo   test      - Run tests in container
echo   package   - Build the extension package (.vsix)
echo   clean     - Clean up containers and volumes
echo   install   - Install/update dependencies
echo   status    - Show container status
echo.
exit /b 0

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop
    exit /b 1
)
exit /b 0

:build_container
echo 🔨 Building development container...
docker-compose build vscode-extension-dev
if errorlevel 1 (
    echo ❌ Failed to build container
    exit /b 1
)
echo ✅ Container built successfully
exit /b 0

:start_container
echo 🚀 Starting development container...
docker-compose up -d vscode-extension-dev
if errorlevel 1 (
    echo ❌ Failed to start container
    exit /b 1
)
echo ✅ Container started successfully
echo 💡 Use 'dev.bat logs' to see output
exit /b 0

:stop_container
echo 🛑 Stopping development container...
docker-compose stop vscode-extension-dev
echo ✅ Container stopped
exit /b 0

:restart_container
echo 🔄 Restarting development container...
docker-compose restart vscode-extension-dev
echo ✅ Container restarted
exit /b 0

:open_shell
echo 🐚 Opening shell in development container...
docker-compose exec vscode-extension-dev /bin/bash
exit /b 0

:show_logs
echo 📋 Container logs:
docker-compose logs -f vscode-extension-dev
exit /b 0

:run_tests
echo 🧪 Running tests...
docker-compose run --rm test-runner
exit /b 0

:package_extension
echo 📦 Building extension package...
docker-compose exec vscode-extension-dev npm run package
echo ✅ Extension packaged successfully
echo 💡 Check for .vsix file in the project directory
exit /b 0

:clean_environment
echo 🧹 Cleaning up development environment...
docker-compose down -v
docker system prune -f --volumes
echo ✅ Environment cleaned
exit /b 0

:install_dependencies
echo 📥 Installing/updating dependencies...
docker-compose exec vscode-extension-dev npm install
echo ✅ Dependencies updated
exit /b 0

:show_status
echo 📊 Container Status:
docker-compose ps
echo.
echo 📊 System Status:
docker system df
exit /b 0
