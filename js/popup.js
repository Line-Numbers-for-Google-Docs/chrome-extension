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
const checkoutButton = document.getElementById('checkout-btn');

// TODO: Add ability to sign out.
const TOKEN_STORE = {}

function login(onFailure) {
    
}

(function() {
    Auth.getAuthToken().then((token) => {
        TOKEN_STORE.token = token;
        goPremiumButton.style.display = 'block';
    }).catch(() => {
        signInButton.style.display = 'block';
    });
})();

signInButton.onclick = function () {
    Auth.login().then((token) => {
        TOKEN_STORE.token = token;
        signInButton.style.display = 'hidden';
        goPremiumButton.style.display = 'block';
    }).catch(() => {
        // TODO: Handle failure.
    })
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

const subscriptionsRequest = new XMLHttpRequest();
const subscriptionsRequestUrl = "https://linenumbers.app/api/v1/subscriptions";
subscriptionsRequest.open("GET", subscriptionsRequestUrl);
subscriptionsRequest.send();

subscriptionsRequest.onreadystatechange = (e) => {
    if (subscriptionsRequest.readyState == 4 && subscriptionsRequest.status == 200) {
        if (subscriptionsRequest.responseText){
            const subscriptions = JSON.parse(subscriptionsRequest.responseText);
            
            let currency = subscriptions.currency
            let currencySymbol = ""
            switch (currency == "OTHER") {
                case "USD":
                    currencySymbol = "$"
                    break;
                case "EUR":
                    currencySymbol = "€"
                    break;
                case "GBP":
                    currencySymbol = "£"
                    break;
                default:
                    // Default to USD when currency not available or unrecognized
                    // TODO: Maybe let the user choose the currency in this case?
                    currency = "USD"
                    currencySymbol = "$"
            }

            document.getElementById("monthly-price").innerText = `${currencySymbol}${subscriptions.monthly[currency]/100}`;
            document.getElementById("yearly-price").innerText = `${currencySymbol}${subscriptions.yearly[currency]/100}`;
        }
    }
}

checkoutButton.onclick = function() {
    let subscriptionType;
    if (document.getElementById('monthly-subscription').checked) {
        subscriptionType = 'monthly';
    } else if (document.getElementById('yearly-subscription').checked) {
        subscriptionType = 'yearly';
    } else {
        // Error...
        // TODO: Handle failure
        return;
    }

    const checkoutUrlRequest = new XMLHttpRequest();
    const checkoutUrlRequestUrl = `https://linenumbers.app/api/v1/checkoutURL?authToken=${TOKEN_STORE.token}&subscriptionType=${subscriptionType}`;
    checkoutUrlRequest.open("GET", checkoutUrlRequestUrl);
    checkoutUrlRequest.send();

    checkoutUrlRequest.onreadystatechange = (e) => {
        if (checkoutUrlRequest.readyState == 4 && checkoutUrlRequest.status == 200) {
            if (checkoutUrlRequest.responseText){
                const checkOutURL = checkoutUrlRequest.responseText;
                chrome.tabs.create({ url: checkOutURL });
            }
        }
    }
}