/**
 * Group Order Modal ("Pesan Bareng")
 * Real-time collaborative cart session for groups hanging out at warkop tables
 */

window.WarkopGroupOrderModal = function GroupOrderModal({
  isOpen,
  onClose,
  activeTable,
  store,
  storeState
}) {
  if (!isOpen) return null;

  const [myName, setMyName] = React.useState(localStorage.getItem('warkop_my_name') || 'Teman Warkop');
  const [copySuccess, setCopySuccess] = React.useState(false);

  // Group session for current table
  const groupSession = store.getGroupSession(activeTable);
  const isSessionActive = Boolean(groupSession);

  // URL for friends to scan and join directly from mobile
  const host = window.location.host;
  const protocol = window.location.protocol;
  const joinUrl = `${protocol}//${host}/?meja=${activeTable}&group=active`;

  // Start or Join Group Session
  const handleJoinOrCreate = () => {
    if (!myName.trim()) return;
    localStorage.setItem('warkop_my_name', myName.trim());
    store.createOrJoinGroupSession(activeTable, myName.trim());
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Group items & split bills
  const groupItems = groupSession ? groupSession.items || [] : [];
  const grandTotal = groupItems.reduce((sum, item) => sum + item.subtotal, 0);

  const memberSplits = React.useMemo(() => {
    const map = {};
    groupItems.forEach(item => {
      const name = item.addedBy || 'Anonim';
      map[name] = (map[name] || 0) + item.subtotal;
    });
    return map;
  }, [groupItems]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-900 border border-purple-500/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-xl shadow-md">
              👥
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                Pesan Bareng (Group Order)
              </h3>
              <p className="text-xs text-purple-200">
                Nongkrong rame-rame di <span className="font-bold text-amber-300">Meja {activeTable}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-200 text-xs">
          {!isSessionActive ? (
            /* Create Session Screen */
            <div className="text-center space-y-4 py-3">
              <div className="max-w-xs mx-auto space-y-2">
                <span className="text-4xl block">📱🤝📱</span>
                <h4 className="font-bold text-base text-white">Mulai Pesan Bareng di Meja Ini</h4>
                <p className="text-stone-400 text-xs">
                  Semua orang di meja bisa scan QR dan memasukkan pesanan masing-masing ke dalam satu keranjang bersama sebelum checkout!
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 max-w-sm mx-auto text-left space-y-2">
                <label className="block text-xs font-bold text-purple-300">
                  Masukkan Nama Anda (Sebagai Inisiator/Host):
                </label>
                <input
                  type="text"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="Contoh: Mas Budi, Rian, atau Roy"
                  className="w-full bg-stone-900 border border-purple-500/40 rounded-xl px-3 py-2 text-stone-100 font-semibold focus:outline-none"
                />
                <button
                  onClick={handleJoinOrCreate}
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition"
                >
                  🚀 Aktifkan Sesi Pesan Bareng Meja {activeTable}
                </button>
              </div>
            </div>
          ) : (
            /* Active Session Screen with QR & Members */
            <>
              {/* QR Code & Join Invite */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row items-center gap-4">
                <div
                  className="w-32 h-32 bg-white p-2 rounded-xl shadow-md flex items-center justify-center flex-shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: window.WarkopQR ? window.WarkopQR.renderSVG(joinUrl, { size: 112, padding: 0 }) : ''
                  }}
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <span className="inline-block bg-purple-900/60 text-purple-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-purple-700/50">
                    SCAN UNTUK GABUNG
                  </span>
                  <h4 className="font-bold text-sm text-white leading-tight">
                    Ajak Teman-teman Meja {activeTable} Scan QR Ini
                  </h4>
                  <p className="text-stone-400 text-[11px]">
                    Atau bagikan link langsung via WhatsApp ke grup nongkrong kalian:
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition mx-auto sm:mx-0 shadow"
                  >
                    <span>{copySuccess ? '✅ Berhasil Disalin!' : '📋 Salin Link Pesan Bareng'}</span>
                  </button>
                </div>
              </div>

              {/* Members Joined */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-300">
                    👥 Teman yang Sudah Bergabung ({groupSession.members.length}):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    ● Realtime Tersinkron
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupSession.members.map((m, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-950/80 text-purple-200 border border-purple-700/40 px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>👤 {m}</span>
                      {m === groupSession.hostName && (
                        <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1 rounded-full">HOST</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shared Live Cart Items */}
              <div className="border-t border-stone-800 pt-3 space-y-2">
                <span className="font-bold text-stone-300 block">
                  🛒 Pesanan yang Sudah Masuk ({groupItems.length} item):
                </span>
                {groupItems.length === 0 ? (
                  <p className="text-stone-500 italic py-2">
                    Belum ada yang menambahkan makanan/minuman. Silakan buka menu dan klik "Tambah ke Pesanan Bareng".
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {groupItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-stone-100">{item.name}</span>
                            <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded font-semibold">
                              ({item.addedBy})
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {item.customization.doneness || item.customization.temperature || ''}
                          </span>
                        </div>
                        <span className="font-black text-amber-400">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bill Split Breakdown */}
              {Object.keys(memberSplits).length > 0 && (
                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1.5">
                  <span className="font-bold text-purple-300 text-xs block">
                    💰 Rincian Patungan Bayar Tiap Orang:
                  </span>
                  {Object.entries(memberSplits).map(([member, total]) => (
                    <div key={member} className="flex justify-between items-center text-stone-300 text-xs">
                      <span>• {member}</span>
                      <span className="font-bold text-amber-400">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-800 pt-1.5 flex justify-between font-bold text-sm text-white">
                    <span>Total Tagihan Meja {activeTable}:</span>
                    <span className="text-amber-400 font-black">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          {isSessionActive && (
            <button
              onClick={() => store.clearGroupSession(activeTable)}
              className="text-red-400 hover:text-red-300 text-xs font-semibold"
            >
              Bubarkan Sesi
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2 rounded-xl text-xs shadow-lg transition"
          >
            {isSessionActive ? 'Lanjut Pilih Menu ➔' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
