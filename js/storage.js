import { Auth } from "./auth.js";

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
            chrome.storage.sync.get([this.documentId], async (result) => {
                if (result[this.documentId] != null) {
                    await this._settings.set(result[this.documentId]);
                } else {
                    await this._settings.set({});
                }

                resolve(true);
            });
        });        
    }

    get settings() {
        return this._settings;
    }

    store() {
        chrome.storage.sync.set({[this.documentId]: this.settings.raw}, function() {});
    }
}

export const numbering = {
    CONTINUOUS: 0,
    EACH_PAGE: 1,
}

class Settings {
    constructor() {
        // Update this to change the default settings.
        this.defaults = {
            free: {
                enabled: false,
                start: 1,
                step: 1,
                type: numbering.CONTINUOUS,
                numberBlankLines: true,
                numberHeaders: false,
                numberFooters: false,
            },
            premium: {
                numberColumns: false,
                pageBorders: false,
                numberSize: 10,
                numberColor: "#626871",
            },    
        };

        this.updateCallbacks = [];
        this.saveStack = [];

        this.settings = {};
    }

    _initializeSettings(rawSettings, defaults) {
        for (const key in defaults) {
            if (rawSettings.hasOwnProperty(key)) {
                this.settings[key] = rawSettings[key];
            } else {
                this.settings[key] = defaults[key];
            }
        }
    }

    async set(rawSettings) {
        // Override defaults with provided settings values
        this._initializeSettings(rawSettings, this.defaults.free);

        const isPremium = await Auth.isPremium();
        if (isPremium) {
            this._initializeSettings(rawSettings, this.defaults.premium);
        } else {
            for (const key in this.defaults.premium) {
                this.settings[key] = this.defaults.premium[key];
            }
        }
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    async executeUpdateCallbacks() {
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
        const settingsCopy = JSON.parse(JSON.stringify(this.settings));
        this.saveStack.push(settingsCopy);
    }

    restoreLastSave() {
        this.settings = this.saveStack.pop();
        this.executeUpdateCallbacks();
    }

    popLastSave() {
        return this.saveStack.pop();
    }

    // Free settings

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

    get type() {
        return this.settings.type;
    }

    set type(type) {
        this.settings.type = type;
        this.executeUpdateCallbacks();
    }

    get numberBlankLines() {
        return this.settings.numberBlankLines;
    }

    set numberBlankLines(numberBlankLines) {
        this.settings.numberBlankLines = numberBlankLines;
        this.executeUpdateCallbacks();
    }

    get numberHeaders() {
        return this.settings.numberHeaders;
    }

    set numberHeaders(numberHeaders) {
        this.settings.numberHeaders = numberHeaders;
        this.executeUpdateCallbacks();
    }

    get numberFooters() {
        return this.settings.numberFooters;
    }

    set numberFooters(numberFooters) {
        this.settings.numberFooters = numberFooters;
        this.executeUpdateCallbacks();
    }

    // Premium settings

    get numberColumns() {
        return this.settings.numberColumns;
    }

    set numberColumns(numberColumns) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.numberColumns = numberColumns;
            this.executeUpdateCallbacks();
        });
    }

    get pageBorders() {
        return this.settings.pageBorders;
    }

    set pageBorders(pageBorders) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.pageBorders = pageBorders;
            this.executeUpdateCallbacks();
        });
    }

    get numberSize() {
        return this.settings.numberSize;
    }

    set numberSize(numberSize) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.numberSize = numberSize;
            this.executeUpdateCallbacks();
        });
    }

    get numberColor() {
        return this.settings.numberColor;
    }

    set numberColor(numberColor) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.numberColor = numberColor;
            this.executeUpdateCallbacks();
        });
    }
}