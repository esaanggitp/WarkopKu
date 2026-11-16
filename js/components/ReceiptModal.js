/**
 * Digital Thermal POS Receipt Modal
 * Authentic Indonesian Warkop style receipt with printable layout
 */

window.WarkopReceiptModal = function ReceiptModal({
  isOpen,
  onClose,
  order
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="p-3 bg-stone-950 border-b border-stone-800 flex justify-between items-center text-xs">
          <span className="font-bold text-stone-300">Struk Transaksi Warkop</span>
          <button onClick={onClose} className="text-stone-400 hover:text-white">✕</button>
        </div>

        {/* Receipt Thermal Paper Content (Printable target) */}
        <div className="p-4 overflow-y-auto flex-1">
          <div id="printable-receipt" className="bg-white text-stone-900 p-5 rounded-2xl shadow-inner font-mono text-xs space-y-3 border border-stone-200">
            {/* Header */}
            <div className="text-center space-y-0.5 border-b-2 border-dashed border-stone-400 pb-3">
              <h2 className="text-base font-black tracking-wider uppercase">☕ WARKOP NUSANTARA</h2>
              <p className="text-[10px] text-stone-600">Jl. Kopi Tubruk No. 12, Jakarta</p>
              <p className="text-[10px] text-stone-600">Telp/WA: 0812-9988-7766</p>
            </div>

            {/* Order Info */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-stone-300 pb-2">
              <div className="flex justify-between">
                <span>No. Pesanan:</span>
                <span className="font-bold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Lokasi:</span>
                <span className="font-bold">MEJA {order.tableNumber || '-'}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 border-b-2 border-dashed border-stone-400 pb-3 text-[11px]">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{item.quantity}x {item.name}</span>
                    <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {/* Customizations indented */}
                  <div className="text-[9px] text-stone-600 pl-3">
                    {item.customization.doneness && <div>• {item.customization.doneness}</div>}
                    {item.customization.spiciness && <div>• {item.customization.spiciness}</div>}
                    {item.customization.temperature && <div>• {item.customization.temperature}</div>}
                    {item.customization.sweetness && <div>• {item.customization.sweetness}</div>}
                    {item.customization.pancongDoneness && <div>• {item.customization.pancongDoneness}</div>}
                    {item.customization.toppings && item.customization.toppings.map((t, ti) => (
                      <div key={ti}>• +{t.name} (Rp {t.price.toLocaleString('id-ID')})</div>
                    ))}
                    {item.addedBy && <div>• Pemesan: {item.addedBy}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Payment */}
            <div className="space-y-1 text-xs pt-1 border-b border-dashed border-stone-300 pb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan:</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-stone-300">
                <span>TOTAL:</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px]">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">{order.paymentMethod === 'cash' ? 'TUNAI' : 'QRIS'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Status:</span>
                <span className="font-bold">{order.paymentStatus === 'paid' ? 'LUNAS' : 'MENUNGGU KASIR'}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-stone-600 pt-2 space-y-0.5">
              <p className="font-bold">Terima Kasih Atas Kunjungan Anda!</p>
              <p>Selamat Nongkrong & Sampai Jumpa Lagi ☕</p>
              <p className="text-[8px] text-stone-400 mt-1">Sistem Pemesanan Warkop Online Realtime</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5"
          >
            <span>🖨️</span>
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
