chrome.runtime.onMessage.addListener(function (msg, sender) {
  if ((msg.from === 'popup') && (msg.subject === 'refresh')) {
    alert("Refresh");
    chrome.runtime.sendMessage({
      from: 'background',
      subject: 'refresh'
    });
  }
});