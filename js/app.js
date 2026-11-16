/**
 * Root Application Component with Role-Based Access Control (RBAC)
 * Rules:
 * 1. Admin   : Username "admin", Password "admin" -> Bisa apa aja
 * 2. Kasir   : Username "kasir", Password "kasir" -> Fitur kontrol pesanan & bisa memesan makanan untuk pelanggan
 * 3. Kitchen : Username "kitchen", Password "kitchen" -> Hanya apa yang dipesan (TIDAK BISA pesan makanan)
 * 4. User    : Pelanggan -> Hanya bisa pesan menu
 */

function WarkopApp() {
  const store = window.WarkopStoreInstance;
  const auth = window.WarkopAuth;

  const [storeState, setStoreState] = React.useState(store.state);
  const [currentUser, setCurrentUser] = React.useState(auth.currentUser);

  // URL Query Parameters parsing
  const searchParams = new URLSearchParams(window.location.search);
  const urlRole = searchParams.get('role'); // 'customer' | 'kitchen' | 'kasir' | 'admin'
  const initialTable = searchParams.get('meja') || '1';
  const initialMode = searchParams.get('mode') === 'takeaway' ? 'takeaway' : 'dine_in';
  const initialGroup = searchParams.get('group') === 'active';

  // Navigation & Role State
  const initialRoleCalc = () => {
    const role = auth.getCurrentRole();
    if (role === 'kitchen') return 'kitchen';
    if (urlRole) return urlRole;
    if (role === 'admin') return 'admin';
    if (role === 'kasir') return 'kasir';
    return 'customer';
  };

  const [activeRole, setActiveRole] = React.useState(initialRoleCalc());
  const [activeTable, setActiveTable] = React.useState(initialTable);
  const [orderMode, setOrderMode] = React.useState(initialMode);

  // Modals & Tracking States
  const [isStaffLoginOpen, setIsStaffLoginOpen] = React.useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(initialGroup);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = React.useState(null);
  const [paymentSuccessCallback, setPaymentSuccessCallback] = React.useState(null);
  const [activeOrderToTrack, setActiveOrderToTrack] = React.useState(null);
  const [receiptOrder, setReceiptOrder] = React.useState(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = React.useState(false);

  // Subscribe to Auth changes
  React.useEffect(() => {
    const unsubAuth = auth.subscribe((user) => {
      setCurrentUser({ ...user });
      if (user.role === 'admin') setActiveRole('admin');
      else if (user.role === 'kasir') setActiveRole('kasir');
      else if (user.role === 'kitchen') setActiveRole('kitchen'); // Kitchen locked to kitchen view
      else setActiveRole('customer');
    });
    return () => unsubAuth();
  }, [auth]);

  // Subscribe to Warkop Store changes
  React.useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setStoreState({ ...newState });
    });
    return () => unsubscribe();
  }, [store]);

  // Sync Table changes to URL without reloading
  React.useEffect(() => {
    if (activeRole === 'customer') {
      const url = new URL(window.location);
      if (orderMode === 'dine_in') {
        url.searchParams.set('meja', activeTable);
        url.searchParams.delete('mode');
      } else {
        url.searchParams.set('mode', 'takeaway');
        url.searchParams.delete('meja');
      }
      url.searchParams.delete('role');
      window.history.replaceState({}, '', url);
    }
  }, [activeTable, orderMode, activeRole]);

  // Guard: If accessing staff views without credentials, prompt login modal
  const handleRoleSwitch = (requestedRole) => {
    const currentRole = auth.getCurrentRole();

    // RULE 1: Kitchen TIDAK BISA pesan makanan / buka customer menu
    if (currentRole === 'kitchen') {
      if (requestedRole === 'kitchen') {
        setActiveRole('kitchen');
      } else {
        alert('Akses Ditolak: Tim Dapur hanya bertugas melihat antrean dan memasak pesanan, tidak bisa memesan makanan.');
      }
      return;
    }

    // Admin can access everything ("bisa apa aja")
    if (currentRole === 'admin') {
      setActiveRole(requestedRole);
      return;
    }

    // Kasir can ONLY access kasir view (POS terminal). NO customer menu access.
    if (currentRole === 'kasir') {
      if (requestedRole === 'kasir') {
        setActiveRole(requestedRole);
      } else {
        alert('Akses Ditolak: Akun Kasir hanya memiliki hak akses layar kasir (POS).');
      }
      return;
    }

    // Guest / Customer User
    if (requestedRole === 'customer') {
      setActiveRole('customer');
      return;
    }

    // If current role is user (guest customer), must login to access staff role!
    setIsStaffLoginOpen(true);
  };

  // Open Payment Modal
  const handleOpenPayment = (payload, onDone) => {
    setPendingOrderPayload(payload);
    setPaymentSuccessCallback(() => onDone);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (createdOrder) => {
    setIsPaymentModalOpen(false);
    if (paymentSuccessCallback) {
      paymentSuccessCallback(createdOrder);
    }
    // Switch customer to live tracking view
    setActiveOrderToTrack(createdOrder.id);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navbar */}
      <window.WarkopNavbar
        activeRole={activeRole}
        setActiveRole={handleRoleSwitch}
        activeTable={activeTable}
        setActiveTable={setActiveTable}
        orderMode={orderMode}
        setOrderMode={setOrderMode}
        openFirebaseModal={() => setIsFirebaseModalOpen(true)}
        openStaffLoginModal={() => setIsStaffLoginOpen(true)}
        storeState={storeState}
      />

      {/* Role Views Router */}
      {/* 1. USER (Pelanggan) - Hanya bisa pesan menu (Kitchen TIDAK BISA ke sini) */}
      {activeRole === 'customer' && auth.getCurrentRole() !== 'kitchen' && (
        <>
          {activeOrderToTrack ? (
            <window.WarkopOrderTracker
              activeOrderId={activeOrderToTrack}
              storeState={storeState}
              onBackToMenu={() => setActiveOrderToTrack(null)}
              onOpenReceipt={(order) => setReceiptOrder(order)}
            />
          ) : (
            <window.WarkopCustomerView
              store={store}
              storeState={storeState}
              activeTable={activeTable}
              setActiveTable={setActiveTable}
              orderMode={orderMode}
              setOrderMode={setOrderMode}
              openGroupOrderModal={() => setIsGroupModalOpen(true)}
              openPaymentModal={handleOpenPayment}
              activeOrderToTrack={activeOrderToTrack}
              setActiveOrderToTrack={setActiveOrderToTrack}
            />
          )}
        </>
      )}

      {/* 2. KITCHEN (Dapur) - Hanya apa yg dipesan */}
      {activeRole === 'kitchen' && (
        <window.WarkopKitchenView
          store={store}
          storeState={storeState}
        />
      )}

      {/* 3. KASIR - Kontrol pesanan & BISA memesan makanan untuk pelanggan */}
      {activeRole === 'kasir' && (
        <window.WarkopCashierView
          store={store}
          storeState={storeState}
          onOpenReceipt={(order) => setReceiptOrder(order)}
        />
      )}

      {/* 4. ADMIN - Bisa apa aja (Full Dashboard) */}
      {activeRole === 'admin' && (
        <window.WarkopAdminDashboard
          store={store}
          storeState={storeState}
          onOpenReceipt={(order) => setReceiptOrder(order)}
        />
      )}

      {/* MODALS */}
      {/* Staff Login Modal (admin / kasir / kitchen) */}
      <window.WarkopStaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onLoginSuccess={(user) => {
          if (user.role === 'admin') setActiveRole('admin');
          else if (user.role === 'kasir') setActiveRole('kasir');
          else if (user.role === 'kitchen') setActiveRole('kitchen');
        }}
      />

      {/* Group Order Modal ("Pesan Bareng") */}
      <window.WarkopGroupOrderModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        activeTable={activeTable}
        store={store}
        storeState={storeState}
      />

      {/* Digital Payment Modal (QRIS & E-Wallet) */}
      <window.WarkopPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderPayload={pendingOrderPayload}
        onSuccess={handlePaymentSuccess}
        store={store}
      />

      {/* Printable Receipt Modal */}
      <window.WarkopReceiptModal
        isOpen={Boolean(receiptOrder)}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
      />

      {/* Firebase Database Config Modal */}
      <window.WarkopFirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
}

// Mount to DOM
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<WarkopApp />);
}
