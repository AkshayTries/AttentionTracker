document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "logs"], data => {
        let domainTimes = data.domainTimes || {};
        let logs = data.logs || [];
        let list = document.getElementById("tabList");
        list.innerHTML = "";

        let totalTime = Object.values(domainTimes).reduce((acc, time) => acc + time, 0);

        if (totalTime === 0) {
            list.innerHTML = "<li class='empty'>No data available yet.</li>";
        } else {
            // Sort domains by time spent (descending order)
            let sortedDomains = Object.entries(domainTimes)
                .sort((a, b) => b[1] - a[1]);

            sortedDomains.forEach(([domain, time], index) => {
                let timeSpentInSeconds = Math.round(time / 1000);
                let formattedTime = formatTime(timeSpentInSeconds);
                let percentage = ((time / totalTime) * 100).toFixed(2); // Calculate percentage

                let li = document.createElement("li");
                li.classList.add("tab-item");

                // Set background gradient to reflect percentage
                li.style.background = `linear-gradient(to right, #2196F3 ${percentage}%, #ccc ${percentage}%)`;

                li.innerHTML = `<strong>${domain}</strong><span class="time">${formattedTime} (${percentage}%)</span>`;
                list.appendChild(li);
            });
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

                // Use chrome.downloads.download() for better compatibility
                chrome.downloads.download({
                    url: url,
                    filename: "tab_activity.csv",
                    saveAs: true
                }, () => {
                    URL.revokeObjectURL(url); // Clean up the URL after download
                });
            });
        });
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

