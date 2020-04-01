import { Auth } from "./auth.js"

dataLayer.push({
    event: 'virtualPageView',
    virtualPath: '/popup',
    virtualTitle: 'Extension Popup'
});

const goBackButton = document.getElementById('go-back');
const landingSection = document.getElementById('landing');
const checkoutSection = document.getElementById('checkout');
const signInButton = document.getElementById('g-signin');
const goPremiumButton = document.getElementById('go-premium');

signInButton.onclick = function () {
    Auth.login().then((token) => {
        console.log(token);
        signedIn();
    });
};

document.getElementById('close-popup').onclick = function() {
    window.close();
}

goPremiumButton.onclick = function() {
    landingSection.style.display = 'none';
    checkoutSection.style.display = "";
    goBackButton.style.display = "";

    goBackButton.onclick = function() {
        landingSection.style.display = "";
        checkoutSection.style.display = "none";
        goBackButton.style.display = "none";
    }
}

// TODO: Add ability to sign out.

Auth.getAuthToken().then((token) => {
    goPremiumButton.style.display = 'block';
}).catch(() => {
    signInButton.style.display = 'block';
});