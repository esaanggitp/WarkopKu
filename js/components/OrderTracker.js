/**
 * Order Tracking Component for Customers
 * Displays real-time live status updates of customer's active order
 */

window.WarkopOrderTracker = function OrderTracker({
  activeOrderId,
  storeState,
  onBackToMenu,
  onOpenReceipt
}) {
  const order = (storeState.orders || []).find(o => o.id === activeOrderId);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-stone-400">
        <span className="text-4xl mb-3">🔍</span>
        <h3 className="font-bold text-white text-base">Pesanan Tidak Ditemukan</h3>
        <p className="text-xs mb-4">Pesanan mungkin sudah selesai atau belum dibuat.</p>
        <button
          onClick={onBackToMenu}
          className="bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  // Stepper status definitions
  const steps = [
    { key: 'received', label: 'Pesanan Diterima', desc: 'Dapur telah mencatat pesanan Anda', icon: '📥' },
    { key: 'cooking', label: 'Sedang Dibuat', desc: 'Indomie & kopi sedang diracik dengan sepenuh hati', icon: '🍳' },
    { key: 'ready', label: order.type === 'dine_in' ? 'Siap Diantar ke Meja' : 'Siap Diambil di Meja Kasir', desc: 'Makanan sudah matang & siap dinikmati', icon: '🛎️' },
    { key: 'completed', label: 'Selesai', desc: 'Selamat menikmati nongkrong di Warkop!', icon: '✅' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'received': return 0;
      case 'cooking': return 1;
      case 'ready': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in pb-24">
      {/* Top Banner Status */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-3 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
          {steps[currentStepIdx].icon}
        </div>

        <div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            STATUS PESANAN {order.id}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {steps[currentStepIdx].label}
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {steps[currentStepIdx].desc}
          </p>
        </div>

        {/* Location & Payment Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="bg-stone-950 border border-stone-800 text-stone-300 px-3 py-1 rounded-full text-xs font-semibold">
            🍽️ Meja {order.tableNumber || '-'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            order.paymentStatus === 'paid'
              ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400'
              : 'bg-amber-950/80 border-amber-800/60 text-amber-400'
          }`}>
            {order.paymentStatus === 'paid' ? `● Lunas (${order.paymentMethod === 'cash' ? 'TUNAI' : 'QRIS'})` : '● Belum Bayar (Kasir)'}
          </span>
        </div>
      </div>

      {/* Realtime Stepper Visual */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg">
        <h4 className="font-bold text-xs text-stone-400 uppercase tracking-wider mb-4">
          Pelacakan Real-time
        </h4>
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.key} className="flex items-start space-x-3 relative">
                {/* Connecting Line */}
                {idx < steps.length - 1 && (
                  <div className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                    idx < currentStepIdx ? 'bg-amber-500' : 'bg-stone-800'
                  }`} style={{ height: 'calc(100% + 8px)' }}></div>
                )}

                {/* Step Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black z-10 transition ${
                  isDone
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950'
                    : isCurrent
                    ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/20 animate-pulse'
                    : 'bg-stone-800 text-stone-500'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>

                <div className="flex-1 pt-0.5">
                  <h5 className={`font-bold text-sm ${isCurrent ? 'text-amber-400' : isDone ? 'text-stone-200' : 'text-stone-500'}`}>
                    {step.label}
                  </h5>
                  <p className="text-xs text-stone-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items Breakdown */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="font-bold text-xs text-stone-400 uppercase tracking-wider">
            Rincian Pesanan
          </h4>
          <span className="text-xs text-amber-400 font-bold">
            Total: Rp {order.total.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="space-y-2">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="bg-stone-950 p-3 rounded-2xl border border-stone-800/80 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-stone-200">
                    <span>{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  {item.addedBy && (
                    <span className="text-[10px] text-purple-300">
                      Oleh: {item.addedBy}
                    </span>
                  )}
                </div>
                <span className="font-black text-amber-400">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-stone-400">
                {item.customization.doneness && <span className="bg-stone-800 px-1 rounded">{item.customization.doneness}</span>}
                {item.customization.spiciness && <span className="bg-red-950 text-red-300 px-1 rounded">{item.customization.spiciness}</span>}
                {item.customization.temperature && <span className="bg-sky-950 text-sky-300 px-1 rounded">{item.customization.temperature}</span>}
                {item.customization.toppings && item.customization.toppings.map(t => (
                  <span key={t.id} className="bg-amber-950 text-amber-300 px-1 rounded">+{t.name}</span>
                ))}
              </div>

              {item.customization.notes && (
                <p className="text-[10px] text-amber-300/80 italic mt-1">"{item.customization.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onOpenReceipt(order)}
          className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-3 rounded-2xl text-xs border border-stone-700 transition flex items-center justify-center space-x-2"
        >
          <span>🧾</span>
          <span>Lihat Struk Digital / Bukti Bayar</span>
        </button>

        <button
          onClick={onBackToMenu}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 rounded-2xl text-xs transition shadow-lg flex items-center justify-center space-x-2"
        >
          <span>➕</span>
          <span>Pesan Tambahan (Tambah Kopi / Camilan)</span>
        </button>
      </div>
    </div>
  );
};
