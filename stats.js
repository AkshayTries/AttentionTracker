document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "logs"], data => {
        let domainTimes = data.domainTimes || {};
        let logs = data.logs || [];

        let totalWebsites = Object.keys(domainTimes).length;
        let totalTime = Object.values(domainTimes).reduce((acc, time) => acc + time, 0);

        // Calculate Average Time Per Site Before Switching
        let totalSwitches = logs.length;
        let avgTimePerSite = totalSwitches > 0 ? (totalTime / totalSwitches) : 0;
        avgTimePerSite = (avgTimePerSite / 1000).toFixed(2);

        // Calculate Time Spent Per Day from logs
        let dailyTime = {};
        let today = new Date().toLocaleDateString();
        let timeSpentToday = 0; // Fix: Ensure we capture today’s time correctly

        logs.forEach(log => {
            let day = log[2].split(",")[0]; // Extract date
            let timeSpent = parseInt(log[1]); // Get time spent in ms

            dailyTime[day] = (dailyTime[day] || 0) + timeSpent;

            // Fix: Track today's time correctly
            if (day === today) {
                timeSpentToday += timeSpent;
            }
        });

        let avgTimePerDay = Object.keys(dailyTime).length > 0
            ? (totalTime / Object.keys(dailyTime).length) / 1000
            : 0;

        let mostVisitedSite = "N/A";
        let visitCounts = {};
        logs.forEach(log => {
            let site = log[0];
            visitCounts[site] = (visitCounts[site] || 0) + 1;
        });

        if (Object.keys(visitCounts).length > 0) {
            mostVisitedSite = Object.entries(visitCounts).sort((a, b) => b[1] - a[1])[0][0];
        }

        // Fix: Ensure "Time Spent Today" is correctly calculated
        // document.getElementById("timeSpentToday").textContent = formatTime(timeSpentToday / 1000);
        document.getElementById("totalWebsites").textContent = totalWebsites;
        document.getElementById("totalTime").textContent = formatTime(totalTime / 1000);
        document.getElementById("avgTimePerSite").textContent = formatTime(avgTimePerSite);
        // document.getElementById("avgTimePerDay").textContent = formatTime(avgTimePerDay);
        document.getElementById("mostVisitedSite").textContent = mostVisitedSite;

        // Generate Charts
        if (Object.keys(domainTimes).length > 0) {
            renderPieChart(domainTimes, totalTime);
        } else {
            document.getElementById("pieChart").outerHTML = "<p>No data available</p>";
        }

        if (Object.keys(dailyTime).length > 0) {
            renderBarChart(dailyTime);
        } else {
            document.getElementById("barChart").outerHTML = "<p>No data available</p>";
        }
    });
});



// **Fix: Pie Chart shows formatted time instead of seconds**
function renderPieChart(domainTimes, totalTime) {
    let labels = [];
    let dataValues = [];
    let otherTime = 0;

    Object.entries(domainTimes).forEach(([domain, time]) => {
        let percentage = (time / totalTime) * 100;
        if (percentage >= 2) {
            labels.push(domain);
            dataValues.push(time / 1000);
        } else {
            otherTime += time;
        }
    });

    if (otherTime > 0) {
        labels.push("Others");
        dataValues.push(otherTime / 1000);
    }

    if (labels.length === 0) {
        document.getElementById("pieChart").outerHTML = "<p>No data available</p>";
        return;
    }

    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Spent',
                data: dataValues,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8D6E63']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return formatTime(tooltipItem.raw);
                        }
                    }
                }
            }
        }
    });
}

// **Fix: Bar Chart now displays formatted time**
function renderBarChart(dailyTime) {
    let labels = Object.keys(dailyTime).sort();
    let dataValues = labels.map(date => dailyTime[date] / (1000 * 60 * 60)); // Convert ms to hours

    // 🔹 Remove last date's data (if incorrect)
    if (labels.length > 0) {
        labels.pop();
        dataValues.pop();
    }

    const ctxBar = document.getElementById('barChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Spent Per Day (Hours)',
                data: dataValues,
                backgroundColor: '#36A2EB',
                borderColor: '#2176D2',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + "h"; // Show hours with 2 decimals
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw.toFixed(2) + " hours";
                        }
                    }
                }
            }
        }
    });
}

// **Updated function: Convert seconds to hh:mm:ss**
function formatTime(seconds) {
    seconds = parseFloat(seconds);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    let remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    } else {
        return `${remainingSeconds}s`;
    }
}
