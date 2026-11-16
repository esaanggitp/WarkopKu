/**
 * Warkop Unified Store & Realtime Sync Bus
 * Coordinates state between Pelanggan, Dapur (KDS), and Pemilik Usaha
 */

class WarkopStore {
  constructor() {
    this.storageKey = 'warkop_state_v1';
    this.broadcastChannel = null;
    this.subscribers = new Set();
    this.state = this.loadInitialState();

    this.initBroadcastChannel();
    this.initAudioContext();
    this.initFirebaseSync();
  }

  loadInitialState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          menu: parsed.menu || window.WARKOP_INITIAL_MENU,
          ingredients: parsed.ingredients || window.WARKOP_INITIAL_INGREDIENTS,
          tables: parsed.tables || window.WARKOP_INITIAL_TABLES,
          orders: parsed.orders || window.WARKOP_INITIAL_ORDERS,
          groupSessions: parsed.groupSessions || {},
          lastUpdated: Date.now()
        };
      }
    } catch (e) {
      console.warn('Using default initial data:', e);
    }

    return {
      menu: window.WARKOP_INITIAL_MENU || [],
      ingredients: window.WARKOP_INITIAL_INGREDIENTS || [],
      tables: window.WARKOP_INITIAL_TABLES || [],
      orders: window.WARKOP_INITIAL_ORDERS || [],
      groupSessions: {},
      lastUpdated: Date.now()
    };
  }

  saveState(persistToCloud = true) {
    this.state.lastUpdated = Date.now();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Storage quota error:', e);
    }

    // Broadcast locally across tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'STATE_UPDATED',
        state: this.state
      });
    }

    // Notify internal subscribers
    this.notify();

    // Sync to Firebase if active
    if (persistToCloud && window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      this.syncStateToFirestore();
    }
  }

  initBroadcastChannel() {
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('warkop_pos_realtime');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          this.state = event.data.state;
          this.notify();
        } else if (event.data && event.data.type === 'NEW_ORDER_ALERT') {
          this.playKitchenAlert();
        }
      };
    }

    // Fallback storage event listener for older browser compatibility
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          this.notify();
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  initFirebaseSync() {
    window.WarkopFirebase.subscribe(async (evt) => {
      if (evt.type === 'CONFIG_CHANGED') {
        const connected = await window.WarkopFirebase.initFirebase();
        if (connected) {
          this.attachFirestoreListeners();
        }
      }
    });

    if (window.WarkopFirebase.mode === 'firebase') {
      window.WarkopFirebase.initFirebase().then((connected) => {
        if (connected) {
          this.attachFirestoreListeners();
        }
      });
    }
  }

  attachFirestoreListeners() {
    const db = window.WarkopFirebase.firestoreDb;
    if (!db) return;

    console.log('🔥 Memasang Firestore real-time listeners...');

    // Detach previous listeners if any
    if (this._firestoreUnsubscribers) {
      this._firestoreUnsubscribers.forEach(unsub => unsub());
    }
    this._firestoreUnsubscribers = [];

    // 1. Listen to orders collection (real-time)
    const unsubOrders = db.collection('warkop_orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot((snapshot) => {
        const remoteOrders = [];
        snapshot.forEach(doc => remoteOrders.push({ id: doc.id, ...doc.data() }));
        this.state.orders = remoteOrders;
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.notify();
        console.log('🔄 Firestore orders synced:', remoteOrders.length, 'pesanan');
      }, (err) => console.warn('Firestore orders listener error:', err));
    this._firestoreUnsubscribers.push(unsubOrders);

    // 2. Listen to ingredients
    const unsubIngredients = db.collection('warkop_meta').doc('ingredients')
      .onSnapshot((doc) => {
        if (doc.exists && doc.data().list) {
          this.state.ingredients = doc.data().list;
          localStorage.setItem(this.storageKey, JSON.stringify(this.state));
          this.notify();
          console.log('🔄 Firestore ingredients synced');
        }
      }, (err) => console.warn('Firestore ingredients listener error:', err));
    this._firestoreUnsubscribers.push(unsubIngredients);

    // 3. Listen to tables
    const unsubTables = db.collection('warkop_meta').doc('tables')
      .onSnapshot((doc) => {
        if (doc.exists && doc.data().list) {
          this.state.tables = doc.data().list;
          localStorage.setItem(this.storageKey, JSON.stringify(this.state));
          this.notify();
          console.log('🔄 Firestore tables synced');
        }
      }, (err) => console.warn('Firestore tables listener error:', err));
    this._firestoreUnsubscribers.push(unsubTables);

    // 4. Listen to menu
    const unsubMenu = db.collection('warkop_meta').doc('menu')
      .onSnapshot((doc) => {
        if (doc.exists && doc.data().list) {
          this.state.menu = doc.data().list;
          localStorage.setItem(this.storageKey, JSON.stringify(this.state));
          this.notify();
          console.log('🔄 Firestore menu synced');
        }
      }, (err) => console.warn('Firestore menu listener error:', err));
    this._firestoreUnsubscribers.push(unsubMenu);

    // 5. Upload initial data to Firestore if collections are empty
    this.seedFirestoreIfEmpty(db);
  }

  async seedFirestoreIfEmpty(db) {
    try {
      // Check if orders exist; if not, seed from local
      const ordersSnap = await db.collection('warkop_orders').limit(1).get();
      if (ordersSnap.empty && this.state.orders.length > 0) {
        console.log('🌱 Seeding Firestore orders dari data lokal...');
        const batch = db.batch();
        this.state.orders.forEach(order => {
          batch.set(db.collection('warkop_orders').doc(order.id), order);
        });
        await batch.commit();
      }

      // Seed meta docs if they don't exist
      const ingredientsDoc = await db.collection('warkop_meta').doc('ingredients').get();
      if (!ingredientsDoc.exists) {
        await db.collection('warkop_meta').doc('ingredients').set({ list: this.state.ingredients });
        console.log('🌱 Seeding Firestore ingredients');
      }

      const tablesDoc = await db.collection('warkop_meta').doc('tables').get();
      if (!tablesDoc.exists) {
        await db.collection('warkop_meta').doc('tables').set({ list: this.state.tables });
        console.log('🌱 Seeding Firestore tables');
      }

      const menuDoc = await db.collection('warkop_meta').doc('menu').get();
      if (!menuDoc.exists) {
        await db.collection('warkop_meta').doc('menu').set({ list: this.state.menu });
        console.log('🌱 Seeding Firestore menu');
      }
    } catch (e) {
      console.warn('Firestore seed error (non-critical):', e);
    }
  }

  async syncStateToFirestore() {
    const db = window.WarkopFirebase.firestoreDb;
    if (!db) return;
    try {
      const batch = db.batch();
      batch.set(db.collection('warkop_meta').doc('ingredients'), { list: this.state.ingredients }, { merge: true });
      batch.set(db.collection('warkop_meta').doc('tables'), { list: this.state.tables }, { merge: true });
      batch.set(db.collection('warkop_meta').doc('menu'), { list: this.state.menu }, { merge: true });
      await batch.commit();
    } catch (e) {
      console.warn('Sync to Firestore error:', e);
    }
  }

  // Web Audio Synthesizer: Crisp, pleasant restaurant kitchen chime
  initAudioContext() {
    this.audioCtx = null;
  }

  playKitchenAlert() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.00, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880.00, now + 0.15);
      osc2.frequency.setValueAtTime(1174.66, now + 0.35); // D6

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.15);
      osc1.stop(now + 0.8);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.log('Audio playback prevented or not permitted:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try { cb(this.state); } catch (e) { console.error(e); }
    });
  }

  // --- BUSINESS LOGIC: STOCK & MENU LOCKING ---
  /**
   * Evaluates if a menu item is available or locked due to out-of-stock ingredients.
   * "Mengunci menu otomatis jika bahan utama habis (misalnya: stok susu kental manis habis,
   * maka menu kopi susu otomatis tidak bisa dipilih)."
   */
  isMenuItemAvailable(menuItem) {
    if (!menuItem.requiredIngredients || menuItem.requiredIngredients.length === 0) {
      return { available: true, missingIngredients: [] };
    }

    const missing = [];
    for (const ingId of menuItem.requiredIngredients) {
      const ing = this.state.ingredients.find(i => i.id === ingId);
      if (!ing || ing.status === 'out_of_stock' || ing.stock <= 0) {
        missing.push(ing ? ing.name : ingId);
      }
    }

    return {
      available: missing.length === 0,
      missingIngredients: missing
    };
  }

  isToppingAvailable(topping) {
    if (!topping.requiresIngredient) return true;
    const ing = this.state.ingredients.find(i => i.id === topping.requiresIngredient);
    return ing && ing.status !== 'out_of_stock' && ing.stock > 0;
  }

  updateIngredientStock(ingredientId, newStock, newStatus) {
    const idx = this.state.ingredients.findIndex(i => i.id === ingredientId);
    if (idx !== -1) {
      const ing = this.state.ingredients[idx];
      ing.stock = Math.max(0, Number(newStock));
      if (newStatus) {
        ing.status = newStatus;
      } else {
        ing.status = ing.stock <= 0 ? 'out_of_stock' : (ing.stock <= ing.minStock ? 'low' : 'available');
      }
      this.saveState();
    }
  }

  toggleIngredientStatus(ingredientId) {
    const ing = this.state.ingredients.find(i => i.id === ingredientId);
    if (ing) {
      if (ing.status === 'out_of_stock') {
        ing.status = ing.stock > ing.minStock ? 'available' : 'low';
        if (ing.stock === 0) ing.stock = 10;
      } else {
        ing.status = 'out_of_stock';
        ing.stock = 0;
      }
      this.saveState();
    }
  }

  // --- ORDERS MANAGEMENT ---
  createOrder(orderData) {
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      orderStatus: 'received', // 'received' | 'cooking' | 'ready' | 'completed' | 'cancelled'
      paymentStatus: orderData.paymentMethod === 'cash' ? 'pending' : 'paid',
      ...orderData
    };

    // Prepend order
    this.state.orders = [newOrder, ...this.state.orders];

    // Update table status if Dine-In
    if (newOrder.type === 'dine_in' && newOrder.tableNumber) {
      const table = this.state.tables.find(t => String(t.id) === String(newOrder.tableNumber));
      if (table) {
        table.status = newOrder.paymentStatus === 'pending' ? 'unpaid' : 'occupied';
        table.activeOrderId = newOrder.id;
        table.totalBill = (table.totalBill || 0) + newOrder.total;
      }
    }

    // Deduct stock of used ingredients
    this.deductStockForOrder(newOrder);

    // Save and alert kitchen
    this.saveState();
    this.playKitchenAlert();
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'NEW_ORDER_ALERT', orderId: newOrder.id });
    }

    // If Firestore is active, save order
    if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      try {
        window.WarkopFirebase.firestoreDb.collection('warkop_orders').doc(newOrder.id).set(newOrder);
      } catch (e) {
        console.warn('Firestore createOrder:', e);
      }
    }

    return newOrder;
  }

  deductStockForOrder(order) {
    if (!order.items) return;
    order.items.forEach(item => {
      const menuItem = this.state.menu.find(m => m.id === item.menuId || m.name === item.name);
      if (menuItem && menuItem.requiredIngredients) {
        menuItem.requiredIngredients.forEach(ingId => {
          const ing = this.state.ingredients.find(i => i.id === ingId);
          if (ing && ing.stock > 0) {
            ing.stock = Math.max(0, ing.stock - (item.quantity || 1));
            if (ing.stock === 0) ing.status = 'out_of_stock';
            else if (ing.stock <= ing.minStock) ing.status = 'low';
          }
        });
      }
    });
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.orderStatus = newStatus;

    if (newStatus === 'completed') {
      // If dine in, check if table should be freed
      if (order.tableNumber) {
        const table = this.state.tables.find(t => String(t.id) === String(order.tableNumber));
        if (table && table.activeOrderId === orderId) {
          table.status = 'available';
          table.activeOrderId = null;
          table.totalBill = 0;
        }
      }
    }

    this.saveState();

    if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      try {
        window.WarkopFirebase.firestoreDb.collection('warkop_orders').doc(orderId).update({ orderStatus: newStatus });
      } catch (e) {
        console.warn('Firestore updateOrderStatus:', e);
      }
    }
  }

  markOrderAsPaid(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.paymentStatus = 'paid';

    if (order.tableNumber) {
      const table = this.state.tables.find(t => String(t.id) === String(order.tableNumber));
      if (table && table.status === 'unpaid') {
        table.status = 'occupied';
      }
    }

    this.saveState();

    // Sync payment status to Firestore
    if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      try {
        window.WarkopFirebase.firestoreDb.collection('warkop_orders').doc(orderId).update({ paymentStatus: 'paid' });
      } catch (e) {
        console.warn('Firestore markOrderAsPaid:', e);
      }
    }
  }

  // --- TABLE ACTIONS ---
  clearTable(tableId) {
    const table = this.state.tables.find(t => String(t.id) === String(tableId));
    if (table) {
      table.status = 'available';
      table.activeOrderId = null;
      table.totalBill = 0;
      this.saveState();
    }
  }

  // --- GROUP ORDER (PESAN BARENG) ---
  getGroupSession(tableNumber) {
    const key = 'GRP-MEJA-' + tableNumber;
    return this.state.groupSessions[key] || null;
  }

  createOrJoinGroupSession(tableNumber, memberName) {
    const key = 'GRP-MEJA-' + tableNumber;
    if (!this.state.groupSessions[key]) {
      this.state.groupSessions[key] = {
        id: key,
        tableNumber: String(tableNumber),
        hostName: memberName,
        members: [memberName],
        items: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };
    } else {
      const session = this.state.groupSessions[key];
      if (!session.members.includes(memberName)) {
        session.members.push(memberName);
      }
    }
    this.saveState();
    return this.state.groupSessions[key];
  }

  addItemToGroupSession(tableNumber, cartItem) {
    const key = 'GRP-MEJA-' + tableNumber;
    if (!this.state.groupSessions[key]) return;
    this.state.groupSessions[key].items.push({
      ...cartItem,
      id: 'grp_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    });
    this.saveState();
  }

  removeItemFromGroupSession(tableNumber, itemId) {
    const key = 'GRP-MEJA-' + tableNumber;
    if (!this.state.groupSessions[key]) return;
    this.state.groupSessions[key].items = this.state.groupSessions[key].items.filter(i => i.id !== itemId);
    this.saveState();
  }

  clearGroupSession(tableNumber) {
    const key = 'GRP-MEJA-' + tableNumber;
    delete this.state.groupSessions[key];
    this.saveState();
  }

  // --- MENU MANAGEMENT ---
  addMenuItem(menuItem) {
    this.state.menu.push({
      id: 'menu_' + Date.now(),
      ...menuItem
    });
    this.saveState();

    // Sync menu to Firestore
    if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      try {
        window.WarkopFirebase.firestoreDb.collection('warkop_meta').doc('menu').set({ list: this.state.menu }, { merge: true });
      } catch (e) { console.warn('Firestore addMenuItem:', e); }
    }
  }

  updateMenuItem(updatedItem) {
    const idx = this.state.menu.findIndex(m => m.id === updatedItem.id);
    if (idx !== -1) {
      this.state.menu[idx] = updatedItem;
      this.saveState();

      if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
        try {
          window.WarkopFirebase.firestoreDb.collection('warkop_meta').doc('menu').set({ list: this.state.menu }, { merge: true });
        } catch (e) { console.warn('Firestore updateMenuItem:', e); }
      }
    }
  }

  deleteMenuItem(id) {
    this.state.menu = this.state.menu.filter(m => m.id !== id);
    this.saveState();

    if (window.WarkopFirebase && window.WarkopFirebase.isInitialized) {
      try {
        window.WarkopFirebase.firestoreDb.collection('warkop_meta').doc('menu').set({ list: this.state.menu }, { merge: true });
      } catch (e) { console.warn('Firestore deleteMenuItem:', e); }
    }
  }

  // --- STATS & ANALYTICS HELPER ---
  getSalesSummary() {
    const orders = this.state.orders;
    const today = new Date().toISOString().slice(0, 10);
    
    // Filter today's orders
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today) && o.orderStatus !== 'cancelled');
    const totalRevenueToday = todayOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
    const activeOrders = orders.filter(o => o.orderStatus === 'received' || o.orderStatus === 'cooking' || o.orderStatus === 'ready');
    
    // Popular menu counts
    const menuPopularity = {};
    orders.forEach(o => {
      if (o.orderStatus !== 'cancelled' && o.items) {
        o.items.forEach(it => {
          menuPopularity[it.name] = (menuPopularity[it.name] || 0) + (it.quantity || 1);
        });
      }
    });

    // Payment methods breakdown: Strictly Tunai (Cash) & QRIS
    const paymentBreakdown = { qris: 0, cash: 0 };
    orders.forEach(o => {
      if (o.paymentStatus === 'paid') {
        const method = o.paymentMethod === 'cash' ? 'cash' : 'qris';
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + o.total;
      }
    });

    const occupiedTablesCount = this.state.tables.filter(t => t.status === 'occupied' || t.status === 'unpaid').length;

    return {
      totalRevenueToday,
      todayOrdersCount: todayOrders.length,
      activeOrdersCount: activeOrders.length,
      occupiedTablesCount,
      totalTables: this.state.tables.length,
      menuPopularity,
      paymentBreakdown
    };
  }
}

window.WarkopStoreInstance = new WarkopStore();
