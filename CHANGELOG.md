# Changelog

All notable changes to the "Copilot Audio Notifications" extension will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and uses [Conventional Commits](https://conventionalcommits.org/) for automated changelog generation.

---

*Note: This changelog is automatically maintained by [semantic-release](https://github.com/semantic-release/semantic-release) based on commit messages following the [Conventional Commits](https://conventionalcommits.org/) specification.*

## [1.0.0] - 2025-07-12

### Added
- 🔔 **Core Audio Notifications**: Play customizable audio alerts when GitHub Copilot requires user input
- � **Cross-Platform Audio Support**: Works on Windows, macOS, and Linux with platform-optimized audio playback
- 🎛️ **Configurable Settings**: Adjust volume (0-100%), inactivity timeouts, and response timeouts
- 📊 **Intelligent Activity Monitoring**: Detects user inactivity and Copilot interaction states
- 🎯 **Status Bar Integration**: Visual indicators showing notification status with click-to-toggle functionality
- �🎉 **Completion Sound Detection**: Special audio notifications for task completions and summaries
- 🎵 **Bundled Windows 3.1 "Tada" Sound**: Default completion notification using classic Microsoft sound
- 🔧 **Multiple Test Commands**: Test both regular and completion notification sounds
- 📝 **Enhanced Pattern Detection**: Improved recognition of completion patterns in Copilot responses
- � **Internationalization Support**: German (DE) language pack included
- 💡 **Comprehensive Command Palette**: Full suite of commands for managing notifications
- ⚡ **Lightweight Performance**: Minimal system impact with efficient monitoring
- 🎵 **Custom Sound Files**: Select your own notification sounds with file picker
- 🔄 **Fallback System**: Visual notifications when audio playback fails
- ☕ **Ko-fi Integration**: Support developer through integrated donation links

### Features
- **Smart Copilot Detection**: Real-time monitoring of VS Code language model events and chat interactions
- **Dual Sound System**: Separate sounds for regular notifications and completion alerts
- **Platform-Specific Audio**: Optimized for each operating system's audio capabilities
- **Flexible Configuration**: Extensive settings for customizing notification behavior
- **Status Management**: Clear visual feedback on extension state and activity

### Supported Audio Formats
- **Windows**: WAV, MP3, WMA, AAC
- **macOS**: WAV, MP3, AIFF, M4A, AAC, FLAC
- **Linux**: WAV, MP3, OGG, FLAC

### Commands Added
- `Copilot Audio: Toggle Audio Notifications` (Ctrl+Alt+B / Cmd+Alt+B)
- `Copilot Audio: Test Notification Sound` (Ctrl+Alt+T / Cmd+Alt+T)
- `Copilot Audio: Test Completion Sound`
- `Copilot Audio: Select Custom Sound File...`
- `Copilot Audio: Select Completion Sound File...`
- `Copilot Audio: Reset to Default Sound`
- `Copilot Audio: Open Settings`
- `Copilot Audio: Show Extension Info`
- `Copilot Audio: Support Development (Ko-fi)`
- `Copilot Audio: Test Toggle State Management` (Debug)

### Configuration Options
- `copilotAudioNotifications.enabled`: Enable/disable audio notifications
- `copilotAudioNotifications.volume`: Volume level for notifications (0-100%)
- `copilotAudioNotifications.customSoundPath`: Path to custom sound file for regular notifications
- `copilotAudioNotifications.completionSoundPath`: Path to custom sound file for completion notifications
- `copilotAudioNotifications.inactivityTimeoutSeconds`: Seconds of inactivity before triggering notification
- `copilotAudioNotifications.copilotResponseTimeoutSeconds`: Seconds to wait for Copilot response before notification
- `copilotAudioNotifications.repeatNotifications`: Enable repeated notifications until user returns
- `copilotAudioNotifications.repeatIntervalMinutes`: Minutes between repeated notifications

### Technical Implementation
- **TypeScript**: Type-safe development with comprehensive error handling
- **ESBuild**: Fast compilation and bundling for optimal performance
- **Cross-Platform Audio**: Platform-specific implementations for reliable audio playback
- **Event-Driven Architecture**: Efficient monitoring of VS Code events and user interactions
- **Internationalization**: Full i18n support with localized strings
- **Docker Development**: Containerized development environment for consistent builds

### Attribution
- Windows 3.1 "tada" sound effect © Microsoft Corporation, used under fair use for educational purposes