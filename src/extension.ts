import * as vscode from 'vscode';
import { AudioNotificationService } from './audioService';
import { CopilotInteractionMonitor } from './interactionMonitor';
import { CommandHandlers } from './commands';
import { l10n } from './localization';

let audioService: AudioNotificationService;
let monitor: CopilotInteractionMonitor;
let commandHandlers: CommandHandlers;
let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	console.log('Copilot Audio Notifications extension is now active!');

	try {
		// Initialize services
		audioService = new AudioNotificationService(context);
		monitor = new CopilotInteractionMonitor(audioService);
		commandHandlers = new CommandHandlers(audioService, monitor);

		// Register commands
		const commandDisposables = commandHandlers.registerCommands();
		disposables.push(...commandDisposables);

		// Register configuration change listener
		disposables.push(
			vscode.workspace.onDidChangeConfiguration((event) => {
				if (event.affectsConfiguration('copilotAudioNotifications')) {
					handleConfigurationChange();
				}
			})
		);

		// Start monitoring if enabled
		if (audioService.isEnabled()) {
			monitor.startMonitoring();
		}

		// Add disposables to context
		context.subscriptions.push(
			audioService as any, // AudioNotificationServiceImpl doesn't implement Disposable
			monitor,
			commandHandlers,
			...disposables
		);

		console.log('Copilot Audio Notifications extension activated successfully');
		vscode.window.showInformationMessage(l10n('extension.activated'));

	} catch (error) {
		console.error('Failed to activate Copilot Audio Notifications extension:', error);
		vscode.window.showErrorMessage(
			l10n('extension.activationError', error instanceof Error ? error.message : String(error))
		);
	}
}

function handleConfigurationChange(): void {
	console.log('Configuration changed, updating audio service and monitor');
	
	audioService.updateConfiguration();
	
	if (audioService.isEnabled()) {
		if (!monitor) {
			console.log('Monitor not initialized, skipping start');
			return;
		}
		monitor.clearPendingState();
		monitor.startMonitoring();
	} else {
		if (monitor) {
			monitor.stopMonitoring();
		}
	}
}

export function deactivate() {
	console.log('Copilot Audio Notifications extension is being deactivated');
	
	try {
		// Stop monitoring
		if (monitor) {
			monitor.stopMonitoring();
		}

		// Dispose of all resources
		disposables.forEach(disposable => {
			try {
				disposable.dispose();
			} catch (error) {
				console.error('Error disposing resource:', error);
			}
		});
		disposables = [];

		console.log('Copilot Audio Notifications extension deactivated successfully');
	} catch (error) {
		console.error('Error during deactivation:', error);
	}
}
