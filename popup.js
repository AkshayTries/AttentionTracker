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
    let remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}
