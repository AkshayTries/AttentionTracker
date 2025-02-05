let domainTimes = {};  
let activeTab = null;
let startTime = null;

// Load stored data when extension starts
chrome.storage.local.get("domainTimes", data => {
    domainTimes = data.domainTimes || {};
});

// Handle tab switch
chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeTab !== null && startTime !== null) {
        let timeSpent = Date.now() - startTime;
        chrome.tabs.get(activeTab, (tab) => {
            if (tab && tab.url && !tab.url.startsWith("chrome://")) {  // Ignore "New Tab" and Chrome internal pages
                let url = new URL(tab.url);
                let domain = url.hostname.replace(/^www\./, '');

                if (!domainTimes[domain]) domainTimes[domain] = 0;
                domainTimes[domain] += timeSpent;

                // Save updated data immediately
                chrome.storage.local.set({ domainTimes });
            }
        });
    }

    activeTab = activeInfo.tabId;
    startTime = Date.now();
});

// Save data when Chrome is closing
chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.set({ domainTimes });
});

// Also save periodically to avoid data loss
setInterval(() => {
    chrome.storage.local.set({ domainTimes });
}, 5000); // Save every 5 seconds
