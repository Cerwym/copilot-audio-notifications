import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface LocalizationStrings {
  [key: string]: string;
}

class LocalizationService {
  private static instance: LocalizationService;
  private strings: LocalizationStrings = {};
  private locale: string = 'en';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  private initialize(): void {
    try {
      // Get the current locale from VS Code
      this.locale = vscode.env.language || 'en';
      
      // Load the appropriate localization file
      this.loadStrings();
    } catch (error) {
      console.error('Failed to initialize localization:', error);
      // Fallback to English if there's an error
      this.locale = 'en';
      this.loadStrings();
    }
  }

  private loadStrings(): void {
    try {
      const extensionPath = vscode.extensions.getExtension('peterlockett.copilot-audio-notifications')?.extensionPath;
      if (!extensionPath) {
        console.error('Could not find extension path for localization');
        return;
      }

      // Try to load locale-specific file first (e.g., package.nls.de.json)
      let localizationFile = path.join(extensionPath, `package.nls.${this.locale}.json`);
      
      if (!fs.existsSync(localizationFile)) {
        // Fallback to base language (e.g., 'de' from 'de-CH')
        const baseLocale = this.locale.split('-')[0];
        localizationFile = path.join(extensionPath, `package.nls.${baseLocale}.json`);
        
        if (!fs.existsSync(localizationFile)) {
          // Fallback to default English
          localizationFile = path.join(extensionPath, 'package.nls.json');
        }
      }

      if (fs.existsSync(localizationFile)) {
        const content = fs.readFileSync(localizationFile, 'utf8');
        this.strings = JSON.parse(content);
        console.log(`Loaded localization for locale: ${this.locale}`);
      } else {
        console.warn('No localization file found, using fallback strings');
        this.loadFallbackStrings();
      }
    } catch (error) {
      console.error('Error loading localization strings:', error);
      this.loadFallbackStrings();
    }
  }

  private loadFallbackStrings(): void {
    // Fallback English strings in case file loading fails
    this.strings = {
      'messages.enabled': '🔔 Copilot prompt waiting alerts enabled',
      'messages.disabled': '🔕 Copilot prompt waiting alerts disabled',
      'messages.promptSoundSuccess': '🔊 Prompt waiting sound played successfully!',
      'messages.completionSoundSuccess': '🎉 Completion sound played successfully!',
      'messages.promptWaitingFallback': '🔔 Copilot is waiting for your input!',
      'messages.completionFallback': '✅ Task completed - your attention may be needed!',
      'labels.enabled': 'Enabled',
      'labels.disabled': 'Disabled',
      'labels.systemDefault': 'System Default'
    };
  }

  /**
   * Get a localized string by key
   * @param key The localization key
   * @param args Optional arguments to substitute in the string (using {0}, {1}, etc.)
   * @returns The localized string
   */
  public getString(key: string, ...args: string[]): string {
    let value = this.strings[key];
    
    if (!value) {
      console.warn(`Localization key not found: ${key}`);
      return key; // Return the key itself as fallback
    }

    // Replace placeholders {0}, {1}, etc. with provided arguments
    if (args && args.length > 0) {
      args.forEach((arg, index) => {
        value = value.replace(new RegExp(`\\{${index}\\}`, 'g'), arg);
      });
    }

    return value;
  }

  /**
   * Get the current locale
   */
  public getLocale(): string {
    return this.locale;
  }

  /**
   * Reload localization strings (useful for testing or dynamic locale changes)
   */
  public reload(): void {
    this.initialize();
  }
}

// Export singleton instance
export const localization = LocalizationService.getInstance();

// Convenience function for getting localized strings
export function l10n(key: string, ...args: string[]): string {
  return localization.getString(key, ...args);
}
