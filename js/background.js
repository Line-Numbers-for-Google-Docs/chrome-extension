// On Exention Open Ask to Reload Line Numbers on all Lines
function refreshGDocs() {
	chrome.tabs.query({
		url: "*://docs.google.com/document/d/*"
	}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.sendMessage(
				tabs[i].id, {
					from: 'popup',
					subject: 'refresh'
				},
				function (response) {
					console.log('GDocs Line Numbering Refreshed');
				});
		}
	});
}

function reloadGDocs() {
	chrome.tabs.query({
		url: "*://docs.google.com/document/d/*"
	}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.reload(tabs[i].id);
		}
	});
}

function onInstall() {
	console.log("Extension Installed");
	chrome.storage.local.set({
		"enabled": true
	}, function () {
		console.log('enabled value set to default value');
		reloadGDocs();
	});
}

function onUpdate() {
	console.log("Extension Updated");
	reloadGDocs();
}

function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version']
if (currVersion != prevVersion) {
	// Check if we just installed this extension.
	if (typeof prevVersion == 'undefined') {
		onInstall();
	} else {
		onUpdate();
	}
	localStorage['version'] = currVersion;
}
