export class Auth {
    static getAuthToken(interactive = false) {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ 'interactive': interactive }, function(token) {
                if (token == null) {
                    reject();
                } else {
                    resolve(token);
                }
            });
        });
    }

    static login() {
        const redirect_uri = chrome.identity.getRedirectURL("linenumbers");

        return new Promise((resolve, reject) => {
            // TODO: Check if it is safe to have authToken in callback_url? Or if something else should be done...
            chrome.identity.launchWebAuthFlow(
                {'url': `https://linenumbers.app/api/v1/login?redirect_uri=${redirect_uri}`, 'interactive': true},
                function(redirect_url) { 
                    /* Extract token from redirect_url */ 
                    if (url == null) {
                        reject()
                    } else {
                        console.log('Redirect url', redirect_url);
                        resolve(redirect_url);
                    }
                },
            );
        });
    }

    static invalidateAuthToken() {
        return new Promise((resolve, reject) => {
            this.getAuthToken().then(token => {
                chrome.identity.removeCachedAuthToken({ 'token': token }, function() {
                    resolve();
                });
            });
        });
    }
}