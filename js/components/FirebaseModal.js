/**
 * Firebase Connection & Database Configuration Modal
 * Allows owners to connect their own Firebase Firestore project or use the high-performance local realtime bus
 */

window.WarkopFirebaseModal = function FirebaseModal({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  const [mode, setMode] = React.useState(window.WarkopFirebase ? window.WarkopFirebase.mode : 'local_realtime');
  const [config, setConfig] = React.useState(window.WarkopFirebase ? window.WarkopFirebase.config : {});
  const [jsonInput, setJsonInput] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState('');

  const handleJsonPaste = () => {
    try {
      // Find JSON block or parse direct JS object
      const cleaned = jsonInput.replace(/const firebaseConfig = /g, '').replace(/;/g, '').trim();
      // Handle unquoted keys if pasted directly from console
      const parsed = Function('"use strict";return (' + cleaned + ')')();
      if (parsed && parsed.apiKey) {
        setConfig(prev => ({ ...prev, ...parsed }));
        setStatusMessage('✅ Konfigurasi Firebase berhasil diekstrak!');
      } else {
        setStatusMessage('⚠️ Format tidak sesuai. Pastikan ada apiKey dan projectId.');
      }
    } catch (e) {
      setStatusMessage('❌ Gagal membaca format JSON: ' + e.message);
    }
  };

  const handleSave = async () => {
    setStatusMessage('⏳ Menyimpan dan mengetes koneksi...');
    window.WarkopFirebase.saveConfig(config, mode);

    if (mode === 'firebase') {
      const success = await window.WarkopFirebase.initFirebase();
      if (success) {
        setStatusMessage('🔥 Terhubung ke Firebase Firestore Project: ' + config.projectId);
      } else {
        setStatusMessage('⚠️ Belum dapat terhubung ke Firebase Cloud. Pastikan SDK Firebase sudah aktif dan API Key valid.');
      }
    } else {
      setStatusMessage('⚡ Berhasil beralih ke Mode Lokal Realtime Multi-Tab.');
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔥</span>
            <div>
              <h3 className="font-black text-sm text-white">Pengaturan Database Firebase</h3>
              <p className="text-[11px] text-stone-400">Hubungkan Cloud Firestore atau gunakan Multi-Tab Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Mode Switcher */}
          <div>
            <label className="block font-bold text-stone-200 mb-2">Mode Sinkronisasi Database:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('local_realtime')}
                className={`p-3 rounded-2xl border text-left transition ${
                  mode === 'local_realtime'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span>⚡</span>
                  <span className="text-white text-xs">Mode Lokal Real-time</span>
                </div>
                <p className="text-[10px] text-stone-400 font-normal">
                  Langsung jalan tanpa akun Firebase. Sinkron instan antar-tab (Pelanggan, Dapur, Kasir).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('firebase')}
                className={`p-3 rounded-2xl border text-left transition ${
                  mode === 'firebase'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span>🔥</span>
                  <span className="text-white text-xs">Cloud Firebase Firestore</span>
                </div>
                <p className="text-[10px] text-stone-400 font-normal">
                  Database cloud Google Firestore untuk multi-perangkat via internet global.
                </p>
              </button>
            </div>
          </div>

          {/* Firebase Credentials Input */}
          {mode === 'firebase' && (
            <div className="space-y-3 pt-2 border-t border-stone-800">
              {/* Quick Paste JSON */}
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-2">
                <span className="font-bold text-amber-300 block">📋 Tempel Firebase Config Cepat:</span>
                <textarea
                  rows="3"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Salin dan tempel const firebaseConfig = { apiKey: '...', projectId: '...' } dari Firebase Console ke sini"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2 font-mono text-[11px] text-stone-200"
                ></textarea>
                <button
                  type="button"
                  onClick={handleJsonPaste}
                  className="bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Ekstrak Otomatis
                </button>
              </div>

              {/* Individual Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-400 text-[10px] uppercase font-bold mb-1">apiKey:</label>
                  <input
                    type="text"
                    value={config.apiKey || ''}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                    placeholder="AIzaSy..."
                  />
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase font-bold mb-1">projectId:</label>
                  <input
                    type="text"
                    value={config.projectId || ''}
                    onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                    placeholder="warkop-online-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase font-bold mb-1">authDomain:</label>
                  <input
                    type="text"
                    value={config.authDomain || ''}
                    onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                    placeholder="warkop-xxxx.firebaseapp.com"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 text-[10px] uppercase font-bold mb-1">storageBucket:</label>
                  <input
                    type="text"
                    value={config.storageBucket || ''}
                    onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              {/* Security Rules Helper */}
              <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-2xl text-[11px] text-stone-300 space-y-1">
                <span className="font-bold text-amber-400 block">💡 Aturan Firestore (firestore.rules) Rekomendasi:</span>
                <p className="text-stone-400">
                  Untuk warkop online mandiri tanpa login login rumit, gunakan aturan baca-tulis collection warkop:
                </p>
                <pre className="bg-stone-950 p-2 rounded-lg font-mono text-[10px] text-amber-200 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /warkop_orders/{orderId} { allow read, write: if true; }
    match /warkop_meta/{docId} { allow read, write: if true; }
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-center font-bold text-amber-300">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl font-bold text-xs"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2 rounded-xl font-black text-xs shadow-lg transition"
          >
            Simpan & Terapkan Database
          </button>
        </div>
      </div>
    </div>
  );
};
