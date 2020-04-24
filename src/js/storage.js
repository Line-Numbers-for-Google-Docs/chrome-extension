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
        this.available = new Promise(async (resolve, _) => {

            const localSettings = await this.retrieveSettingsFromLocalStorage();
            const serverSettings = await this.retrieveSettingsFromServer();

            if (localSettings == null && serverSettings == null) {
                await this._settings.set({});
                resolve(true);

                return;
            }

            if (localSettings == null) {
                await this._settings.set(serverSettings);
                resolve(true);

                this.storeLocally(serverSettings);

                return;
            }

            if (serverSettings == null) {
                if (localSettings.lastUpdated == null) {
                    localSettings.lastUpdated = Date.now();
                    this.storeLocally(localSettings);
                }

                await this._settings.set(localSettings);
                resolve(true);

                this.storeOnServer(localSettings);

                return;
            }

            if (localSettings.lastUpdated > serverSettings.lastUpdated) {
                await this._settings.set(localSettings);
                resolve(true);

                this.storeOnServer(localSettings);
            } else {
                await this._settings.set(serverSettings);
                resolve(true);

                this.storeLocally(serverSettings);
            }
        });
    }

    async retrieveSettingsFromServer() {
        const authToken = await Auth.getAuthToken();

        if (!authToken) {
            return null;
        }

        try {
            const response = await fetch(`${ENV.API_URL}/document/settings?document=${this.documentId}`, {
                headers: {
                    AUTHORIZATION: authToken
                },
                method: 'GET',
            });

            if (response.ok) {
                // Successfully retrieved from server
                const rawSettings = await response.json();

                return rawSettings;
            }
        } catch (e) {
            console.warn(e);
            return null;
        }

        return null;
    }

    retrieveSettingsFromLocalStorage() {
        return new Promise((resolve, _) => {
            chrome.storage.sync.get([this.documentId], result => {
                resolve(result[this.documentId]);
            });
        });
    }

    get settings() {
        return this._settings;
    }

    storeLocally(rawSettings) {
        chrome.storage.sync.set({ [this.documentId]: rawSettings }, function () { });
    }

    async storeOnServer(rawSettings) {
        // Send update to server
        const authToken = await Auth.getAuthToken();
        if (authToken != null) {
            fetch(`${ENV.API_URL}/document/settings?document=${this.documentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    AUTHORIZATION: authToken
                },
                body: JSON.stringify(rawSettings),
            });
        }
    }

    async store() {
        const rawSettings = this.settings.raw;
        rawSettings.lastUpdated = Date.now();

        this.storeLocally(rawSettings);
        this.storeOnServer(rawSettings);
    }
}

export const numbering = {
    CONTINUOUS: 0,
    EACH_PAGE: 1,
}

export const selection = {
    NUMBER: 0,
    NO_NUMBER: 1,
}

export const borderStyle = {
    NONE: 0,
    SOLID: 1,
    DOUBLE: 2,
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
                numberSize: 10,
                numberColor: "626871",
                leftBorderStyle: borderStyle.NONE,
                rightBorderStyle: borderStyle.NONE,
                selectionType: selection.NUMBER,
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
            try {
                callback(this);
            } catch (e) {
                console.error("Failed to execute callback", e);
            }
        }
    }

    get raw() {
        // Remove default values
        const rawSettings = {};

        for (const key in this.settings) {
            if (this.settings[key] != this.defaults.free[key] &&
                this.settings[key] != this.defaults.premium[key]) {
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

    get leftBorderStyle() {
        return this.settings.leftBorderStyle;
    }

    set leftBorderStyle(leftBorderStyle) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.leftBorderStyle = leftBorderStyle;
            this.executeUpdateCallbacks();
        });
    }

    get rightBorderStyle() {
        return this.settings.rightBorderStyle;
    }

    set rightBorderStyle(rightBorderStyle) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.rightBorderStyle = rightBorderStyle;
            this.executeUpdateCallbacks();
        });
    }

    get selectionType() {
        return this.settings.selectionType;
    }

    set selectionType(selectionType) {
        Auth.isPremium().then(isPremium => {
            if (!isPremium) return;
            this.settings.selectionType = selectionType;
            this.executeUpdateCallbacks();
        });
    }
}