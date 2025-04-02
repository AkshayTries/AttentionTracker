chrome.storage.local.get(["domainTimes", "logs", "hiddenSites", "focusMode", "blockedSites"], data => {
    let domainTimes = data.domainTimes || {};
    let logs = data.logs || [];
    let hiddenSites = data.hiddenSites || {};
    let blockedSites = data.blockedSites || {};
    let list = document.getElementById("tabList");

    list.innerHTML = "";

    let totalTime = Object.values(domainTimes).reduce((acc, time) => acc + time, 0);

    // Check if Focus Mode is enabled
    let focusMode = data.focusMode || false;
    document.getElementById("focusToggle").checked = focusMode;
    toggleDarkMode(focusMode);

    if (totalTime === 0) {
        list.innerHTML = "<li class='empty'>No data available yet.</li>";
    } else {
        let sortedDomains = Object.entries(domainTimes)
            .map(([domain, time]) => [domain.replace(/\.[^.]*$/, ''), time])
            .sort((a, b) => b[1] - a[1]);

        sortedDomains.forEach(([domain, time]) => {
            let percentage = Math.round((time / totalTime) * 100);
            if (hiddenSites[domain]) return;

            if (percentage >= 0.1) {
                let timeSpentInSeconds = Math.round(time / 1000);
                let formattedTime = formatTime(timeSpentInSeconds);
                let isBlocked = blockedSites[domain] || false;

                let li = document.createElement("li");
                li.classList.add("tab-item");
                li.style.background = `linear-gradient(to right, #2196F3 ${percentage}%, #ccc ${percentage}%)`;
                li.innerHTML = `
                    <strong title="${domain}">${domain}</strong>
                    ${!focusMode ? `<span class="time">${formattedTime} (${percentage}%)</span>` : ""}
                    <button class="hide-btn" data-domain="${domain}">Hide</button>
                    ${focusMode ? `<button class="block-btn" data-domain="${domain}" style="background:${isBlocked ? 'red' : 'green'};">
                        ${isBlocked ? 'Unblock' : 'Block'}
                    </button>` : ""}
                `;
                list.appendChild(li);

                li.querySelector(".hide-btn").addEventListener("click", function () {
                    let domain = this.getAttribute("data-domain");
                    hiddenSites[domain] = true;
                    chrome.storage.local.set({ hiddenSites }, () => {
                        li.remove();
                    });
                });

                if (focusMode) {
                    li.querySelector(".block-btn").addEventListener("click", function () {
                        let domain = this.getAttribute("data-domain");
                        if (blockedSites[domain]) {
                            delete blockedSites[domain];
                        } else {
                            blockedSites[domain] = true;
                        }
                        chrome.storage.local.set({ blockedSites }, () => {
                            this.textContent = blockedSites[domain] ? "Unblock" : "Block";
                            this.style.background = blockedSites[domain] ? "red" : "green";
                        });
                    });
                }
            }
        });

        if (list.children.length === 0) {
            list.innerHTML = "<li class='empty'>No sites with more than 0.1% time spent.</li>";
        }
    }
    
    

    // **Handle Focus Mode Toggle**
    document.getElementById("focusToggle").addEventListener("change", function () {
        let isEnabled = this.checked;
        chrome.storage.local.set({ focusMode: isEnabled }, () => {
            window.location.reload(); // Reload to hide/show time spent
        });
        toggleDarkMode(isEnabled);
    });

    // **Reset Hidden Sites**
    document.getElementById("resetHidden").addEventListener("click", () => {
        chrome.storage.local.set({ hiddenSites: {} }, () => {

            const clickSound = new Audio(chrome.runtime.getURL("click.mp3"));
            clickSound.currentTime = 0; // Reset sound to start
            clickSound.play().then(() => {
                setTimeout(() => window.location.reload(), 1000); // Delay reload slightly
            }).catch(error => console.error("Playback error:", error));
            

        });
    });

    // **Download CSV Button**
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

    // **More Stats Button**
    document.getElementById("moreStats").addEventListener("click", () => {
        const clickSound = new Audio(chrome.runtime.getURL("click.mp3"));
        clickSound.currentTime = 0; // Reset sound to start
    
        clickSound.play().then(() => {
            setTimeout(() => {
                chrome.tabs.create({ url: chrome.runtime.getURL("stats.html") }); // Open stats page
                window.close(); // Close popup after opening the new tab
            }, 650); // Short delay to ensure the sound is heard
        }).catch(error => console.error("Playback error:", error));
    });
    
});

// **Toggle Dark Mode**
function toggleDarkMode(isEnabled) {
    if (isEnabled) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

// **Format Time Function**
function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    let hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}

document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadCsv"); // Select the specific button
    const clickSound = new Audio(chrome.runtime.getURL("click.mp3")); // Create audio in JS

    if (downloadButton) {
        downloadButton.addEventListener("click", function () {
            clickSound.currentTime = 0; // Reset sound to start
            clickSound.play().catch(error => console.error("Playback error:", error));
        });
    } else {
        console.error("Button with ID 'downloadCsv' not found.");
    }
});

