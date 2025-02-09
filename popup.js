document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "logs", "hiddenSites"], data => {
        let domainTimes = data.domainTimes || {};
        let logs = data.logs || [];
        let hiddenSites = data.hiddenSites || {}; // Object to track hidden sites
        let list = document.getElementById("tabList");
        list.innerHTML = "";

        let totalTime = Object.values(domainTimes).reduce((acc, time) => acc + time, 0);

        if (totalTime === 0) {
            list.innerHTML = "<li class='empty'>No data available yet.</li>";
        } else {
            let sortedDomains = Object.entries(domainTimes)
                .map(([domain, time]) => [domain.replace(/\.[^.]*$/, ''), time])
                .sort((a, b) => b[1] - a[1]);

                sortedDomains.forEach(([domain, time]) => {
                    let percentage = Math.round((time / totalTime) * 100); // Round to the nearest integer
                
                    // Skip hidden sites
                    if (hiddenSites[domain]) return;
                
                    // Only show sites with more than 0.1% of total time
                    if (percentage >= 0.1) {
                        let timeSpentInSeconds = Math.round(time / 1000);
                        let formattedTime = formatTime(timeSpentInSeconds);
                
                        let li = document.createElement("li");
                        li.classList.add("tab-item");
                        li.style.background = `linear-gradient(to right, #2196F3 ${percentage}%, #ccc ${percentage}%)`;
                        li.innerHTML = `
                            <strong title="${domain}">${domain}</strong>
                            <span class="time">${formattedTime} (${percentage}%)</span>
                            <button class="hide-btn">Hide</button>
                        `;
                        list.appendChild(li);
                
                        // Add event listener to the "Hide" button
                        li.querySelector(".hide-btn").addEventListener("click", () => {
                            hiddenSites[domain] = true; // Mark the site as hidden
                            chrome.storage.local.set({ hiddenSites }, () => {
                                li.remove(); // Remove the site's card from the popup
                            });
                        });
                    }
                });

            // If no site meets the threshold, show empty message
            if (list.children.length === 0) {
                list.innerHTML = "<li class='empty'>No sites with more than 0.1% time spent.</li>";
            }
        }

        document.getElementById("downloadCsv").addEventListener("click", () => {
            chrome.storage.local.get("logs", data => {
                let logs = data.logs || [];
                let csvContent = "Website,Time Spent,Switched At\n";
                logs.forEach(row => {
                    csvContent += row.join(",") + "\n";
                });

                let blob = new Blob([csvContent], { type: "text/csv" });
                let url = URL.createObjectURL(blob);

                chrome.downloads.download({
                    url: url,
                    filename: "tab_activity.csv",
                    saveAs: true
                }, () => {
                    URL.revokeObjectURL(url);
                });
            });
        });

        document.getElementById("moreStats").addEventListener("click", () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("stats.html") });
            window.close();
        });
    });
});
document.getElementById("resetHidden").addEventListener("click", () => {
    chrome.storage.local.set({ hiddenSites: {} }, () => {
        window.location.reload(); // Refresh the popup to show all sites
    });
});
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    let hours = Math.floor(minutes / 60);
    let remainingMinutes = minutes % 60;
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}