chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              schemes: ["http", "https", "chrome", "chrome-extension"]
            }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});
