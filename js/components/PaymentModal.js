/**
 * Payment Modal with Step-Based Flow
 * Flow for Pelanggan (Customer):
 *   Step 1: Klik "Bayar" → Modal terbuka, pilih metode (QRIS atau Tunai/Ke Kasir)
 *   Step 2a: Jika QRIS → Tampilkan QR Code → Klik "Simulasi Pembayaran Berhasil"
 *   Step 2b: Jika Tunai → Langsung kirim pesanan ke dapur (bayar tunai di kasir nanti)
 *
 * Strictly limited to 2 methods:
 * 1. QRIS (QRIS Nasional - Semua m-Banking & E-Wallet)
 * 2. Tunai di Kasir
 */

window.WarkopPaymentModal = function PaymentModal({
  isOpen,
  onClose,
  orderPayload,
  onSuccess,
  store
}) {
  if (!isOpen || !orderPayload) return null;

  const [step, setStep] = React.useState('choose'); // 'choose' | 'qris' | 'processing'
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(900); // 15 mins for QRIS

  // Reset state when modal opens
  React.useEffect(() => {
    setStep('choose');
    setIsProcessing(false);
    setTimeLeft(900);
  }, [isOpen]);

  // Countdown timer for QRIS (only when showing QR code)
  React.useEffect(() => {
    if (step !== 'qris') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Complete Payment Action
  const handleConfirmPayment = (method) => {
    setIsProcessing(true);
    setStep('processing');

    setTimeout(() => {
      const createdOrder = store.createOrder({
        ...orderPayload,
        type: 'dine_in',
        paymentMethod: method,
        paymentStatus: method === 'cash' ? 'pending' : 'paid'
      });

      setIsProcessing(false);
      onSuccess(createdOrder);
    }, 600);
  };

  // Handle Tunai: langsung kirim pesanan, bayar nanti di kasir
  const handlePayCash = () => {
    handleConfirmPayment('cash');
  };

  // Handle QRIS: show QR code first
  const handleChooseQris = () => {
    setStep('qris');
    setTimeLeft(900);
  };

  const totalAmount = orderPayload.total || 0;
  const qrisPayload = `00020101021226670016ID.CO.WARKOP.WWW0118936009990000010203520458125303360540${totalAmount}5802ID5916WARKOP NUSANTARA6007JAKARTA62190115MEJA${orderPayload.tableNumber || '01'}6304`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-stone-100">
              {step === 'choose' ? 'Pilih Metode Pembayaran' : step === 'qris' ? 'Scan QRIS untuk Bayar' : 'Memproses Pesanan...'}
            </h3>
            <p className="text-xs text-amber-400 font-bold">
              Tagihan Meja {orderPayload.tableNumber} — Rp {totalAmount.toLocaleString('id-ID')}
            </p>
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">

          {/* ========== STEP 1: PILIH METODE ========== */}
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 text-center mb-4">
                Pilih cara pembayaran yang Anda inginkan:
              </p>

              {/* Option 1: QRIS */}
              <button
                onClick={handleChooseQris}
                className="w-full bg-stone-950 hover:bg-stone-800 border-2 border-stone-700 hover:border-amber-500 rounded-2xl p-4 transition group text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    📱
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-stone-100 group-hover:text-amber-400 transition">
                      Bayar dengan QRIS
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Scan QR Code dari m-Banking atau e-Wallet (GoPay, OVO, DANA, ShopeePay, dll)
                    </p>
                  </div>
                  <span className="text-stone-500 group-hover:text-amber-400 text-lg transition">➔</span>
                </div>
              </button>

              {/* Option 2: Tunai / Ke Kasir */}
              <button
                onClick={handlePayCash}
                className="w-full bg-stone-950 hover:bg-stone-800 border-2 border-stone-700 hover:border-emerald-500 rounded-2xl p-4 transition group text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                    💵
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-sm text-stone-100 group-hover:text-emerald-400 transition">
                      Bayar Tunai / Ke Kasir
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Pesanan langsung dikirim ke dapur. Bayar uang tunai ke kasir sebelum pulang.
                    </p>
                  </div>
                  <span className="text-stone-500 group-hover:text-emerald-400 text-lg transition">➔</span>
                </div>
              </button>

              {/* Total Tagihan */}
              <div className="mt-4 bg-stone-950 border border-stone-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-stone-400">Total Tagihan:</span>
                <span className="text-lg font-black text-amber-400">Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          {/* ========== STEP 2a: QRIS — TAMPILKAN QR CODE ========== */}
          {step === 'qris' && (
            <div className="space-y-4 text-center">
              {/* Back button */}
              <button
                onClick={() => setStep('choose')}
                className="text-xs text-stone-400 hover:text-white transition flex items-center space-x-1 mx-auto"
              >
                <span>←</span>
                <span>Kembali pilih metode</span>
              </button>

              {/* National QRIS Card Layout */}
              <div className="bg-white text-stone-950 rounded-2xl p-4 shadow-xl border-2 border-stone-200 max-w-[280px] mx-auto space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-red-600 text-base tracking-tighter">QRIS</span>
                    <span className="text-[9px] text-stone-500 uppercase font-bold">Nasional</span>
                  </div>
                  <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border">
                    GPN
                  </span>
                </div>

                <div className="text-center py-0.5">
                  <h4 className="font-black text-xs text-stone-900 tracking-wide uppercase">
                    WARKOP NUSANTARA
                  </h4>
                  <p className="text-[9px] text-stone-500">NMID: ID1029384756102</p>
                </div>

                {/* QR Code SVG */}
                <div
                  className="w-48 h-48 mx-auto bg-stone-50 p-2 rounded-xl border border-stone-300 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: window.WarkopQR ? window.WarkopQR.renderSVG(qrisPayload, { size: 176, padding: 0 }) : ''
                  }}
                />

                <div className="border-t pt-2">
                  <span className="text-[10px] text-stone-500 block">Total Pembayaran:</span>
                  <span className="text-lg font-black text-stone-950">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Countdown & Info */}
              <div className="space-y-1">
                <div className="text-xs text-stone-300">
                  Waktu scan: <span className="font-bold text-amber-400 font-mono">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  Scan pakai BCA, Mandiri Livin, BRImo, BNI, GoPay, OVO, DANA, atau ShopeePay langsung dari meja Anda.
                </p>
              </div>

              {/* Instant Simulation Button */}
              <button
                disabled={isProcessing}
                onClick={() => handleConfirmPayment('qris')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black py-3 rounded-2xl shadow-lg transition text-xs flex items-center justify-center space-x-2"
              >
                <span>⚡ {isProcessing ? 'Memverifikasi Pembayaran...' : 'Simulasi Pembayaran QRIS Berhasil (Klik Sini)'}</span>
              </button>
            </div>
          )}

          {/* ========== STEP: PROCESSING ========== */}
          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 mx-auto flex items-center justify-center text-3xl animate-bounce">
                🍳
              </div>
              <h4 className="text-sm font-bold text-white">Mengirim pesanan ke dapur...</h4>
              <p className="text-xs text-stone-400">Pesanan Meja {orderPayload.tableNumber} sedang diproses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
