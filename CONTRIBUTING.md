# Contributing to Copilot Audio Notifications

Thank you for your interest in contributing to this project! This guide will help you understand our development workflow and conventions.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/copilot-audio-notifications.git
   cd copilot-audio-notifications
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run watch
   ```

4. **Test your changes**
   ```bash
   npm test
   ```

## Semantic Versioning and Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing. Releases are automatically generated based on commit messages that follow the [Conventional Commits](https://conventionalcommits.org/) specification.

### Commit Message Format

All commit messages must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

#### Breaking Changes

To trigger a major version bump, include `BREAKING CHANGE:` in the commit body or footer, or add `!` after the type:

```
feat!: remove deprecated audio API
```

or

```
feat: add new notification system

BREAKING CHANGE: The old notification API has been removed.
```

### Examples

#### Feature Addition (Minor Version)
```
feat: add volume control for notifications

Allows users to adjust notification volume from 0-100% in settings.
Closes #123
```

#### Bug Fix (Patch Version)
```
fix: resolve audio playback issue on macOS

Fixed issue where custom sound files wouldn't play on macOS due to 
incorrect path handling.

Fixes #456
```

#### Breaking Change (Major Version)
```
feat!: redesign settings configuration

BREAKING CHANGE: Configuration structure has changed. Users will need 
to reconfigure their notification settings.
```

## Release Process

### Automatic Releases

Releases happen automatically when commits are pushed to the main branch:

1. **CI/CD Pipeline**: Tests run on all supported platforms
2. **Semantic Analysis**: Commit messages are analyzed to determine version bump
3. **Changelog Generation**: CHANGELOG.md is automatically updated
4. **Version Bump**: package.json version is updated
5. **Extension Package**: .vsix file is created
6. **GitHub Release**: Release notes and artifacts are published
7. **VS Code Marketplace**: Extension is published automatically

### Branch Strategy

- **main**: Production releases (latest stable version)
- **beta**: Pre-release versions for testing new features
- **alpha**: Early development versions with experimental features

### Manual Release (if needed)

To test the release process locally:

```bash
# Dry run to see what would be released
npm run semantic-release:dry

# Manual release (not recommended for main branch)
npm run semantic-release
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write code following TypeScript best practices
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create a pull request**
   ```bash
   git push origin feat/your-feature-name
   ```

## Testing

- **Unit Tests**: `npm test`
- **Linting**: `npm run lint`
- **Type Checking**: `npm run check-types`
- **Manual Testing**: Use F5 to launch extension in development mode

## Code Style

- Use TypeScript for all source code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Update configuration documentation for new settings
- Include examples in commit messages

## Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server (link in README)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Extension credits
- Release notes (for significant contributions)

Thank you for contributing to make this extension better for everyone! 🎉
