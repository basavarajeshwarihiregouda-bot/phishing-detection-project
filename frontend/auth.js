// ===== AUTH MODULE =====
const API_BASE = '';

let currentUser = null;

export async function authenticate(username, password) {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            currentUser = { username, role: data.role };
            return currentUser;
        }
    } catch (err) {
        console.error("Login error:", err);
    }
    return null;
}

export async function register(username, password, email) {
    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            currentUser = { username, role: data.role };
            return { success: true, user: currentUser };
        } else {
            return { success: false, message: data.message || "Registration failed" };
        }
    } catch (err) {
        console.error("Registration error:", err);
        return { success: false, message: "Network error" };
    }
}

export function logout() {
    currentUser = null;
}

export function getCurrentUser() {
    return currentUser;
}

export async function resetPassword(username, password) {
    const res = await fetch(`${API_BASE}/reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Reset failed");
    }
    return await res.json();
}

