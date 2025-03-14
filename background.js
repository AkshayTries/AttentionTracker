let domainTimes = {};
let activeTab = null;
let startTime = null;
let logs = [];
let blockedSites = {};

// Load stored data when extension starts
chrome.storage.local.get(["domainTimes", "logs", "focusMode", "blockedSites"], data => {
    domainTimes = data.domainTimes || {};
    logs = data.logs || [];
    blockedSites = data.blockedSites || {};  // Load blocked sites
});

// Listen for tab updates to check if a blocked site is accessed
chrome.webNavigation.onBeforeNavigate.addListener(details => {
    let url = new URL(details.url);
    let domain = url.hostname.replace(/^www\./, ''); // Normalize domain

    chrome.storage.local.get(["focusMode", "blockedSites"], data => {
        let focusMode = data.focusMode || false;
        let blockedSites = data.blockedSites || {};

        if (focusMode && blockedSites[domain]) {
            // Redirect to blocked.html
            chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL("blocked.html") });
        }
    });
}, { urls: ["<all_urls>"] });

// Handle tab switch
chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeTab !== null && startTime !== null) {
        let timeSpent = Date.now() - startTime;
        chrome.tabs.get(activeTab, (tab) => {
            if (tab && tab.url) {
                let url = new URL(tab.url);
                let domain = url.hostname.replace(/^www\./, '');

                if (!domainTimes[domain]) domainTimes[domain] = 0;
                domainTimes[domain] += timeSpent;

                // Log the switch
                let timestamp = new Date().toLocaleString();
                logs.push([domain, formatTime(timeSpent), timestamp]);

                // Save logs and updated time
                chrome.storage.local.set({ domainTimes, logs });
            }
        });
    }

    activeTab = activeInfo.tabId;
    startTime = Date.now();
});

// Convert time
function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} sec`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    let hours = Math.floor(minutes / 60);
    return `${hours} hr ${minutes % 60} min`;
}

// Save periodically
setInterval(() => {
    chrome.storage.local.set({ domainTimes, logs });
}, 5000);

// Intercept navigation and redirect blocked sites
chrome.webNavigation.onBeforeNavigate.addListener(details => {
    chrome.storage.local.get(["blockedSites", "focusMode"], data => {
        let blockedSites = data.blockedSites || {};
        let focusMode = data.focusMode || false;
        
        if (!focusMode) return; // Only block if Focus Mode is ON

        try {
            let url = new URL(details.url);
            let domain = url.hostname.replace(/^www\./, '');

            if (blockedSites[domain]) {
                // Redirect to blocked.html
                chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL("blocked.html") });
            }
        } catch (e) {
            console.error("Error processing URL: ", e);
        }
    });
}, { urls: ["<all_urls>"] });

