/**
 * Kitchen Display System (KDS) & Waiter Operational Dashboard
 * Real-time kitchen queue, audio alarms, customization tags, and WhatsApp notification integration
 * Note: Dapur hanya melihat apa yang dipesan untuk meja & TIDAK BISA memesan makanan.
 */

window.WarkopKitchenView = function KitchenView({
  store,
  storeState
}) {
  const [activeTab, setActiveTab] = React.useState('active'); // 'active' | 'history'

  const orders = storeState.orders || [];

  // Filter active vs history
  const activeOrders = orders.filter(o => o.orderStatus === 'received' || o.orderStatus === 'cooking' || o.orderStatus === 'ready');
  const completedOrders = orders.filter(o => o.orderStatus === 'completed' || o.orderStatus === 'cancelled');

  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  // Calculate elapsed minutes
  const getElapsedMinutes = (isoString) => {
    if (!isoString) return 0;
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.floor(diffMs / 60000);
  };

  // Generate formatted WhatsApp message text
  const generateWhatsAppMessage = (order) => {
    let text = `🛎️ *PESANAN DAPUR WARKOP [${order.id}]*\n`;
    text += `📍 Lokasi: *MEJA ${order.tableNumber || '-'}*\n`;
    text += `👤 Pemesan: ${order.customerName}\n`;
    text += `⏰ Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB\n`;
    text += `------------------------------------\n`;

    (order.items || []).forEach((it) => {
      text += `*${it.quantity}x ${it.name}*\n`;
      const cust = it.customization || {};
      if (cust.doneness) text += `   • Kematangan: ${cust.doneness}\n`;
      if (cust.spiciness) text += `   • Pedas: ${cust.spiciness}\n`;
      if (cust.temperature) text += `   • Suhu: ${cust.temperature}\n`;
      if (cust.sweetness) text += `   • Manis: ${cust.sweetness}\n`;
      if (cust.pancongDoneness) text += `   • Pancong: ${cust.pancongDoneness}\n`;
      if (cust.toppings && cust.toppings.length > 0) {
        text += `   • Topping: ${cust.toppings.map(t => t.name).join(', ')}\n`;
      }
      if (cust.notes) text += `   • Catatan: "${cust.notes}"\n`;
      if (it.addedBy) text += `   (oleh: ${it.addedBy})\n`;
    });

    text += `------------------------------------\n`;
    text += `💰 *TOTAL: Rp ${order.total.toLocaleString('id-ID')}*\n`;
    const payMethodName = order.paymentMethod === 'cash' ? 'TUNAI' : 'QRIS';
    text += `💳 Status Bayar: ${order.paymentStatus === 'paid' ? `LUNAS (${payMethodName})` : 'BELUM BAYAR (Kasir)'}\n`;
    text += `\n_Mohon segera dimasak & disajikan ke MEJA ${order.tableNumber}!_ ☕`;

    return encodeURIComponent(text);
  };

  // Advance order status
  const handleAdvanceStatus = (order) => {
    if (order.orderStatus === 'received') {
      store.updateOrderStatus(order.id, 'cooking');
    } else if (order.orderStatus === 'cooking') {
      store.updateOrderStatus(order.id, 'ready');
    } else if (order.orderStatus === 'ready') {
      store.updateOrderStatus(order.id, 'completed');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20">
      {/* Top KDS Control Header */}
      <div className="bg-stone-900 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center text-xl font-black shadow-md">
              🍳
            </div>
            <div>
              <h2 className="font-black text-lg text-white flex items-center space-x-2">
                <span>Kitchen Display System (Layar Antrean Dapur)</span>
                <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {activeOrders.length} Antrean
                </span>
              </h2>
              <p className="text-xs text-stone-400">Khusus Koki & Barista: Lihat apa yang dipesan pelanggan meja</p>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Sound alert test */}
            <button
              onClick={() => store.playKitchenAlert()}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-xl border border-stone-700 font-semibold flex items-center space-x-1.5"
            >
              <span>🔔</span>
              <span>Tes Bel Dapur</span>
            </button>

            {/* View Mode: Active vs History */}
            <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'active' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                }`}
              >
                Antrean Aktif ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'history' ? 'bg-stone-800 text-white' : 'text-stone-400'
                }`}
              >
                Riwayat Selesai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main KDS Grid */}
      <main className="max-w-7xl mx-auto px-4 pt-4">
        {displayedOrders.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-stone-500 text-center">
            <span className="text-5xl mb-2">✨</span>
            <h4 className="font-bold text-base text-stone-300">Tidak ada antrean pesanan</h4>
            <p className="text-xs">Semua makanan warkop sudah matang atau belum ada pelanggan memesan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders.map(order => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsed >= 15;
              const isWarning = elapsed >= 8 && elapsed < 15;

              // Border and banner color based on state
              let headerBg = 'bg-stone-800';
              let statusLabel = 'Pesanan Baru Masuk';
              let nextActionLabel = '🍳 Mulai Masak';
              let nextActionColor = 'bg-amber-500 text-stone-950 hover:bg-amber-400';

              if (order.orderStatus === 'cooking') {
                headerBg = 'bg-blue-900/80';
                statusLabel = 'Sedang Dimasak';
                nextActionLabel = '🛎️ Siap Saji / Antar';
                nextActionColor = 'bg-sky-500 text-stone-950 hover:bg-sky-400';
              } else if (order.orderStatus === 'ready') {
                headerBg = 'bg-emerald-900/80';
                statusLabel = 'Siap Diantar ke Meja!';
                nextActionLabel = '✅ Selesai Diantar';
                nextActionColor = 'bg-emerald-500 text-stone-950 hover:bg-emerald-400';
              } else if (order.orderStatus === 'completed') {
                headerBg = 'bg-stone-850';
                statusLabel = 'Selesai';
              }

              const isPaid = order.paymentStatus === 'paid';
              const payMethodDisplay = order.paymentMethod === 'cash' ? 'TUNAI' : 'QRIS';

              return (
                <div
                  key={order.id}
                  className={`bg-stone-900 rounded-3xl border overflow-hidden flex flex-col justify-between shadow-xl transition relative ${
                    isUrgent && order.orderStatus !== 'completed'
                      ? 'border-red-500/80 ring-2 ring-red-500/30'
                      : 'border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className={`${headerBg} p-4 border-b border-stone-800/80 flex items-center justify-between`}>
                      <div>
                        <span className="text-2xl font-black text-amber-400">
                          MEJA {order.tableNumber || '-'}
                        </span>
                        <span className="text-[10px] text-stone-400 block">{order.id}</span>
                      </div>

                      {/* Elapsed timer badge */}
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                        isUrgent
                          ? 'bg-red-500 text-white animate-pulse'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-stone-950 text-stone-300'
                      }`}>
                        <span>⏱️</span>
                        <span>{elapsed} mnt lalu</span>
                      </div>
                    </div>

                    {/* Order Metadata Sub-bar */}
                    <div className="bg-stone-950/70 px-4 py-2 border-b border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                      <div>
                        <span>Pemesan: <span className="font-semibold text-stone-200">{order.customerName}</span></span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        isPaid ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        {isPaid ? `LUNAS (${payMethodDisplay})` : 'BELUM BAYAR (KASIR)'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="px-4 py-2 bg-stone-900 border-b border-stone-800/40 flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>Status: {statusLabel}</span>
                      {order.isGroupOrder && (
                        <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800/50">
                          👥 Group Order
                        </span>
                      )}
                    </div>

                    {/* Order Items List with High Contrast Customization Details */}
                    <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1.5 text-xs">
                          <div className="flex items-start justify-between font-black text-sm text-stone-100">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                                {item.quantity}x
                              </span>
                              <span>{item.name}</span>
                            </div>
                            {item.addedBy && (
                              <span className="text-[10px] text-purple-400 font-semibold">
                                ({item.addedBy})
                              </span>
                            )}
                          </div>

                          {/* Customization Tags */}
                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {item.customization.doneness && (
                              <span className="bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-800/40">
                                🍜 {item.customization.doneness}
                              </span>
                            )}
                            {item.customization.spiciness && (
                              <span className="bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded-md border border-red-800/40">
                                🌶️ {item.customization.spiciness}
                              </span>
                            )}
                            {item.customization.temperature && (
                              <span className="bg-sky-950 text-sky-300 font-bold px-2 py-0.5 rounded-md border border-sky-800/40">
                                🧊 {item.customization.temperature}
                              </span>
                            )}
                            {item.customization.sweetness && (
                              <span className="bg-stone-800 text-stone-200 font-medium px-2 py-0.5 rounded-md">
                                🍯 {item.customization.sweetness}
                              </span>
                            )}
                            {item.customization.pancongDoneness && (
                              <span className="bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-800/40">
                                🥞 {item.customization.pancongDoneness}
                              </span>
                            )}
                            {item.customization.toppings && item.customization.toppings.map(t => (
                              <span key={t.id} className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-800/40">
                                +{t.name}
                              </span>
                            ))}
                          </div>

                          {/* Notes */}
                          {item.customization.notes && (
                            <div className="bg-amber-500/10 border-l-2 border-amber-500 p-2 rounded text-amber-200 text-[11px] font-semibold">
                              ⚠️ Catatan: "{item.customization.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & WhatsApp Integration */}
                  <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-2">
                    {/* Advance Status Button */}
                    {order.orderStatus !== 'completed' ? (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 ${nextActionColor}`}
                      >
                        <span>{nextActionLabel}</span>
                      </button>
                    ) : (
                      <div className="text-center text-xs text-stone-500 font-bold py-1">
                        ✅ Pesanan Selesai Disajikan ke Meja
                      </div>
                    )}

                    {/* WhatsApp Notification Share Button */}
                    <a
                      href={`https://wa.me/?text=${generateWhatsAppMessage(order)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow"
                    >
                      <span>📲</span>
                      <span>Kirim Rincian ke WhatsApp Dapur</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
