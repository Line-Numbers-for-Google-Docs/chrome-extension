import { Auth } from './auth.js';

const newAuthTokenHandlers = []

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.authenticate) {
        const interactive = request.authenticate.interactive;

        if (interactive) {
            // Launch login page
            chrome.tabs.create({ url: `${ENV.LOGIN_URL}?extensionId=${chrome.runtime.id}`, active: true }, (tab) => {
                newAuthTokenHandlers.push((authToken) => {
                    chrome.tabs.remove([tab.id])
                    sendResponse(authToken)
                })
            });
        } else {
            // TODO: Handle non-interactive login if possible
            sendResponse(null)
        }

        return true; // Inform Chrome that we will make a delayed sendResponse
    }
});

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    if (request.authToken) {
        console.log("Got auth token", request.authToken)
        sendResponse(true)

        Auth.storeTokenInLocalStorage(request.authToken);

        // New login, so query subscription status
        // Await to make sure we only resolve when we have fully updated subscription status.
        await Auth.queryAndCacheSubscriptionStatus();

        // New login, so send FCM token to server so that it can send messaged back.
        const fcmToken = await Auth.getFcmFromLocalStorage();
        Auth.trySendFcmTokenToServer(fcmToken);

        let newAuthTokenHandler
        while (newAuthTokenHandler = newAuthTokenHandlers.pop()) {
            newAuthTokenHandler(request.authToken);
        }
    }
});