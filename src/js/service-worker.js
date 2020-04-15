// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyC_8owrjnH8r5GYFOZk1zr-5RtwK7OQIfU",
    authDomain: "line-numbers-for-1585514689405.firebaseapp.com",
    databaseURL: "https://line-numbers-for-1585514689405.firebaseio.com",
    projectId: "line-numbers-for-1585514689405",
    storageBucket: "line-numbers-for-1585514689405.appspot.com",
    messagingSenderId: "797785421061",
    appId: "1:797785421061:web:c2fc00420c075e709ef36c",
    measurementId: "G-2ZYGGKYD0T",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

self.addEventListener('install', event => {
    console.log('Service worker installing...');
    // Add a call to skipWaiting here
    self.skipWaiting()
});

self.addEventListener('activate', event => {
    console.log('Service worker activating...');

    messaging.usePublicVapidKey("BLt5C4H5qpUyCt9QoVlknNvn8z_e4Oef6s7H-rDNdgnFxEDZNhC27wKejGN5YgjAInzcBe_1Mnd98W5QjASP-SM");

    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken().then((currentToken) => {
        console.log("currentToken", currentToken);

        if (currentToken) {
            sendTokenToServer(currentToken);
        } else {
            console.error('No Instance ID token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.error('An error occurred while retrieving token. ', err);
    });

    messaging.setBackgroundMessageHandler(function(payload) {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        if (payload.data.event == "subscriptionActivated") {
            const channel = new BroadcastChannel('subscription-updates');
            channel.postMessage({ subscriptionUpdated: true });
        }
    });
});

function sendTokenToServer(token) {
    // let request = new XMLHttpRequest();
    // request.open("POST", 'localhost:4567/api/v1/setFcmToken', true);
    // request.send(token)
}