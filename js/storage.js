export class SettingsManager {
    constructor(documentId) {
        this.documentId = documentId;
        this._settings = new Settings({});

        chrome.storage.sync.get([this.documentId], function(result) {
            if (result.settings != null) {
                this._settings = new Settings(result.settings);
            }
        });
    }

    get settings() {
        return this._settings;
    }

    store() {
        chrome.storage.sync.set({[this.documentId]: this.settings.raw}, function() {
            // Notify that we saved.
            message('Settings saved');
        });
    }
}

class Settings {
    constructor(rawSettings) {
        // Update this to change the default settings.
        this.defaults = {
            step: 1
            // this.numberHeaderFooter = false;
            // this.numberBlankLines = false;
            // this.numberParagraphsOnly = true;
            // this.resetCountOnNewPage = false;
            // this.lineBorder = false;
        };

        this.settings = {};

        // Override defaults with provided settings values
        for (const key in this.defaults) {
            if (rawSettings.hasOwnProperty(key)) {
                this.settings[key] = rawSettings[key];
            } else {
                this.settings[key] = this.defaults[key];
            }
        }
    }

    get raw() {
        // Remove default values
        rawSettings = {};

        for (const key in this.settings) {
            if (this.settings[key] != this.defaults[key]) {
                rawSettings[key] = this.settings[key];
            }
        }

        return rawSettings;
    }

    get step() {
        return this.settings.step;
    }

    set step(step) {
        this.settings.step = step;
    }
}