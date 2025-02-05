let domainTimes = {};  // Stores time spent on each domain
let activeTab = null;
let startTime = null;

chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeTab !== null && startTime !== null) {
        let timeSpent = Date.now() - startTime;
        chrome.tabs.get(activeTab, (tab) => {
            if (tab) {
                let url = new URL(tab.url);
                let domain = url.hostname.replace(/^www\./, '');  // Remove 'www.' from the domain

                if (!domainTimes[domain]) domainTimes[domain] = 0;
                domainTimes[domain] += timeSpent;
                chrome.storage.local.set({ domainTimes });
            }
        });
    }

    activeTab = activeInfo.tabId;
    startTime = Date.now();
});

chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.set({ domainTimes });
});
