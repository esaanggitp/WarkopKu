/**
 * Role-Based Access Control (RBAC) & Authentication Module
 * Manages accounts for:
 * 1. Admin   (username: admin, password: admin)   - Full access ("bisa apa aja")
 * 2. Kasir   (username: kasir, password: kasir)   - Order control & payment verification only
 * 3. Kitchen (username: kitchen, password: kitchen) - Kitchen display queue only
 * 4. User    (Customer / Pelanggan)                - Self-order only ("hanya bisa pesan")
 */

const WARKOP_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    displayName: 'Administrator (Pemilik Usaha)',
    badge: '👑 Admin'
  },
  kasir: {
    username: 'kasir',
    password: 'kasir',
    role: 'kasir',
    displayName: 'Kasir Warkop (Front-of-House)',
    badge: '💳 Kasir'
  },
  kitchen: {
    username: 'kitchen',
    password: 'kitchen',
    role: 'kitchen',
    displayName: 'Tim Dapur (Koki & Barista)',
    badge: '🍳 Dapur'
  }
};

class AuthManager {
  constructor() {
    this.sessionKey = 'warkop_auth_session';
    this.currentUser = this.loadStoredSession();
    this.listeners = new Set();
  }

  loadStoredSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (WARKOP_ACCOUNTS[parsed.username]) {
          return WARKOP_ACCOUNTS[parsed.username];
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
    // Default guest / customer role
    return {
      username: 'user',
      role: 'user',
      displayName: 'Pelanggan Warkop',
      badge: '📱 Pelanggan'
    };
  }

  login(username, password) {
    const user = WARKOP_ACCOUNTS[username.trim().toLowerCase()];
    if (user && user.password === password) {
      this.currentUser = user;
      localStorage.setItem(this.sessionKey, JSON.stringify({
        username: user.username,
        role: user.role,
        loginAt: Date.now()
      }));
      this.notify();
      return { success: true, user: this.currentUser };
    }
    return { success: false, message: 'Username atau password salah! (Gunakan admin/admin, kasir/kasir, atau kitchen/kitchen)' };
  }

  logout() {
    this.currentUser = {
      username: 'user',
      role: 'user',
      displayName: 'Pelanggan Warkop',
      badge: '📱 Pelanggan'
    };
    localStorage.removeItem(this.sessionKey);
    this.notify();
  }

  getCurrentRole() {
    return this.currentUser ? this.currentUser.role : 'user';
  }

  isAuthenticatedStaff() {
    const role = this.getCurrentRole();
    return role === 'admin' || role === 'kasir' || role === 'kitchen';
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }
}

window.WarkopAuth = new AuthManager();
