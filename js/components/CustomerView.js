/**
 * Customer Self-Order Component
 * Handles Table QR scanning, Menu Browsing, Customizations,
 * Cart Management, Dine-in Meja, and Group Order activation.
 */

window.WarkopCustomerView = function CustomerView({
  store,
  storeState,
  activeTable,
  setActiveTable,
  openGroupOrderModal,
  openPaymentModal,
  activeOrderToTrack,
  setActiveOrderToTrack
}) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [customizingItem, setCustomizingItem] = React.useState(null);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [cart, setCart] = React.useState([]);

  // Customization modal local form state
  const [customForm, setCustomForm] = React.useState({
    quantity: 1,
    doneness: '',
    spiciness: '',
    temperature: '',
    sweetness: '',
    pancongDoneness: '',
    selectedToppings: [],
    notes: '',
    addedBy: 'Saya'
  });

  // Group session for current table if any
  const groupSession = store.getGroupSession(activeTable);
  const isGroupActive = Boolean(groupSession && groupSession.status === 'active');

  // Categories config
  const categories = [
    { id: 'all', label: 'Semua Menu', icon: '🍽️' },
    { id: 'indomie', label: 'Mi Instan (Indomie)', icon: '🍜' },
    { id: 'minuman', label: 'Kopi & Minuman', icon: '☕' },
    { id: 'pancong', label: 'Pancong & Roti', icon: '🥞' },
    { id: 'gorengan', label: 'Gorengan', icon: '🥟' },
    { id: 'makanan', label: 'Makanan Berat', icon: '🍛' }
  ];

  // Filtered menu
  const filteredMenu = (storeState.menu || []).filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open item customizer
  const handleStartCustomize = (item) => {
    const availability = store.isMenuItemAvailable(item);
    if (!availability.available) return;

    setCustomizingItem(item);
    setCustomForm({
      quantity: 1,
      doneness: item.availableDoneness ? item.availableDoneness[0] : '',
      spiciness: item.availableSpiciness ? item.availableSpiciness[1] || item.availableSpiciness[0] : '',
      temperature: item.availableTemperature ? item.availableTemperature[0] : '',
      sweetness: item.availableSweetness ? item.availableSweetness[0] : '',
      pancongDoneness: item.availablePancongDoneness ? item.availablePancongDoneness[0] : '',
      selectedToppings: [],
      notes: '',
      addedBy: isGroupActive ? (localStorage.getItem('warkop_my_name') || 'Saya') : 'Saya'
    });
  };

  const toggleTopping = (topping) => {
    const exists = customForm.selectedToppings.some(t => t.id === topping.id);
    if (exists) {
      setCustomForm(prev => ({
        ...prev,
        selectedToppings: prev.selectedToppings.filter(t => t.id !== topping.id)
      }));
    } else {
      setCustomForm(prev => ({
        ...prev,
        selectedToppings: [...prev.selectedToppings, topping]
      }));
    }
  };

  // Calculate current customized unit price
  const calculateModalItemPrice = () => {
    if (!customizingItem) return 0;
    const toppingsTotal = customForm.selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);
    return (customizingItem.price + toppingsTotal) * customForm.quantity;
  };

  // Add customized item to Cart or Group Cart
  const handleAddToCart = () => {
    if (!customizingItem) return;

    const toppingsTotal = customForm.selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);
    const unitPrice = customizingItem.price + toppingsTotal;
    const subtotal = unitPrice * customForm.quantity;

    const newItem = {
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      menuId: customizingItem.id,
      name: customizingItem.name,
      basePrice: customizingItem.price,
      quantity: customForm.quantity,
      subtotal: subtotal,
      customization: {
        doneness: customForm.doneness,
        spiciness: customForm.spiciness,
        temperature: customForm.temperature,
        sweetness: customForm.sweetness,
        pancongDoneness: customForm.pancongDoneness,
        toppings: customForm.selectedToppings,
        notes: customForm.notes.trim()
      },
      addedBy: customForm.addedBy
    };

    if (isGroupActive) {
      store.addItemToGroupSession(activeTable, newItem);
    } else {
      setCart(prev => [...prev, newItem]);
    }

    setCustomizingItem(null);
    setIsCartOpen(true);
  };

  const removeCartItem = (itemId) => {
    if (isGroupActive) {
      store.removeItemFromGroupSession(activeTable, itemId);
    } else {
      setCart(prev => prev.filter(i => i.id !== itemId));
    }
  };

  // Active items in cart
  const activeCartItems = isGroupActive ? (groupSession.items || []) : cart;
  const cartTotal = activeCartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = activeCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Group bill split breakdown by member
  const memberSplits = React.useMemo(() => {
    if (!isGroupActive) return {};
    const splits = {};
    activeCartItems.forEach(item => {
      const member = item.addedBy || 'Anonim';
      splits[member] = (splits[member] || 0) + item.subtotal;
    });
    return splits;
  }, [activeCartItems, isGroupActive]);

  // Handle Checkout
  const handleProceedToPayment = () => {
    if (activeCartItems.length === 0) return;

    const orderPayload = {
      type: 'dine_in',
      tableNumber: activeTable,
      customerName: isGroupActive ? `${groupSession.hostName} & Kawan-kawan (${groupSession.members.length} Orang)` : `Meja ${activeTable}`,
      customerPhone: '',
      isGroupOrder: isGroupActive,
      groupSessionId: isGroupActive ? groupSession.id : null,
      items: activeCartItems,
      subtotal: cartTotal,
      total: cartTotal,
      estimatedWaitMinutes: 10 + Math.min(15, activeCartItems.length * 2)
    };

    openPaymentModal(orderPayload, () => {
      if (isGroupActive) {
        store.clearGroupSession(activeTable);
      } else {
        setCart([]);
      }
      setIsCartOpen(false);
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28">
      {/* Top Banner: Table Selector & Group Order */}
      <div className="bg-stone-900 border-b border-stone-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Table Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-400 font-medium">Nomor Meja:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-amber-400 font-bold text-xs rounded-xl px-3 py-1.5 focus:ring-amber-500 focus:outline-none"
              >
                {(storeState.tables || []).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status === 'available' ? 'Tersedia' : 'Terisi'})
                  </option>
                ))}
              </select>
            </div>

            {/* Group Order Trigger */}
            <button
              onClick={openGroupOrderModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isGroupActive
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md animate-pulse'
                  : 'bg-stone-800 hover:bg-stone-700 text-purple-300 border-purple-500/30'
              }`}
            >
              <span>👥</span>
              <span>{isGroupActive ? `Pesan Bareng (${groupSession.members.length})` : 'Pesan Bareng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-4">
        {/* Active Group Order Notification Bar */}
        {isGroupActive && (
          <div className="mb-4 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-600/50 rounded-xl p-3 shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤝</span>
              <div>
                <h4 className="text-sm font-bold text-purple-200">
                  Mode Pesan Bareng Aktif (Meja {activeTable})
                </h4>
                <p className="text-xs text-purple-300/80">
                  Anggota: <span className="font-semibold text-white">{groupSession.members.join(', ')}</span>
                </p>
              </div>
            </div>
            <button
              onClick={openGroupOrderModal}
              className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg shadow"
            >
              Lihat QR & Anggota
            </button>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Indomie, Kopi Susu, Pancong Lumer, atau Gorengan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
            <span className="absolute left-3.5 top-3 text-stone-500 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 text-xs hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs Scrollable */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-950/40'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map(item => {
            const availability = store.isMenuItemAvailable(item);
            const isAvailable = availability.available;

            return (
              <div
                key={item.id}
                className={`bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden flex flex-col justify-between transition transform hover:-translate-y-0.5 shadow-md ${
                  !isAvailable ? 'opacity-65 grayscale-[30%]' : ''
                }`}
              >
                <div>
                  {/* Food Image & Badge */}
                  <div className="relative h-44 w-full bg-stone-800 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    {item.isPopular && (
                      <span className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow">
                        ⭐ Favorit Warkop
                      </span>
                    )}

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-xl mb-1">🔒</span>
                        <span className="bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow">
                          STOK HABIS
                        </span>
                        <span className="text-[11px] text-red-200 mt-1 font-medium">
                          Bahan habis: {availability.missingIngredients.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-stone-100 text-base leading-snug">
                        {item.name}
                      </h3>
                      <span className="font-black text-amber-400 text-sm whitespace-nowrap">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0">
                  <button
                    disabled={!isAvailable}
                    onClick={() => handleStartCustomize(item)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      isAvailable
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-950/50'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
                    }`}
                  >
                    <span>{isAvailable ? '➕ Kustomisasi & Pesan' : 'Stok Belum Tersedia'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-amber-300/40 transform active:scale-95 transition"
          >
            <div className="flex items-center space-x-2.5">
              <span className="bg-stone-950 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold">
                {cartItemCount} item
              </span>
              <span className="text-sm font-bold">
                {isGroupActive ? 'Keranjang Bersama' : 'Keranjang Meja ' + activeTable}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black">Rp {cartTotal.toLocaleString('id-ID')}</span>
              <span className="text-lg">➔</span>
            </div>
          </button>
        </div>
      )}

      {/* ITEM CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div>
                <h3 className="font-bold text-base text-stone-100">{customizingItem.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">Rp {customizingItem.price.toLocaleString('id-ID')}</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Group Order: Member Name identifier */}
              {isGroupActive && (
                <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3">
                  <label className="block text-purple-200 font-bold mb-1">
                    👤 Pemesan Item Ini (Nama Anda):
                  </label>
                  <input
                    type="text"
                    value={customForm.addedBy}
                    onChange={(e) => setCustomForm({ ...customForm, addedBy: e.target.value })}
                    placeholder="Contoh: Budi, Dimas, Rian"
                    className="w-full bg-stone-900 border border-purple-500/40 rounded-lg px-3 py-1.5 text-stone-100 font-semibold focus:outline-none"
                  />
                </div>
              )}

              {/* Indomie Kematangan Option */}
              {customizingItem.availableDoneness && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🍜 Tingkat Kematangan Mi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {customizingItem.availableDoneness.map(done => (
                      <button
                        key={done}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, doneness: done })}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          customForm.doneness === done
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                        }`}
                      >
                        {done}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Indomie Level Pedas Option */}
              {customizingItem.availableSpiciness && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🌶️ Level Pedas Cabe Rawit:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customizingItem.availableSpiciness.map(spicy => (
                      <button
                        key={spicy}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, spiciness: spicy })}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          customForm.spiciness === spicy
                            ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                        }`}
                      >
                        {spicy}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pancong Kematangan Option */}
              {customizingItem.availablePancongDoneness && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🥞 Tingkat Lumer Pancong:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {customizingItem.availablePancongDoneness.map(done => (
                      <button
                        key={done}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, pancongDoneness: done })}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          customForm.pancongDoneness === done
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                        }`}
                      >
                        {done}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Minuman Suhu & Kemanisan Option */}
              {customizingItem.availableTemperature && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🧊 Pilihan Suhu / Es:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.availableTemperature.map(temp => (
                      <button
                        key={temp}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, temperature: temp })}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          customForm.temperature === temp
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                        }`}
                      >
                        {temp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customizingItem.availableSweetness && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🍯 Tingkat Kemanisan:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customizingItem.availableSweetness.map(sweet => (
                      <button
                        key={sweet}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, sweetness: sweet })}
                        className={`p-2 rounded-xl border text-center transition font-medium ${
                          customForm.sweetness === sweet
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-stone-800/60 border-stone-700/60 text-stone-300'
                        }`}
                      >
                        {sweet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Toppings */}
              {customizingItem.allowedToppings && (
                <div>
                  <label className="block font-bold text-stone-200 mb-2">
                    🍳 Tambah Topping Gurih:
                  </label>
                  <div className="space-y-1.5">
                    {window.WARKOP_TOPPINGS.filter(t => customizingItem.allowedToppings.includes(t.id)).map(topping => {
                      const isAvailable = store.isToppingAvailable(topping);
                      const isSelected = customForm.selectedToppings.some(t => t.id === topping.id);

                      return (
                        <div
                          key={topping.id}
                          onClick={() => isAvailable && toggleTopping(topping)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                            !isAvailable
                              ? 'bg-stone-900/40 border-stone-800 text-stone-500 cursor-not-allowed'
                              : isSelected
                              ? 'bg-amber-500/10 border-amber-500/70 text-amber-200'
                              : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isAvailable}
                              onChange={() => {}}
                              className="rounded text-amber-500 focus:ring-amber-500"
                            />
                            <span>{topping.name}</span>
                          </div>
                          <span className="font-bold text-amber-400">
                            +Rp {topping.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Catatan Khusus */}
              <div>
                <label className="block font-bold text-stone-200 mb-1">
                  📝 Catatan Khusus Dapur:
                </label>
                <textarea
                  rows="2"
                  value={customForm.notes}
                  onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
                  placeholder="Misal: jangan pakai micin, kuah dipisah, kopi jangan terlalu pahit..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <span className="font-bold text-stone-200 text-sm">Jumlah Pesanan:</span>
                <div className="flex items-center space-x-3 bg-stone-950 border border-stone-800 px-3 py-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCustomForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 font-bold hover:bg-stone-700"
                  >
                    -
                  </button>
                  <span className="font-black text-sm text-amber-400 w-6 text-center">
                    {customForm.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 font-bold hover:bg-stone-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block">Total Item Ini:</span>
                <span className="text-base font-black text-amber-400">
                  Rp {calculateModalItemPrice().toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2.5 rounded-xl shadow-lg transition"
              >
                {isGroupActive ? '➕ Tambah ke Pesanan Bareng' : '➕ Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER / MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="bg-stone-900 border-l border-stone-800 w-full max-w-md h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🛒</span>
                <div>
                  <h3 className="font-bold text-sm text-stone-100">
                    {isGroupActive ? `Pesanan Bersama (Meja ${activeTable})` : `Keranjang Meja ${activeTable}`}
                  </h3>
                  <p className="text-[11px] text-amber-400">
                    Makan di Tempat (Dine-in)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeCartItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-stone-500 text-center">
                  <span className="text-4xl mb-2">🍜</span>
                  <p className="text-sm font-semibold">Keranjang masih kosong</p>
                  <p className="text-xs">Pilih menu warkop favoritmu dan kustomisasi sesuai selera!</p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  {activeCartItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-stone-950 border border-stone-800/80 rounded-xl p-3 text-xs space-y-1.5 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-stone-100 text-sm">{item.name}</span>
                            {item.quantity > 1 && (
                              <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded text-[10px]">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                          {isGroupActive && (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                              👤 Dipesan oleh: {item.addedBy}
                            </span>
                          )}
                        </div>
                        <span className="font-black text-amber-400 text-sm whitespace-nowrap">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Customization Details Badges */}
                      <div className="flex flex-wrap gap-1 text-[10px] text-stone-400">
                        {item.customization.doneness && (
                          <span className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                            {item.customization.doneness}
                          </span>
                        )}
                        {item.customization.spiciness && (
                          <span className="bg-red-950 text-red-300 px-1.5 py-0.5 rounded">
                            {item.customization.spiciness}
                          </span>
                        )}
                        {item.customization.temperature && (
                          <span className="bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded">
                            {item.customization.temperature}
                          </span>
                        )}
                        {item.customization.sweetness && (
                          <span className="bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded">
                            {item.customization.sweetness}
                          </span>
                        )}
                        {item.customization.toppings && item.customization.toppings.map(t => (
                          <span key={t.id} className="bg-amber-900/40 text-amber-200 px-1.5 py-0.5 rounded border border-amber-700/30">
                            +{t.name}
                          </span>
                        ))}
                      </div>

                      {item.customization.notes && (
                        <p className="text-[11px] text-amber-300/80 italic">
                          "{item.customization.notes}"
                        </p>
                      )}

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-[11px] font-semibold"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Group Split Bill Preview */}
                  {isGroupActive && Object.keys(memberSplits).length > 1 && (
                    <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs space-y-1.5 mt-3">
                      <span className="font-bold text-purple-300 block">📊 Rincian Patungan (Split Bill Meja):</span>
                      {Object.entries(memberSplits).map(([member, total]) => (
                        <div key={member} className="flex justify-between text-stone-300">
                          <span>• {member}</span>
                          <span className="font-semibold text-amber-400">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Checkout */}
            {activeCartItems.length > 0 && (
              <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400 font-medium">Total Tagihan Meja {activeTable}:</span>
                  <span className="text-xl font-black text-amber-400">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black py-3 rounded-xl shadow-lg transition text-sm flex items-center justify-center space-x-2"
                >
                  <span>💳 Bayar Sekarang</span>
                  <span>➔</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
