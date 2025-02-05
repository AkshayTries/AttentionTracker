document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("domainTimes", data => {
        let domainTimes = data.domainTimes || {};  
        let list = document.getElementById("tabList");
        list.innerHTML = "";  

        if (Object.keys(domainTimes).length === 0) {
            list.innerHTML = "<li class='empty'>No data available yet.</li>";
        } else {
            Object.keys(domainTimes).forEach((domain, index) => {
                let timeSpentInSeconds = Math.round(domainTimes[domain] / 1000);  

                // Convert time to readable format
                let formattedTime = formatTime(timeSpentInSeconds);

                let li = document.createElement("li");
                li.classList.add("tab-item");

                // Alternate background color for styling
                li.classList.add(index % 2 === 0 ? "odd" : "even");

                li.innerHTML = `<strong>${domain}</strong><span class="time">${formattedTime}</span>`;
                list.appendChild(li);
            });
        }
    });
});

// Function to format time
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        let minutes = Math.floor(seconds / 60);
        let sec = seconds % 60;
        return sec === 0 ? `${minutes}m` : `${minutes}m ${sec}s`;
    } else {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
    }
}
