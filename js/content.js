'use strict';

// Inject CSS for debugging, should probably be moved to manifest.
const style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/linenumbering.css');
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(style, head.lastChild);

// Work around to use es6 modules
(async () => {
    const src = chrome.extension.getURL('js/linenumbering.js');
    const contentScript = await import(src);
    contentScript.main();
})();