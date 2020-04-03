export class Auth {
    
    /**
     * Authentication
     */

    static get AUTH_TOKEN_KEY() {
        return 'authToken';
    }

    static queryLocalStorageForToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([Auth.AUTH_TOKEN_KEY], function(result) {
                if (result[Auth.AUTH_TOKEN_KEY] == null) {
                    reject();
                } else {
                    resolve(result[Auth.AUTH_TOKEN_KEY]);
                }
            });
        });
    }

    static storeTokenInLocalStorage(token) {
        chrome.storage.local.set({[Auth.AUTH_TOKEN_KEY]: token}, function() {});
    }

    static getAuthToken(interactive = false) {
        return new Promise((resolve, reject) => {
            Auth.queryLocalStorageForToken().then((token) => {
                resolve(token);
            }).catch(() => {
                // No authToken found in local storage, start authFlow to retrieve token
                Auth.retrieveAuthToken(interactive).then(token => {
                    resolve(token);
                }).catch(() => {
                    reject();
                });
            });
        });
    }

    static retrieveAuthToken(interactive = false) {
        return new Promise((resolve, reject) => {
            const redirect_uri = chrome.identity.getRedirectURL("linenumbers");

            chrome.identity.launchWebAuthFlow(
                {'url': `https://linenumbers.app/api/v1/login?redirect_uri=${redirect_uri}`, 'interactive': interactive},
                function(redirect_url) { 
                    /* Extract token from redirect_url */ 
                    if (redirect_url == null) {
                        // Failed to Authenticate...
                        reject();
                    } else {
                        const authToken = redirect_url.split('authToken=')[1];
                        Auth.storeTokenInLocalStorage(authToken);
                        resolve(authToken);
                    }
                },
            );
        });
    }

    static login() {
        return this.getAuthToken(true);
    }

    static invalidateAuthToken() {
        return new Promise((resolve, _) => {
            chrome.storage.local.remove([Auth.AUTH_TOKEN_KEY], function () {
                resolve();
            });
        });
    }

    static syncAuthToken() {
        this.querySubscriptionStatus().then(subscriptionStatus => {
            storeSubscriptionStatusInLocalStorage(subscriptionStatus);
            resolve(subscriptionStatus);
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
                if (result[Auth.SUBSCRIPTION_STATUS_KEY] == null) {
                    reject();
                } else {
                    resolve(result[Auth.SUBSCRIPTION_STATUS_KEY]);
                }
            });
        });
    }

    static storeSubscriptionStatusInLocalStorage(subscriptionStatus) {
        chrome.storage.local.set({[Auth.SUBSCRIPTION_STATUS_KEY]: subscriptionStatus}, function() {});
    }

    static getSubscriptionStatus() {
        return new Promise((resolve, reject) => {
            Auth.queryLocalStorageForSubscriptionStatus().then(subscriptionStatus => {
                resolve(subscriptionStatus);
            }).catch(() => {
                Auth.querySubscriptionStatus().then(subscriptionStatus => {
                    Auth.storeSubscriptionStatusInLocalStorage(subscriptionStatus);
                    resolve(subscriptionStatus);
                }).catch(() => {
                    // Failed to query subscription status
                    // TODO: Make sure anything that calls this handles this case properly
                    reject("Failed to query subscription status...");
                });
            });
        });
    }

    static querySubscriptionStatus() {
        return new Promise((resolve, reject) => {
            this.getAuthToken().then((token) => {
                const subscriptionStatusRequest = new XMLHttpRequest();
                const subscriptionStatusRequestUrl = `https://linenumbers.app/api/v1/subscriptionStatus?authToken=${token}`;
                subscriptionStatusRequest.open("GET", subscriptionStatusRequestUrl);
                subscriptionStatusRequest.send();

                subscriptionStatusRequest.onreadystatechange = (e) => {
                    if (subscriptionStatusRequest.readyState == 4) {
                        if (subscriptionStatusRequest.status == 200) {
                            const subscriptionStatus = JSON.parse(subscriptionStatusRequest.responseText);
                            resolve(subscriptionStatus);
                        } else {
                            // Failed to query subscription status
                            // TODO: Make sure anything that calls this handles this case properly
                            reject("Failed to query subscription status...");
                            console.log("Failed!", subscriptionStatusRequest);
                        }
                    }
                }
            }).catch(() => {
                resolve({
                    premium: false,
                    premium_end: null,
                });
            });
        });
    }

    // TODO: This should be run on start up
    static syncSubscriptionStatus() {
        this.querySubscriptionStatus().then(subscriptionStatus => {
            storeSubscriptionStatusInLocalStorage(subscriptionStatus);
            resolve(subscriptionStatus);
        });
    }
}