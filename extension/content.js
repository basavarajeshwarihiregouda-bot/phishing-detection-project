const SUSPICIOUS_KEYWORDS = ["login", "verify", "password", "otp", "bank", "urgent"];

function scanPage() {
    const text = document.body.innerText.toLowerCase();
    
    const foundKeywords = SUSPICIOUS_KEYWORDS.filter(word => {
        // Use regex to find exact word matches
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(text);
    });
    
    if (foundKeywords.length > 0) {
        showWarningAlert(foundKeywords);
        
        // Optionally notify background script
        try {
            chrome.runtime.sendMessage({ 
                type: "SUSPICIOUS_CONTENT_DETECTED", 
                keywords: foundKeywords 
            });
        } catch(e) {}
    }
}

function showWarningAlert(keywords) {
    // Check if alert already exists
    if (document.getElementById("phishguard-content-alert")) return;
    
    const overlay = document.createElement("div");
    overlay.id = "phishguard-content-alert";
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: rgba(15, 15, 42, 0.95);
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
        color: #fff;
        font-family: 'Inter', -apple-system, sans-serif;
        z-index: 2147483647;
        padding: 16px;
        backdrop-filter: blur(10px);
        transform: translateX(400px);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px; color:#ef4444; font-weight:bold;">
                <span style="font-size:1.2rem;">⚠️</span>
                PhishGuard Alert
            </div>
            <button id="phishguard-close-btn" style="background:transparent; border:none; color:#9ca3af; cursor:pointer; font-size:1rem;">✕</button>
        </div>
        <p style="font-size:0.85rem; color:#d1d5db; margin:0 0 12px 0; line-height:1.4;">
            This page is asking for sensitive information. We detected the following keywords:
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${keywords.map(k => `<span style="background:rgba(239,68,68,0.2); color:#ef4444; padding:2px 8px; border-radius:12px; font-size:0.75rem; border:1px solid rgba(239,68,68,0.3);">${k}</span>`).join('')}
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Slide in animation
    setTimeout(() => {
        overlay.style.transform = "translateX(0)";
    }, 100);
    
    // Close button logic
    document.getElementById("phishguard-close-btn").addEventListener("click", () => {
        overlay.style.transform = "translateX(400px)";
        setTimeout(() => overlay.remove(), 400);
    });
}

// Run scanner after page loads
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(scanPage, 1500); // Give it a slight delay so dynamic content can load
} else {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(scanPage, 1500);
    });
}
