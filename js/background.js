function reloadGDocs() {
	/**
	 * Reload all open Google Docs tabs. Makes sure extension scripts are injected into already open documents.
	 */
	chrome.tabs.query({
		url: "*://docs.google.com/document/d/*"
	}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.reload(tabs[i].id);
		}
	});
}

// Handle install and update events
chrome.runtime.onInstalled.addListener((details) => {
	const currentVersion = chrome.runtime.getManifest().version
	const previousVersion = details.previousVersion
	const reason = details.reason
 
	console.log(`Previous Version: ${previousVersion }`)
	console.log(`Current Version: ${currentVersion }`)
	
	switch (reason) {
		case 'install':
			console.log('Extension installed!');

			reloadGDocs();

			const welcomePage = `https://line-numbers-for-google-docs.github.io/#/welcome`;

			chrome.tabs.create({url: welcomePage}, function (tab) {
				console.log(`New tab launched with ${welcomePage}`);
			});

			dataLayer.push({
				event: 'installed',
				version: currentVersion,
				virtualPath: '/background',
				virtualTitle: 'Background Script'
			});

			break;
		case 'update':
			console.log('Extension updated!');

			reloadGDocs();

			const versionWelcomePage = `https://line-numbers-for-google-docs.github.io/#/version/${currentVersion}/welcome`;

			chrome.tabs.create({url: versionWelcomePage}, function (tab) {
				console.log(`New tab launched with ${versionWelcomePage}`);
			});

			dataLayer.push({
				event: 'updated',
				version: currentVersion,
				virtualPath: '/background',
				virtualTitle: 'Background Script'
			});

			break;
		case 'chrome_update':
		case 'shared_module_update':
		default:
			console.warn('Unknown install events within the browser')
			break;
	}
});