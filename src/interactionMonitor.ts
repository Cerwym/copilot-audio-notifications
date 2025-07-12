import * as vscode from 'vscode';
import { AudioNotificationService } from './audioService';
import { l10n } from './localization';

export class CopilotInteractionMonitor {
	private audioService: AudioNotificationService;
	private statusBarItem: vscode.StatusBarItem;
	private isMonitoring: boolean = false;
	private lastActivity: number = Date.now();
	private checkInterval: NodeJS.Timeout | undefined;
	private disposables: vscode.Disposable[] = [];
	private lastCopilotActivity: number = 0;
	private lastNotificationTime: number = 0;
	private lastCompletionNotificationTime: number = 0;
	private readonly notificationCooldownMs: number = 5000;
	private readonly completionCooldownMs: number = 10000;
	
	private activeOperations: Set<string> = new Set();
	private operationStartTime: number = 0;

	constructor(audioService: AudioNotificationService) {
		this.audioService = audioService;
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
		this.statusBarItem.text = "$(bell) Audio Alerts";
		this.statusBarItem.tooltip = l10n('statusBar.tooltip');
		this.statusBarItem.command = 'copilotAudioNotifications.toggle';
		this.updateStatusBar();
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.onOperationStart', (operationId: string) => {
				this.trackOperationStart(operationId);
			})
		);

		this.disposables.push(
			vscode.commands.registerCommand('copilotAudioNotifications.onOperationComplete', (operationId: string) => {
				this.trackOperationComplete(operationId);
			})
		);

		this.disposables.push(
			vscode.workspace.onDidChangeTextDocument((event) => {
				this.onTextDocumentChange(event);
			})
		);

		this.disposables.push(
			vscode.window.onDidChangeActiveTextEditor((editor) => {
				this.onActiveEditorChange(editor);
			})
		);

		this.disposables.push(
			vscode.window.onDidChangeVisibleTextEditors((editors) => {
				this.onVisibleEditorsChange(editors);
			})
		);

		this.disposables.push(
			vscode.window.onDidChangeWindowState((state) => {
				if (state.focused) {
					this.updateActivity();
				}
			})
		);
	}

	static async withProgressTracking<T>(
		monitor: CopilotInteractionMonitor,
		title: string,
		task: (progress: vscode.Progress<{message?: string; increment?: number}>, token: vscode.CancellationToken) => Thenable<T>
	): Promise<T> {
		const operationId = `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		
		return vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title,
			cancellable: true
		}, async (progress, token) => {
			monitor.trackOperationStart(operationId);
			
			token.onCancellationRequested(() => {
				console.log(`Operation ${operationId} was cancelled by user`);
				monitor.trackOperationComplete(operationId);
			});
			
			try {
				const result = await task(progress, token);
				monitor.trackOperationComplete(operationId);
				return result;
			} catch (error) {
				monitor.trackOperationComplete(operationId);
				throw error;
			}
		});
	}

	async trackOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
		const operationId = `manual-${operationName}-${Date.now()}`;
		this.trackOperationStart(operationId);
		
		try {
			const result = await operation();
			this.trackOperationComplete(operationId);
			return result;
		} catch (error) {
			this.trackOperationComplete(operationId);
			throw error;
		}
	}

	public trackOperationStart(operationId: string): void {
		console.log(`Operation started: ${operationId}`);
		this.activeOperations.add(operationId);
		this.operationStartTime = Date.now();
		this.lastCopilotActivity = Date.now();
	}

	public trackOperationComplete(operationId: string): void {
		console.log(`Operation completed: ${operationId}`);
		this.activeOperations.delete(operationId);
		
		if (this.activeOperations.size === 0 && this.operationStartTime > 0) {
			const operationDuration = Date.now() - this.operationStartTime;
			if (operationDuration > 2000) {
				this.triggerCompletionNotification(`Operation completed after ${Math.round(operationDuration / 1000)}s`);
			}
			this.operationStartTime = 0;
		}
	}

	public get activeOperationsCount(): number {
		return this.activeOperations.size;
	}

	public get activeOperationsList(): string[] {
		return Array.from(this.activeOperations);
	}

	private onTextDocumentChange(event: vscode.TextDocumentChangeEvent): void {
		if (this.isCopilotRelatedDocument(event.document)) {
			const changes = event.contentChanges;
			const hasLargeChanges = changes.some(change => change.text.length > 100);
			
			if (hasLargeChanges) {
				this.lastCopilotActivity = Date.now();
				console.log('Copilot Chat activity detected: large content changes');
			}
		}
		this.updateActivity();
	}

	private isWaitingForUserDecision(): boolean {
		const now = Date.now();
		const timeSinceLastActivity = now - this.lastActivity;
		const timeSinceCopilotActivity = now - this.lastCopilotActivity;
		
		return this.activeOperations.size === 0 &&
			   this.lastCopilotActivity > 0 && 
			   timeSinceCopilotActivity > 30000 &&
			   timeSinceCopilotActivity < 300000 &&
			   timeSinceLastActivity > 15000;
	}

	private onActiveEditorChange(editor: vscode.TextEditor | undefined): void {
		if (editor && this.isCopilotRelatedEditor(editor)) {
			this.lastCopilotActivity = Date.now();
			console.log('Copilot activity detected: editor change');
		}
		this.updateActivity();
	}

	private onVisibleEditorsChange(editors: readonly vscode.TextEditor[]): void {
		const hasCopilotEditor = editors.some(editor => this.isCopilotRelatedEditor(editor));
		if (hasCopilotEditor) {
			this.lastCopilotActivity = Date.now();
			console.log('Copilot activity detected: visible editors change');
		}
		this.updateActivity();
	}

	private isCopilotRelatedEditor(editor: vscode.TextEditor): boolean {
		return this.isCopilotRelatedDocument(editor.document);
	}

	private isCopilotRelatedDocument(document: vscode.TextDocument): boolean {
		const uri = document.uri.toString().toLowerCase();
		const fileName = document.fileName?.toLowerCase() || '';
		
		return uri.includes('copilot') || 
			   uri.includes('chat') ||
			   fileName.includes('copilot') ||
			   fileName.includes('chat') ||
			   document.languageId === 'copilot-chat' ||
			   (uri.startsWith('untitled:') && document.getText().includes('🤖'));
	}

	startMonitoring(): void {
		if (this.isMonitoring) {
			return;
		}

		this.isMonitoring = true;
		this.updateStatusBar();

		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const inactivityTimeout = config.get<number>('inactivityTimeoutSeconds', 30) * 1000;

		this.checkInterval = setInterval(() => {
			if (!this.audioService.isEnabled()) {
				console.log('Audio disabled during monitoring - stopping');
				this.stopMonitoring();
				return;
			}
			
			const now = Date.now();
			const timeSinceLastActivity = now - this.lastActivity;
			const isWaitingForDecision = this.isWaitingForUserDecision();
			const hasActiveOperations = this.activeOperations.size > 0;
			
			if (hasActiveOperations) {
				console.log(`Active operations: ${Array.from(this.activeOperations).join(', ')}`);
				return;
			}
			
			if (isWaitingForDecision && timeSinceLastActivity > 5000) {
				console.log('AI is waiting for user decision - triggering prompt sound');
				this.triggerNotification('AI waiting for user decision');
				return;
			}
			
			if (timeSinceLastActivity > inactivityTimeout && 
				this.lastCopilotActivity > 0 && 
				!hasActiveOperations) {
				this.checkForPendingInteractions();
			}
		}, 2000);

		console.log('Enhanced Copilot interaction monitoring started with event-based detection');
	}

	stopMonitoring(): void {
		this.isMonitoring = false;
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = undefined;
		}
		
		this.clearPendingState();
		this.updateStatusBar();
		console.log('Copilot interaction monitoring stopped and pending state cleared');
	}

	updateActivity(): void {
		this.lastActivity = Date.now();
	}

	private updateStatusBar(): void {
		if (this.audioService.isEnabled() && this.isMonitoring) {
			this.statusBarItem.text = l10n('statusBar.audioAlertsOn');
			this.statusBarItem.backgroundColor = undefined;
		} else if (this.audioService.isEnabled()) {
			this.statusBarItem.text = l10n('statusBar.audioAlertsOff');
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		} else {
			this.statusBarItem.text = l10n('statusBar.audioDisabled');
			this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		}
		this.statusBarItem.show();
	}

	private async triggerNotification(reason: string): Promise<void> {
		if (!this.audioService.isEnabled()) {
			console.log(`Prompt waiting notification skipped - audio disabled: ${reason}`);
			return;
		}
		
		const now = Date.now();
		if ((now - this.lastNotificationTime) < this.notificationCooldownMs) {
			console.log(`Prompt waiting notification skipped due to cooldown: ${reason}`);
			return;
		}
		
		try {
			console.log(`Triggering prompt waiting notification: ${reason}`);
			this.lastNotificationTime = now;
			await this.audioService.playPromptWaitingSound();
		} catch (error) {
			console.error('Failed to play prompt waiting sound:', error);
		}
	}

	private async triggerCompletionNotification(reason: string): Promise<void> {
		if (!this.audioService.isEnabled()) {
			console.log(`Completion notification skipped - audio disabled: ${reason}`);
			return;
		}
		
		const now = Date.now();
		if ((now - this.lastCompletionNotificationTime) < this.completionCooldownMs) {
			console.log(`Completion notification skipped due to cooldown: ${reason}`);
			return;
		}
		
		try {
			console.log(`Triggering completion notification: ${reason}`);
			this.lastCompletionNotificationTime = now;
			await this.audioService.playCompletionSound();
		} catch (error) {
			console.error('Failed to play completion sound:', error);
		}
	}

	private async checkForPendingInteractions(): Promise<void> {
		const visibleTextEditors = vscode.window.visibleTextEditors;
		const activeEditor = vscode.window.activeTextEditor;
		const hasCopilotEditor = visibleTextEditors.some(editor => this.isCopilotRelatedEditor(editor));
		const isWaitingForDecision = this.isWaitingForUserDecision();
		
		if (isWaitingForDecision) {
			console.log('Detected AI waiting for user decision in checkForPendingInteractions');
			await this.triggerNotification('AI waiting for user decision');
		} else if ((activeEditor && this.isLikelyWaitingForInput()) || hasCopilotEditor) {
			if (!this.activeOperations.size) {
				await this.triggerNotification('Copilot waiting for user input');
			}
		}
	}

	private isLikelyWaitingForInput(): boolean {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return false;
		}

		if (this.isCopilotRelatedDocument(activeEditor.document)) {
			return true;
		}

		const selection = activeEditor.selection;
		const timeSinceLastActivity = Date.now() - this.lastActivity;
		const timeSinceCopilotActivity = Date.now() - this.lastCopilotActivity;
		
		return selection.isEmpty && 
			   timeSinceCopilotActivity > 5000 &&
			   timeSinceCopilotActivity < 60000 &&
			   this.lastCopilotActivity > 0;
	}

	public clearPendingState(): void {
		console.log('Clearing all pending operations and notification state');
		
		this.activeOperations.clear();
		this.operationStartTime = 0;
		this.lastActivity = Date.now();
		this.lastCopilotActivity = 0;
		this.lastNotificationTime = 0;
		this.lastCompletionNotificationTime = 0;
		
		console.log('Pending state cleared - no queued notifications will trigger');
	}

	dispose(): void {
		this.stopMonitoring();
		this.statusBarItem.dispose();
		this.disposables.forEach(disposable => disposable.dispose());
		this.disposables = [];
	}
}
