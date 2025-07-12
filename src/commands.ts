import * as vscode from 'vscode';
import { AudioNotificationService } from './audioService';
import { CopilotInteractionMonitor } from './interactionMonitor';
import { l10n } from './localization';

export class CommandHandlers {
	private audioService: AudioNotificationService;
	private monitor: CopilotInteractionMonitor;
	private disposables: vscode.Disposable[] = [];

	constructor(audioService: AudioNotificationService, monitor: CopilotInteractionMonitor) {
		this.audioService = audioService;
		this.monitor = monitor;
	}

	registerCommands(): vscode.Disposable[] {
		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.enable', async () => {
				await this.handleEnableCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.disable', async () => {
				await this.handleDisableCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.toggle', async () => {
				await this.handleToggleCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.testSound', async () => {
				await this.handleTestSoundCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.testCompletionSound', async () => {
				await this.handleTestCompletionSoundCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.playPromptWaitingSound', async () => {
				await this.handlePlayPromptWaitingSoundCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.showSettings', () => {
				this.handleShowSettingsCommand();
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.showStatus', () => {
				this.handleShowStatusCommand();
			})
		);

		return this.disposables;
	}

	private async handleEnableCommand(): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
			await config.update('enabled', true, vscode.ConfigurationTarget.Global);
			
			this.audioService.updateConfiguration();
			this.monitor.clearPendingState();
			this.monitor.startMonitoring();
			
			console.log('Audio notifications enabled');
			vscode.window.showInformationMessage(l10n('commands.enable.success'));
		} catch (error) {
			console.error('Failed to enable audio notifications:', error);
			vscode.window.showErrorMessage(l10n('commands.enable.error'));
		}
	}

	private async handleDisableCommand(): Promise<void> {
		try {
			const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
			await config.update('enabled', false, vscode.ConfigurationTarget.Global);
			
			this.audioService.updateConfiguration();
			this.monitor.stopMonitoring();
			
			console.log('Audio notifications disabled');
			vscode.window.showInformationMessage(l10n('commands.disable.success'));
		} catch (error) {
			console.error('Failed to disable audio notifications:', error);
			vscode.window.showErrorMessage(l10n('commands.disable.error'));
		}
	}

	private async handleToggleCommand(): Promise<void> {
		const currentlyEnabled = this.audioService.isEnabled();
		
		currentlyEnabled ? await this.handleDisableCommand() : await this.handleEnableCommand();
	}

	private async handleTestSoundCommand(): Promise<void> {
		if (!this.audioService.isEnabled()) {
			vscode.window.showWarningMessage(l10n('commands.testSound.disabled'));
			return;
		}

		try {
			console.log('Playing test prompt waiting sound');
			await this.audioService.playPromptWaitingSound();
			vscode.window.showInformationMessage(l10n('commands.testSound.success'));
		} catch (error) {
			console.error('Failed to play test sound:', error);
			vscode.window.showErrorMessage(l10n('commands.testSound.error', error instanceof Error ? error.message : String(error)));
		}
	}

	private async handleTestCompletionSoundCommand(): Promise<void> {
		if (!this.audioService.isEnabled()) {
			vscode.window.showWarningMessage(l10n('commands.testCompletionSound.disabled'));
			return;
		}

		try {
			console.log('Playing test completion sound');
			await this.audioService.playCompletionSound();
			vscode.window.showInformationMessage(l10n('commands.testCompletionSound.success'));
		} catch (error) {
			console.error('Failed to play test completion sound:', error);
			vscode.window.showErrorMessage(l10n('commands.testCompletionSound.error', error instanceof Error ? error.message : String(error)));
		}
	}

	private async handlePlayPromptWaitingSoundCommand(): Promise<void> {
		if (!this.audioService.isEnabled()) {
			vscode.window.showWarningMessage(l10n('commands.playPromptWaitingSound.disabled'));
			return;
		}

		try {
			console.log('Manually playing prompt waiting sound');
			await this.audioService.playPromptWaitingSound();
		} catch (error) {
			console.error('Failed to play prompt waiting sound:', error);
			vscode.window.showErrorMessage(l10n('commands.playPromptWaitingSound.error', error instanceof Error ? error.message : String(error)));
		}
	}

	private handleShowSettingsCommand(): void {
		vscode.commands.executeCommand('workbench.action.openSettings', 'copilotAudioNotifications');
	}

	private handleShowStatusCommand(): void {
		const isEnabled = this.audioService.isEnabled();
		const activeOpsCount = this.monitor.activeOperationsCount;
		const activeOps = this.monitor.activeOperationsList;
		
		let message = isEnabled ? 
			l10n('commands.showStatus.enabled') : 
			l10n('commands.showStatus.disabled');
		
		activeOpsCount > 0 ? (
			message += '\n' + l10n('commands.showStatus.activeOperations', activeOpsCount.toString()),
			activeOps.length > 0 ? message += '\n' + activeOps.join(', ') : null
		) : null;
		
		vscode.window.showInformationMessage(message, { modal: false });
	}

	dispose(): void {
		this.disposables.forEach(disposable => disposable.dispose());
		this.disposables = [];
	}
}
