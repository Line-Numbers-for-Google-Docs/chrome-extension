import { Auth } from "./auth.js"

dataLayer.push({
    event: 'virtualPageView',
    virtualPath: '/popup',
    virtualTitle: 'Extension Popup'
});

function signedIn() {
    document.getElementById('g-signin').style.display = 'none';
    document.getElementById('logged-in-content').style.display = 'block';
}

function signedOut() {
    document.getElementById('g-signin').style.display = 'block';
    document.getElementById('logged-in-content').style.display = 'none';
}

document.getElementById('g-signin').onclick = function () {
    Auth.login().then((token) => {
        console.log(token);
        signedIn();

        // const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`

        // var xhr = new XMLHttpRequest();
        // xhr.open('GET', url);
        // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // xhr.onload = function() {
        //     console.log('Response', xhr.responseText);
        // };
        // xhr.send();
    });
};

signedOut();

// Auth.getAuthToken().then((token) => {
//     console.log('Singed in!', token);
//     signedIn();

//     const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`

//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url);
//     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//     xhr.onload = function() {
//         console.log('Response', xhr.responseText);
//     };
//     xhr.send();

// }).catch(() => {
//     console.log('Not signed in!');
//     signedOut();
// });