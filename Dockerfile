# VS Code Extension Development Container
FROM node:20-alpine

# Install essential development tools
RUN apk add --no-cache \
    git \
    bash \
    curl \
    wget \
    zip \
    unzip \
    python3 \
    make \
    g++ \
    && npm install -g @vscode/vsce yo generator-code

# Set working directory
WORKDIR /workspace

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create directories for VS Code extension development
RUN mkdir -p .vscode out dist

# Install development dependencies and build
RUN npm run compile || true

# Expose port for development server if needed
EXPOSE 3000

# Default command
CMD ["npm", "run", "watch"]
