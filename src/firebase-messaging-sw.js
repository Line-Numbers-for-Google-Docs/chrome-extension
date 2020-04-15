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
    measurementId: "G-2ZYGGKYD0T"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    if (payload.data.event != null && payload.data.event == "subscriptionActivated") {
        const channel = new BroadcastChannel('subscription-updates');
        channel.postMessage({ subscriptionUpdated: true });
    }
});