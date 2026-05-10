// PhishGuard Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishGuard Extension installed.");
});

// Optionally listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SUSPICIOUS_CONTENT_DETECTED") {
    console.log("Suspicious content detected on tab:", sender.tab.id);
    // Could badge the extension icon or store the state
    chrome.action.setBadgeText({ text: "!", tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444", tabId: sender.tab.id });
  }
});
