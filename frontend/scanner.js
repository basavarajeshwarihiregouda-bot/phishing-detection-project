// ===== SCANNER MODULE =====
const BASE_URL = 'http://127.0.0.1:5000';

export async function scanUrl(url, username) {
    const response = await fetch(`${BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user: username })
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
}

export async function fetchStats() {
    const response = await fetch(`${BASE_URL}/admin/stats`);
    return await response.json();
}

export async function fetchMetrics() {
    const response = await fetch(`${BASE_URL}/admin/metrics`);
    return await response.json();
}

export async function fetchCharts() {
    const response = await fetch(`${BASE_URL}/admin/charts`);
    return await response.json();
}

export async function fetchHistory() {
    const response = await fetch(`${BASE_URL}/admin/history`);
    return await response.json();
}

export async function deleteScan(id) {
    const response = await fetch(`${BASE_URL}/admin/delete_scan/${id}`, { method: 'DELETE' });
    return await response.json();
}

export async function bookmarkUrl(username, record) {
    const response = await fetch(`${BASE_URL}/user/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, record })
    });
    return await response.json();
}

export async function fetchBookmarks(username) {
    const response = await fetch(`${BASE_URL}/user/bookmarks/${username}`);
    return await response.json();
}

export async function retrainModel() {
    const response = await fetch(`${BASE_URL}/admin/retrain`, { method: 'POST' });
    return await response.json();
}

export async function fetchRules() {
    const response = await fetch(`${BASE_URL}/admin/rules`);
    return await response.json();
}

export async function addBlacklist(url, username) {
    const response = await fetch(`${BASE_URL}/admin/add-blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user: username })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Server error: ${response.status}`);
    return result;
}

export async function addWhitelist(url, username) {
    const response = await fetch(`${BASE_URL}/admin/add-whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user: username })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Server error: ${response.status}`);
    return result;
}

export async function removeBlacklist(id) {
    const response = await fetch(`${BASE_URL}/admin/remove-blacklist/${id}`, { method: 'DELETE' });
    return await response.json();
}

export async function removeWhitelist(id) {
    const response = await fetch(`${BASE_URL}/admin/remove-whitelist/${id}`, { method: 'DELETE' });
    return await response.json();
}
