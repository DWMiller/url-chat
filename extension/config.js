const CONFIG = {
  SOCKET_URL: 'http://159.203.20.212:3000/'
};

// Chrome extensions can use storage API for dynamic config
chrome.storage.local.get(['serverUrl'], function(result) {
  if (result.serverUrl) {
    CONFIG.SOCKET_URL = result.serverUrl;
  }
});

export default CONFIG; 