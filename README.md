# TemuTalenta

Platform kurasi, pencarian, dan *smart matchmaking* talenta profesional (*Offline-First Talent Discovery Platform*).

---

## 📌 Deskripsi Singkat
**TemuTalenta** dirancang untuk mempermudah proses pencarian, kurasi, evaluasi kecocokan (*matchmaking*), serta pengelolaan talenta profesional. Platform ini dibangun dengan pendekatan **offline-first & zero-dependency**, sehingga dapat dijalankan dan didemonstrasikan langsung di browser lokal tanpa membutuhkan server eksternal maupun koneksi internet.

## 🚀 Fitur Utama
- **Eksplorasi & Filter Talenta**: Pencarian instan berdasarkan nama, peran, keterampilan teknis (Go, Figma, Python, Flutter, dll.), kategori industri, tipe kerja (*remote/hybrid/onsite*), dan status ketersediaan.
- **🎯 Smart Matchmaker Simulation**: Algoritma pembobotan otomatis berbasis formula terstandarisasi (Keahlian 45%, Pengalaman 25%, Budget/Rate 20%, Ketersediaan 10%) untuk menghitung peringkat dan skor kecocokan (*Match Score*) kandidat.
- **Detail Profil & Modal Native `<dialog>`**: Tampilan modal interaktif lengkap dengan portofolio, teknologi terverifikasi, kontak, serta estimasi perhitungan pajak penghasilan **PPh 21 Tenaga Ahli Lepas**.
- **Penyimpanan Mandiri (Offline LocalStorage)**: Fitur pendaftaran profil talenta baru secara lokal dan manajemen *bookmark* kandidat favorit.
- **Portabilitas Data (JSON Export)**: Kemampuan mengekspor seluruh database talenta ke berkas JSON standar.
- **Dark & Light Mode**: Desain modern responsif dengan deteksi preferensi sistem dan tombol toggle instan.

---

## 📁 Struktur Repositori & Dokumentasi

```text
TemuTalenta/
├── docs/
│   ├── blueprint-perencanaan.md  # Blueprint arsitektur, user journey, skema data & roadmap
│   └── core.md                   # Knowledge core: ontologi domain, formula scoring & PPh 21
├── src/
│   ├── css/
│   │   └── style.css             # Desain antarmuka modern, responsif & accessible
│   ├── js/
│   │   ├── data.js               # Dataset awal talenta terkurasi & manajemen storage
│   │   └── app.js                # State machine, algoritma matchmaking & event handlers
│   └── index.html                # Alternatif entri point dalam direktori src
├── index.html                    # Entri point utama website (dapat langsung dibuka di browser)
├── server.js                     # Server lokal zero-dependency (Node.js native http)
├── package.json                  # Konfigurasi npm script (npm start)
├── .editorconfig                 # Standarisasi format kode
├── .gitignore                    # Konfigurasi pengabaian Git
└── README.md                     # Informasi utama repositori
```

---

## 🛠️ Cara Menjalankan Website (Offline)

### Opsi 1: Langsung Buka di Browser (Paling Cepat)
Anda dapat langsung membuka berkas `index.html` dengan klik ganda (*double-click*) pada file explorer atau membuka tautan:
- [index.html](file:///C:/Users/901191/GitHub/TemuTalenta/index.html) di peramban favorit Anda (Chrome, Edge, Firefox).

### Opsi 2: Menggunakan Local Server (Node.js)
```bash
cd TemuTalenta
npm start
```
Buka peramban pada alamat [http://localhost:3000](http://localhost:3000).

### Opsi 3: Menggunakan Python HTTP Server
```bash
cd TemuTalenta
python -m http.server 3000
```

---

## 📖 Referensi Dokumentasi Inti
- [docs/blueprint-perencanaan.md](file:///C:/Users/901191/GitHub/TemuTalenta/docs/blueprint-perencanaan.md) – Dokumen strategi produk dan peta jalan teknis.
- [docs/core.md](file:///C:/Users/901191/GitHub/TemuTalenta/docs/core.md) – Basis pengetahuan domain, taksonomi keahlian, dan regulasi lokal.

---

## 📄 Lisensi
[MIT License](LICENSE)
