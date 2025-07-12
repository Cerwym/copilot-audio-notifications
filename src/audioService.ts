import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';
import { l10n } from './localization';

export class AudioNotificationService {
	private extensionContext: vscode.ExtensionContext;

	constructor(context: vscode.ExtensionContext) {
		this.extensionContext = context;
	}

	isEnabled(): boolean {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		return config.get<boolean>('enabled', false);
	}

	updateConfiguration(): void {
		// This method allows the configuration to be refreshed
		// The configuration is read fresh each time isEnabled() is called
		console.log('Audio notification configuration updated');
	}

	async playPromptWaitingSound(): Promise<void> {
		if (!this.isEnabled()) {
			console.log('Prompt waiting sound skipped - audio notifications disabled');
			return;
		}

		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const soundFile = config.get<string>('promptWaitingSoundFile', '');
		const volume = config.get<number>('volume', 0.7);

		try {
			if (soundFile && soundFile.trim() !== '') {
				console.log(`Playing custom prompt waiting sound: ${soundFile}`);
				await this.playSound(soundFile, volume);
			} else {
				const bundledSound = this.getBundledSoundPath();
				console.log(`Playing bundled prompt waiting sound: ${bundledSound}`);
				await this.playSound(bundledSound, volume);
			}
		} catch (error) {
			console.error('Failed to play prompt waiting sound:', error);
			throw new Error(l10n('audio.playError', error instanceof Error ? error.message : String(error)));
		}
	}

	async playCompletionSound(): Promise<void> {
		if (!this.isEnabled()) {
			console.log('Completion sound skipped - audio notifications disabled');
			return;
		}

		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const soundFile = config.get<string>('completionSoundFile', '');
		const volume = config.get<number>('volume', 0.7);

		try {
			if (soundFile && soundFile.trim() !== '') {
				console.log(`Playing custom completion sound: ${soundFile}`);
				await this.playSound(soundFile, volume);
			} else {
				const bundledSound = this.getBundledSoundPath();
				console.log(`Playing bundled completion sound (same as prompt waiting): ${bundledSound}`);
				await this.playSound(bundledSound, volume);
			}
		} catch (error) {
			console.error('Failed to play completion sound:', error);
			throw new Error(l10n('audio.playError', error instanceof Error ? error.message : String(error)));
		}
	}

	private getBundledSoundPath(): string {
		const soundsDir = path.join(this.extensionContext.extensionPath, 'sounds');
		const soundFile = path.join(soundsDir, 'tada.mp3');
		
		if (!fs.existsSync(soundFile)) {
			throw new Error(l10n('audio.bundledSoundNotFound', soundFile));
		}
		
		return soundFile;
	}

	async validateSoundFile(filePath: string): Promise<boolean> {
		try {
			if (!filePath || filePath.trim() === '') {
				return false;
			}
			
			if (!fs.existsSync(filePath)) {
				console.log(`Sound file does not exist: ${filePath}`);
				return false;
			}
			
			const stats = fs.statSync(filePath);
			if (!stats.isFile()) {
				console.log(`Path is not a file: ${filePath}`);
				return false;
			}
			
			const ext = path.extname(filePath).toLowerCase();
			const supportedFormats = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];
			
			if (!supportedFormats.includes(ext)) {
				console.log(`Unsupported audio format: ${ext}`);
				return false;
			}
			
			return true;
		} catch (error) {
			console.error(`Error validating sound file ${filePath}:`, error);
			return false;
		}
	}

	private async playSound(soundPath: string, volume: number): Promise<void> {
		return new Promise((resolve, reject) => {
			const adjustedVolume = Math.max(0, Math.min(1, volume));
			let command: string;
			
			switch (os.platform()) {
				case 'darwin': // macOS
					command = `afplay "${soundPath}"`;
					break;
				case 'win32': // Windows
					const volumePercent = Math.round(adjustedVolume * 100);
					const escapedPath = soundPath.replace(/'/g, "''");
					command = `powershell -c "(New-Object Media.SoundPlayer('${escapedPath}')).Play(); Start-Sleep 2"`;
					
					volumePercent !== 100 ? (() => {
						const volumeCommand = `powershell -c "[audio]::Volume = ${adjustedVolume}"`;
						exec(volumeCommand, (error) => {
							error ? console.warn('Failed to set volume:', error.message) : null;
						});
					})() : null;
					break;
				case 'linux': // Linux
					// Try multiple audio systems in order of preference
					const linuxCommands = [
						`paplay "${soundPath}"`, // PulseAudio
						`aplay "${soundPath}"`,  // ALSA
						`play "${soundPath}"`    // SoX
					];
					
					command = linuxCommands[0]; // Start with PulseAudio
					break;
				default:
					reject(new Error(l10n('audio.unsupportedPlatform', os.platform())));
					return;
			}
			
			console.log(`Executing audio command: ${command}`);
			
			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.error(`Audio playback error: ${error.message}`);
					
					// On Linux, try fallback commands
					if (os.platform() === 'linux' && command.includes('paplay')) {
						console.log('PulseAudio failed, trying ALSA...');
						exec(`aplay "${soundPath}"`, (alsaError, alsaStdout, alsaStderr) => {
							if (alsaError) {
								console.log('ALSA failed, trying SoX...');
								exec(`play "${soundPath}"`, (soxError) => {
									if (soxError) {
										reject(new Error(l10n('audio.allPlaybackFailed')));
									} else {
										resolve();
									}
								});
							} else {
								resolve();
							}
						});
						return;
					}
					
					reject(error);
				} else {
					stderr ? console.warn(`Audio stderr: ${stderr}`) : null;
					resolve();
				}
			});
		});
	}
}
