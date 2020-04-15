dataLayer.push({
    event: 'backgroundScriptLoaded',
    virtualPath: '/background',
    virtualTitle: 'Background Script'
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.metricsTagData) {
        dataLayer.push(request.metricsTagData);
    }
});