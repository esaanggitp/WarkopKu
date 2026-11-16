/**
 * Initial Data for Warkop POS & Self-Order System
 * Covers authentic Indonesian warkop items, customizable toppings,
 * raw material dependencies (Bahan Baku), and tables.
 */

window.WARKOP_INITIAL_INGREDIENTS = [
  { id: 'ing_indomie_goreng', name: 'Mi Indomie Goreng Original', category: 'Mi & Makanan', stock: 65, minStock: 15, unit: 'Bungkus', status: 'available' },
  { id: 'ing_indomie_kuah', name: 'Mi Indomie Kuah (Ayam Bawang/Kari)', category: 'Mi & Makanan', stock: 40, minStock: 10, unit: 'Bungkus', status: 'available' },
  { id: 'ing_telur', name: 'Telur Ayam Segar', category: 'Topping & Telur', stock: 90, minStock: 20, unit: 'Butir', status: 'available' },
  { id: 'ing_kornet', name: 'Kornet Sapi Pronas', category: 'Topping & Daging', stock: 12, minStock: 5, unit: 'Kaleng', status: 'available' },
  { id: 'ing_keju', name: 'Keju Cheddar Kraft', category: 'Topping & Keju', stock: 8, minStock: 3, unit: 'Balok', status: 'available' },
  { id: 'ing_kopi_robusta', name: 'Biji/Bubuk Kopi Robusta Lampung', category: 'Kopi & Minuman', stock: 2500, minStock: 500, unit: 'Gram', status: 'available' },
  { id: 'ing_susu_kental', name: 'Susu Kental Manis (Carnation/Frisian Flag)', category: 'Susu & Gula', stock: 18, minStock: 6, unit: 'Kaleng', status: 'available' },
  { id: 'ing_gula_aren', name: 'Gula Aren Cair Alami', category: 'Susu & Gula', stock: 5, minStock: 2, unit: 'Liter', status: 'available' },
  { id: 'ing_teh_tubruk', name: 'Teh Melati Tubruk Wangi', category: 'Kopi & Minuman', stock: 15, minStock: 4, unit: 'Kotak', status: 'available' },
  { id: 'ing_adonan_pancong', name: 'Adonan Kue Pancong Kelapa', category: 'Kue & Roti', stock: 35, minStock: 10, unit: 'Porsi', status: 'available' },
  { id: 'ing_roti_tawar', name: 'Roti Tawar Kasino', category: 'Kue & Roti', stock: 14, minStock: 4, unit: 'Bungkus', status: 'available' },
  { id: 'ing_pisang_raja', name: 'Pisang Raja Manis', category: 'Kue & Roti', stock: 6, minStock: 2, unit: 'Sisir', status: 'available' },
  { id: 'ing_tepung_gorengan', name: 'Tepung Bumbu Gorengan Renyah', category: 'Camilan', stock: 20, minStock: 5, unit: 'Kg', status: 'available' }
];

window.WARKOP_TOPPINGS = [
  { id: 'top_telur_ceplok_setengah', name: 'Telur Ceplok ½ Matang', price: 4000, requiresIngredient: 'ing_telur' },
  { id: 'top_telur_dadar', name: 'Telur Dadar Daun Bawang', price: 4000, requiresIngredient: 'ing_telur' },
  { id: 'top_kornet', name: 'Kornet Sapi Tumis Mentega', price: 5000, requiresIngredient: 'ing_kornet' },
  { id: 'top_keju', name: 'Keju Cheddar Parut Melimpah', price: 4000, requiresIngredient: 'ing_keju' },
  { id: 'top_sosis', name: 'Sosis Sapi Goreng (2 pcs)', price: 4000, requiresIngredient: null },
  { id: 'top_bakso', name: 'Bakso Sapi Kuah (3 pcs)', price: 4000, requiresIngredient: null },
  { id: 'top_sawi_extra', name: 'Extra Sayur Sawi Hijau', price: 1000, requiresIngredient: null }
];

window.WARKOP_PANCONG_TOPPINGS = [
  { id: 'ptop_keju', name: 'Keju Parut', price: 3000, requiresIngredient: 'ing_keju' },
  { id: 'ptop_meses', name: 'Coklat Meses Ceres', price: 3000, requiresIngredient: null },
  { id: 'ptop_susu', name: 'Extra Susu Kental Manis', price: 2000, requiresIngredient: 'ing_susu_kental' },
  { id: 'ptop_matcha', name: 'Greentea / Matcha Glaze', price: 4000, requiresIngredient: null },
  { id: 'ptop_oreo', name: 'Crushed Oreo Crumbs', price: 3000, requiresIngredient: null }
];

window.WARKOP_INITIAL_MENU = [
  {
    id: 'menu_indomie_goreng',
    name: 'Indomie Goreng Spesial Warkop',
    category: 'indomie',
    price: 12000,
    description: 'Indomie goreng legendaris dengan racikan sawi segar, taburan bawang goreng renyah, dan kecap manis khas racikan abang warkop.',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_indomie_goreng'],
    availableDoneness: ['Setengah Matang (Favorit Warkop)', 'Pas / Al Dente', 'Lembek / Matang Sempurna'],
    availableSpiciness: ['Level 0 (Tidak Pedas)', 'Level 1 (Cabe 2 biji)', 'Level 2 (Cabe 5 biji)', 'Level 3 (Cabe 10 biji)', 'Level 5 (Mampus Pedas)'],
    allowedToppings: ['top_telur_ceplok_setengah', 'top_telur_dadar', 'top_kornet', 'top_keju', 'top_sosis', 'top_bakso', 'top_sawi_extra'],
    isPopular: true
  },
  {
    id: 'menu_internet',
    name: 'Internet (Indomie Telur Kornet)',
    category: 'indomie',
    price: 19000,
    description: 'Menu ikonik warkop sepanjang masa: Indomie Goreng lengkap dengan tumisan kornet gurih dan telur ceplok setengah matang meleleh.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_indomie_goreng', 'ing_telur', 'ing_kornet'],
    availableDoneness: ['Setengah Matang (Favorit Warkop)', 'Pas / Al Dente', 'Lembek / Matang Sempurna'],
    availableSpiciness: ['Level 0 (Tidak Pedas)', 'Level 1 (Cabe 2 biji)', 'Level 2 (Cabe 5 biji)', 'Level 3 (Cabe 10 biji)', 'Level 5 (Mampus Pedas)'],
    allowedToppings: ['top_keju', 'top_sosis', 'top_bakso', 'top_sawi_extra'],
    isPopular: true
  },
  {
    id: 'menu_indomie_kuah_kari',
    name: 'Indomie Kuah Kari Ayam Telur Meleleh',
    category: 'indomie',
    price: 15000,
    description: 'Indomie kuah rasa kari ayam medok dengan kuah kental, telur rebus diaduk setengah matang, plus irisan rawit dan jeruk nipis.',
    image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_indomie_kuah', 'ing_telur'],
    availableDoneness: ['Setengah Matang', 'Pas', 'Lembek'],
    availableSpiciness: ['Level 0', 'Level 1 (Sedang)', 'Level 2 (Pedas)', 'Level 3 (Super Pedas)'],
    allowedToppings: ['top_keju', 'top_kornet', 'top_sosis', 'top_bakso', 'top_sawi_extra'],
    isPopular: false
  },
  {
    id: 'menu_kopi_susu_aren',
    name: 'Es Kopi Susu Gula Aren Asli',
    category: 'minuman',
    price: 13000,
    description: 'Ekstrak kopi robusta pekat dipadu susu kental manis gurih dan legitnya sirup gula aren alami. Creamy & nagih.',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_kopi_robusta', 'ing_susu_kental', 'ing_gula_aren'],
    availableTemperature: ['Dingin (Banyak Es)', 'Dingin (Sedikit Es)', 'Hangat', 'Panas'],
    availableSweetness: ['Normal Manis (Rekomendasi)', 'Less Sugar (Sedikit Manis)', 'No Sugar (Tanpa Gula)'],
    isPopular: true
  },
  {
    id: 'menu_kopi_tubruk',
    name: 'Kopi Tubruk Robusta Hitam',
    category: 'minuman',
    price: 7000,
    description: 'Kopi hitam tubruk khas warkop Nusantara dari biji robusta pilihan, aroma pekat menggelegar untuk teman begadang dan diskusi santai.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_kopi_robusta'],
    availableTemperature: ['Panas Berasap', 'Hangat'],
    availableSweetness: ['Pahit Total (Tanpa Gula)', 'Normal Manis (Gula 1.5 sdm)', 'Manis Legit (Gula 2 sdm)'],
    isPopular: false
  },
  {
    id: 'menu_es_teh_tarik',
    name: 'Es Teh Tarik / Es Teh Manis Jumbo',
    category: 'minuman',
    price: 8000,
    description: 'Teh melati wangi diseduh pekat dengan susu kental ditarik berbusa, disajikan dalam gelas jumbo super segar.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_teh_tubruk', 'ing_susu_kental'],
    availableTemperature: ['Es Dingin Segar', 'Hangat'],
    availableSweetness: ['Normal Manis', 'Less Sweet'],
    isPopular: true
  },
  {
    id: 'menu_pancong_lumer',
    name: 'Kue Pancong Lumer Keju Coklat',
    category: 'pancong',
    price: 14000,
    description: 'Kue pancong kekinian bertekstur lembut meleleh di bagian dalam dengan taburan keju parut melimpah dan susu kental coklat.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_adonan_pancong', 'ing_keju', 'ing_susu_kental'],
    availablePancongDoneness: ['Lumer Basah (Meleleh Banget)', 'Setengah Matang (Pas Gurih)', 'Matang Penuh (Padat & Renyah Pinggir)'],
    allowedPancongToppings: ['ptop_keju', 'ptop_meses', 'ptop_susu', 'ptop_matcha', 'ptop_oreo'],
    isPopular: true
  },
  {
    id: 'menu_roti_bakar_coklat_keju',
    name: 'Roti Bakar Kasino Coklat Keju Susu',
    category: 'pancong',
    price: 15000,
    description: 'Roti kasino tebal dipanggang dengan olesan mentega gurih, diisi coklat meses premium dan keju cheddar parut berlapis susu kental manis.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_roti_tawar', 'ing_keju', 'ing_susu_kental'],
    allowedPancongToppings: ['ptop_keju', 'ptop_meses', 'ptop_susu'],
    isPopular: false
  },
  {
    id: 'menu_pisang_bakar',
    name: 'Pisang Bakar Keju Coklat Meises',
    category: 'pancong',
    price: 13000,
    description: 'Pisang raja manis dibakar wangi karamel, disiram susu kental manis dan taburan melimpah keju serta meses coklat.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_pisang_raja', 'ing_keju', 'ing_susu_kental'],
    allowedPancongToppings: ['ptop_keju', 'ptop_meses', 'ptop_susu'],
    isPopular: false
  },
  {
    id: 'menu_gorengan_platter',
    name: 'Aneka Gorengan Hangat (Isi 4 Pcs)',
    category: 'gorengan',
    price: 10000,
    description: 'Paket combo gorengan hangat: Bakwan sayur renyah, Tempe Mendoan gurih, dan Tahu Isi pedas dengan cabai rawit hijau segar.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_tepung_gorengan'],
    isPopular: true
  },
  {
    id: 'menu_magelangan',
    name: 'Nasi Magelangan (Nasi Goreng + Mi)',
    category: 'makanan',
    price: 18000,
    description: 'Perpaduan legendaris nasi goreng bumbu gurih warkop diaduk bersama mi instan, suwiran ayam, bakso, dan telur orak-arik.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
    requiredIngredients: ['ing_indomie_goreng', 'ing_telur'],
    availableSpiciness: ['Level 0', 'Level 1 (Sedang)', 'Level 2 (Pedas)', 'Level 3 (Pedas Banget)'],
    allowedToppings: ['top_telur_ceplok_setengah', 'top_kornet', 'top_keju', 'top_kerupuk'],
    isPopular: true
  }
];

window.WARKOP_INITIAL_TABLES = [
  { id: '1', name: 'Meja 01', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '2', name: 'Meja 02', capacity: 4, status: 'occupied', activeOrderId: 'ORD-9821', totalBill: 34000 },
  { id: '3', name: 'Meja 03', capacity: 6, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '4', name: 'Meja 04', capacity: 6, status: 'unpaid', activeOrderId: 'ORD-9820', totalBill: 58000 },
  { id: '5', name: 'Meja 05', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '6', name: 'Meja 06', capacity: 8, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '7', name: 'Meja 07', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '8', name: 'Meja 08', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '9', name: 'Meja 09', capacity: 6, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '10', name: 'Meja 10', capacity: 6, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '11', name: 'Meja 11', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 },
  { id: '12', name: 'Meja 12', capacity: 4, status: 'available', activeOrderId: null, totalBill: 0 }
];

window.WARKOP_INITIAL_ORDERS = [
  {
    id: 'ORD-9820',
    type: 'dine_in',
    tableNumber: '04',
    customerName: 'Geng Nongkrong Mas Roy',
    customerPhone: '081288991122',
    isGroupOrder: true,
    groupSessionId: 'GRP-MEJA-4',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    items: [
      {
        id: 'item_1',
        name: 'Internet (Indomie Telur Kornet)',
        price: 19000,
        quantity: 2,
        customization: {
          doneness: 'Setengah Matang (Favorit Warkop)',
          spiciness: 'Level 2 (Cabe 5 biji)',
          toppings: [{ name: 'Keju Cheddar Parut Melimpah', price: 4000 }],
          notes: 'Kuah sedikit saja, telur jangan sampai matang ya mas'
        },
        addedBy: 'Roy',
        subtotal: 46000
      },
      {
        id: 'item_2',
        name: 'Es Kopi Susu Gula Aren Asli',
        price: 13000,
        quantity: 1,
        customization: {
          temperature: 'Dingin (Banyak Es)',
          sweetness: 'Normal Manis (Rekomendasi)'
        },
        addedBy: 'Fajar',
        subtotal: 13000
      }
    ],
    subtotal: 58000,
    total: 58000,
    paymentMethod: 'cash',
    paymentStatus: 'pending', // Menunggu bayar kasir
    orderStatus: 'ready' // Siap diantar pramusaji
  },
  {
    id: 'ORD-9821',
    type: 'dine_in',
    tableNumber: '02',
    customerName: 'Andi & Sarah',
    customerPhone: '085712348899',
    isGroupOrder: false,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    items: [
      {
        id: 'item_3',
        name: 'Kue Pancong Lumer Keju Coklat',
        price: 14000,
        quantity: 1,
        customization: {
          pancongDoneness: 'Lumer Basah (Meleleh Banget)',
          pancongToppings: [{ name: 'Extra Susu Kental Manis', price: 2000 }]
        },
        addedBy: 'Sarah',
        subtotal: 16000
      },
      {
        id: 'item_4',
        name: 'Es Teh Tarik / Es Teh Manis Jumbo',
        price: 8000,
        quantity: 2,
        customization: {
          temperature: 'Es Dingin Segar',
          sweetness: 'Normal Manis'
        },
        addedBy: 'Andi',
        subtotal: 16000
      }
    ],
    subtotal: 32000,
    total: 32000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    orderStatus: 'cooking' // Sedang dimasak dapur
  },
  {
    id: 'ORD-9818',
    type: 'dine_in',
    tableNumber: '06',
    customerName: 'Mas Dimas',
    customerPhone: '089611223344',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    items: [
      {
        id: 'item_5',
        name: 'Nasi Magelangan (Nasi Goreng + Mi)',
        price: 18000,
        quantity: 1,
        customization: {
          spiciness: 'Level 3 (Pedas Banget)',
          toppings: [{ name: 'Telur Ceplok ½ Matang', price: 4000 }]
        },
        addedBy: 'Dimas',
        subtotal: 22000
      }
    ],
    subtotal: 22000,
    total: 22000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    orderStatus: 'completed'
  }
];
