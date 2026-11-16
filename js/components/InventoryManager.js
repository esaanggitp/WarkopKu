/**
 * Raw Material & Ingredients Stock Management
 * Features automated menu locking when primary ingredients run out of stock
 */

window.WarkopInventoryManager = function InventoryManager({
  store,
  storeState
}) {
  const ingredients = storeState.ingredients || [];
  const menu = storeState.menu || [];

  // Find menu items affected by a specific ingredient
  const getAffectedMenuItems = (ingredientId) => {
    return menu.filter(m => m.requiredIngredients && m.requiredIngredients.includes(ingredientId));
  };

  const handleToggleStatus = (ingId) => {
    store.toggleIngredientStatus(ingId);
  };

  const handleAdjustStock = (ingId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    store.updateIngredientStock(ingId, newStock);
  };

  // Count out of stock items
  const outOfStockCount = ingredients.filter(i => i.status === 'out_of_stock' || i.stock <= 0).length;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">📦</span>
            <h3 className="font-black text-base text-white">
              Manajemen Stok Bahan Baku Otomatis
            </h3>
          </div>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Sistem otomatis mengunci menu digital di sisi pelanggan bila bahan baku utama ditandai <span className="text-red-400 font-bold">HABIS</span>, sehingga pelanggan tidak akan memesan menu yang tidak bisa dibuat dapur.
          </p>
        </div>

        {outOfStockCount > 0 ? (
          <div className="bg-red-950/80 border border-red-800/60 px-4 py-2.5 rounded-2xl text-xs text-red-300 font-bold flex items-center space-x-2 animate-pulse">
            <span>⚠️</span>
            <span>{outOfStockCount} Bahan Habis (Menu Terkunci!)</span>
          </div>
        ) : (
          <div className="bg-emerald-950/80 border border-emerald-800/60 px-4 py-2.5 rounded-2xl text-xs text-emerald-300 font-bold flex items-center space-x-2">
            <span>✅</span>
            <span>Semua Bahan Baku Aman</span>
          </div>
        )}
      </div>

      {/* Ingredients List Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 bg-stone-950 flex justify-between items-center">
          <h4 className="font-bold text-xs text-stone-300 uppercase tracking-wider">
            Daftar Bahan Baku & Menu Terkait
          </h4>
          <span className="text-xs text-stone-500">{ingredients.length} Jenis Bahan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/60 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Nama Bahan Baku</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Stok Saat Ini</th>
                <th className="py-3 px-4">Status & Pengaruh Menu</th>
                <th className="py-3 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {ingredients.map(ing => {
                const affected = getAffectedMenuItems(ing.id);
                const isOutOfStock = ing.status === 'out_of_stock' || ing.stock <= 0;
                const isLow = !isOutOfStock && ing.stock <= ing.minStock;

                return (
                  <tr
                    key={ing.id}
                    className={`hover:bg-stone-850/50 transition ${
                      isOutOfStock ? 'bg-red-950/15' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-stone-100">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                        <span>{ing.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-normal ml-4">Min. Stok: {ing.minStock} {ing.unit}</span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-stone-400">
                      {ing.category}
                    </td>

                    {/* Stock Counter */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAdjustStock(ing.id, ing.stock, -1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="font-black text-amber-400 min-w-12 text-center text-sm">
                          {ing.stock} {ing.unit}
                        </span>
                        <button
                          onClick={() => handleAdjustStock(ing.id, ing.stock, 1)}
                          className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Status & Auto Locking Impact */}
                    <td className="py-3.5 px-4">
                      {isOutOfStock ? (
                        <div className="space-y-1">
                          <span className="bg-red-950 text-red-300 border border-red-800/60 text-[10px] font-black px-2 py-0.5 rounded-full inline-block">
                            🔒 HABIS (MENU DIKUNCI)
                          </span>
                          {affected.length > 0 && (
                            <p className="text-[10px] text-red-400">
                              Mengunci: {affected.map(m => m.name).join(', ')}
                            </p>
                          )}
                        </div>
                      ) : isLow ? (
                        <div className="space-y-1">
                          <span className="bg-amber-950 text-amber-400 border border-amber-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            ⚠️ MENIPIS
                          </span>
                          <p className="text-[10px] text-stone-400">
                            Digunakan di {affected.length} menu warkop
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
                            ● TERSEDIA
                          </span>
                          <p className="text-[10px] text-stone-500">
                            {affected.length} menu dapat dipesan normal
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Quick Toggle Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(ing.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                          isOutOfStock
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {isOutOfStock ? '🔄 Buka / Restok' : '❌ Kunci (Tandai Habis)'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
