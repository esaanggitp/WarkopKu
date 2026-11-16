/**
 * Staff Login Modal Component
 * Enables logging into Admin, Kasir, or Kitchen roles with credential verification
 */

window.WarkopStaffLoginModal = function StaffLoginModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  if (!isOpen) return null;

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = window.WarkopAuth.login(username, password);
    if (res.success) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
    const res = window.WarkopAuth.login(user, pass);
    if (res.success) {
      onLoginSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shadow">
              🔐
            </div>
            <div>
              <h3 className="font-black text-base text-white">Login Hak Akses Staff</h3>
              <p className="text-xs text-stone-400">Admin • Kasir • Dapur</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white text-sm">✕</button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800/80 p-3 rounded-2xl text-red-300 font-semibold text-center animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">Username Staff:</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / kasir / kitchen"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 font-medium focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1.5">Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 font-medium focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black py-3 rounded-2xl shadow-lg transition text-sm flex items-center justify-center space-x-2"
            >
              <span>Masuk Sebagai Staff</span>
              <span>➔</span>
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2 border-t border-stone-800 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 block text-center">
              Akses Cepat (Klik untuk login instan):
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin')}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 flex items-center justify-between text-left transition"
              >
                <div>
                  <span className="font-bold text-amber-400 text-xs block">👑 Admin (Pemilik Usaha)</span>
                  <span className="text-[10px] text-stone-400">Bisa apa aja (Omzet, Stok, Menu, Meja, dll) • user: admin pass: admin</span>
                </div>
                <span className="text-stone-500 text-xs">➔</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kasir', 'kasir')}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 flex items-center justify-between text-left transition"
              >
                <div>
                  <span className="font-bold text-sky-400 text-xs block">💳 Kasir (Front-of-House)</span>
                  <span className="text-[10px] text-stone-400">Hanya kontrol pesanan, pembayaran kasir, & meja • user: kasir pass: kasir</span>
                </div>
                <span className="text-stone-500 text-xs">➔</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kitchen', 'kitchen')}
                className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 flex items-center justify-between text-left transition"
              >
                <div>
                  <span className="font-bold text-emerald-400 text-xs block">🍳 Kitchen (Dapur)</span>
                  <span className="text-[10px] text-stone-400">Hanya melihat apa yg dipesan & status masak • user: kitchen pass: kitchen</span>
                </div>
                <span className="text-stone-500 text-xs">➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
