const BACKEND_API = "http://127.0.0.1:5000/predict";

document.addEventListener("DOMContentLoaded", async () => {
    const urlDisplay = document.getElementById("current-url");
    const loadingState = document.getElementById("loading-state");
    const safeState = document.getElementById("safe-state");
    const phishState = document.getElementById("phish-state");
    const errorState = document.getElementById("error-state");
    const warningActions = document.getElementById("warning-actions");
    const btnShowWarning = document.getElementById("btn-show-warning");
    
    let currentTabId = null;

    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) throw new Error("Could not detect URL");
        
        currentTabId = tab.id;
        const currentUrl = tab.url;
        urlDisplay.textContent = currentUrl;
        
        // Don't scan internal chrome pages
        if (currentUrl.startsWith("chrome://") || currentUrl.startsWith("edge://") || currentUrl.startsWith("about:")) {
            loadingState.classList.add("hidden");
            document.getElementById("error-text").textContent = "Internal browser pages are safe.";
            errorState.classList.remove("hidden");
            return;
        }

        // Call Backend API
        const response = await fetch(BACKEND_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: currentUrl, user: "extension_user" })
        });
        
        if (!response.ok) throw new Error("Server returned an error");
        const data = await response.json();
        
        loadingState.classList.add("hidden");
        
        const isPhish = data.result === "phishing";
        const prob = data.probability || (isPhish ? 0.95 : 0.05);
        const pct = Math.round(prob * 100);
        
        if (isPhish) {
            phishState.classList.remove("hidden");
            document.getElementById("phish-confidence").textContent = `${pct}%`;
        } else {
            safeState.classList.remove("hidden");
            document.getElementById("safe-confidence").textContent = `${pct}%`;
        }
        
    } catch (err) {
        console.error(err);
        loadingState.classList.add("hidden");
        errorState.classList.remove("hidden");
        document.getElementById("error-text").textContent = err.message || "Failed to connect to backend API.";
    }

    // Button Listeners
    document.getElementById("btn-continue").addEventListener("click", () => {
        window.close(); // Close popup
    });
    
    document.getElementById("btn-close-tab").addEventListener("click", () => {
        if (currentTabId) {
            chrome.tabs.remove(currentTabId);
        }
        window.close();
    });
    
    btnShowWarning.addEventListener("click", () => {
        btnShowWarning.classList.add("hidden");
        warningActions.classList.remove("hidden");
    });
    
    document.getElementById("btn-ignore").addEventListener("click", () => {
        window.close();
    });
});
