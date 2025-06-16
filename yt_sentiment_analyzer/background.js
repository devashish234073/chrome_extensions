chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Sentiment Analyzer installed');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('youtube.com/watch')) {
    chrome.tabs.sendMessage(tab.id, { action: 'analyzeComments' });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    chrome.storage.local.remove(['sentimentData']);
  }
});

// 🚨 ADD THIS: Handle fetch to Ollama API from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let payload = JSON.stringify(message.payload);
  if (message.action === 'fetchSentiment') {
    fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    })
      .then(async (response) => {
        const text = await response.text();

        try {
          const json = JSON.parse(text);
          return { success: true, data: json };
        } catch (e) {
          return { success: false, error: `prompt ${payload} returned Invalid JSON response:  ${text}` };
        }
      })
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep sendResponse alive for async use
  }
});

