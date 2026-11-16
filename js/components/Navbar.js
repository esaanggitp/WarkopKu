/**
 * Top Navbar with Strict Role-Based Access Control (RBAC)
 * Rules:
 * - Admin   : Full access ("bisa apa aja")
 * - Kasir   : Kontrol pesanan & bisa memesan makanan untuk pelanggan
 * - Kitchen : Hanya bisa apa yg dipesan (TIDAK BISA pesan makanan)
 * - User    : Pelanggan (Hanya bisa pesan makanan)
 */

window.WarkopNavbar = function Navbar({
  activeRole,
  setActiveRole,
  activeTable,
  setActiveTable,
  orderMode,
  setOrderMode,
  openFirebaseModal,
  openStaffLoginModal,
  storeState
}) {
  const currentAuth = window.WarkopAuth ? window.WarkopAuth.currentUser : null;
  const currentRole = currentAuth ? currentAuth.role : 'user';

  const activeOrdersCount = (storeState.orders || []).filter(o => o.orderStatus === 'received' || o.orderStatus === 'cooking').length;
  const unpaidCount = (storeState.orders || []).filter(o => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled').length;

  const handleLogout = () => {
    window.WarkopAuth.logout();
    setActiveRole('customer');
  };

  const handleLogoClick = () => {
    if (currentRole === 'kitchen') {
      setActiveRole('kitchen');
    } else {
      setActiveRole('customer');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-900/30">
              <span className="text-xl">☕</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-wide text-amber-400">WARKOP<span className="text-white">KU</span></span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {currentRole === 'admin' ? '👑 Admin' : currentRole === 'kasir' ? '💳 Kasir' : currentRole === 'kitchen' ? '🍳 Dapur' : 'Pelanggan'}
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                {currentRole === 'admin'
                  ? 'Akses Penuh: Omzet, Stok, Menu, Meja & Kasir'
                  : currentRole === 'kasir'
                  ? 'Akses Kasir: Kontrol Pesanan & Input Pesanan Pelanggan'
                  : currentRole === 'kitchen'
                  ? 'Akses Dapur: Khusus Antrean Masak (Tidak Bisa Memesan)'
                  : 'Sistem Pesan Mandiri & Nongkrong Asik'}
              </p>
            </div>
          </div>

          {/* Role Navigation (Desktop) - Strictly Gated by Login Role */}
          <nav className="hidden md:flex items-center bg-stone-950/80 p-1 rounded-xl border border-stone-800 text-xs">
            {/* Customer ordering view is ONLY visible to User (Pelanggan) and Admin.
                KITCHEN dan KASIR TIDAK bisa akses menu digital pelanggan */}
            {(currentRole === 'user' || currentRole === 'admin') && (
              <button
                onClick={() => setActiveRole('customer')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeRole === 'customer'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>📱</span>
                <span>Menu Pesanan (Pelanggan)</span>
              </button>
            )}

            {/* ADMIN ACCESS: Bisa Apa Aja */}
            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => setActiveRole('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                    activeRole === 'admin'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>📊</span>
                  <span>Dashboard Pemilik</span>
                </button>

                <button
                  onClick={() => setActiveRole('kasir')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition relative ${
                    activeRole === 'kasir'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>💳</span>
                  <span>Layar Kasir (POS)</span>
                  {unpaidCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                      {unpaidCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveRole('kitchen')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition relative ${
                    activeRole === 'kitchen'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>🍳</span>
                  <span>Layar Dapur</span>
                  {activeOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* KASIR ACCESS: Kontrol Pesanan & Bisa Memesan Makanan untuk Pelanggan */}
            {currentRole === 'kasir' && (
              <button
                onClick={() => setActiveRole('kasir')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition relative ${
                  activeRole === 'kasir'
                    ? 'bg-sky-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>💳</span>
                <span>Layar Kasir (Kontrol & Buat Pesanan)</span>
                {unpaidCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                    {unpaidCount}
                  </span>
                )}
              </button>
            )}

            {/* KITCHEN ACCESS: HANYA APA YG DIPESAN (TIDAK BISA PESAN MAKANAN) */}
            {currentRole === 'kitchen' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-950/60 text-emerald-300 rounded-lg border border-emerald-800/50 font-bold text-xs">
                <span>🍳 Layar Antrean Masak Dapur</span>
                {activeOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </div>
            )}
          </nav>

          {/* Right Action: Table Info / Login Staff / Settings */}
          <div className="flex items-center space-x-2">
            {/* Show Table tag ONLY if in customer view and NOT kitchen */}
            {activeRole === 'customer' && currentRole !== 'kitchen' && (
              <div className="flex items-center bg-stone-800/90 border border-stone-700/80 rounded-lg px-2.5 py-1 text-xs">
                <div className="flex items-center space-x-1.5 text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-amber-400">Meja {activeTable}</span>
                </div>
              </div>
            )}

            {/* If Logged in as Staff -> Show Logout Button */}
            {currentRole !== 'user' ? (
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-stone-300 hidden xl:inline bg-stone-800 px-2 py-1 rounded-lg">
                  {currentAuth.displayName}
                </span>

                {/* Firebase config button (Admin only) */}
                {currentRole === 'admin' && (
                  <button
                    onClick={openFirebaseModal}
                    title="Pengaturan Firebase Firestore"
                    className="bg-stone-800 hover:bg-stone-700 border border-stone-700 px-2.5 py-1.5 rounded-lg text-xs transition"
                  >
                    <span>⚙️</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-950 hover:bg-red-900 border border-red-800/60 text-red-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* If User / Guest -> Show Staff Login Button */
              <button
                onClick={openStaffLoginModal}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3 py-1.5 rounded-lg text-xs transition shadow flex items-center space-x-1.5"
              >
                <span>🔐</span>
                <span>Login Staff</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navbar */}
      <div className="md:hidden flex items-center justify-around bg-stone-950 px-2 py-1.5 border-t border-stone-800/70 text-xs">
        {/* Customer view only if User or Admin (Kasir & Kitchen TIDAK bisa) */}
        {(currentRole === 'user' || currentRole === 'admin') && (
          <button
            onClick={() => setActiveRole('customer')}
            className={`flex-1 py-1.5 rounded-md text-center font-medium ${
              activeRole === 'customer' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
            }`}
          >
            📱 Menu
          </button>
        )}

        {currentRole === 'admin' && (
          <>
            <button
              onClick={() => setActiveRole('admin')}
              className={`flex-1 py-1.5 rounded-md text-center font-medium ${
                activeRole === 'admin' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              📊 Pemilik
            </button>
            <button
              onClick={() => setActiveRole('kasir')}
              className={`flex-1 py-1.5 rounded-md text-center font-medium ${
                activeRole === 'kasir' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              💳 Kasir
            </button>
            <button
              onClick={() => setActiveRole('kitchen')}
              className={`flex-1 py-1.5 rounded-md text-center font-medium ${
                activeRole === 'kitchen' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
              }`}
            >
              🍳 Dapur
            </button>
          </>
        )}

        {currentRole === 'kasir' && (
          <button
            onClick={() => setActiveRole('kasir')}
            className={`flex-1 py-1.5 rounded-md text-center font-medium ${
              activeRole === 'kasir' ? 'bg-sky-500 text-stone-950 font-bold' : 'text-stone-400'
            }`}
          >
            💳 Layar Kasir (POS)
          </button>
        )}

        {currentRole === 'kitchen' && (
          <div className="flex-1 py-1.5 rounded-md text-center font-bold text-emerald-400 bg-emerald-950/40">
            🍳 Khusus Antrean Dapur
          </div>
        )}

        {currentRole === 'user' && (
          <button
            onClick={openStaffLoginModal}
            className="flex-1 py-1.5 rounded-md text-center font-medium text-amber-400"
          >
            🔐 Login Staff
          </button>
        )}
      </div>
    </header>
  );
};
