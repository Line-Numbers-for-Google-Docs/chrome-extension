export class Auth {
    static getAuthToken(interactive = false) {
        const redirect_uri = chrome.identity.getRedirectURL("linenumbers");

        return new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                {'url': `https://linenumbers.app/api/v1/login?redirect_uri=${redirect_uri}`, 'interactive': interactive},
                function(redirect_url) { 
                    /* Extract token from redirect_url */ 
                    if (redirect_url == null) {
                        reject()
                    } else {
                        const authToken = redirect_url.split('authToken=')[1]
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
        return new Promise((resolve, reject) => {
            this.getAuthToken().then(token => {
                chrome.identity.removeCachedAuthToken({ 'token': token }, function() {
                    resolve();
                });
            });
        });
    }
}