# Copilot Audio Notifications

> 🔔 Never miss when GitHub Copilot needs your attention!

A VS Code extension that plays audio notifications when GitHub Copilot or other AI assistants are waiting for user input. Perfect for developers who step away from their computer and want to be alerted when interaction is needed.

## ✨ Features

- 🔊 **Cross-platform audio support** - Works on Windows, macOS, and Linux
- 🎵 **Custom notification sounds** - Use your own audio files or system defaults
- 🔧 **Configurable settings** - Adjust volume, timeout, and behavior
- 📊 **Activity monitoring** - Intelligent detection of when you're away
- 🎯 **Status bar integration** - See notification status at a glance
- ⚡ **Lightweight** - Minimal performance impact
- 🌍 **Internationalization (i18n)** - Full localization support with German translation included

## 🚀 Quick Start

1. Install the extension from the VS Code Marketplace
2. The extension activates automatically when VS Code starts
3. Audio notifications are enabled by default
4. Click the bell icon in the status bar to toggle notifications

## 🎵 Supported Audio Formats

| Platform | Supported Formats |
|----------|-------------------|
| Windows  | WAV, MP3, WMA, AAC |
| macOS    | WAV, MP3, AIFF, M4A, AAC, FLAC |
| Linux    | WAV, MP3, OGG, FLAC |

## ⚙️ Configuration

Configure the extension through VS Code settings (`Ctrl+,` → search "copilot audio"):

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `copilotAudioNotifications.enabled` | `true` | Enable/disable audio notifications |
| `copilotAudioNotifications.volume` | `50` | Notification volume (0-100%) |
| `copilotAudioNotifications.customSoundPath` | `""` | Path to custom notification sound |
| `copilotAudioNotifications.inactivityTimeoutSeconds` | `30` | Seconds of inactivity before triggering notifications |

### Example Settings

```json
{
  "copilotAudioNotifications.enabled": true,
  "copilotAudioNotifications.volume": 75,
  "copilotAudioNotifications.customSoundPath": "/path/to/your/sound.wav",
  "copilotAudioNotifications.inactivityTimeoutSeconds": 45
}
```

## 🎮 Commands

Access these commands via the Command Palette (`Ctrl+Shift+P`):

| Command | Shortcut | Description |
|---------|----------|-------------|
| `Copilot Audio: Toggle Audio Notifications` | `Ctrl+Alt+B` | Enable/disable notifications |
| `Copilot Audio: Test Notification Sound` | - | Play a test notification |
| `Copilot Audio: Select Custom Sound File...` | - | Choose your own notification sound |
| `Copilot Audio: Clear Custom Sound` | - | Reset to system default sound |
| `Copilot Audio: Open Settings` | - | Open extension settings |
| `Copilot Audio: Show Info` | - | Display extension status and info |

## 🔧 How It Works

1. **Activity Monitoring**: The extension tracks your keyboard and mouse activity
2. **Inactivity Detection**: After the configured timeout period, it starts monitoring for pending interactions
3. **Smart Notifications**: When Copilot or other AI tools are likely waiting for input, it plays a notification sound
4. **Fallback System**: If audio fails, it shows a visual notification instead

## 🎯 Use Cases

- **Long AI operations**: Get notified when code generation completes
- **Multi-tasking**: Don't miss Copilot suggestions while browsing
- **Accessibility**: Audio cues for users who prefer auditory feedback
- **Remote work**: Stay connected to your development flow

## 🛠️ Troubleshooting

### No Sound Playing?

1. Check that notifications are enabled in the status bar
2. Verify your system audio is working
3. Try the "Test Notification Sound" command
4. Check if your custom sound file is valid (if using one)

### Custom Sound Not Working?

1. Ensure the file format is supported for your platform
2. Check file size (must be under 10MB)
3. Verify the file path is accessible
4. Try a different audio format

### Extension Not Activating?

1. Restart VS Code
2. Check the Output panel for any error messages
3. Ensure you have the latest version installed

## 🤝 Contributing

We welcome contributions! This project uses automated semantic versioning and releases.

### Quick Contributing Guide

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Make your changes** with proper testing
4. **Use conventional commits**: `feat: add your feature description`
5. **Submit a pull request**

### Important Documents

- 📋 [Contributing Guidelines](CONTRIBUTING.md) - Detailed contribution process
- 🏷️ [Semantic Versioning Guide](SEMANTIC_VERSIONING.md) - Automated release process
- 📝 [Development Setup](DEVELOPMENT.md) - Full development environment

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Cerwym/copilot-audio-notifications.git
cd copilot-audio-notifications

# Install dependencies
npm install

# Start development
npm run watch

# Run tests
npm test

# Test release process (dry run)
npm run semantic-release:dry
```

### Commit Message Format

This project uses [Conventional Commits](https://conventionalcommits.org/) for automated versioning:

```
feat: add new notification feature    # New feature (minor version)
fix: resolve audio playback issue     # Bug fix (patch version) 
feat!: redesign API                   # Breaking change (major version)
```

## 📝 Releases & Changelog

- **🔄 Automated Releases**: Versions and releases are automatically generated based on commit messages
- **📋 Changelog**: See [CHANGELOG.md](CHANGELOG.md) for automatically generated version history
- **🏷️ Semantic Versioning**: Follows [semver](https://semver.org/) specification

## 🐛 Issues & Feedback

Found a bug or have a feature request? Please [open an issue](https://github.com/Cerwym/copilot-audio-notifications/issues/new) on GitHub.

## ☕ Support Development

If this extension helps your workflow, consider supporting its development:

[☕ Support on Ko-fi](https://ko-fi.com/peterlockett)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the VS Code team for the excellent extensibility API
- GitHub Copilot team for inspiring this tool
- **Microsoft Corporation** for the "tada.wav" sound effect from Windows 3.1, used as the default completion notification sound
- The open-source community for audio libraries and inspiration

---

**Made with ❤️ by [Peter Lockett](https://github.com/Cerwym)**

*Star ⭐ this repo if you find it useful!*
