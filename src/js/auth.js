export class Auth {

    /**
     * Authentication
     */

    static get AUTH_TOKEN_KEY() {
        return 'authToken';
    }

    static queryLocalStorageForToken() {
        return new Promise((resolve, _) => {
            chrome.storage.local.get([Auth.AUTH_TOKEN_KEY], function (result) {
                resolve(result[Auth.AUTH_TOKEN_KEY]);
            });
        });
    }

    static storeTokenInLocalStorage(token) {
        chrome.storage.local.set({ [Auth.AUTH_TOKEN_KEY]: token }, function () { });
    }

    static async getAuthToken(interactive = false) {
        let authToken = await Auth.queryLocalStorageForToken();

        if (authToken == null) {
            // No authToken found in local storage, start authFlow to retrieve token
            authToken = await Auth.retrieveAndCacheAuthToken(interactive);
        }

        return authToken;
    }

    static retrieveAndCacheAuthToken(interactive = false) {
        return new Promise((resolve, _) => {
            chrome.runtime.sendMessage({ authenticate: { interactive: interactive } }, function (response) {
                resolve(response);
            });
        });
    }

    static async login() {
        const authToken = await this.getAuthToken(true);

        return authToken;
    }

    static invalidateAuthToken() {
        return new Promise((resolve, _) => {
            chrome.storage.local.remove([Auth.AUTH_TOKEN_KEY], function () {
                resolve();
            });
        });
    }

    /**
     * Firebase Cloud Messaging
     */

    static FCM_TOKEN_KEY = "fcmToken";

    static storeFcmInLocalStorage(token) {
        chrome.storage.local.set({ [Auth.FCM_TOKEN_KEY]: token }, function () { });
    }

    static getFcmFromLocalStorage() {
        return new Promise((resolve, _) => {
            chrome.storage.local.get([Auth.FCM_TOKEN_KEY], function (result) {
                resolve(result[Auth.FCM_TOKEN_KEY]);
            });
        });
    }

    static storeAndSendFcmToken(fcmToken) {
        Auth.storeFcmInLocalStorage(fcmToken);
        Auth.trySendFcmTokenToServer(fcmToken);
    }

    static async trySendFcmTokenToServer(fcmToken) {
        const authToken = await Auth.getAuthToken();

        // TODO: Figure out how to still send even if user isn't connected so that non logged in user can also receive push notifications
        if (authToken != null) {
            fetch(`${ENV.API_URL}/helpers/addFcmToken`, {
                method: 'POST',
                headers: {
                    AUTHORIZATION: authToken
                },
                body: fcmToken,
            });
        }
    }

    /**
     * Subscription Status
     */

    static get SUBSCRIPTION_STATUS_KEY() {
        return 'subscriptionStatus';
    }

    static queryLocalStorageForSubscriptionStatus() {
        return new Promise((resolve, _) => {
            chrome.storage.local.get([Auth.SUBSCRIPTION_STATUS_KEY], function (result) {
                resolve(result[Auth.SUBSCRIPTION_STATUS_KEY]);
            });
        });
    }

    static storeSubscriptionStatusInLocalStorage(subscriptionStatus) {
        return new Promise((resolve, _) => {
            chrome.storage.local.set({ [Auth.SUBSCRIPTION_STATUS_KEY]: subscriptionStatus }, function () {
                resolve();
            });
        });
    }

    static async getSubscriptionStatus() {
        let subscriptionStatus = await Auth.queryLocalStorageForSubscriptionStatus();

        if (subscriptionStatus == null) {
            // Subscription status not found in local storage, query API get retrieve it.
            console.log("Subscription status not found locally, retrieving from API...");
            subscriptionStatus = await Auth.queryAndCacheSubscriptionStatus();
        }

        return subscriptionStatus;
    }

    static queryAndCacheSubscriptionStatus() {
        return new Promise(async (resolve, reject) => {
            const authToken = await Auth.getAuthToken();

            if (authToken == null) {
                // User not logged in.
                const subscriptionStatus = {
                    premium: false,
                    premium_end: null,
                };

                // Await to make sure we only resolve when subscription status is cached.
                await Auth.storeSubscriptionStatusInLocalStorage(subscriptionStatus);

                resolve(subscriptionStatus);

                return;
            }

            fetch(`${ENV.API_URL}/subscription/status`, {
                headers: {
                    AUTHORIZATION: authToken
                },
                method: "GET",
            }).then(async (response) => {
                if (response.ok) {
                    const subscriptionStatus = JSON.parse(await response.text());

                    // Await to make sure we only resolve when subscription status is cached.
                    await Auth.storeSubscriptionStatusInLocalStorage(subscriptionStatus);
                    resolve(subscriptionStatus);
                } else {
                    // Failed to query subscription status
                    // TODO: Figure out how to handles this case properly
                    reject("Failed to query subscription status...");
                    console.log("Failed!", subscriptionStatusRequest);
                }
            });
        });
    }

    static async isPremium() {
        const subscriptionStatus = await Auth.getSubscriptionStatus();

        return subscriptionStatus != null &&
            subscriptionStatus.premium &&
            subscriptionStatus.premium_end + 86400 > new Date().getTime() / 1000; // Add 1 day leeway.
    }
}