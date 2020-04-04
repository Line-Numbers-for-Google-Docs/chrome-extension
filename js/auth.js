export class Auth {
    
    /**
     * Authentication
     */

    static get AUTH_TOKEN_KEY() {
        return 'authToken';
    }

    static queryLocalStorageForToken() {
        return new Promise((resolve, _) => {
            chrome.storage.local.get([Auth.AUTH_TOKEN_KEY], function(result) {
                resolve(result[Auth.AUTH_TOKEN_KEY]);
            });
        });
    }

    static storeTokenInLocalStorage(token) {
        chrome.storage.local.set({[Auth.AUTH_TOKEN_KEY]: token}, function() {});
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
            if (chrome.identity == null) {
                // In content script, can't authenticate...
                resolve(null);
            }

            const redirect_uri = chrome.identity.getRedirectURL("linenumbers");

            chrome.identity.launchWebAuthFlow(
                {'url': `https://linenumbers.app/api/v1/login?redirect_uri=${redirect_uri}`, 'interactive': interactive},
                function(redirect_url) { 
                    /* Extract token from redirect_url */ 
                    if (redirect_url == null) {
                        // Failed to Authenticate...
                        resolve(null);
                    } else {
                        const authToken = redirect_url.split('authToken=')[1];
                        Auth.storeTokenInLocalStorage(authToken);
                        resolve(authToken);
                    }
                },
            );
        });
    }

    static async login() {
        const authToken = await this.getAuthToken(true);
        queryAndCacheSubscriptionStatus();

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
     * Subscription Status
     */

    static get SUBSCRIPTION_STATUS_KEY() {
        return 'subscriptionStatus';
    }

    static queryLocalStorageForSubscriptionStatus() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([Auth.SUBSCRIPTION_STATUS_KEY], function(result) {
                resolve(result[Auth.SUBSCRIPTION_STATUS_KEY]);
            });
        });
    }

    static storeSubscriptionStatusInLocalStorage(subscriptionStatus) {
        chrome.storage.local.set({[Auth.SUBSCRIPTION_STATUS_KEY]: subscriptionStatus}, function() {});
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

                resolve(subscriptionStatus);
                Auth.storeSubscriptionStatusInLocalStorage(subscriptionStatus);

                return;
            }

            const subscriptionStatusRequest = new XMLHttpRequest();
            const subscriptionStatusRequestUrl = `https://linenumbers.app/api/v1/subscriptionStatus?authToken=${authToken}`;
            subscriptionStatusRequest.open("GET", subscriptionStatusRequestUrl);
            subscriptionStatusRequest.send();

            subscriptionStatusRequest.onreadystatechange = (e) => {
                if (subscriptionStatusRequest.readyState == 4) {
                    if (subscriptionStatusRequest.status == 200) {
                        const subscriptionStatus = JSON.parse(subscriptionStatusRequest.responseText);
                        resolve(subscriptionStatus);
                        Auth.storeSubscriptionStatusInLocalStorage(subscriptionStatus);
                    } else {
                        // Failed to query subscription status
                        // TODO: Figure out how to handles this case properly
                        reject("Failed to query subscription status...");
                        console.log("Failed!", subscriptionStatusRequest);
                    }
                }
            }
        });
    }

    static async isPremium() {
        const subscriptionStatus = await Auth.getSubscriptionStatus();
        
        return subscriptionStatus != null && 
            subscriptionStatus.premium && 
            subscriptionStatus.premium_end > new Date().getTime() / 1000;
    }
}