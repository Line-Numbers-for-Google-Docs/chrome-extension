import { Auth } from "./auth.js"

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyC_8owrjnH8r5GYFOZk1zr-5RtwK7OQIfU",
    authDomain: "line-numbers-for-1585514689405.firebaseapp.com",
    databaseURL: "https://line-numbers-for-1585514689405.firebaseio.com",
    projectId: "line-numbers-for-1585514689405",
    storageBucket: "line-numbers-for-1585514689405.appspot.com",
    messagingSenderId: "797785421061",
    appId: "1:797785421061:web:c2fc00420c075e709ef36c",
    measurementId: "G-2ZYGGKYD0T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

const channel = new BroadcastChannel('subscription-updates');
channel.addEventListener('message', event => {
	console.log('Received', event.data);
	if (event.data.subscriptionUpdated) {
		console.log("Updating subscription status");
		Auth.queryAndCacheSubscriptionStatus();
	}
});

messaging.usePublicVapidKey("BLt5C4H5qpUyCt9QoVlknNvn8z_e4Oef6s7H-rDNdgnFxEDZNhC27wKejGN5YgjAInzcBe_1Mnd98W5QjASP-SM");

// Get Instance ID token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
messaging.getToken().then((currentToken) => {
	// console.log("Token", currentToken);
    if (currentToken) {
        Auth.storeAndSendFcmToken(currentToken);
    } else {
        console.log('No Instance ID token available. Request permission to generate one.');
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
});

  // Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
    messaging.getToken().then((refreshedToken) => {
        console.log('Token refreshed.');
        // Send Instance ID token to app server.
        Auth.storeAndSendFcmToken(refreshedToken);
    }).catch((err) => {
        console.log('Unable to retrieve refreshed token ', err);
        showToken('Unable to retrieve refreshed token ', err);
    });
});