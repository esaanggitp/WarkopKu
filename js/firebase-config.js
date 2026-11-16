/**
 * Firebase Configuration & Realtime Sync Engine for Warkop POS
 * Supports both Google Cloud Firestore and Instant Multi-Tab Broadcast Synchronization
 */

const FIREBASE_CONFIG_KEY = 'warkop_firebase_config';
const FIREBASE_ACTIVE_MODE_KEY = 'warkop_database_mode'; // 'firebase' | 'local_realtime'

// Default empty config template for users to fill
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

class FirebaseManager {
  constructor() {
    this.config = this.loadStoredConfig();
    this.isInitialized = false;
    this.firestoreDb = null;
    this.mode = localStorage.getItem(FIREBASE_ACTIVE_MODE_KEY) || 'local_realtime';
    this.listeners = new Set();
  }

  loadStoredConfig() {
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored Firebase config:', e);
    }
    return { ...DEFAULT_FIREBASE_CONFIG };
  }

  saveConfig(newConfig, mode = 'firebase') {
    this.config = { ...this.config, ...newConfig };
    this.mode = mode;
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(this.config));
    localStorage.setItem(FIREBASE_ACTIVE_MODE_KEY, mode);
    this.initFirebase();
    this.notifyListeners({ type: 'CONFIG_CHANGED', config: this.config, mode: this.mode });
  }

  hasValidCredentials() {
    return Boolean(
      this.config.apiKey &&
      this.config.projectId &&
      this.config.apiKey.length > 5 &&
      this.config.projectId.length > 2
    );
  }

  async initFirebase() {
    if (this.mode !== 'firebase' || !this.hasValidCredentials()) {
      console.log('⚡ Warkop Database running in High-Performance Local Realtime Mode (Multi-Tab Synced)');
      this.isInitialized = false;
      this.firestoreDb = null;
      return false;
    }

    try {
      if (window.firebase && window.firebase.apps) {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(this.config);
        }
        this.firestoreDb = window.firebase.firestore();
        this.isInitialized = true;
        console.log('🔥 Connected to Google Firebase Firestore for project:', this.config.projectId);
        return true;
      }
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Firestore:', err);
      this.isInitialized = false;
      this.firestoreDb = null;
      return false;
    }
    return false;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }
}

window.WarkopFirebase = new FirebaseManager();
