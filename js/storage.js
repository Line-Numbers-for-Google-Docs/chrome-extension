export class SettingsManager {
    static async getInstance() {
        if (this.instance == null) {
            const documentId = window.location.href.match(/(?<=\/d\/)[\d\w]+/g)[0];
            this.instance = new SettingsManager(documentId);
        }

        await this.instance.available;

        return this.instance;
    }

    constructor(documentId) {
        this.documentId = documentId;
        this._settings = new Settings();
        this.available = new Promise((resolve, reject) => {
            chrome.storage.sync.get([this.documentId], (result) => {
                if (result[this.documentId] != null) {
                    this._settings.set(result[this.documentId]);
                }

                console.log("Got settings", this._settings.settings);
                resolve(true);
            });
        });        
    }

    get settings() {
        return this._settings;
    }

    store() {
        console.log("Storing settings", this.settings.settings);
        chrome.storage.sync.set({[this.documentId]: this.settings.raw}, function() {});
    }
}

class Settings {
    constructor() {
        // Update this to change the default settings.
        this.defaults = {
            enabled: false,
            start: 1,
            step: 1,
            numberBlankLines: false,
            resetCountOnNewPage: false,
            // numberHeaderFooter: false,
            // numberParagraphsOnly: true,
            // lineBorder: false,
        };

        this.updateCallbacks = [];
        this.saveStack = [];

        this.settings = {};
    }

    set(rawSettings) {
        // Override defaults with provided settings values
        for (const key in this.defaults) {
            if (rawSettings.hasOwnProperty(key)) {
                this.settings[key] = rawSettings[key];
            } else {
                this.settings[key] = this.defaults[key];
            }
        }
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    executeUpdateCallbacks() {
        for (const callback of this.updateCallbacks) {
            callback(this);
        }
    }

    get raw() {
        // Remove default values
        const rawSettings = {};

        for (const key in this.settings) {
            if (this.settings[key] != this.defaults[key]) {
                rawSettings[key] = this.settings[key];
            }
        }

        return rawSettings;
    }

    save() {
        this.saveStack.push(JSON.parse(JSON.stringify(this.settings)));
    }

    restoreLastSave() {
        this.settings = this.saveStack.pop();
        this.executeUpdateCallbacks();
    }

    popLastSave() {
        return this.saveStack.pop();
    }

    get enabled() {
        return this.settings.enabled;
    }

    set enabled(enabled) {
        this.settings.enabled = enabled;
        this.executeUpdateCallbacks();
    }

    get start() {
        return this.settings.start;
    }

    set start(start) {
        this.settings.start = start;
        this.executeUpdateCallbacks();
    }

    get step() {
        return this.settings.step;
    }

    set step(step) {
        this.settings.step = step;
        this.executeUpdateCallbacks();
    }
}