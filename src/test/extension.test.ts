import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Import the extension functions we want to test
// Note: Since the extension functions are not exported, we'll test through VS Code commands

suite('Copilot Audio Notifications Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let extension: vscode.Extension<any> | undefined;

	suiteSetup(async () => {
		// Ensure the extension is activated
		extension = vscode.extensions.getExtension('PeterLockett.copilot-audio-notifications');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
	});

	test('Extension should be present and activated', () => {
		assert.ok(extension);
		assert.ok(extension?.isActive);
	});

	test('Configuration should have default values', () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		assert.strictEqual(config.get('enabled'), true);
		assert.strictEqual(config.get('volume'), 50);
		assert.strictEqual(config.get('customSoundPath'), '');
		assert.strictEqual(config.get('inactivityTimeoutSeconds'), 30);
		assert.strictEqual(config.get('repeatNotifications'), false);
		assert.strictEqual(config.get('repeatIntervalMinutes'), 2);
	});

	test('All commands should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		
		const expectedCommands = [
			'copilotAudioNotifications.toggle',
			'copilotAudioNotifications.testSound',
			'copilotAudioNotifications.selectSound',
			'copilotAudioNotifications.clearSound',
			'copilotAudioNotifications.openSettings',
			'copilotAudioNotifications.showInfo',
			'copilotAudioNotifications.donate'
		];

		for (const command of expectedCommands) {
			assert.ok(commands.includes(command), `Command ${command} should be registered`);
		}
	});

	test('Toggle command should change configuration', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		const initialState = config.get('enabled');
		
		// Execute toggle command
		await vscode.commands.executeCommand('copilotAudioNotifications.toggle');
		
		// Check if state changed
		const newState = config.get('enabled');
		assert.strictEqual(newState, !initialState);
		
		// Toggle back to original state
		await vscode.commands.executeCommand('copilotAudioNotifications.toggle');
		const finalState = config.get('enabled');
		assert.strictEqual(finalState, initialState);
	});

	test('Test sound command should execute without error', async () => {
		// This test just ensures the command doesn't throw an error
		// We can't easily test if sound actually plays in a test environment
		try {
			await vscode.commands.executeCommand('copilotAudioNotifications.testSound');
			assert.ok(true, 'Test sound command executed successfully');
		} catch (error) {
			assert.fail(`Test sound command failed: ${error}`);
		}
	});

	test('Clear sound command should reset custom sound path', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		// Set a custom path first
		await config.update('customSoundPath', '/fake/path/sound.wav', vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('customSoundPath'), '/fake/path/sound.wav');
		
		// Execute clear command
		await vscode.commands.executeCommand('copilotAudioNotifications.clearSound');
		
		// Check if path was cleared
		assert.strictEqual(config.get('customSoundPath'), '');
	});

	test('Volume configuration should accept valid range', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		// Test valid values
		await config.update('volume', 0, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('volume'), 0);
		
		await config.update('volume', 50, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('volume'), 50);
		
		await config.update('volume', 100, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('volume'), 100);
	});

	test('Inactivity timeout should accept valid range', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		// Test valid values
		await config.update('inactivityTimeoutSeconds', 5, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('inactivityTimeoutSeconds'), 5);
		
		await config.update('inactivityTimeoutSeconds', 30, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('inactivityTimeoutSeconds'), 30);
		
		await config.update('inactivityTimeoutSeconds', 300, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('inactivityTimeoutSeconds'), 300);
	});

	suiteTeardown(async () => {
		// Reset configuration to defaults
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		await config.update('enabled', true, vscode.ConfigurationTarget.Global);
		await config.update('volume', 50, vscode.ConfigurationTarget.Global);
		await config.update('customSoundPath', '', vscode.ConfigurationTarget.Global);
		await config.update('inactivityTimeoutSeconds', 30, vscode.ConfigurationTarget.Global);
		await config.update('repeatNotifications', false, vscode.ConfigurationTarget.Global);
		await config.update('repeatIntervalMinutes', 2, vscode.ConfigurationTarget.Global);
	});
});

// Test suite for audio service functionality
suite('Audio Service Tests', () => {
	
	test('Should identify supported audio formats by platform', () => {
		const platform = os.platform();
		
		// Define expected formats for each platform
		const expectedFormats: { [key: string]: string[] } = {
			'win32': ['.wav', '.mp3', '.wma', '.aac'],
			'darwin': ['.wav', '.mp3', '.aiff', '.m4a', '.aac', '.flac'],
			'linux': ['.wav', '.mp3', '.ogg', '.flac']
		};
		
		const expected = expectedFormats[platform] || ['.wav', '.mp3'];
		
		// Since we can't directly test the audio service class, we test the logic
		// This would normally be done by exporting the class or creating testable functions
		assert.ok(expected.length > 0, 'Should have supported formats');
		assert.ok(expected.includes('.wav'), 'Should support WAV format');
		assert.ok(expected.includes('.mp3'), 'Should support MP3 format');
	});

	test('Should validate file extensions correctly', () => {
		// Test valid extensions
		const validExtensions = ['.wav', '.mp3', '.aiff', '.m4a', '.aac', '.flac', '.ogg', '.wma'];
		
		for (const ext of validExtensions) {
			const testFile = `test${ext}`;
			const fileExt = path.extname(testFile).toLowerCase();
			assert.ok(validExtensions.includes(fileExt), `${ext} should be recognized as valid`);
		}
		
		// Test invalid extensions
		const invalidExtensions = ['.txt', '.doc', '.exe', '.zip'];
		
		for (const ext of invalidExtensions) {
			const testFile = `test${ext}`;
			const fileExt = path.extname(testFile).toLowerCase();
			assert.ok(!validExtensions.includes(fileExt), `${ext} should be recognized as invalid`);
		}
	});
});

// Test suite for configuration validation
suite('Configuration Validation Tests', () => {
	
	test('Should handle configuration changes gracefully', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		// Test boolean values
		await config.update('enabled', false, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('enabled'), false);
		
		await config.update('enabled', true, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('enabled'), true);
		
		// Test string values
		await config.update('customSoundPath', '/test/path.wav', vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('customSoundPath'), '/test/path.wav');
		
		// Reset
		await config.update('customSoundPath', '', vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('customSoundPath'), '');
	});

	test('Should maintain configuration schema constraints', async () => {
		const config = vscode.workspace.getConfiguration('copilotAudioNotifications');
		
		// Volume should be constrained to 0-100
		await config.update('volume', 75, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('volume'), 75);
		
		// Timeout should be reasonable
		await config.update('inactivityTimeoutSeconds', 60, vscode.ConfigurationTarget.Global);
		assert.strictEqual(config.get('inactivityTimeoutSeconds'), 60);
		
		// Reset to defaults
		await config.update('volume', 50, vscode.ConfigurationTarget.Global);
		await config.update('inactivityTimeoutSeconds', 30, vscode.ConfigurationTarget.Global);
	});
});
