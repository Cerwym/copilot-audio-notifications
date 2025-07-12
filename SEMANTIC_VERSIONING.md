# Semantic Versioning and Release Automation

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for fully automated version management and package publishing. This document explains how the system works and how to contribute effectively.

## Overview

Every commit to the `main` branch is analyzed to determine:
- Whether a release should be made
- What version number should be assigned
- What changes should be documented

This is all done automatically based on your commit messages following the [Conventional Commits](https://conventionalcommits.org/) specification.

## How It Works

### 1. Commit Analysis
When code is pushed to the main branch, semantic-release analyzes commit messages to determine the type of changes:

- **MAJOR version** (1.0.0 → 2.0.0): Breaking changes
- **MINOR version** (1.0.0 → 1.1.0): New features
- **PATCH version** (1.0.0 → 1.0.1): Bug fixes

### 2. Automated Release Process

If commits warrant a release, the system automatically:

1. **Determines new version** based on commit types
2. **Generates release notes** from commit messages
3. **Updates CHANGELOG.md** with new entries
4. **Updates package.json** with new version
5. **Creates and publishes VS Code extension package** (.vsix file)
6. **Creates GitHub release** with notes and artifacts
7. **Publishes to VS Code Marketplace** 
8. **Commits changes back** to repository

### 3. Branch Strategy

- **main**: Production releases (stable)
- **beta**: Pre-release versions (beta channel)
- **alpha**: Early development (alpha channel)

## Commit Message Format

### Basic Structure
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types and Version Bumps

| Type | Description | Version Bump | Example |
|------|-------------|--------------|---------|
| `feat` | New feature | MINOR | `feat: add volume control` |
| `fix` | Bug fix | PATCH | `fix: resolve macOS audio issue` |
| `perf` | Performance improvement | PATCH | `perf: optimize audio loading` |
| `docs` | Documentation only | PATCH | `docs: update README` |
| `style` | Code style changes | PATCH | `style: fix formatting` |
| `refactor` | Code refactoring | PATCH | `refactor: simplify audio service` |
| `test` | Test additions/changes | PATCH | `test: add audio service tests` |
| `build` | Build system changes | PATCH | `build: update esbuild config` |
| `ci` | CI configuration changes | PATCH | `ci: update GitHub Actions` |
| `chore` | Other changes | PATCH | `chore: update dependencies` |

### Breaking Changes (Major Version)

To trigger a MAJOR version bump, use one of these methods:

**Method 1: Add `!` after the type**
```
feat!: remove deprecated audio API
```

**Method 2: Include `BREAKING CHANGE:` in the footer**
```
feat: redesign settings system

BREAKING CHANGE: Configuration format has changed. 
Users need to reconfigure their settings.
```

### Scope (Optional)

Add scope to provide additional context:
```
feat(audio): add new notification sound
fix(settings): resolve configuration validation
docs(readme): update installation instructions
```

### Examples

#### Feature Addition
```
feat: add repeat notification option

Allows users to enable repeated notifications until they return to VS Code.
Configurable interval between 1-60 minutes.

Closes #42
```

#### Bug Fix
```
fix: resolve audio playback on Linux

Fixed issue where custom sound files wouldn't play on Ubuntu due to 
incorrect MIME type detection.

Fixes #38
```

#### Breaking Change
```
feat!: redesign notification API

BREAKING CHANGE: The notification configuration has been restructured.
- `soundPath` is now `customSoundPath`
- `enableRepeats` is now `repeatNotifications`
- Removed `legacyMode` setting

Migration guide available in UPGRADE.md
```

#### Documentation Update
```
docs: add troubleshooting guide

Added common issues and solutions for audio playback problems
across different platforms.
```

## Release Channels

### Stable Releases (main branch)
- Automatically published to VS Code Marketplace
- Semantic version numbers (1.0.0, 1.1.0, 1.1.1)
- Full testing and validation

### Beta Releases (beta branch)
- Pre-release versions for testing
- Version format: 1.1.0-beta.1
- Available through marketplace pre-release channel

### Alpha Releases (alpha branch)
- Early development versions
- Version format: 1.1.0-alpha.1
- For development testing only

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit with conventional format**
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Create pull request**
   - PR title should also follow conventional format
   - CI will run semantic-release in dry-run mode to preview changes

### Testing Release Process

You can test what semantic-release would do without making actual changes:

```bash
# See what version would be released
npm run semantic-release:dry
```

## Changelog Generation

The CHANGELOG.md file is automatically maintained. It includes:

- **Version headers** with release dates
- **Categorized changes** by type (Features, Bug Fixes, etc.)
- **Breaking changes** highlighted prominently  
- **Commit references** for traceability

Example generated section:
```markdown
## [1.2.0](https://github.com/owner/repo/compare/v1.1.0...v1.2.0) (2025-07-12)

### 🚀 Features
* add volume control for notifications ([a1b2c3d](https://github.com/owner/repo/commit/a1b2c3d))
* add repeat notification option ([e4f5g6h](https://github.com/owner/repo/commit/e4f5g6h))

### 🐛 Bug Fixes  
* resolve audio playback on Linux ([i7j8k9l](https://github.com/owner/repo/commit/i7j8k9l))
```

## VS Code Extension Publishing

The release process automatically:

1. **Builds the extension** using `npm run package`
2. **Creates .vsix package** 
3. **Publishes to marketplace** using stored credentials
4. **Uploads artifacts** to GitHub release

### Marketplace Credentials

The `VSCE_PAT` (Visual Studio Code Extension Personal Access Token) must be configured in GitHub repository secrets for automatic publishing.

## Best Practices

### Commit Messages
- Use imperative mood ("add" not "adds" or "added")
- Be concise but descriptive
- Reference issues when applicable
- Group related changes in single commits

### Pull Requests
- Title should follow conventional commit format
- Description should explain the "why" not just the "what"
- Include testing instructions
- Reference related issues

### Breaking Changes
- Minimize breaking changes
- Provide clear migration instructions
- Consider deprecation warnings first
- Document in commit body and PR description

## Troubleshooting

### Release Not Triggered
Common reasons releases don't happen:
- No commits with types that trigger releases (feat, fix, perf)
- All changes are docs, style, test, etc. (patch-only types)
- Commits don't follow conventional format

### Version Calculation Issues
- Check commit message format
- Ensure breaking changes are properly marked
- Verify no syntax errors in commit messages

### Publishing Failures
- Check `VSCE_PAT` token validity
- Verify marketplace permissions
- Check for validation errors in package.json

## Configuration Files

- **`.releaserc.json`**: Main semantic-release configuration
- **`.github/workflows/release.yml`**: GitHub Actions workflow
- **`.gitmessage`**: Commit message template
- **`CONTRIBUTING.md`**: Detailed contribution guidelines

This automation ensures consistent, reliable releases while reducing manual overhead and human error. Focus on writing good code and commit messages – the tooling handles the rest! 🚀
