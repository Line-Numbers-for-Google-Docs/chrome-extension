import { Auth } from "./auth.js"

// TODO: Rewrite all the then and catch with async await and resolve to null for failure.

/**
 * Setup
 */

const goBackButton = document.getElementById('go-back');
const landingSection = document.getElementById('landing');
const signInButton = document.getElementById('g-signin');
const goPremiumButton = document.getElementById('go-premium');
const checkoutButton = document.getElementById('checkout-btn');
const amountInput = document.getElementById('subscription-amount');
const manageSubscriptionButton = document.getElementById('manage-subscription-btn');
const subscriptionUpdateAmountInput = document.getElementById('subscription-update-amount');

// Sections
const signedOutContent = document.getElementById('signed-out-content');
const nonPremiumContent = document.getElementById('signed-in-non-premium-content');
const premiumContent = document.getElementById('premium-content');

const checkoutSection = document.getElementById('checkout');
const manageSubscriptionSection = document.getElementById('manage-subscription');

const manageActiveSubscriptionSection = document.getElementById('active-subscription-content');
const manageCanceledSubscriptionSection = document.getElementById('canceled-subscription-content');

// Figure out what to display based on user state
const synchronizePageWithUserState = async function() {
    signedOutContent.style.display = 'none';
    premiumContent.style.display = 'none';
    nonPremiumContent.style.display = 'none';

    const authToken = await Auth.getAuthToken();

    if (authToken == null) {
        // User not signed in
        signedOutContent.style.display = null;
    } else {
        // User signed in
        const isPremium = await Auth.isPremium();
        if (isPremium) {
            // User signed in and premium
            premiumContent.style.display = null;

            fetch(`https://linenumbers.app/api/v1/activeSubscription?authToken=${authToken}`, {
                method : "GET",
            }).then(async (response) => {
                if (response.ok) {
                    const activeSubscription = await response.json();
                    console.log(activeSubscription);
                    subscriptionUpdateAmountInput.value = activeSubscription.quantity;
                    
                    if (activeSubscription.cancel_at_period_end) {
                        manageCanceledSubscriptionSection.style.display = null;
                    } else {
                        manageActiveSubscriptionSection.style.display = null;
                    }
                } else {
                    // Failed to get active subscription status
                    // TODO: Handle
                }
            });
        } else {
            // User signed in but not premium
            nonPremiumContent.style.display = null;
        }
    }
}
synchronizePageWithUserState();

/**
 * Authentication
 */

// TODO: Add ability to sign out.

signInButton.onclick = async function () {
    const authToken = await Auth.login();

    if (authToken == null) {
        // Failed to login...
        // TODO: Handle this in some way -- show message to user.
    } else {
        synchronizePageWithUserState();
    }
};

document.getElementById('close-popup').onclick = function() {
    window.close();
}

/**
 * Subscriptions
 */

// TODO: Add ability to update subscriptions.

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

manageSubscriptionButton.onclick = function() {
    landingSection.style.display = 'none';
    manageSubscriptionSection.style.display = "";
    goBackButton.style.display = "";

    goBackButton.onclick = function() {
        landingSection.style.display = "";
        manageSubscriptionSection.style.display = "none";
        goBackButton.style.display = "none";
    }
}

const currencyRequest = new XMLHttpRequest();
const currencyRequestUrl = "https://linenumbers.app/api/v1/currency";
currencyRequest.open("GET", currencyRequestUrl);
currencyRequest.send();

currencyRequest.onreadystatechange = (e) => {
    if (currencyRequest.readyState == 4 && currencyRequest.status == 200) {
        if (currencyRequest.responseText){
            const currency = currencyRequest.responseText;
            
            let currencySymbol = ""
            switch (currency) {
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
                    currencySymbol = "$"
            }

            const currencyElements = Array.from(document.getElementsByClassName("currency"));
            for (const currencyElement of currencyElements) {
                currencyElement.innerText = `${currencySymbol}`;
            }
        }
    }
}

checkoutButton.onclick = async function() {
    let amount = Number(amountInput.value);

    const authToken = await Auth.getAuthToken();

    const checkoutUrlRequest = new XMLHttpRequest();
    const checkoutUrlRequestUrl = `https://linenumbers.app/api/v1/checkoutURL?authToken=${authToken}&amount=${amount}`;
    checkoutUrlRequest.open("GET", checkoutUrlRequestUrl);
    checkoutUrlRequest.send();

    checkoutUrlRequest.onreadystatechange = (e) => {
        if (checkoutUrlRequest.readyState == 4) {
            if (checkoutUrlRequest.status == 200 && checkoutUrlRequest.responseText) {
                const checkOutURL = checkoutUrlRequest.responseText;
                chrome.tabs.create({ url: checkOutURL });
            } else {
                console.error("Failed to get checkout url", e);
                // TODO: Let user know checkout failed and what to do
            }
        }
    }
}

/** Donation Amount Validation */
amountInput.onkeypress = (event) => {
    if (event.charCode == 48) {
        // 0 typed in
        return amountInput.value != ""
    }

    return (event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57
}
// Note strictly required but for extra validation :)
amountInput.onchange = (event) => {
    const val = Number(amountInput.value);

    if (val == 0) {
        amountInput.value = 5;
    } else {
        amountInput.value = val;
    }
}

const updateSubscriptionButton = document.getElementById('update-subscription-btn');
const updateSubscriptionButtonText = document.getElementsByClassName('update-subscription-btn-text')[0];
updateSubscriptionButton.onclick = async () => {
    const amount = Number(subscriptionUpdateAmountInput.value);
    const authToken = await Auth.getAuthToken();

    const text = updateSubscriptionButtonText.innerText;
    updateSubscriptionButtonText.innerText = 'Updating...';

    fetch(`https://linenumbers.app/api/v1/updateSubscription?authToken=${authToken}&amount=${amount}`, {
        method : "POST",
    }).then((response) => {
      if (response.ok) {
        // Successfully updated
        updateSubscriptionButton.style['background-image'] = '-webkit-linear-gradient(left, #77D183, #62C887)';
        updateSubscriptionButtonText.innerText = 'Success!';

        setTimeout(() => {
            updateSubscriptionButton.style['background-image'] = null;
            updateSubscriptionButtonText.innerText = text;
        }, 1000);
      } else {
        // Failed to update...
        updateSubscriptionButton.style['background-image'] = '-webkit-linear-gradient(left, #FA6E6E, #F06B6C)';
        updateSubscriptionButtonText.innerText = 'Failed!';

        setTimeout(() => {
            updateSubscriptionButton.style['background-image'] = null;
            updateSubscriptionButtonText.innerText = text;
        }, 1000);
      }
    });
}

const cancelSubscriptionButton = document.getElementById('cancel-subscription-btn');
const cancelSubscriptionButtonText = document.getElementsByClassName('cancel-subscription-btn-text')[0];
cancelSubscriptionButton.onclick = async () => {
    const authToken = await Auth.getAuthToken();

    const text = cancelSubscriptionButtonText.innerText;
    cancelSubscriptionButtonText.innerText = 'Canceling...';

    fetch(`https://linenumbers.app/api/v1/cancelSubscription?authToken=${authToken}`, {
        method : "POST",
    }).then((response) => {
      if (response.ok) {
        // Successfully canceled
        manageActiveSubscriptionSection.style.display = 'none';
        manageCanceledSubscriptionSection.style.display = null;
        cancelSubscriptionButtonText.innerText = text;
      } else {
        // Failed to cancel...
        cancelSubscriptionButton.style['background-image'] = '-webkit-linear-gradient(left, #FA6E6E, #F06B6C)';
        cancelSubscriptionButtonText.innerText = 'Failed!';

        setTimeout(() => {
            cancelSubscriptionButton.style['background-image'] = null;
            cancelSubscriptionButtonText.innerText = text;
        }, 1000);
      }
    });
}

const restartSubscriptionButton = document.getElementById('restart-subscription-btn');
const restartSubscriptionButtonText = document.getElementsByClassName('restart-subscription-btn-text')[0];
restartSubscriptionButton.onclick = async () => {
    const text = restartSubscriptionButtonText.innerText;
    restartSubscriptionButtonText.innerText = 'Restarting...';

    const authToken = await Auth.getAuthToken();

    const response = await fetch(`https://linenumbers.app/api/v1/restartSubscription?authToken=${authToken}`, { method : "POST" });

    const success = response.ok;
    if (success) {
        // Successfully restarted
        manageCanceledSubscriptionSection.style.display = 'none';
        manageActiveSubscriptionSection.style.display = null;
        restartSubscriptionButtonText.innerText = text;
    } else {
        // Failed to restart...
        restartSubscriptionButton.style['background-image'] = '-webkit-linear-gradient(left, #FA6E6E, #F06B6C)';
        restartSubscriptionButtonText.innerText = 'Failed!';

        setTimeout(() => {
            restartSubscriptionButton.style['background-image'] = null;
            restartSubscriptionButtonText.innerText = text;
        }, 1000);
    }
}