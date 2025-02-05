document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "logs"], data => {
        let domainTimes = data.domainTimes || {};
        let logs = data.logs || [];
        let list = document.getElementById("tabList");
        list.innerHTML = "";

        if (Object.keys(domainTimes).length === 0) {
            list.innerHTML = "<li class='empty'>No data available yet.</li>";
        } else {
            Object.keys(domainTimes).forEach((domain, index) => {
                let timeSpentInSeconds = Math.round(domainTimes[domain] / 1000);
                let formattedTime = formatTime(timeSpentInSeconds);

                let li = document.createElement("li");
                li.classList.add("tab-item", index % 2 === 0 ? "odd" : "even");
                li.innerHTML = `<strong>${domain}</strong><span class="time">${formattedTime}</span>`;
                list.appendChild(li);
            });
        }

        document.getElementById("downloadCsv").addEventListener("click", () => {
            let csvContent = "data:text/csv;charset=utf-8,Website,Time Spent,Switched At\n";
            
            logs.forEach(row => {
                csvContent += row.join(",") + "\n";
            });

            let encodedUri = encodeURI(csvContent);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "tab_activity.csv");
            document.body.appendChild(link);
            link.click();
        });
    });
});

function formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    let minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    let hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}
