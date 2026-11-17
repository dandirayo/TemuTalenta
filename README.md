# TemuTalenta (Enterprise Recruitment & Resume Library)

Sistem manajemen rekrutmen konsultan dan pustaka resume (*Applicant Tracking System & Resume Library*) berstandar enterprise yang berjalan mandiri (*Offline-First*).

---

## 📌 Fitur Utama (Versi 2.1)

1. **Mode Single-User Full Control (`AUL SuperAdmin`)**:
   - Dikonfigurasikan khusus untuk pengoperasian mandiri dengan satu akun Super Administrator utama (**AUL SuperAdmin**).
   - Memiliki kendali penuh atas seluruh modul rekrutmen: pengelolaan kandidat, penerbitan lowongan, kalender wawancara, offering letter e-sign, pelacak garansi 90 hari, master data, dan analitik.
2. **Tata Letak Interaktif & Resizable Sidebar**:
   - Menu samping (*sidebar*) kiri dapat diubah lebarnya secara fleksibel dengan menarik pembatas ke arah tengah (*min 175px, max 450px*) dan reset instan melalui *double-click*.
   - Navigasi mencakup 3 pilar: **Talent Management**, **Consultant Business**, dan **Data Analysis**.
3. **Portal Lowongan Kerja Klien & Manajemen Lowongan**:
   - Menampilkan peluang karir aktif lintas klien, formulir input lowongan baru, edit lowongan yang sudah ada, serta opsi penutupan/penghapusan lowongan.
4. **Tata Letak Enterprise Resume Library (`Resume Lib`)**:
   - Tabel kandidat kepadatan tinggi dengan 12 kolom standar (`Candidate`, `Nationality`, `Status`, `Gender`, `Age`, `Education`, `Language`, `Year of service`, `Recommended Position`, `Recommended Company`, `Entry time`, `Operation`).
   - Tampilan ganda: **Tampilan Tabel** dan **Papan Kanban** 7-tahap dengan *drag-and-drop*.
5. **Bilingual Instant Switcher (`Indonesia` / `English` / `Chinese`)**:
   - Sakelar dwibahasa interaktif di bilah atas yang menerjemahkan seluruh menu, filter, header kolom, dan tombol operasi secara instan.
6. **Dual Theme (`Light Mode` & `Dark Mode`)**:
   - Mendukung skema warna terang dan gelap dengan sinkronisasi `<meta name="color-scheme">` dan variabel CSS tanpa *flash* saat dimuat.
7. **Filter Pipeline 7 Tahapan & Pencarian Lanjutan**:
   - Filter cepat berdasarkan tahapan seleksi: `All`, `New`, `Pending`, `Original resume pass`, `Interview`, `Failed`, dan `Entry`.
   - Pengaturan visibilitas kolom dinamis dan pengurutan multi-kolom (*Sortable Headers*).
8. **Operasi Kandidat Fungsional Lengkap**:
   - **`Download Resume`**: Mengunduh berkas ringkasan CV kandidat terstruktur.
   - **`Recommended Repeat`**: Mengajukan kandidat ke posisi dan perusahaan klien baru dengan penegakan 6 aturan bisnis.
   - **`Schedule Interview`**: Penjadwalan interview terintegrasi dengan ekspor kalender `.ics`.
   - **`Offer Letter Generator`**: Pembuatan surat penawaran kerja resmi dengan e-signature digital.
   - **`Outreach Generator`**: Template pesan instan ke WhatsApp (`wa.me`) dan Email (`mailto:`).
9. **Ikonografi Vektor Bersih (Non-AI Look)**:
   - Seluruh antarmuka menggunakan ikon garis tipis **Inline SVG** standar aplikasi B2B enterprise tanpa penggunaan emoji dekoratif.

---

## 📁 Struktur Repositori & Dokumentasi

```text
TemuTalenta/
├── docs/
│   ├── PRD.md                    # Product Requirements Document (Spesifikasi Produk Lengkap)
│   ├── blueprint-perencanaan.md  # Blueprint arsitektur & alur operasional konsultan
│   └── core.md                   # Knowledge core: skema data, status pipeline & aturan bisnis
├── src/
│   ├── css/
│   │   └── style.css             # Stylesheet B2B Enterprise (Light & Dark Mode)
│   ├── js/
│   │   ├── data.js               # Dataset kandidat, riwayat rekomendasi & kamus ID/EN
│   │   └── app.js                # Mesin filter, sortir tabel, i18n, tema & operasi modal
│   └── index.html                # Entri point dalam direktori src
├── index.html                    # Entri point utama (siap dibuka langsung di browser)
├── server.js                     # Server HTTP lokal zero-dependency (Node.js)
├── package.json                  # Konfigurasi npm script
└── README.md                     # Dokumentasi utama repositori
```

---

## 🚀 Cara Menjalankan Secara Offline

1. **Langsung Buka di Browser**:
   Klik ganda pada berkas [index.html](file:///C:/Users/901191/GitHub/TemuTalenta/index.html).
2. **Melalui Local Server Node.js**:
   ```powershell
   cd C:\Users\901191\GitHub\TemuTalenta
   npm start
   ```
   Buka `http://localhost:3000` di peramban Anda.

---

## 📖 Dokumentasi Perencanaan & Spesifikasi
- [docs/PRD.md](file:///C:/Users/901191/GitHub/TemuTalenta/docs/PRD.md) – Product Requirements Document (PRD v2.0).
- [docs/blueprint-perencanaan.md](file:///C:/Users/901191/GitHub/TemuTalenta/docs/blueprint-perencanaan.md) – Blueprint Perencanaan Sistem.
- [docs/core.md](file:///C:/Users/901191/GitHub/TemuTalenta/docs/core.md) – Knowledge Core & Standar Skema Data.
