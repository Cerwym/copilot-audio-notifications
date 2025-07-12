// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';

interface AudioNotificationService {
	playNotificationSound(): Promise<void>;
	isEnabled(): boolean;
	validateSoundFile(filePath: string): Promise<boolean>;
	getSupportedFormats(): string[];
}

class CrossPlatformAudioService implements AudioNotificationService {
	private readonly defaultSounds = {
		windows: 'ms-winsoundevent:Notification.Default',
		macOS: '/System/Library/Sounds/Glass.aiff',
		linux: '/usr/share/sounds/alsa/Front_Left.wav'
	};

	private readonly supportedFormats = {
		windows: ['.wav', '.mp3', '.wma', '.aac'],
		macOS: ['.wav', '.mp3', '.aiff', '.m4a', '.aac', '.flac'],
		linux: ['.wav', '.mp3', '.ogg', '.flac']
	};

	getSupportedFormats(): string[] {
		const platform = os.platform();
		switch (platform) {
			case 'win32':
				return this.supportedFormats.windows;
			case 'darwin':
				return this.supportedFormats.macOS;
			case 'linux':
				return this.supportedFormats.linux;
			default:
				return ['.wav', '.mp3'];
		}
	}

	async validateSoundFile(filePath: string): Promise<boolean> {
		try {
			// Check if file exists
			if (!fs.existsSync(filePath)) {
				return false;
			}

			// Check file extension
			const ext = path.extname(filePath).toLowerCase();
			const supportedFormats = this.getSupportedFormats();
			
			if (!supportedFormats.includes(ext)) {
				return false;
			}

			// Check file size (max 10MB for performance)
			const stats = fs.statSync(filePath);
			if (stats.size > 10 * 1024 * 1024) {
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error validating sound file:', error);
			return false;
		}
	}

	isEnabled(): boolean {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		return config.get<boolean>('enabled', true);
	}

	async playNotificationSound(): Promise<void> {
		if (!this.isEnabled()) {
			return;
		}

		const platform = os.platform();
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const customSoundPath = config.get<string>('customSoundPath');
		const volume = config.get<number>('volume', 50) / 100; // Convert percentage to decimal

		try {
			if (customSoundPath && await this.validateSoundFile(customSoundPath)) {
				await this.playCustomSound(customSoundPath, volume);
			} else {
				await this.playDefaultSound(platform, volume);
			}
		} catch (error) {
			console.error('Failed to play notification sound:', error);
			// Fallback to VS Code notification
			vscode.window.showInformationMessage('🔔 Copilot needs your attention!');
		}
	}

	private async playCustomSound(soundPath: string, volume: number): Promise<void> {
		const platform = os.platform();
		let command: string;

		switch (platform) {
			case 'win32':
				// Use PowerShell with volume control for WAV files, fallback for others
				const ext = path.extname(soundPath).toLowerCase();
				if (ext === '.wav') {
					command = `powershell -c "$player = New-Object Media.SoundPlayer '${soundPath}'; $player.PlaySync()"`;
				} else {
					// For other formats, try Windows Media Player
					command = `powershell -c "Add-Type -AssemblyName presentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([System.Uri]'${soundPath}'); $player.Volume = ${volume}; $player.Play(); Start-Sleep -Seconds 3"`;
				}
				break;
			case 'darwin':
				command = `afplay "${soundPath}" -v ${volume}`;
				break;
			case 'linux':
				// Try different audio systems with volume control
				command = `paplay "${soundPath}" --volume=${Math.floor(volume * 65536)} || aplay "${soundPath}" || play "${soundPath}" vol ${volume}`;
				break;
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		return this.executeCommand(command);
	}

	private async playDefaultSound(platform: string, volume: number): Promise<void> {
		let command: string;

		switch (platform) {
			case 'win32':
				// Use different frequency/duration based on volume
				const frequency = Math.floor(400 + (volume * 800)); // 400-1200 Hz
				const duration = Math.floor(200 + (volume * 600)); // 200-800 ms
				command = `powershell -c "[console]::beep(${frequency},${duration})"`;
				break;
			case 'darwin':
				command = `afplay /System/Library/Sounds/Glass.aiff -v ${volume}`;
				break;
			case 'linux':
				command = `paplay /usr/share/sounds/alsa/Front_Left.wav --volume=${Math.floor(volume * 65536)} || aplay /usr/share/sounds/alsa/Front_Left.wav || echo -e "\\a"`;
				break;
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		return this.executeCommand(command);
	}

	private executeCommand(command: string): Promise<void> {
		return new Promise((resolve, reject) => {
			exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
				if (error) {
					reject(new Error(`Command failed: ${error.message}`));
					return;
				}
				resolve();
			});
		});
	}
}

class CopilotInteractionMonitor {
	private audioService: AudioNotificationService;
	private statusBarItem: vscode.StatusBarItem;
	private isMonitoring: boolean = false;
	private lastActivity: number = Date.now();
	private checkInterval: NodeJS.Timeout | undefined;

	constructor(audioService: AudioNotificationService) {
		this.audioService = audioService;
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.statusBarItem.text = "$(bell) Audio Alerts";
		this.statusBarItem.tooltip = "Copilot Audio Notifications - Click to toggle";
		this.statusBarItem.command = 'copilotAudioNotifications.toggle';
		this.updateStatusBar();
	}

	startMonitoring(): void {
		if (this.isMonitoring) {
			return;
		}

		this.isMonitoring = true;
		this.updateStatusBar();

		// Monitor for various events that indicate user interaction
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const inactivityTimeout = config.get<number>('inactivityTimeoutSeconds', 30) * 1000;

		this.checkInterval = setInterval(() => {
			const timeSinceLastActivity = Date.now() - this.lastActivity;
			
			if (timeSinceLastActivity > inactivityTimeout) {
				// Check if there are any pending operations or dialogs
				this.checkForPendingInteractions();
			}
		}, 5000); // Check every 5 seconds

		console.log('Copilot interaction monitoring started');
	}

	stopMonitoring(): void {
		this.isMonitoring = false;
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = undefined;
		}
		this.updateStatusBar();
		console.log('Copilot interaction monitoring stopped');
	}

	updateActivity(): void {
		this.lastActivity = Date.now();
	}

	private updateStatusBar(): void {
		if (this.audioService.isEnabled() && this.isMonitoring) {
			this.statusBarItem.text = "$(bell) Audio Alerts ON";
			this.statusBarItem.backgroundColor = undefined;
		} else if (this.audioService.isEnabled()) {
			this.statusBarItem.text = "$(bell-slash) Audio Alerts OFF";
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		} else {
			this.statusBarItem.text = "$(bell-slash) Audio Disabled";
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		}
		this.statusBarItem.show();
	}

	private async checkForPendingInteractions(): Promise<void> {
		// This is a simplified check - in a real implementation, you'd want to
		// hook into VS Code's notification system or Copilot's specific APIs
		const visibleTextEditors = vscode.window.visibleTextEditors;
		const activeEditor = vscode.window.activeTextEditor;
		
		// Check if there are any visible progress notifications
		// (This is a heuristic - VS Code doesn't expose all notification states)
		if (activeEditor && this.isLikelyWaitingForInput()) {
			await this.audioService.playNotificationSound();
		}
	}

	private isLikelyWaitingForInput(): boolean {
		// Heuristic checks for when Copilot might be waiting for input
		// This could be enhanced with more sophisticated detection
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return false;
		}

		// Check if cursor hasn't moved for a while and there might be a suggestion pending
		// This is a simplified implementation - a real one would integrate more deeply
		const selection = activeEditor.selection;
		return selection.isEmpty && activeEditor.document.isDirty;
	}

	dispose(): void {
		this.stopMonitoring();
		this.statusBarItem.dispose();
	}
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Copilot Audio Notifications extension activated!');

	// Initialize services
	const audioService = new CrossPlatformAudioService();
	const monitor = new CopilotInteractionMonitor(audioService);

	// Register commands
	const toggleCommand = vscode.commands.registerCommand('copilotAudioNotifications.toggle', () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const currentlyEnabled = config.get<boolean>('enabled', true);
		config.update('enabled', !currentlyEnabled, vscode.ConfigurationTarget.Global);
		
		if (!currentlyEnabled) {
			monitor.startMonitoring();
			vscode.window.showInformationMessage('🔔 Copilot Audio Notifications enabled');
		} else {
			monitor.stopMonitoring();
			vscode.window.showInformationMessage('🔕 Copilot Audio Notifications disabled');
		}
	});

	const testSoundCommand = vscode.commands.registerCommand('copilotAudioNotifications.testSound', async () => {
		try {
			await audioService.playNotificationSound();
			vscode.window.showInformationMessage('🔊 Test sound played successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to play test sound: ${error}`);
		}
	});

	const selectSoundCommand = vscode.commands.registerCommand('copilotAudioNotifications.selectSound', async () => {
		const supportedFormats = audioService.getSupportedFormats();
		const formatFilter: { [name: string]: string[] } = {
			'Audio Files': supportedFormats
		};

		const fileUri = await vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: formatFilter,
			openLabel: 'Select Notification Sound'
		});

		if (fileUri && fileUri[0]) {
			const filePath = fileUri[0].fsPath;
			
			if (await audioService.validateSoundFile(filePath)) {
				const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
				await config.update('customSoundPath', filePath, vscode.ConfigurationTarget.Global);
				
				// Test the selected sound
				try {
					await audioService.playNotificationSound();
					vscode.window.showInformationMessage(`✅ Sound file selected: ${path.basename(filePath)}`);
				} catch (error) {
					vscode.window.showWarningMessage(`Sound file selected but failed to play: ${error}`);
				}
			} else {
				vscode.window.showErrorMessage(`Invalid sound file. Supported formats: ${supportedFormats.join(', ')}`);
			}
		}
	});

	const clearSoundCommand = vscode.commands.registerCommand('copilotAudioNotifications.clearSound', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		await config.update('customSoundPath', '', vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage('🔄 Reset to default system sound');
	});

	const openSettingsCommand = vscode.commands.registerCommand('copilotAudioNotifications.openSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', 'copilotAudioNotifications');
	});

	const showInfoCommand = vscode.commands.registerCommand('copilotAudioNotifications.showInfo', () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const customPath = config.get<string>('customSoundPath', '');
		const volume = config.get<number>('volume', 50);
		const timeout = config.get<number>('inactivityTimeoutSeconds', 30);
		const supportedFormats = audioService.getSupportedFormats();

		const info = [
			'**Copilot Audio Notifications Status**\n',
			`🔔 **Status**: ${audioService.isEnabled() ? 'Enabled' : 'Disabled'}`,
			`🎵 **Sound**: ${customPath ? path.basename(customPath) : 'System Default'}`,
			`🔊 **Volume**: ${volume}%`,
			`⏱️ **Timeout**: ${timeout} seconds`,
			`\n**Supported Formats**: ${supportedFormats.join(', ')}`,
			'\n**Commands Available**:',
			'• Toggle notifications (Ctrl+Alt+B)',
			'• Select custom sound file',
			'• Test current sound',
			'• Open settings'
		].join('\n');

		vscode.window.showInformationMessage(info, { modal: true }, 'Open Settings', 'Select Sound', '☕ Support Development')
			.then(selection => {
				if (selection === 'Open Settings') {
					vscode.commands.executeCommand('copilotAudioNotifications.openSettings');
				} else if (selection === 'Select Sound') {
					vscode.commands.executeCommand('copilotAudioNotifications.selectSound');
				} else if (selection === '☕ Support Development') {
					vscode.commands.executeCommand('copilotAudioNotifications.donate');
				}
			});
	});

	const donateCommand = vscode.commands.registerCommand('copilotAudioNotifications.donate', () => {
		const message = [
			'☕ **Support Copilot Audio Notifications Development**\n',
			'Thank you for considering supporting this extension! Your donation helps:',
			'• 🔧 Maintain and improve the extension',
			'• 🎵 Add new audio features and platform support', 
			'• 🐛 Fix bugs and compatibility issues',
			'• 📚 Create better documentation and examples',
			'\n**Every coffee helps keep the code flowing!** ☕✨'
		].join('\n');

		vscode.window.showInformationMessage(
			message, 
			{ modal: true }, 
			'☕ Open Ko-fi', 
			'⭐ Rate Extension', 
			'📧 Send Feedback'
		).then(selection => {
			if (selection === '☕ Open Ko-fi') {
				vscode.env.openExternal(vscode.Uri.parse('https://ko-fi.com/peterlockett'));
			} else if (selection === '⭐ Rate Extension') {
				vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=PeterLockett.copilot-audio-notifications&ssr=false#review-details'));
			} else if (selection === '📧 Send Feedback') {
				vscode.env.openExternal(vscode.Uri.parse('https://github.com/Cerwym/copilot-audio-notifications/issues/new?template=feedback.md'));
			}
		});
	});

	// Monitor text editor changes to detect user activity
	const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
		monitor.updateActivity();
	});

	const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(() => {
		monitor.updateActivity();
	});

	// Start monitoring if enabled
	if (audioService.isEnabled()) {
		monitor.startMonitoring();
	}

	// Add disposables to context
	context.subscriptions.push(
		toggleCommand,
		testSoundCommand,
		selectSoundCommand,
		clearSoundCommand,
		openSettingsCommand,
		showInfoCommand,
		donateCommand,
		onDidChangeActiveTextEditor,
		onDidChangeTextDocument,
		monitor
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
