
import "@plasmohq/messaging/background";
import { startHub } from "@plasmohq/messaging/pub-sub";

  // Handle extension icon click to open sidepanel
chrome.action.onClicked.addListener(async (tab) => {
    
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
});
  
  chrome.runtime.onInstalled.addListener(async () => {
    await chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true
    });
    
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true
    });
  });




startHub()

export { };

