// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked');
  try {
    // Save the current tab's URL
    await chrome.storage.local.set({ url: tab.url });
    console.log('URL saved:', tab.url);

    // Get the window dimensions
    const { width: screenWidth, height: screenHeight } = await new Promise(resolve => {
      chrome.windows.getLastFocused(win => {
        resolve({
          width: win.width,
          height: win.height
        });
      });
    });

    // Calculate popup position (right side of screen)
    const popupWidth = 380;
    const popupHeight = 500;
    const left = screenWidth - popupWidth - 20; // 20px padding from right
    const top = 20; // 20px from top

    // Create popup window
    const popup = await chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: popupWidth,
      height: popupHeight,
      left,
      top,
      focused: true
    });
    console.log('Popup created:', popup);
  } catch (error) {
    console.error('Error handling click:', error);
  }
});

// Initialize function
async function initializeExtension() {
  try {
    // Check for stored configuration
    const config = await chrome.storage.local.get(['serverUrl']);
    if (!config.serverUrl) {
      await chrome.storage.local.set({
        serverUrl: 'http://165.227.39.21:3000/'  // Default server URL
      });
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  initializeExtension();
});

// Global error handling
self.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
