import { Auth } from './auth.js';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.authenticate) {
        const interactive = request.authenticate.interactive;

        const redirect_uri = chrome.identity.getRedirectURL("linenumbers");

        const authFlowConfig = {
            'url': `https://linenumbers.app/api/v1/login?redirect_uri=${redirect_uri}`, 
            'interactive': interactive
        }

        const launchWebAuthFlow = (isSecondAttempt) => {
            console.log("Launching Auth Flow! Interactive:", interactive);
            chrome.identity.launchWebAuthFlow(
                authFlowConfig,
                async redirect_url => {
                    /* Extract token from redirect_url */ 
                    if (redirect_url == null) {
                        // Failed to Authenticate...
                        if (!interactive || isSecondAttempt) {
                            sendResponse(null);
                        } else {
                            // Query second time, KEEP THIS HERE
                            // For some reason on first attempt you get 'Authorization page could not be loaded'.
                            // Re-querying it is required to actually retrieve the Auth Token.
                            launchWebAuthFlow(true);
                        }
                    } else {
                        const authToken = redirect_url.split('authToken=')[1];
                        
                        Auth.storeTokenInLocalStorage(authToken);

                        // New login, so query subscription status
                        // Await to make sure we only resolve when we have fully updated subscription status.
                        await Auth.queryAndCacheSubscriptionStatus();

                        // New login, so send FCM token to server so that it can send messaged back.
                        const fcmToken = await Auth.getFcmFromLocalStorage();
                        Auth.trySendFcmTokenToServer(fcmToken);

                        sendResponse(authToken);
                    }
                },
            );
        }
        
        launchWebAuthFlow();

        return true; // Inform Chrome that we will make a delayed sendResponse
    }
});