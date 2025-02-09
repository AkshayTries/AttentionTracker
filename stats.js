document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "logs"], data => {
        let domainTimes = data.domainTimes || {};
        let logs = data.logs || [];

        let totalWebsites = Object.keys(domainTimes).length;
        let totalTime = Object.values(domainTimes).reduce((acc, time) => acc + time, 0);

        // Calculate Average Time Per Site Before Switching (rounded to 2 decimal places)
        let totalSwitches = logs.length;
        let avgTimePerSite = totalSwitches > 0 ? (totalTime / totalSwitches) : 0;
        avgTimePerSite = (avgTimePerSite / 1000).toFixed(2); // Convert to seconds & round

        // Calculate Average Time Per Day (kept as is)
        let daysTracked = new Set(logs.map(log => log[2].split(",")[0])); // Extract unique days from timestamps
        let avgTimePerDay = daysTracked.size > 0 ? (totalTime / daysTracked.size) : 0;
        avgTimePerDay = avgTimePerDay / 1000; // Convert to seconds without rounding

        // Find Most Visited Site (Based on Number of Switches)
        let visitCounts = {};
        logs.forEach(log => {
            let site = log[0];
            visitCounts[site] = (visitCounts[site] || 0) + 1;
        });

        let mostVisitedSite = Object.entries(visitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

        // Update the HTML
        document.getElementById("totalWebsites").textContent = totalWebsites;
        document.getElementById("totalTime").textContent = formatTime(totalTime / 1000);
        document.getElementById("avgTimePerSite").textContent = formatTime(avgTimePerSite);
        document.getElementById("avgTimePerDay").textContent = formatTime(avgTimePerDay);
        document.getElementById("mostVisitedSite").textContent = mostVisitedSite;
    });
});

function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    let hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}
