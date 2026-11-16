/**
 * Table Management Component (Manajemen Meja)
 * Real-time table occupancy, unpaid bills tracking, and instant QR Code generation for each table
 */

window.WarkopTableManager = function TableManager({
  store,
  storeState
}) {
  const [selectedQrTable, setSelectedQrTable] = React.useState(null);
  const tables = storeState.tables || [];

  const host = window.location.host;
  const protocol = window.location.protocol;

  const handleClearTable = (tableId) => {
    if (confirm(`Bersihkan dan kosongkan Meja ${tableId}?`)) {
      store.clearTable(tableId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Meja Kosong (Tersedia)</span>
            <span className="text-2xl font-black text-emerald-400">
              {tables.filter(t => t.status === 'available').length} Meja
            </span>
          </div>
          <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
            🟢
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Meja Terisi (Sedang Makan)</span>
            <span className="text-2xl font-black text-amber-400">
              {tables.filter(t => t.status === 'occupied').length} Meja
            </span>
          </div>
          <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            🟡
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block">Belum Bayar (Menunggu Kasir)</span>
            <span className="text-2xl font-black text-red-400">
              {tables.filter(t => t.status === 'unpaid').length} Meja
            </span>
          </div>
          <span className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl">
            🔴
          </span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tables.map(table => {
          let statusBg = 'border-emerald-500/30 bg-stone-900';
          let statusBadge = 'bg-emerald-950 text-emerald-400 border-emerald-800/40';
          let statusText = 'KOSONG';

          if (table.status === 'occupied') {
            statusBg = 'border-amber-500/50 bg-stone-900 ring-1 ring-amber-500/20';
            statusBadge = 'bg-amber-950 text-amber-400 border-amber-800/40';
            statusText = 'TERISI';
          } else if (table.status === 'unpaid') {
            statusBg = 'border-red-500/60 bg-stone-900 ring-2 ring-red-500/30';
            statusBadge = 'bg-red-950 text-red-400 border-red-800/40 animate-pulse';
            statusText = 'BELUM BAYAR';
          }

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between shadow-md transition ${statusBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-lg text-white">{table.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-400">
                  <p>Kapasitas: {table.capacity} Orang</p>
                  {table.activeOrderId && (
                    <p className="text-[11px] font-semibold text-stone-300">
                      Pesanan: <span className="text-amber-400">{table.activeOrderId}</span>
                    </p>
                  )}
                  {table.totalBill > 0 && (
                    <p className="text-xs font-black text-white">
                      Tagihan: <span className="text-amber-400">Rp {table.totalBill.toLocaleString('id-ID')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-800 space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedQrTable(table)}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-1.5 px-2 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span>📷</span>
                  <span>Cetak QR Meja</span>
                </button>

                {table.status !== 'available' && (
                  <button
                    onClick={() => handleClearTable(table.id)}
                    className="w-full bg-red-950/80 hover:bg-red-900 text-red-300 font-bold py-1.5 px-2 rounded-xl border border-red-800/40 transition"
                  >
                    Kosongkan Meja
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PRINTABLE QR CODE MODAL FOR TABLE TENT */}
      {selectedQrTable && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
              <h3 className="font-bold text-sm text-stone-100">QR Code Meja Siap Cetak</h3>
              <button
                onClick={() => setSelectedQrTable(null)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Printable Table Tent Card */}
            <div className="p-6 text-center space-y-4">
              <div className="bg-white text-stone-950 p-6 rounded-2xl shadow-xl border-2 border-stone-200 space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">☕</span>
                  <span className="font-black text-sm tracking-wider uppercase">WARKOP NUSANTARA</span>
                </div>

                <div className="bg-stone-950 text-amber-400 py-1.5 px-4 rounded-xl font-black text-lg uppercase tracking-wider inline-block">
                  {selectedQrTable.name}
                </div>

                <p className="text-[10px] text-stone-600 font-medium">
                  Scan QR di bawah untuk melihat menu digital & langsung memesan dari HP Anda!
                </p>

                {/* QR Code SVG */}
                <div
                  className="w-44 h-44 mx-auto p-2 bg-stone-50 rounded-xl border border-stone-300 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: window.WarkopQR ? window.WarkopQR.renderSVG(`${protocol}//${host}/?meja=${selectedQrTable.id}`, { size: 160, padding: 0 }) : ''
                  }}
                />

                <div className="text-[9px] text-stone-500 font-mono">
                  {`${protocol}//${host}/?meja=${selectedQrTable.id}`}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs shadow-lg transition"
                >
                  🖨️ Cetak Kartu Meja Ini
                </button>
                <button
                  onClick={() => setSelectedQrTable(null)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
