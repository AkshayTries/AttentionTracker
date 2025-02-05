document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["domainTimes", "workingTab"], data => {
        let domainTimes = data.domainTimes || {};  
        let workingTab = data.workingTab || null; 
        let list = document.getElementById("tabList");
        list.innerHTML = "";  

        if (Object.keys(domainTimes).length === 0) {
            list.innerHTML = "<li class='empty'>No data available yet.</li>";
        } else {
            Object.keys(domainTimes).forEach((domain, index) => {
                let timeSpentInSeconds = Math.round(domainTimes[domain] / 1000);  

                let li = document.createElement("li");
                li.classList.add("tab-item");

                if (index % 2 === 0) {
                    li.classList.add('odd');
                } else {
                    li.classList.add('even');
                }

                // Create a small button for setting the working tab
                let button = document.createElement("button");
                button.textContent = workingTab === domain ? "✔" : "•";
                button.style.backgroundColor = workingTab === domain ? "#4CAF50" : "#2196F3";
                button.style.color = "#fff";
                button.style.border = "none";
                button.style.padding = "4px 8px";
                button.style.borderRadius = "50%";
                button.style.cursor = "pointer";
                button.style.fontSize = "14px";
                button.style.marginLeft = "10px";

                button.onclick = () => setWorkingTab(domain);

                li.innerHTML = `<strong>${domain}</strong> <span class="time">${timeSpentInSeconds} sec</span>`;
                li.appendChild(button);
                list.appendChild(li);
            });
        }
    });
});

function setWorkingTab(domain) {
    chrome.storage.local.set({ workingTab: domain }, () => {
        location.reload();  
    });
}
