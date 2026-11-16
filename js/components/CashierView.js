/**
 * Dedicated Cashier POS & Order Control View
 * Rules:
 * - Kasir hanya bisa fitur kontrol pesanan
 * - Dasbor kasir BISA memesan makanan untuk pelanggan (POS Terminal)
 */

window.WarkopCashierView = function CashierView({
  store,
  storeState,
  onOpenReceipt
}) {
  const [activeTab, setActiveTab] = React.useState('orders'); // 'orders' | 'new_order' | 'tables'
  const [orderFilter, setOrderFilter] = React.useState('pending'); // 'all' | 'pending' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = React.useState('');

  const orders = storeState.orders || [];
  const tables = storeState.tables || [];
  const menu = storeState.menu || [];

  // --- STATE FOR CASHIER ORDER ENTRY (MEMESAN MAKANAN UNTUK PELANGGAN) ---
  const [posOrderType, setPosOrderType] = React.useState('dine_in'); // 'dine_in' | 'takeaway'
  const [posTable, setPosTable] = React.useState('1');
  const [posCustomerName, setPosCustomerName] = React.useState('');
  const [posCustomerPhone, setPosCustomerPhone] = React.useState('');
  const [posMenuCategory, setPosMenuCategory] = React.useState('all');
  const [posMenuSearch, setPosMenuSearch] = React.useState('');
  const [posCart, setPosCart] = React.useState([]);
  const [posCustomizingItem, setPosCustomizingItem] = React.useState(null);
  const [posCustomForm, setPosCustomForm] = React.useState({
    quantity: 1,
    doneness: '',
    spiciness: '',
    temperature: '',
    sweetness: '',
    pancongDoneness: '',
    selectedToppings: [],
    notes: ''
  });

  // Cash payment helper
  const [posPaymentMethod, setPosPaymentMethod] = React.useState('cash_paid'); // 'cash_paid' | 'qris' | 'pending'
  const [cashReceived, setCashReceived] = React.useState(0);

  // Filter orders in queue tab
  const filteredOrders = orders.filter(order => {
    let matchesStatus = true;
    if (orderFilter === 'pending') {
      matchesStatus = order.paymentStatus === 'pending';
    } else if (orderFilter === 'active') {
      matchesStatus = order.orderStatus === 'received' || order.orderStatus === 'cooking' || order.orderStatus === 'ready';
    } else if (orderFilter === 'completed') {
      matchesStatus = order.orderStatus === 'completed';
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      order.id.toLowerCase().includes(q) ||
      (order.tableNumber && String(order.tableNumber).includes(q)) ||
      (order.customerName && order.customerName.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const unpaidCount = orders.filter(o => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled').length;
  const activeQueuesCount = orders.filter(o => o.orderStatus === 'received' || o.orderStatus === 'cooking').length;

  // POS Menu Filter
  const filteredPosMenu = menu.filter(item => {
    const matchesCat = posMenuCategory === 'all' || item.category === posMenuCategory;
    const matchesQ = !posMenuSearch ||
      item.name.toLowerCase().includes(posMenuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(posMenuSearch.toLowerCase());
    return matchesCat && matchesQ;
  });

  // Cart calculations
  const posCartTotal = posCart.reduce((sum, item) => sum + item.subtotal, 0);
  const posCartCount = posCart.reduce((sum, item) => sum + item.quantity, 0);
  const cashChange = Math.max(0, cashReceived - posCartTotal);

  // Open item customizer in Cashier POS
  const handleStartPosCustomize = (item) => {
    const availability = store.isMenuItemAvailable(item);
    if (!availability.available) return;

    setPosCustomizingItem(item);
    setPosCustomForm({
      quantity: 1,
      doneness: item.availableDoneness ? item.availableDoneness[0] : '',
      spiciness: item.availableSpiciness ? item.availableSpiciness[1] || item.availableSpiciness[0] : '',
      temperature: item.availableTemperature ? item.availableTemperature[0] : '',
      sweetness: item.availableSweetness ? item.availableSweetness[0] : '',
      pancongDoneness: item.availablePancongDoneness ? item.availablePancongDoneness[0] : '',
      selectedToppings: [],
      notes: ''
    });
  };

  const handleTogglePosTopping = (topping) => {
    const exists = posCustomForm.selectedToppings.some(t => t.id === topping.id);
    if (exists) {
      setPosCustomForm(prev => ({
        ...prev,
        selectedToppings: prev.selectedToppings.filter(t => t.id !== topping.id)
      }));
    } else {
      setPosCustomForm(prev => ({
        ...prev,
        selectedToppings: [...prev.selectedToppings, topping]
      }));
    }
  };

  const handleAddPosCart = () => {
    if (!posCustomizingItem) return;
    const toppingsTotal = posCustomForm.selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);
    const unitPrice = posCustomizingItem.price + toppingsTotal;
    const subtotal = unitPrice * posCustomForm.quantity;

    const newItem = {
      id: 'pos_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      menuId: posCustomizingItem.id,
      name: posCustomizingItem.name,
      basePrice: posCustomizingItem.price,
      quantity: posCustomForm.quantity,
      subtotal: subtotal,
      customization: {
        doneness: posCustomForm.doneness,
        spiciness: posCustomForm.spiciness,
        temperature: posCustomForm.temperature,
        sweetness: posCustomForm.sweetness,
        pancongDoneness: posCustomForm.pancongDoneness,
        toppings: posCustomForm.selectedToppings,
        notes: posCustomForm.notes.trim()
      },
      addedBy: 'Kasir POS'
    };

    setPosCart(prev => [...prev, newItem]);
    setPosCustomizingItem(null);
  };

  // Submit Order directly from Cashier Dashboard
  const handleSubmitPosOrder = () => {
    if (posCart.length === 0) {
      alert('Pilih minimal 1 menu sebelum memproses pesanan.');
      return;
    }

    const orderPayload = {
      type: posOrderType,
      tableNumber: posOrderType === 'dine_in' ? posTable : null,
      customerName: posCustomerName.trim() || (posOrderType === 'dine_in' ? `Pelanggan Meja ${posTable}` : 'Pelanggan Takeaway (Kasir)'),
      customerPhone: posCustomerPhone.trim() || '',
      isGroupOrder: false,
      items: posCart,
      subtotal: posCartTotal,
      total: posCartTotal,
      paymentMethod: posPaymentMethod === 'qris' ? 'qris' : 'cash',
      paymentStatus: posPaymentMethod === 'pending' ? 'pending' : 'paid',
      estimatedWaitMinutes: 10 + Math.min(15, posCart.length * 2)
    };

    const createdOrder = store.createOrder(orderPayload);

    // Open receipt modal automatically
    onOpenReceipt(createdOrder);

    // Reset POS form
    setPosCart([]);
    setPosCustomerName('');
    setPosCustomerPhone('');
    setCashReceived(0);

    // Switch to orders view to see order in queue
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20">
      {/* Top Header Bar */}
      <div className="bg-stone-900 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-stone-950 flex items-center justify-center text-xl font-black shadow-md">
              💳
            </div>
            <div>
              <h2 className="font-black text-lg text-white flex items-center space-x-2">
                <span>Layar Kasir & Kontrol Pesanan</span>
                <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold px-2.5 py-0.5 rounded-full">
                  Hak Akses: Kasir
                </span>
              </h2>
              <p className="text-xs text-stone-400">Verifikasi Pembayaran • Buat Pesanan untuk Pelanggan • Kontrol Meja</p>
            </div>
          </div>

          {/* Quick Tabs: Kontrol vs Input Pesanan Baru vs Meja */}
          <div className="flex items-center space-x-2 text-xs">
            {unpaidCount > 0 && (
              <div className="bg-red-950/80 border border-red-800 px-3 py-1.5 rounded-xl text-red-300 font-bold flex items-center space-x-1.5 animate-pulse">
                <span>🔴</span>
                <span>{unpaidCount} Perlu Dibayar</span>
              </div>
            )}

            <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'orders' ? 'bg-sky-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>📋</span>
                <span>Kontrol Pesanan ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('new_order')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'new_order' ? 'bg-amber-500 text-stone-950 shadow' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span>➕</span>
                <span>Pesan untuk Pelanggan</span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'tables' ? 'bg-sky-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>🪑</span>
                <span>Denah Meja</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-5">
        {/* TAB 1: KONTROL PESANAN */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter Sub-bar & New Order CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1 ${
                    orderFilter === 'pending'
                      ? 'bg-red-500 text-white shadow'
                      : 'bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  <span>🔴 Belum Bayar ({unpaidCount})</span>
                </button>

                <button
                  onClick={() => setOrderFilter('active')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1 ${
                    orderFilter === 'active'
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  <span>⏳ Sedang Diproses ({activeQueuesCount})</span>
                </button>

                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    orderFilter === 'all'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  Semua ({orders.length})
                </button>

                <button
                  onClick={() => setOrderFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                    orderFilter === 'completed'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  Selesai
                </button>
              </div>

              {/* Action: Buat Pesanan Baru button */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 sm:w-48">
                  <input
                    type="text"
                    placeholder="Cari ID / Meja / Nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 pl-8 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-1.5 text-stone-500 text-xs">🔍</span>
                </div>

                <button
                  onClick={() => setActiveTab('new_order')}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3.5 py-1.5 rounded-xl text-xs shadow flex items-center space-x-1 whitespace-nowrap"
                >
                  <span>➕</span>
                  <span>Input Pesanan Baru</span>
                </button>
              </div>
            </div>

            {/* Orders Cards Grid */}
            {filteredOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-stone-500 text-center">
                <span className="text-4xl mb-2">✨</span>
                <h4 className="font-bold text-sm text-stone-300">Tidak ada pesanan yang sesuai filter</h4>
                <p className="text-xs">Klik tombol "Input Pesanan Baru" jika ada pelanggan datang ke kasir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => {
                  const isUnpaid = order.paymentStatus === 'pending';

                  return (
                    <div
                      key={order.id}
                      className={`bg-stone-900 rounded-3xl border p-4 flex flex-col justify-between shadow-xl transition ${
                        isUnpaid
                          ? 'border-red-500/80 ring-2 ring-red-500/20'
                          : 'border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
                          <div>
                            <span className="text-xs font-bold text-amber-400">{order.id}</span>
                            <h3 className="font-black text-base text-white">
                              {order.type === 'dine_in' ? `MEJA ${order.tableNumber}` : '🥡 TAKEAWAY'}
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              isUnpaid
                                ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}>
                              {isUnpaid ? 'BELUM BAYAR (KASIR)' : `LUNAS (${order.paymentMethod.toUpperCase()})`}
                            </span>
                            <span className="block text-[10px] text-stone-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                          </div>
                        </div>

                        {/* Customer & Items Details */}
                        <div className="space-y-1.5 text-xs text-stone-300">
                          <p className="text-stone-400 text-[11px]">
                            Pemesan: <span className="font-semibold text-stone-200">{order.customerName}</span>
                          </p>

                          <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-800 space-y-1 max-h-36 overflow-y-auto">
                            {(order.items || []).map((it, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <div>
                                  <span className="font-bold">{it.quantity}x {it.name}</span>
                                  {it.addedBy && <span className="text-[10px] text-purple-300 ml-1">({it.addedBy})</span>}
                                </div>
                                <span className="font-semibold text-amber-400">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2 font-black text-sm">
                            <span className="text-stone-400">Total Tagihan:</span>
                            <span className="text-base text-amber-400">Rp {order.total.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cashier Actions */}
                      <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
                        {isUnpaid && (
                          <button
                            onClick={() => store.markOrderAsPaid(order.id)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
                          >
                            <span>💵</span>
                            <span>Terima Pembayaran Tunai (Tandai Lunas)</span>
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => onOpenReceipt(order)}
                            className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2 rounded-xl text-xs border border-stone-700 transition flex items-center justify-center space-x-1"
                          >
                            <span>🧾</span>
                            <span>Cetak Struk</span>
                          </button>

                          {order.orderStatus !== 'completed' && (
                            <button
                              onClick={() => store.updateOrderStatus(order.id, 'completed')}
                              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
                              title="Tandai pesanan selesai dinikmati"
                            >
                              Selesai ✓
                            </button>
                          )}

                          {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm(`Batalkan pesanan ${order.id}?`)) store.updateOrderStatus(order.id, 'cancelled');
                              }}
                              className="bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-2 rounded-xl text-xs font-bold"
                              title="Batalkan pesanan"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INPUT PESANAN BARU UNTUK PELANGGAN (POS TERMINAL KASIR) */}
        {activeTab === 'new_order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left 2 Cols: Menu Selection */}
            <div className="lg:col-span-2 space-y-4">
              {/* Table / Customer Info Bar */}
              <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>➕ Buat Pesanan untuk Pelanggan</span>
                  </h3>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Mode POS Kasir
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Tipe Pesanan:</label>
                    <select
                      value={posOrderType}
                      onChange={(e) => setPosOrderType(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-2 font-bold"
                    >
                      <option value="dine_in">🍽️ Makan di Meja (Dine-in)</option>
                      <option value="takeaway">🥡 Takeaway (Bungkus)</option>
                    </select>
                  </div>

                  {posOrderType === 'dine_in' ? (
                    <div>
                      <label className="block text-stone-400 font-bold mb-1">Pilih Nomor Meja:</label>
                      <select
                        value={posTable}
                        onChange={(e) => setPosTable(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 text-amber-400 font-black rounded-xl p-2"
                      >
                        {tables.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.status === 'available' ? 'Kosong' : 'Terisi'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-stone-400 font-bold mb-1">No. WhatsApp Pelanggan:</label>
                      <input
                        type="tel"
                        value={posCustomerPhone}
                        onChange={(e) => setPosCustomerPhone(e.target.value)}
                        placeholder="0812xxxx"
                        className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-stone-400 font-bold mb-1">Nama Pelanggan:</label>
                    <input
                      type="text"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      placeholder="Contoh: Mas Budi, Rian"
                      className="w-full bg-stone-950 border border-stone-700 text-stone-100 rounded-xl p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Menu Categories & Search */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cari menu untuk pelanggan..."
                      value={posMenuSearch}
                      onChange={(e) => setPosMenuSearch(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 pl-9 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                    />
                    <span className="absolute left-3 top-2 text-stone-500 text-xs">🔍</span>
                  </div>

                  {/* Categories */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'indomie', label: 'Indomie' },
                      { id: 'minuman', label: 'Minuman' },
                      { id: 'pancong', label: 'Pancong' },
                      { id: 'gorengan', label: 'Gorengan' },
                      { id: 'makanan', label: 'Makanan' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPosMenuCategory(c.id)}
                        className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                          posMenuCategory === c.id
                            ? 'bg-amber-500 text-stone-950 font-bold shadow'
                            : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredPosMenu.map(item => {
                    const availability = store.isMenuItemAvailable(item);
                    const isAvailable = availability.available;

                    return (
                      <div
                        key={item.id}
                        onClick={() => isAvailable && handleStartPosCustomize(item)}
                        className={`bg-stone-900 rounded-2xl border border-stone-800 p-3 flex flex-col justify-between transition cursor-pointer hover:border-amber-500/60 shadow-md ${
                          !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div>
                          <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-xl mb-2 bg-stone-800" />
                          <h4 className="font-bold text-xs text-stone-100 line-clamp-1">{item.name}</h4>
                          <span className="font-black text-amber-400 text-xs">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="mt-2">
                          <button
                            type="button"
                            disabled={!isAvailable}
                            className={`w-full py-1 rounded-lg text-[10px] font-bold ${
                              isAvailable ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-stone-950' : 'bg-red-950 text-red-400'
                            }`}
                          >
                            {isAvailable ? '➕ Tambah' : 'Stok Habis'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: POS Cart & Payment Panel */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="font-black text-sm text-white flex items-center space-x-2">
                    <span>🛒 Rincian Tagihan</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-bold">{posCartCount} item</span>
                </div>

                {/* Items in Cart */}
                <div className="space-y-2 mt-3 max-h-60 overflow-y-auto pr-1">
                  {posCart.length === 0 ? (
                    <div className="py-8 text-center text-stone-500 text-xs">
                      Pilih menu di sebelah kiri untuk memasukkan pesanan pelanggan.
                    </div>
                  ) : (
                    posCart.map(item => (
                      <div key={item.id} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs space-y-1">
                        <div className="flex justify-between items-start font-bold">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-amber-400">x{item.quantity}</span>
                            <span className="text-stone-200 line-clamp-1">{item.name}</span>
                          </div>
                          <span className="text-amber-400">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                        </div>

                        {/* Customization Details */}
                        <div className="flex flex-wrap gap-1 text-[9px] text-stone-400">
                          {item.customization.doneness && <span className="bg-stone-800 px-1 rounded">{item.customization.doneness}</span>}
                          {item.customization.spiciness && <span className="bg-red-950 text-red-300 px-1 rounded">{item.customization.spiciness}</span>}
                          {item.customization.temperature && <span className="bg-sky-950 text-sky-300 px-1 rounded">{item.customization.temperature}</span>}
                          {item.customization.toppings && item.customization.toppings.map(t => (
                            <span key={t.id} className="bg-amber-950 text-amber-300 px-1 rounded">+{t.name}</span>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setPosCart(prev => prev.filter(i => i.id !== item.id))}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-stone-800 pt-3 space-y-3">
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-stone-400">Total Tagihan:</span>
                  <span className="text-xl text-amber-400">Rp {posCartTotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Payment Option Selector */}
                <div className="space-y-1.5 text-xs">
                  <label className="block text-stone-400 font-bold text-[11px]">Metode Pembayaran:</label>
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPosPaymentMethod('cash_paid')}
                      className={`p-2 rounded-xl border transition ${
                        posPaymentMethod === 'cash_paid' ? 'bg-emerald-500 text-stone-950 border-emerald-400 font-black' : 'bg-stone-950 text-stone-400 border-stone-800'
                      }`}
                    >
                      💵 Tunai (Lunas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosPaymentMethod('qris')}
                      className={`p-2 rounded-xl border transition ${
                        posPaymentMethod === 'qris' ? 'bg-sky-500 text-stone-950 border-sky-400 font-black' : 'bg-stone-950 text-stone-400 border-stone-800'
                      }`}
                    >
                      📱 QRIS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosPaymentMethod('pending')}
                      className={`p-2 rounded-xl border transition ${
                        posPaymentMethod === 'pending' ? 'bg-amber-500 text-stone-950 border-amber-400 font-black' : 'bg-stone-950 text-stone-400 border-stone-800'
                      }`}
                    >
                      ⏳ Bayar Nanti
                    </button>
                  </div>
                </div>

                {/* Cash Calculation if Cash Paid */}
                {posPaymentMethod === 'cash_paid' && posCartTotal > 0 && (
                  <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Uang Diterima:</span>
                      <input
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        placeholder="Rp 0"
                        className="w-32 bg-stone-900 border border-stone-700 text-right px-2 py-1 rounded-lg text-amber-400 font-bold"
                      />
                    </div>

                    {/* Quick nominal buttons */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCashReceived(posCartTotal)}
                        className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-1 rounded-lg text-[10px] font-bold"
                      >
                        Uang Pas
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(50000)}
                        className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-1 rounded-lg text-[10px] font-bold"
                      >
                        50rb
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(100000)}
                        className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-1 rounded-lg text-[10px] font-bold"
                      >
                        100rb
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-stone-800 font-bold">
                      <span className="text-stone-400">Kembalian:</span>
                      <span className="text-sm font-black text-emerald-400">
                        Rp {cashChange.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Order Button */}
                <button
                  type="button"
                  disabled={posCart.length === 0}
                  onClick={handleSubmitPosOrder}
                  className={`w-full py-3 rounded-2xl font-black text-xs shadow-xl transition flex items-center justify-center space-x-2 ${
                    posCart.length > 0
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <span>🚀 Proses Pesanan & Kirim ke Dapur</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DENAH MEJA */}
        {activeTab === 'tables' && (
          <div className="animate-fade-in">
            <window.WarkopTableManager store={store} storeState={storeState} />
          </div>
        )}
      </main>

      {/* POS ITEM CUSTOMIZATION MODAL */}
      {posCustomizingItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white">{posCustomizingItem.name}</h3>
                <span className="text-amber-400 font-bold text-xs">Rp {posCustomizingItem.price.toLocaleString('id-ID')}</span>
              </div>
              <button onClick={() => setPosCustomizingItem(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Kematangan */}
              {posCustomizingItem.availableDoneness && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">🍜 Tingkat Kematangan:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {posCustomizingItem.availableDoneness.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPosCustomForm({ ...posCustomForm, doneness: d })}
                        className={`p-1.5 rounded-lg border text-center font-medium ${
                          posCustomForm.doneness === d ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-stone-800/60 border-stone-700 text-stone-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pedas */}
              {posCustomizingItem.availableSpiciness && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">🌶️ Level Pedas:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {posCustomizingItem.availableSpiciness.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPosCustomForm({ ...posCustomForm, spiciness: s })}
                        className={`p-1.5 rounded-lg border text-center font-medium ${
                          posCustomForm.spiciness === s ? 'bg-red-500/20 border-red-500 text-red-300 font-bold' : 'bg-stone-800/60 border-stone-700 text-stone-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suhu / Minuman */}
              {posCustomizingItem.availableTemperature && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">🧊 Suhu Minuman:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {posCustomizingItem.availableTemperature.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPosCustomForm({ ...posCustomForm, temperature: t })}
                        className={`p-1.5 rounded-lg border text-center font-medium ${
                          posCustomForm.temperature === t ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold' : 'bg-stone-800/60 border-stone-700 text-stone-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {posCustomizingItem.allowedToppings && (
                <div>
                  <label className="block font-bold text-stone-300 mb-1">🍳 Tambah Topping:</label>
                  <div className="space-y-1">
                    {window.WARKOP_TOPPINGS.filter(t => posCustomizingItem.allowedToppings.includes(t.id)).map(top => {
                      const isAvailable = store.isToppingAvailable(top);
                      const isSelected = posCustomForm.selectedToppings.some(t => t.id === top.id);

                      return (
                        <div
                          key={top.id}
                          onClick={() => isAvailable && handleTogglePosTopping(top)}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                            !isAvailable ? 'opacity-40 cursor-not-allowed' : isSelected ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 'bg-stone-800/60 border-stone-700'
                          }`}
                        >
                          <span>{top.name}</span>
                          <span className="font-bold text-amber-400">+Rp {top.price.toLocaleString('id-ID')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-300 mb-1">📝 Catatan Pelanggan:</label>
                <input
                  type="text"
                  value={posCustomForm.notes}
                  onChange={(e) => setPosCustomForm({ ...posCustomForm, notes: e.target.value })}
                  placeholder="Misal: jangan pakai micin, kuah banyak"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2 text-stone-100"
                />
              </div>

              {/* Quantity */}
              <div className="flex justify-between items-center pt-2 border-t border-stone-800">
                <span className="font-bold text-stone-300">Jumlah:</span>
                <div className="flex items-center space-x-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setPosCustomForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="w-6 h-6 rounded bg-stone-800 text-stone-300 font-bold"
                  >-</button>
                  <span className="font-black text-amber-400 px-2">{posCustomForm.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setPosCustomForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="w-6 h-6 rounded bg-stone-800 text-stone-300 font-bold"
                  >+</button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPosCustomizingItem(null)}
                className="bg-stone-800 text-stone-300 px-4 py-2 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddPosCart}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2 rounded-xl font-black text-xs shadow"
              >
                Tambahkan ke Tagihan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
