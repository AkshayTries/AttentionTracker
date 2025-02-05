let domainTimes = {};
let activeTab = null;
let startTime = null;
let logs = [];  // Stores log entries for Excel

// Load stored data when extension starts
chrome.storage.local.get(["domainTimes", "logs"], data => {
    domainTimes = data.domainTimes || {};
    logs = data.logs || [];
});

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
                let timestamp = new Date().toLocaleString(); // Get human-readable timestamp
                logs.push([domain, formatTime(timeSpent), timestamp]);

                // Save logs and updated time
                chrome.storage.local.set({ domainTimes, logs });
            }
        });
    }

    activeTab = activeInfo.tabId;
    startTime = Date.now();
});

// Convert time to minutes/hours
function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} sec`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    let hours = Math.floor(minutes / 60);
    return `${hours} hr ${minutes % 60} min`;
}

// Save data when Chrome is closing
chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.set({ domainTimes, logs });
});

// Save periodically
setInterval(() => {
    chrome.storage.local.set({ domainTimes, logs });
}, 5000);
