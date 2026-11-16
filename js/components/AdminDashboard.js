/**
 * Owner POS & Admin Dashboard
 * Comprehensive reports, Daily revenue, Best selling menu analytics,
 * Payment methods breakdown, and sub-managers.
 */

window.WarkopAdminDashboard = function AdminDashboard({
  store,
  storeState,
  onOpenReceipt
}) {
  const [activeTab, setActiveTab] = React.useState('analytics'); // 'analytics' | 'tables' | 'inventory' | 'menu' | 'transactions'
  const [dateFilter, setDateFilter] = React.useState('today'); // 'today' | 'all'
  const [newMenuModalOpen, setNewMenuModalOpen] = React.useState(false);

  // New Menu Form State
  const [newMenu, setNewMenu] = React.useState({
    name: '',
    category: 'indomie',
    price: 15000,
    description: '',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_indomie_goreng']
  });

  const summary = store.getSalesSummary();
  const orders = storeState.orders || [];

  // Filtered orders for transaction table
  const filteredOrders = orders.filter(o => {
    if (dateFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return o.createdAt.startsWith(today);
    }
    return true;
  });

  // Calculate top best sellers array sorted
  const sortedPopularMenu = Object.entries(summary.menuPopularity || {})
    .sort((a, b) => b[1] - a[1]);

  const maxPopularCount = sortedPopularMenu.length > 0 ? sortedPopularMenu[0][1] : 1;

  // Export Transactions to CSV
  const handleExportCSV = () => {
    let csv = 'ID Pesanan,Tanggal,Tipe,Meja/Nama,Total (Rp),Metode Bayar,Status Bayar,Status Pesanan\n';
    filteredOrders.forEach(o => {
      csv += `"${o.id}","${new Date(o.createdAt).toLocaleString('id-ID')}","${o.type}","${o.type === 'dine_in' ? 'Meja ' + o.tableNumber : o.customerName}",${o.total},"${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Penjualan_Warkop_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateMenuItem = (e) => {
    e.preventDefault();
    if (!newMenu.name.trim()) return;

    store.addMenuItem({
      ...newMenu,
      price: Number(newMenu.price),
      isPopular: false
    });

    setNewMenuModalOpen(false);
    setNewMenu({
      name: '',
      category: 'indomie',
      price: 15000,
      description: '',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
      requiredIngredients: ['ing_indomie_goreng']
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20">
      {/* Top Header & Navigation Tabs */}
      <div className="bg-stone-900 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <h2 className="font-black text-xl text-white">Dashboard Pemilik Usaha Warkop</h2>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Pantau omzet, stok bahan baku, denah meja, dan performa menu terlaris secara realtime.
              </p>
            </div>

            {/* Sub-Tabs */}
            <div className="flex flex-wrap items-center bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs gap-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'analytics' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>📈</span>
                <span>Ringkasan & Omzet</span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'tables' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🪑</span>
                <span>Manajemen Meja ({storeState.tables.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'inventory' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>📦</span>
                <span>Stok Bahan Baku</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'menu' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🍜</span>
                <span>Kelola Menu</span>
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'transactions' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🧾</span>
                <span>Laporan Penjualan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {/* TAB 1: ANALYTICS & DAILY SUMMARY */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Omzet Hari Ini */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-amber-500">💰</div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Omzet Penjualan Hari Ini
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-amber-400 mt-1">
                  Rp {summary.totalRevenueToday.toLocaleString('id-ID')}
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
                  ● Dari {summary.todayOrdersCount} transaksi tercatat
                </span>
              </div>

              {/* Meja Terisi */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-amber-500">🪑</div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Okupansi Meja Warkop
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-white mt-1">
                  {summary.occupiedTablesCount} <span className="text-base font-normal text-stone-400">/ {summary.totalTables} Meja</span>
                </h3>
                <span className="text-[11px] text-amber-400 font-semibold block mt-1">
                  {Math.round((summary.occupiedTablesCount / summary.totalTables) * 100)}% Kapasitas Terisi
                </span>
              </div>

              {/* Antrean Dapur Aktif */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-amber-500">🍳</div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Pesanan Aktif di Dapur
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-white mt-1">
                  {summary.activeOrdersCount} Pesanan
                </h3>
                <span className="text-[11px] text-sky-400 font-semibold block mt-1">
                  Sedang diracik pramusaji
                </span>
              </div>

              {/* Top Seller Item */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-amber-500">⭐</div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Menu Juara Hari Ini
                </span>
                <h3 className="text-base lg:text-lg font-black text-amber-300 mt-1 line-clamp-1">
                  {sortedPopularMenu.length > 0 ? sortedPopularMenu[0][0] : 'Belum Ada'}
                </h3>
                <span className="text-[11px] text-stone-400 font-semibold block mt-1">
                  {sortedPopularMenu.length > 0 ? `${sortedPopularMenu[0][1]} Porsi Terjual` : 'Menunggu pesanan'}
                </span>
              </div>
            </div>

            {/* Visual Charts: Best Seller vs Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Menu Paling Laris (Best Sellers) */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🏆</span>
                    <h4 className="font-bold text-sm text-white">Menu Paling Laris (Indomie vs Pancong vs Kopi)</h4>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">Berdasarkan Total Porsi</span>
                </div>

                <div className="space-y-3 pt-2">
                  {sortedPopularMenu.length === 0 ? (
                    <p className="text-stone-500 text-xs italic">Belum ada data penjualan.</p>
                  ) : (
                    sortedPopularMenu.slice(0, 6).map(([menuName, count], idx) => {
                      const percentage = Math.round((count / maxPopularCount) * 100);
                      return (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-200">
                              #{idx + 1} {menuName}
                            </span>
                            <span className="font-black text-amber-400">{count} Porsi</span>
                          </div>
                          <div className="w-full bg-stone-950 rounded-full h-2.5 overflow-hidden border border-stone-800">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Metode Pembayaran Terfavorit */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💳</span>
                    <h4 className="font-bold text-sm text-white">Metode Pembayaran yang Paling Sering Digunakan</h4>
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">Nominal Transaksi</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 font-bold block">QRIS (Digital Instan)</span>
                    <span className="text-xl font-black text-amber-400">
                      Rp {(summary.paymentBreakdown.qris || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-400 block">● BCA, Mandiri, BRI, GoPay, Dana, dll.</span>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-xs text-stone-400 font-bold block">Tunai di Kasir (Cash)</span>
                    <span className="text-xl font-black text-emerald-400">
                      Rp {(summary.paymentBreakdown.cash || 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-stone-400 block">● Pembayaran Langsung di Kasir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLE MANAGEMENT */}
        {activeTab === 'tables' && (
          <div className="animate-fade-in">
            <window.WarkopTableManager store={store} storeState={storeState} />
          </div>
        )}

        {/* TAB 3: INVENTORY & STOCK */}
        {activeTab === 'inventory' && (
          <div className="animate-fade-in">
            <window.WarkopInventoryManager store={store} storeState={storeState} />
          </div>
        )}

        {/* TAB 4: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Daftar Menu Warkop ({storeState.menu.length})</h3>
                <p className="text-xs text-stone-400">Atur harga, nama, kategori, dan ketergantungan bahan baku.</p>
              </div>
              <button
                onClick={() => setNewMenuModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg flex items-center space-x-1.5"
              >
                <span>➕</span>
                <span>Tambah Menu Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeState.menu.map(item => (
                <div key={item.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-4 flex space-x-3 items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-stone-800" />
                    <div>
                      <h4 className="font-bold text-sm text-stone-100">{item.name}</h4>
                      <p className="text-xs text-amber-400 font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                      <span className="text-[10px] text-stone-400 uppercase">{item.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus menu "${item.name}"?`)) store.deleteMenuItem(item.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold p-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SALES REPORT & TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Rekapitulasi Penjualan & Transaksi</h3>
                <p className="text-xs text-stone-400">Riwayat lengkap pesanan pelanggan dari sisi kasir & self-order.</p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-stone-800 border border-stone-700 text-amber-400 font-bold rounded-xl px-3 py-2"
                >
                  <option value="today">Hari Ini Saja</option>
                  <option value="all">Semua Riwayat Transaksi</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <span>📥</span>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">No. Pesanan</th>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Tipe / Lokasi</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Metode & Status Bayar</th>
                      <th className="py-3 px-4 text-right">Aksi Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-stone-500">
                          Tidak ada transaksi yang cocok dengan filter tanggal.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-stone-850/40 transition">
                          <td className="py-3 px-4 font-bold text-amber-400">
                            {order.id}
                          </td>
                          <td className="py-3 px-4 text-stone-400">
                            {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </td>
                          <td className="py-3 px-4 font-semibold text-stone-200">
                            Meja {order.tableNumber || '-'}
                          </td>
                          <td className="py-3 px-4 text-stone-300">
                            {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-black text-amber-400">
                            Rp {order.total.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                              {order.paymentStatus === 'paid' ? `LUNAS (${order.paymentMethod.toUpperCase()})` : 'BELUM BAYAR'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onOpenReceipt(order)}
                              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                            >
                              🧾 Cetak Struk
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL TAMBAH MENU BARU */}
      {newMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-white">Tambah Menu Warkop Baru</h3>
              <button onClick={() => setNewMenuModalOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">Nama Menu:</label>
                <input
                  type="text"
                  required
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                  placeholder="Contoh: Indomie Bangladesh Spesial"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Kategori:</label>
                <select
                  value={newMenu.category}
                  onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                >
                  <option value="indomie">Mi Instan (Indomie)</option>
                  <option value="minuman">Kopi & Minuman</option>
                  <option value="pancong">Kue Pancong & Roti</option>
                  <option value="gorengan">Gorengan</option>
                  <option value="makanan">Makanan Berat</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Harga (Rp):</label>
                <input
                  type="number"
                  required
                  value={newMenu.price}
                  onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">Deskripsi:</label>
                <textarea
                  rows="2"
                  value={newMenu.description}
                  onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                  placeholder="Deskripsi singkat menu..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                ></textarea>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">URL Foto:</label>
                <input
                  type="url"
                  value={newMenu.image}
                  onChange={(e) => setNewMenu({ ...newMenu, image: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewMenuModalOpen(false)}
                  className="bg-stone-800 text-stone-300 px-4 py-2 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 text-stone-950 px-5 py-2 rounded-xl font-bold hover:bg-amber-400 shadow"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
