#!/bin/bash

# Copilot Audio Notifications - Development Script
# This script manages the Docker development environment

set -e

CONTAINER_NAME="copilot-audio-notifications-dev"
PROJECT_NAME="copilot-audio-notifications"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🔔 Copilot Audio Notifications Development Environment${NC}"
    echo -e "${BLUE}====================================================${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage: ./dev.sh [command]${NC}"
    echo
    echo "Commands:"
    echo "  build     - Build the Docker development environment"
    echo "  start     - Start the development container"
    echo "  stop      - Stop the development container"
    echo "  restart   - Restart the development container"
    echo "  shell     - Open a shell in the development container"
    echo "  logs      - Show container logs"
    echo "  test      - Run tests in container"
    echo "  package   - Build the extension package (.vsix)"
    echo "  clean     - Clean up containers and volumes"
    echo "  install   - Install/update dependencies"
    echo "  status    - Show container status"
    echo
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
        echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker is not running${NC}"
        echo "Please start Docker Desktop"
        exit 1
    fi
}

build_container() {
    echo -e "${BLUE}🔨 Building development container...${NC}"
    docker-compose build vscode-extension-dev
    echo -e "${GREEN}✅ Container built successfully${NC}"
}

start_container() {
    echo -e "${BLUE}🚀 Starting development container...${NC}"
    docker-compose up -d vscode-extension-dev
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo -e "${YELLOW}💡 Use './dev.sh logs' to see output${NC}"
}

stop_container() {
    echo -e "${BLUE}🛑 Stopping development container...${NC}"
    docker-compose stop vscode-extension-dev
    echo -e "${GREEN}✅ Container stopped${NC}"
}

restart_container() {
    echo -e "${BLUE}🔄 Restarting development container...${NC}"
    docker-compose restart vscode-extension-dev
    echo -e "${GREEN}✅ Container restarted${NC}"
}

open_shell() {
    echo -e "${BLUE}🐚 Opening shell in development container...${NC}"
    docker-compose exec vscode-extension-dev /bin/bash
}

show_logs() {
    echo -e "${BLUE}📋 Container logs:${NC}"
    docker-compose logs -f vscode-extension-dev
}

run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    docker-compose run --rm test-runner
}

package_extension() {
    echo -e "${BLUE}📦 Building extension package...${NC}"
    docker-compose exec vscode-extension-dev npm run package
    echo -e "${GREEN}✅ Extension packaged successfully${NC}"
    echo -e "${YELLOW}💡 Check for .vsix file in the project directory${NC}"
}

clean_environment() {
    echo -e "${BLUE}🧹 Cleaning up development environment...${NC}"
    docker-compose down -v
    docker system prune -f --volumes
    echo -e "${GREEN}✅ Environment cleaned${NC}"
}

install_dependencies() {
    echo -e "${BLUE}📥 Installing/updating dependencies...${NC}"
    docker-compose exec vscode-extension-dev npm install
    echo -e "${GREEN}✅ Dependencies updated${NC}"
}

show_status() {
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker-compose ps
    echo
    echo -e "${BLUE}📊 System Status:${NC}"
    docker system df
}

# Main script logic
print_header

if [ $# -eq 0 ]; then
    print_usage
    exit 0
fi

check_docker

case "$1" in
    build)
        build_container
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    shell)
        open_shell
        ;;
    logs)
        show_logs
        ;;
    test)
        run_tests
        ;;
    package)
        package_extension
        ;;
    clean)
        clean_environment
        ;;
    install)
        install_dependencies
        ;;
    status)
        show_status
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        print_usage
        exit 1
        ;;
esac
