<img width="1343" height="595" alt="image" src="https://github.com/user-attachments/assets/e2186f58-82a2-4bae-bff2-56dfb4fd7765" /># ☕ WarkopKu - Sistem Pemesanan Warkop Online Realtime

**WarkopKu** adalah aplikasi web pemesanan dan kasir (Point of Sale / POS) modern khusus warkop (warung kopi) Indonesia. Dirancang untuk alur kerja cepat, mendukung pemesanan mandiri oleh pelanggan lewat scan QR meja, sistem pesanan kelompok (*Group Order*), layar antrean dapur (*Kitchen Display System / KDS*), layar POS kasir, hingga dashboard analitik pemilik warkop dengan sinkronisasi basis data **Firebase Firestore** dan multi-tab realtime.

<img width="1343" height="595" alt="Screenshot 2026-11-17 050800" src="https://github.com/user-attachments/assets/928ef0ef-2c0b-4159-85b1-95081b7c43d3" />


---

## 🚀 Fitur Utama Berdasarkan Peran (RBAC)

Aplikasi ini menerapkan **Role-Based Access Control (RBAC)** yang memisahkan hak akses secara ketat:

### 1. 📱 Sisi Pelanggan (Customer / Self-Order)
- **Scan QR Meja (Order Link):** Pelanggan cukup memindai QR code di meja (atau membuka tautan `?meja=X`), nomor meja langsung terdeteksi otomatis.
- **Menu Digital & Kustomisasi:**
  - Pilihan menu warkop khas: Indomie kuah/goreng, kopi susu, pancong lumer, gorengan, roti bakar, dan minuman es/panas.
  - Opsi kustomisasi detail: tingkat kematangan mi (setengah matang / pas / lembek), level pedas cabe rawit, tingkat lumer pancong, es/panas, kemanisan, topping tambahan (telur, kornet, keju), dan catatan khusus dapur.
- **Group Order (Pesan Bareng):** Banyak orang di satu meja bisa bergabung ke keranjang bersama lewat HP masing-masing dan melakukan split-bill otomatis sebelum checkout.
- **Alur Pembayaran Step-Based (Hanya 2 Metode):**
  - **📱 QRIS:** Menampilkan kode QRIS Nasional dinamis beserta hitung mundur 15 menit dan simulasi verifikasi instan.
  - **💵 Tunai / Ke Kasir:** Pesanan langsung dikirim ke dapur dan tagihan tercatat untuk dibayar di kasir sebelum pulang.
- **Live Order Tracker:** Pelacakan status pesanan secara realtime (*Diterima ➔ Dimasak ➔ Siap Diantar ➔ Selesai*).

### 2. 💳 Sisi Kasir (Cashier POS)
- **Layar POS Khusus Kasir:** Kasir langsung diarahkan ke kontrol pesanan dan tidak menampilkan menu digital pelanggan.
- **Input Pesanan Pelanggan:** Kasir dapat membuat pesanan baru langsung atas nama meja dengan kalkulator uang tunai dan kembalian.
- **Kontrol Pembayaran:** Menandai pesanan lunas untuk pembayaran tunai atau verifikasi QRIS.
- **Cetak Struk Thermal:** Dukungan cetak struk kasir format 80mm/58mm.
- **Denah Meja:** Memantau meja kosong, terisi, atau belum bayar tagihan.

### 3. 🍳 Sisi Dapur (Kitchen Display System / KDS)
- **Khusus Antrean Masak:** Layar antrean pesanan masuk real-time dengan timer waktu tunggu.
- **Audio Bell:** Notifikasi suara bel lonceng dapur otomatis saat ada pesanan baru masuk.
- **Update Status:** Tombol cepat untuk mengubah status pesanan (*Mulai Masak*, *Siap Diantar*).
- **Integrasi WhatsApp:** Kirim rincian pesanan ke chat WhatsApp dengan satu klik.
- **Perlindungan Akses:** Dapur **TIDAK BISA** memesan makanan atau mengakses menu kasir.

### 4. 📊 Sisi Pemilik Usaha (Admin Dashboard)
- **Akses Penuh ("Bisa Apa Aja"):** Navigasi ke semua layar (Dashboard, Kasir, Dapur, Pelanggan).
- **Rekap & Analitik Penjualan:** Omzet harian, jumlah transaksi, metode pembayaran terpopuler (QRIS vs Tunai), dan menu paling laris.
- **Manajemen Stok Bahan Baku (Auto-Lock):** Penguncian otomatis menu jika bahan utama habis (misal: stok Indomie habis, menu otomatis terkunci dan tidak bisa dipesan pelanggan).
- **Manajemen Meja:** Pengaturan 12 meja, cetak kartu QR meja, dan pengosongan meja.
- **CRUD Menu:** Tambah, edit, dan hapus menu makanan/minuman yang tersinkronisasi ke database.

---

## 🔐 Kredensial Akun Staff

| Peran | Username | Password | Deskripsi Akses |
|-------|----------|----------|-----------------|
| **👑 Admin (Pemilik)** | `admin` | `admin` | Akses penuh ke seluruh fitur dan pengaturan |
| **💳 Kasir** | `kasir` | `kasir` | Kontrol pesanan, input pesanan pelanggan, & meja |
| **🍳 Kitchen (Dapur)** | `kitchen` | `kitchen` | Hanya melihat antrean & status masak (tanpa fitur pesan) |
| **📱 Pelanggan** | *(Tanpa Login)* | *(Tanpa Login)* | Hanya bisa memesan makanan dari meja |

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** React 18 (Babel in-browser standalone) & Tailwind CSS CDN
- **Database:** Google Cloud Firebase Firestore & BroadcastChannel (Multi-tab realtime sync fallback)
- **Audio:** Web Audio API (Synthesizer Chime untuk KDS)
- **QR Engine:** Standalone SVG QR Code Generator
- **Server:** Node.js HTTP Server bawaan (tanpa dependensi eksternal yang rumit)

---

## 📦 Panduan Instalasi & Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)

### Langkah-langkah
1. **Clone repository:**
   ```bash
   git clone https://github.com/USERNAME/REPO_NAME.git
   cd REPO_NAME
   ```

2. **Jalankan server:**
   ```bash
   npm start
   # atau
   node server.js
   ```

3. **Buka di Browser:**
   - **Lokal (Laptop/PC):** `http://localhost:3000`
   - **Akses dari HP (Satu Jaringan Wi-Fi):** `http://[IP-KOMPUTER-ANDA]:3000` (IP akan otomatis ditampilkan di terminal saat server dijalankan)

---

## 🔗 Tautan Cepat Berdasarkan Parameter URL

Anda dapat langsung membuka URL berikut untuk menguji masing-masing tampilan:

- **Pelanggan Meja 1:** `http://localhost:3000/?meja=1`
- **Pelanggan Meja 2:** `http://localhost:3000/?meja=2`
- **Layar Kasir (POS):** `http://localhost:3000/?role=kasir`
- **Layar Dapur (KDS):** `http://localhost:3000/?role=kitchen`
- **Layar Admin / Pemilik:** `http://localhost:3000/?role=admin`

---

## 🔥 Konfigurasi Firebase Firestore

Aplikasi dapat berjalan secara **Offline/Local Realtime** menggunakan penyimpanan browser & multi-tab sync, atau terhubung langsung ke **Firebase Cloud Firestore**.

### Cara Mengaktifkan Firebase:
1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Buat database di menu **Firestore Database** (Pilih mode *Test* untuk kemudahan pengujian).
3. Buka **Project Settings (⚙️)** ➔ Scroll ke bawah pada bagian **Your Apps** ➔ Pilih ikon Web `</>`.
4. Salin konfigurasi objek Firebase:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "projek-anda.firebaseapp.com",
     "projectId": "projek-anda",
     "storageBucket": "projek-anda.appspot.com",
     "messagingSenderId": "123456789",
     "appId": "1:123456789:web:abcdef"
   }
   ```
5. Buka aplikasi WarkopKu, login sebagai **Admin** (`admin`/`admin`).
6. Klik ikon **⚙️** di pojok kanan atas navbar.
7. Tempel konfigurasi JSON Firebase, lalu klik **Simpan & Aktifkan Firebase**.
8. Data orders, stok, meja, dan menu akan otomatis tersinkronisasi dua arah secara realtime.

---

## 📁 Struktur Direktori Proyek

```text
├── index.html                 # Halaman utama aplikasi (SPA)
├── server.js                  # Server Node.js untuk melayani web & deteksi IP lokal
├── package.json               # Konfigurasi npm start
├── README.md                  # Dokumentasi proyek
├── js/
│   ├── app.js                 # Root React Component & Routing Guard
│   ├── auth.js                # Sistem Autentikasi & RBAC
│   ├── firebase-config.js     # Manajer koneksi Firestore
│   ├── mock-data.js           # Data awal menu warkop, bahan, & meja
│   ├── qrcode.js              # Generator SVG QR Code
│   ├── store.js               # State management & sinkronisasi realtime
│   └── components/
│       ├── AdminDashboard.js  # Dashboard analitik & laporan pemilik
│       ├── CashierView.js     # Layar kasir (POS & kontrol pesanan)
│       ├── CustomerView.js    # Katalog menu & self-order pelanggan
│       ├── FirebaseModal.js   # Modal pengaturan konfigurasi Firebase
│       ├── GroupOrderModal.js # Fitur pesan bareng (Group Order)
│       ├── InventoryManager.js# Manajemen stok bahan baku
│       ├── KitchenView.js     # Layar display dapur (KDS)
│       ├── Navbar.js          # Navigasi atas dengan filter hak akses
│       ├── OrderTracker.js    # Pelacak status pesanan pelanggan
│       ├── PaymentModal.js    # Modal pembayaran step-based (QRIS & Tunai)
│       ├── ReceiptModal.js    # Cetak struk POS kasir
│       ├── StaffLoginModal.js # Modal login role staff
│       └── TableManager.js    # Manajemen & denah meja
```

---

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan operasional warkop dan UMKM kuliner. Bebas digunakan dan dikembangkan kembali.
