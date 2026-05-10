// ===== MAIN APP ORCHESTRATOR =====
import { authenticate, register, logout, getCurrentUser, resetPassword } from './auth.js';
import { 
    scanUrl, fetchStats, fetchMetrics, fetchCharts, fetchHistory, deleteScan, 
    bookmarkUrl, fetchBookmarks, retrainModel, fetchRules, addBlacklist, addWhitelist, removeBlacklist, removeWhitelist
} from './scanner.js?v=4';
import { createLineChart, createBarChart, createDoughnutChart, createFeatureChart } from './chart.js?v=3';

const BACKEND_API = 'https://phishing-detection-project-1-ysuh.onrender.com';

// ===== DOM REFS =====
const pages = {
    login: document.getElementById('page-login'),
    scanner: document.getElementById('page-scanner'),
    admin: document.getElementById('page-admin')
};

// Auth Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotForm = document.getElementById('forgot-form');
const authTabs = document.getElementById('auth-tabs');
const loginError = document.getElementById('login-error');
const toggleModeBtn = document.getElementById('toggle-mode-btn');
const toggleText = document.getElementById('toggle-text');
const loginSubtitle = document.querySelector('.login-subtitle');

// Scanner Elements
const urlInput = document.getElementById('url-input');
const scanBtn = document.getElementById('scan-btn');
const scanSpinner = document.getElementById('scan-spinner');
const resultCard = document.getElementById('result-card');
const historyBody = document.getElementById('history-body');
const favoritesBody = document.getElementById('favorites-body');

// Admin Elements
const adminTabs = document.getElementById('admin-tabs');
const adminPanels = document.querySelectorAll('.admin-panel');
const userTabs = document.querySelectorAll('.user-tab');
const userPanels = document.querySelectorAll('.user-panel');

// State
let currentUser = getCurrentUser();
let currentAuthRole = 'user';
let isSignUpMode = false;
let currentScanRecord = null;

// ===== INITIALIZATION =====
function init() {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.className = savedTheme;
    
    if (currentUser) {
        if (currentUser.role === 'admin') {
            showPage('admin');
            refreshAdminDashboard();
        } else {
            showPage('scanner');
            document.getElementById('nav-user-label').textContent = currentUser.username.toUpperCase();
            refreshUserDashboard();
        }
    } else {
        showPage('login');
    }
}

function showPage(name) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    pages[name].classList.add('active');
    
    // Toggle Chatbot FAB visibility
    const fab = document.getElementById('chatbot-fab');
    if (fab) {
        if (name === 'scanner') {
            fab.classList.remove('hidden');
        } else {
            fab.classList.add('hidden');
            document.getElementById('chatbot-window')?.classList.add('hidden');
        }
    }
}

// ===== AUTH UI =====
authTabs?.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        authTabs.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAuthRole = tab.dataset.role;
        loginError.classList.add('hidden');
        
        const label = document.getElementById('login-id-label');
        if (currentAuthRole === 'admin') {
            label.textContent = "Admin ID";
            loginSubtitle.textContent = "Sign in to Admin Dashboard";
        } else {
            label.textContent = "Username";
            loginSubtitle.textContent = "Sign in to your account";
        }
    });
});

toggleModeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    loginError.classList.add('hidden');
    
    if (isSignUpMode) {
        loginForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        authTabs.classList.add('hidden');
        loginSubtitle.textContent = "Create New Account";
        toggleText.textContent = "Already have an account?";
        toggleModeBtn.textContent = "Sign In";
    } else {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        authTabs.classList.remove('hidden');
        loginSubtitle.textContent = currentAuthRole === 'admin' ? "Sign in to Admin Dashboard" : "Sign in to your account";
        toggleText.textContent = "Don't have an account?";
        toggleModeBtn.textContent = "Sign Up";
    }
});

document.getElementById('forgot-pass-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    forgotForm.classList.remove('hidden');
    authTabs.classList.add('hidden');
    loginSubtitle.textContent = "Reset Password";
    toggleText.textContent = "Remembered?";
    toggleModeBtn.textContent = "Sign In";
    isSignUpMode = false;
});

// SUBMITS
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    try {
        const user = await authenticate(u, p);
        if (!user) throw new Error("Invalid credentials");
        if (currentAuthRole === 'admin' && user.role !== 'admin') throw new Error("Admin access required");
        
        currentUser = user;
        if (user.role === 'admin') {
            showPage('admin');
            refreshAdminDashboard();
        } else {
            showPage('scanner');
            document.getElementById('nav-user-label').textContent = user.username.toUpperCase();
            refreshUserDashboard();
        }
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
    }
});

signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const u = document.getElementById('signup-username').value.trim();
    const em = document.getElementById('signup-email').value.trim();
    const p = document.getElementById('signup-password').value;
    
    // PASSWORD VALIDATION
    if (p.length < 6) {
        loginError.textContent = "Password must be 6+ chars";
        loginError.classList.remove('hidden');
        return;
    }
    if (!/[A-Za-z]/.test(p) || !/\d/.test(p) || !/[!@#$%^&*()]/.test(p)) {
        loginError.textContent = "Password must contain alpha, number, and special char.";
        loginError.classList.remove('hidden');
        return;
    }

    try {
        const res = await register(u, p, em);
        if (res.success) {
            loginError.textContent = "Success! Please login.";
            loginError.classList.remove('hidden');
            loginError.style.color = "var(--color-safe)";
            loginError.style.background = "var(--color-safe-bg)";
            loginError.style.borderColor = "var(--color-safe)";
            setTimeout(() => {
                loginError.style.color = "";
                loginError.style.background = "";
                loginError.style.borderColor = "";
                toggleModeBtn.click();
            }, 2000);
        } else throw new Error(res.message);
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
    }
});

forgotForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('forgot-username').value.trim();
    const p = document.getElementById('forgot-password').value;
    try {
        await resetPassword(u, p);
        alert("Password updated! Please login.");
        toggleModeBtn.click();
    } catch (err) { alert(err.message); }
});

// LOGOUT
[document.getElementById('logout-btn-scanner'), document.getElementById('logout-btn-admin')].forEach(b => {
    b?.addEventListener('click', () => {
        logout();
        currentUser = null;
        window.location.href = 'index.html';
    });
});

// ===== SCANNER LOGIC =====
scanBtn?.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    
    scanBtn.disabled = true;
    scanSpinner.classList.remove('hidden');
    resultCard.classList.add('hidden');
    
    try {
        const res = await scanUrl(url, currentUser.username);
        currentScanRecord = res;
        displayResult(res);
        refreshUserDashboard();
    } catch (err) { alert(err.message); }
    finally { scanBtn.disabled = false; scanSpinner.classList.add('hidden'); }
});

// ===== ADMIN SCAN LOGIC =====
document.getElementById('admin-scan-btn')?.addEventListener('click', async () => {
    const url = document.getElementById('admin-url-input').value.trim();
    if (!url) return;
    
    const adminScanBtn = document.getElementById('admin-scan-btn');
    const adminScanSpinner = document.getElementById('admin-scan-spinner');
    const adminResultCard = document.getElementById('admin-result-card');
    
    adminScanBtn.disabled = true;
    adminScanSpinner.classList.remove('hidden');
    adminResultCard.classList.add('hidden');
    
    try {
        const res = await scanUrl(url, 'admin');
        displayAdminResult(res);
        refreshAdminDashboard();
    } catch (err) { alert(err.message); }
    finally { adminScanBtn.disabled = false; adminScanSpinner.classList.add('hidden'); }
});

function displayAdminResult(res) {
    const adminResultCard = document.getElementById('admin-result-card');
    adminResultCard.classList.remove('hidden');
    const isPhish = res.result === 'phishing';
    const prob = res.probability || (isPhish ? 0.92 : 0.08);
    const pct = Math.round(prob * 100);
    const risk = getRiskLevel(pct);

    document.getElementById('admin-result-title').textContent = isPhish ? '🚨 Phishing Detected!' : '✅ URL Appears Safe';
    document.getElementById('admin-result-url').textContent = res.url;
    document.getElementById('admin-result-reason').textContent = res.reason || (isPhish ? "Suspicious patterns detected." : "No known threats found.");
    document.getElementById('admin-risk-badge').textContent = `${risk.label} Risk`;
    document.getElementById('admin-risk-badge').className = `risk-badge ${risk.class}`;
    document.getElementById('admin-confidence-text').textContent = `Confidence: ${pct}%`;

    document.getElementById('admin-prob-bar').style.width = pct + '%';
    document.getElementById('admin-prob-text').textContent = `${pct}%`;

    const visitBtn = document.getElementById('admin-visit-site-btn');
    if (visitBtn) {
        visitBtn.style.display = 'block';
        let targetUrl = res.url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }
        visitBtn.dataset.url = targetUrl;
        if (isPhish) {
            visitBtn.textContent = 'Visit Unsafe Site';
            visitBtn.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
            visitBtn.dataset.phish = "true";
        } else {
            visitBtn.textContent = 'Visit Site';
            visitBtn.style.background = 'linear-gradient(90deg, #6366f1, #a855f7)';
            visitBtn.dataset.phish = "false";
        }
    }
}

function displayResult(res) {
    resultCard.classList.remove('hidden');
    const isPhish = res.result === 'phishing';
    const prob = res.probability || (isPhish ? 0.92 : 0.08);
    const pct = Math.round(prob * 100);
    const risk = getRiskLevel(pct);

    document.getElementById('result-title').textContent = isPhish ? '🚨 Phishing Detected!' : '✅ URL Appears Safe';
    document.getElementById('result-url').textContent = res.url;
    document.getElementById('result-reason').textContent = res.reason || (isPhish ? "Suspicious patterns detected." : "No known threats found.");
    document.getElementById('risk-badge').textContent = `${risk.label} Risk`;
    document.getElementById('risk-badge').className = `risk-badge ${risk.class}`;
    document.getElementById('confidence-text').textContent = `Confidence: ${pct}%`;

    document.getElementById('prob-bar').style.width = pct + '%';
    document.getElementById('prob-text').textContent = `${pct}%`;

    const explainList = document.getElementById('explain-list');
    explainList.innerHTML = buildExplainReasons(res).map(reason => `<li>${reason}</li>`).join('');

    // Breakdown
    const ana = res.analysis || {};
    document.getElementById('breakdown-domain').textContent = ana.domain || '-';
    document.getElementById('breakdown-length').textContent = ana.length || '-';
    document.getElementById('breakdown-https').textContent = ana.https ? 'Yes' : 'No';

    const visitBtn = document.getElementById('visit-site-btn');
    if (visitBtn) {
        visitBtn.style.display = 'block';
        let targetUrl = res.url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }
        visitBtn.dataset.url = targetUrl;
        if (isPhish) {
            visitBtn.textContent = 'Visit Unsafe Site';
            visitBtn.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
            visitBtn.dataset.phish = "true";
        } else {
            visitBtn.textContent = 'Visit Site';
            visitBtn.style.background = 'linear-gradient(90deg, #6366f1, #a855f7)';
            visitBtn.dataset.phish = "false";
        }
    }
}

function getRiskLevel(confidence) {
    if (confidence >= 85) return { label: 'High', class: 'risk-high' };
    if (confidence >= 65) return { label: 'Medium', class: 'risk-medium' };
    return { label: 'Low', class: 'risk-low' };
}

function buildExplainReasons(result) {
    const text = (result.reason || '').toLowerCase();
    if (text.includes('admin blacklist')) return ['Matched from Admin Blacklist - Priority Override'];
    if (text.includes('admin whitelist')) return ['Matched from Admin Whitelist - Priority Override'];
    
    const reasons = [];
    const analysis = result.analysis || {};
    const prob = result.probability || 0;

    if (/typo|spoof/.test(text)) reasons.push('Domain spoofing detected');
    if (/login|verify|secure|update|account|banking/.test(result.url.toLowerCase())) reasons.push('Suspicious keyword found');
    if ((analysis.domain || '').includes('.') && (analysis.domain || '').split('.').length > 2) reasons.push('Suspicious subdomain structure');
    if (analysis.is_ip) reasons.push('IP address used instead of domain');
    if (!analysis.https) reasons.push('No HTTPS present');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(result.url) && (result.url.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length > 3) reasons.push('Too many special characters');
    if (reasons.length === 0) reasons.push('Model prediction based on URL heuristics and learned patterns');
    return reasons;
}

document.getElementById('bookmark-btn')?.addEventListener('click', async () => {
    if (!currentScanRecord) return;
    try {
        await bookmarkUrl(currentUser.username, currentScanRecord);
        refreshUserDashboard();
        alert("URL Bookmarked!");
    } catch (err) { console.error(err); }
});

function handleVisitSiteClick(e) {
    const url = e.target.dataset.url;
    const isPhish = e.target.dataset.phish === "true";
    if (isPhish) {
        document.getElementById('visit-warning-modal').classList.remove('hidden');
        document.getElementById('btn-continue-visit').dataset.url = url;
    } else {
        window.open(url, "_blank");
    }
}

document.getElementById('visit-site-btn')?.addEventListener('click', handleVisitSiteClick);
document.getElementById('admin-visit-site-btn')?.addEventListener('click', handleVisitSiteClick);

document.getElementById('btn-cancel-visit')?.addEventListener('click', () => {
    document.getElementById('visit-warning-modal').classList.add('hidden');
});

document.getElementById('btn-continue-visit')?.addEventListener('click', (e) => {
    const url = e.target.dataset.url;
    document.getElementById('visit-warning-modal').classList.add('hidden');
    window.open(url, "_blank");
});

async function fetchUserStats(username) {
    const response = await fetch(`${BACKEND_API}/user/stats?user=${encodeURIComponent(username)}`);
    return await response.json();
}

async function fetchUserMetrics(username) {
    const response = await fetch(`${BACKEND_API}/user/metrics?user=${encodeURIComponent(username)}`);
    return await response.json();
}

async function fetchUserCharts(username) {
    const response = await fetch(`${BACKEND_API}/user/charts?user=${encodeURIComponent(username)}`);
    return await response.json();
}

async function fetchUserHistory(username) {
    const response = await fetch(`${BACKEND_API}/user/history?user=${encodeURIComponent(username)}`);
    return await response.json();
}

async function refreshUserDashboard() {
    try {
        const history = await fetchUserHistory(currentUser.username);
        const userHistory = history.filter(h => h.username === currentUser.username);
        renderHistory(userHistory);
        
        const bookmarks = await fetchBookmarks(currentUser.username);
        renderBookmarks(bookmarks);
        refreshUserAnalytics();
    } catch (err) { console.error(err); }
}

async function refreshUserAnalytics() {
    try {
        if (!currentUser) return;
        const username = currentUser.username;
        const [stats, metrics, charts, history] = await Promise.all([
            fetchUserStats(username),
            fetchUserMetrics(username),
            fetchUserCharts(username),
            fetchUserHistory(username)
        ]);

        setText('profile-total', stats.total_scans);
        setText('profile-phishing', stats.phishing_count);
        setText('profile-legit', stats.legitimate_count);
        setText('profile-success-rate', `${stats.detection_rate}%`);
        setText('profile-summary-text', `You have scanned ${stats.total_scans} URLs, detected ${stats.phishing_count} phishing threats, and maintain a ${stats.detection_rate}% detection success rate.`);

        setText('user-perf-accuracy', `${metrics.accuracy}%`);
        setText('user-perf-precision', `${metrics.precision}%`);
        setText('user-perf-recall', `${metrics.recall}%`);
        setText('user-perf-f1', `${metrics.f1_score}%`);

        setText('user-confusion-tp', metrics.confusion_matrix.true_positives);
        setText('user-confusion-fp', metrics.confusion_matrix.false_positives);
        setText('user-confusion-tn', metrics.confusion_matrix.true_negatives);
        setText('user-confusion-fn', metrics.confusion_matrix.false_negatives);

        setText('risk-high-count', metrics.risk_levels.high);
        setText('risk-medium-count', metrics.risk_levels.medium);
        setText('risk-low-count', metrics.risk_levels.low);

        const explainSummary = [];
        if (charts.categories.domain_spoofing) explainSummary.push('Domain spoofing detected');
        if (charts.categories.suspicious_keyword) explainSummary.push('Suspicious keyword found');
        if (charts.categories.no_https) explainSummary.push('Missing HTTPS detected');
        if (charts.categories.suspicious_subdomain) explainSummary.push('Suspicious subdomain patterns');
        if (!explainSummary.length) explainSummary.push('Model inference based on URL curves and behavior');
        document.getElementById('user-explain-summary').innerHTML = explainSummary.map(item => `<li>${item}</li>`).join('');

        createFeatureChart(
            document.getElementById('user-feature-chart'),
            charts.feature_importance.map(i => i.label),
            charts.feature_importance.map(i => i.value * 100)
        );

        createDoughnutChart(
            document.getElementById('user-distribution-chart'),
            ['Legitimate', 'Phishing'],
            [charts.distribution.legitimate, charts.distribution.phishing]
        );

        createDoughnutChart(
            document.getElementById('user-risk-chart'),
            ['Low', 'Medium', 'High'],
            [metrics.risk_levels.low, metrics.risk_levels.medium, metrics.risk_levels.high]
        );

        createLineChart(
            document.getElementById('user-metric-trend-chart'),
            charts.dates,
            charts.accuracy_series
        );
    } catch (err) {
        console.error('User analytics refresh error:', err);
    }
}

function renderHistory(data) {
    const section = document.getElementById('history-section');
    if (data.length > 0) section.classList.remove('hidden');
    else section.classList.add('hidden');

    historyBody.innerHTML = data.map(h => {
        const confidence = Math.round((h.probability || (h.result === 'phishing' ? 92 : 10)) * 100) / 100;
        const risk = getRiskLevel(confidence);
        return `
        <tr>
            <td class="url-cell">${h.url}</td>
            <td><span class="badge ${h.result === 'phishing' ? 'badge-danger' : 'badge-safe'}">${h.result.toUpperCase()}</span></td>
            <td><span class="risk-badge ${risk.class}">${risk.label}</span></td>
            <td>${confidence}%</td>
            <td>${h.reason || '-'}</td>
            <td>${formatTime(h.timestamp)}</td>
        </tr>
    `;
    }).join('');
}

function renderBookmarks(data) {
    const section = document.getElementById('favorites-section');
    if (data.length > 0) section.classList.remove('hidden');
    else section.classList.add('hidden');

    favoritesBody.innerHTML = data.map(b => `
        <tr>
            <td class="url-cell">${b.url}</td>
            <td><span class="badge ${b.result === 'phishing' ? 'badge-danger' : 'badge-safe'}">${b.result.toUpperCase()}</span></td>
            <td>${b.reason || '-'}</td>
        </tr>
    `).join('');
}

// ===== ADMIN LOGIC =====
adminTabs?.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        adminTabs.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.dataset.panel;
        adminPanels.forEach(p => {
            p.classList.remove('active');
            p.classList.add('hidden');
            if (p.id === target) {
                p.classList.add('active');
                p.classList.remove('hidden');
                if (target === 'panel-performance' || target === 'panel-confusion' || target === 'panel-charts' || target === 'panel-features') {
                    refreshAdminAnalytics();
                }
                if (target === 'panel-rules') {
                    refreshRulesDashboard();
                }
            }
        });
    });
});

userTabs?.forEach(tab => {
    tab.addEventListener('click', () => {
        userTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.panel;
        userPanels.forEach(p => {
            p.classList.remove('active');
            p.classList.add('hidden');
            if (p.id === target) {
                p.classList.add('active');
                p.classList.remove('hidden');
            }
        });

        if (target === 'panel-performance' || target === 'panel-charts' || target === 'panel-profile') {
            refreshUserAnalytics();
        } else if (target === 'panel-scan') {
            refreshUserDashboard();
        }
    });
});

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

async function refreshAdminDashboard() {
    try {
        const [stats, metrics, charts] = await Promise.all([fetchStats(), fetchMetrics(), fetchCharts()]);
        console.log('refreshAdminDashboard', { stats, metrics, charts });

            setText('dashboard-total', metrics.total_urls);
            setText('dashboard-threats', metrics.phishing);
            setText('dashboard-safe', metrics.legitimate);
            setText('dashboard-rate', `${metrics.accuracy}%`);
            setText('stat-active-users', stats.total_users);
            setText('stat-confidence', `${stats.avg_confidence}%`);
            setText('perf-accuracy', `${metrics.accuracy}%`);
            setText('perf-precision', `${metrics.precision}%`);
            setText('perf-recall', `${metrics.recall}%`);
            setText('perf-f1', `${metrics.f1_score}%`);

            setText('confusion-true-positive', metrics.confusion_matrix.true_positives);
            setText('confusion-false-positive', metrics.confusion_matrix.false_positives);
            setText('confusion-true-negative', metrics.confusion_matrix.true_negatives);
            setText('confusion-false-negative', metrics.confusion_matrix.false_negatives);

            createFeatureChart(
                document.getElementById('feature-chart'),
                charts.feature_importance.map(i => i.label),
                charts.feature_importance.map(i => i.value * 100)
            );

            createLineChart(document.getElementById('line-chart'), charts.timeline.labels, charts.timeline.values);

            createBarChart(
                document.getElementById('bar-chart'),
                [
                    'Domain Spoofing',
                    'Shortener',
                    'Suspicious Keyword',
                    'No HTTPS',
                    'Suspicious Subdomain',
                    'Other'
                ],
                [
                    charts.categories.domain_spoofing,
                    charts.categories.shortener,
                    charts.categories.suspicious_keyword,
                    charts.categories.no_https,
                    charts.categories.suspicious_subdomain,
                    charts.categories.other
                ]
            );

            createDoughnutChart(
                document.getElementById('doughnut-chart'),
                ['Safe', 'Low Confidence', 'Medium Confidence', 'High Confidence'],
                [
                    charts.prediction_distribution.safe,
                    charts.prediction_distribution.low_confidence,
                    charts.prediction_distribution.medium_confidence,
                    charts.prediction_distribution.high_confidence
                ]
            );

            const history = await fetchHistory();
            renderAdminHistory(history);
            renderAdminPhishing(history.filter(h => h.result === 'phishing'));
            renderAdminScanHistory(history.slice(0, 10));
        } catch (err) {
            console.error('Admin dashboard refresh error:', err);
        }
}

async function refreshAdminAnalytics() {
    try {
        const [stats, metrics, charts] = await Promise.all([fetchStats(), fetchMetrics(), fetchCharts()]);
        
        // Performance Panel
        setText('admin-perf-accuracy', `${metrics.accuracy}%`);
        setText('admin-perf-precision', `${metrics.precision}%`);
        setText('admin-perf-recall', `${metrics.recall}%`);
        setText('admin-perf-f1', `${metrics.f1_score}%`);
        setText('admin-avg-conf', `${stats.avg_confidence}%`);
        setText('admin-safe-urls', metrics.legitimate);
        setText('admin-phish-urls', metrics.phishing);

        // Confusion Matrix Panel
        setText('conf-tp', metrics.confusion_matrix.true_positives);
        setText('conf-fp', metrics.confusion_matrix.false_positives);
        setText('conf-tn', metrics.confusion_matrix.true_negatives);
        setText('conf-fn', metrics.confusion_matrix.false_negatives);

        const tp = metrics.confusion_matrix.true_positives;
        const fp = metrics.confusion_matrix.false_positives;
        const tn = metrics.confusion_matrix.true_negatives;
        const fn = metrics.confusion_matrix.false_negatives;

        const sensitivity = tp / (tp + fn) * 100;
        const specificity = tn / (tn + fp) * 100;
        const fpr = fp / (fp + tn) * 100;
        const fnr = fn / (fn + tp) * 100;

        setText('admin-sensitivity', `${sensitivity.toFixed(2)}%`);
        setText('admin-specificity', `${specificity.toFixed(2)}%`);
        setText('admin-fpr', `${fpr.toFixed(2)}%`);
        setText('admin-fnr', `${fnr.toFixed(2)}%`);

        // Charts Panel
        createBarChart(
            document.getElementById('admin-metrics-chart'),
            ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
            [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score]
        );

        createDoughnutChart(
            document.getElementById('admin-dist-chart'),
            ['Safe', 'Low Conf', 'Medium Conf', 'High Conf'],
            [
                charts.prediction_distribution.safe,
                charts.prediction_distribution.low_confidence,
                charts.prediction_distribution.medium_confidence,
                charts.prediction_distribution.high_confidence
            ]
        );

        createBarChart(
            document.getElementById('admin-threat-chart'),
            ['Domain Spoofing', 'Shortener', 'Suspicious Keyword', 'No HTTPS', 'Suspicious Subdomain', 'Other'],
            [
                charts.categories.domain_spoofing,
                charts.categories.shortener,
                charts.categories.suspicious_keyword,
                charts.categories.no_https,
                charts.categories.suspicious_subdomain,
                charts.categories.other
            ]
        );

        createLineChart(
            document.getElementById('admin-timeline-chart'),
            charts.timeline.labels,
            charts.timeline.values
        );

        createLineChart(
            document.getElementById('admin-rate-chart'),
            charts.dates || [],
            charts.accuracy_series || []
        );

    } catch (err) {
        console.error('Admin analytics refresh error:', err);
    }
}

function renderAdminScanHistory(data) {
    const section = document.getElementById('admin-scan-history-section');
    const body = document.getElementById('admin-scan-history-body');
    
    if (data.length > 0) section.classList.remove('hidden');
    else section.classList.add('hidden');

    body.innerHTML = data.map(h => {
        const confidence = Math.round((h.probability || (h.result === 'phishing' ? 92 : 10)) * 100) / 100;
        const risk = getRiskLevel(confidence);
        return `
        <tr>
            <td class="url-cell">${h.url}</td>
            <td><span class="badge ${h.result === 'phishing' ? 'badge-danger' : 'badge-safe'}">${h.result.toUpperCase()}</span></td>
            <td><span class="risk-badge ${risk.class}">${risk.label}</span></td>
            <td>${confidence}%</td>
            <td>${h.username || 'system'}</td>
            <td>${formatTime(h.timestamp)}</td>
        </tr>
    `;
    }).join('');
}

function renderAdminHistory(data) {
    document.getElementById('admin-history-body').innerHTML = data.map(h => {
        const confidence = Math.round((h.probability || (h.result === 'phishing' ? 92 : 10)) * 100) / 100;
        const risk = getRiskLevel(confidence);
        return `
        <tr>
            <td class="url-cell">${h.url}</td>
            <td><span class="badge ${h.result === 'phishing' ? 'badge-danger' : 'badge-safe'}">${h.result.toUpperCase()}</span></td>
            <td>${h.username}</td>
            <td>${formatTime(h.timestamp)}</td>
            <td><span class="risk-badge ${risk.class}">${risk.label}</span></td>
            <td>${confidence}%</td>
            <td><button class="btn-ghost" onclick="window.deleteRecord('${h.id}')">Delete</button></td>
        </tr>
    `;
    }).join('');
}

window.deleteRecord = async (id) => {
    if (!confirm("Delete this record?")) return;
    await deleteScan(id);
    refreshAdminDashboard();
};

function renderAdminPhishing(data) {
    document.getElementById('admin-phishing-body').innerHTML = data.map(h => `
        <tr>
            <td class="url-cell">${h.url}</td>
            <td>${h.reason || 'Suspicious'}</td>
            <td>${Math.round((h.probability || 0.9) * 100)}%</td>
            <td>${formatTime(h.timestamp)}</td>
        </tr>
    `).join('');
}

function formatTime(ts) {
    if (!ts) return '-';
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// THEME
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-mode');
    document.body.className = isLight ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', document.body.className);
});

// SEARCH FILTER LOGIC
document.getElementById('user-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = historyBody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

document.getElementById('admin-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.getElementById('admin-history-body').querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});

async function refreshRulesDashboard() {
    try {
        const rules = await fetchRules();
        renderRules(rules.blacklist || [], 'body-blacklist');
        renderRules(rules.whitelist || [], 'body-whitelist');
    } catch (err) {
        console.error('Error fetching rules:', err);
    }
}

function renderRules(data, targetId) {
    const tbody = document.getElementById(targetId);
    if (!tbody) return;
    tbody.innerHTML = data.map(r => `
        <tr>
            <td class="url-cell">${r.url}</td>
            <td>${formatTime(r.timestamp)}</td>
            <td><button class="btn-ghost" onclick="window.deleteRule('${r.rule_type}', '${r.id}')">Remove</button></td>
        </tr>
    `).join('');
}

window.deleteRule = async (type, id) => {
    if (!confirm(`Remove this URL from ${type}?`)) return;
    try {
        if (type === 'blacklist') await removeBlacklist(id);
        else await removeWhitelist(id);
        refreshRulesDashboard();
    } catch (err) {
        alert(err.message);
    }
};

document.getElementById('form-blacklist')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('input-blacklist').value.trim();
    if (!url) return;
    try {
        await addBlacklist(url, currentUser?.username || 'admin');
        document.getElementById('input-blacklist').value = '';
        refreshRulesDashboard();
        alert('Added to blacklist');
    } catch (err) {
        alert(err.message);
    }
});

document.getElementById('form-whitelist')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('input-whitelist').value.trim();
    if (!url) return;
    try {
        await addWhitelist(url, currentUser?.username || 'admin');
        document.getElementById('input-whitelist').value = '';
        refreshRulesDashboard();
        alert('Added to whitelist');
    } catch (err) {
        alert(err.message);
    }
});

document.getElementById('search-blacklist')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.getElementById('body-blacklist').querySelectorAll('tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});

document.getElementById('search-whitelist')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.getElementById('body-whitelist').querySelectorAll('tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});

// ===== CHATBOT LOGIC =====
const chatbotFab = document.getElementById('chatbot-fab');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');

chatbotFab?.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
    if (!chatbotWindow.classList.contains('hidden')) {
        chatbotInput.focus();
        scrollToBottom();
    }
});

chatbotClose?.addEventListener('click', () => {
    chatbotWindow.classList.add('hidden');
});

function scrollToBottom() {
    if (chatbotMessages) {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

function addChatMessage(text, isUser = false) {
    if (!chatbotMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content';
    contentDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'msg-time';
    const now = new Date();
    timeDiv.textContent = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
    
    msgDiv.appendChild(contentDiv);
    msgDiv.appendChild(timeDiv);
    chatbotMessages.appendChild(msgDiv);
    scrollToBottom();
}

function addTypingIndicator() {
    if (!chatbotMessages) return null;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot-msg typing-indicator-msg';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content typing-dots';
    contentDiv.innerHTML = '<span></span><span></span><span></span>';
    
    msgDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
}

async function sendChatMessage(text) {
    if (!text || !text.trim()) return;
    
    addChatMessage(text, true);
    if (chatbotInput) chatbotInput.value = '';
    
    const indicator = addTypingIndicator();
    
    try {
        const response = await fetch(`${BACKEND_API}/chatbot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        
        if (indicator) indicator.remove();
        addChatMessage(data.reply, false);
    } catch (err) {
        if (indicator) indicator.remove();
        addChatMessage("Sorry, I'm having trouble connecting to the server.", false);
    }
}

chatbotSend?.addEventListener('click', () => {
    sendChatMessage(chatbotInput?.value);
});

chatbotInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage(chatbotInput.value);
    }
});

document.querySelectorAll('.faq-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        sendChatMessage(chip.textContent);
    });
});

window.addEventListener('DOMContentLoaded', init);
