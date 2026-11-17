# Blueprint Perencanaan: TemuTalenta (Enterprise Recruitment & Resume Library)

Dokumen ini memuat cetak biru arsitektur, alur operasional konsultan rekrutmen, skema data kandidat & rekomendasi, serta peta jalan pengembangan platform **TemuTalenta**.

---

## 1. Ringkasan Eksekutif

**TemuTalenta** adalah platform manajemen rekrutmen terpadu (*Applicant Tracking System & Consultant Resume Library*) yang memfasilitasi konsultan rekrutmen dan tim HR dalam mengelola ribuan resume kandidat, memfilter kualifikasi multibahasa, serta melacak riwayat pengajuan kandidat ke berbagai perusahaan mitra (*Recommended Repeat & Recommended List*).

### Fitur Pilar Utama:
- **Single-User Full Control (AUL SuperAdmin)**: Mode deployment satu pengguna terpadu dengan hak akses penuh (*SuperAdmin*) ke seluruh fungsi tanpa restriksi.
- **Enterprise Resume Library (`Resume Lib`)**: Tabel data kepadatan tinggi (*high-density data table*) dengan penyaringan multi-parameter, pengurutan waktu masuk (*Entry time*), dan visibilitas kolom yang dapat dikustomisasi.
- **Draggable & Resizable Left Sidebar**: Menu navigasi samping kiri yang dapat ditarik lebarnya ke arah tengah secara dinamis dengan batas aman (*min 175px, max 450px*) dan reset klik ganda (*double-click*).
- **Career Portal Job Management**: Portal lowongan kerja klien dengan kemampuan pembuatan lowongan baru (+ Post Job Order), edit lowongan, dan hapus lowongan.
- **Multi-Stage Pipeline Tracking**: Pemantauan status kandidat dari `New`, `Pending`, `Original resume pass`, `Interview`, `Failed`, hingga `Entry`.
- **Bilingual UI (Indonesia & English)**: Sistem lokalisasi instan tanpa muat ulang halaman.
- **Dual Theme (Light & Dark Mode)**: Antarmuka adaptif untuk kenyamanan kerja jangka panjang dengan kontras terukur.
- **Offline-First & Mandiri**: Beroperasi penuh di peramban lokal dengan persistensi `localStorage` dan ekspor/unduh dokumen resume instan.

---

## 2. Arsitektur Sistem

```
+-----------------------------------------------------------------------------+
|                        PRESENTATION LAYER (UI/UX)                           |
|  - Enterprise Sidebar Layout (Talent Mgmt, Consultant Business, Analytics)  |
|  - Bilingual Engine (ID / EN) & Theme Controller (Light / Dark)             |
|  - Accessible Sortable Data Table & Native <dialog> Overlays                |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                      APPLICATION LOGIC & STATE ENGINE                       |
|  - Multi-Criteria Filter Engine (Name, Keyword, Stage, Advanced Filters)    |
|  - Dynamic Column Visibility Controller                                     |
|  - Recommendation Tracker (Recommended Repeat & Historical List)            |
|  - Instant Resume Document Generator (Downloadable CV)                      |
+-----------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------+
|                        LOCAL PERSISTENCE LAYER                              |
|  - Browser LocalStorage (Candidates, Recommendations, Preferences)          |
|  - JSON Schema Import / Export Ready                                        |
+-----------------------------------------------------------------------------+
```

---

## 3. Alur Kerja Operasional (Consultant Workflow)

1. **Akuisisi & Input Resume (`New`)**:
   - Konsultan memasukkan data kandidat baru (Nama, Kebangsaan, Gender, Usia, Pendidikan, Bahasa, Tahun Pengalaman, serta Posisi/Perusahaan awal).
2. **Kurasi & Verifikasi (`Pending` -> `Original resume pass`)**:
   - Konsultan menyaring kandidat menggunakan pencarian kata kunci atau filter lanjutan, mengunduh resume (`Download Resume`), dan mengirimkannya ke perusahaan klien.
3. **Proses Seleksi & Wawancara (`Interview`)**:
   - Kandidat yang lolos seleksi dokumen masuk ke tahap wawancara. Semua catatan progres tercatat di dalam `Recommended List`.
4. **Rekomendasi Lintas Klien (`Recommended Repeat`)**:
   - Apabila kandidat potensial dibutuhkan juga oleh perusahaan mitra lain (misal: *alauda*, *Mico World*, *Midea*), konsultan menekan tombol `Recommended Repeat` untuk menambahkan pengajuan baru tanpa menduplikasi data kandidat utama.
5. **Keputusan Akhir (`Entry` / `Failed`)**:
   - Kandidat yang diterima kerja dipindahkan ke status `Entry`, sedangkan kandidat yang gugur ditandai `Failed` sebagai referensi evaluasi di masa mendatang.

---

## 4. Peta Jalan Pengembangan & Hasil Audit (Audit & Roadmap)

Implementasi fitur telah diaudit menyeluruh dan diselaraskan dengan spesifikasi **PRD.md** ke dalam 6 fase terstruktur (ditambah optimasi responsif penuh lintas HP, Tablet, dan Desktop):

| Fase | Fokus Pengembangan & Fitur yang Diimplementasikan | Status Audit |
| :--- | :--- | :---: |
| **Fase 1 (P0 - Core ATS & Data Integrity)** | • **Resume Lib Enterprise Table**: Pencarian sebagian nama, kata kunci, filter umur, pendidikan, masa kerja.<br>• **8 Pipeline Tabs**: All, New (0), Pending (10, 11), Resume Pass (12), Interview (20-22), Offer (30, 31), Failed (x9, 90, 91), Entry (40, 41).<br>• **Badge Dua Digit**: 0 s.d 91 sesuai kamus ATS.<br>• **Detail Profil Kandidat Lengkap (DK-01 s.d DK-06)**: 4 Sub-tab (Ringkasan & Kontak, Pengalaman & Pendidikan, Penampil Dokumen CV, Riwayat Aktivitas).<br>• **Transisi Status dengan Validasi Wajib**: Prompt alasan wajib untuk kode gagal (19, 29, 39, 49, 90) dan validasi hak akses manajer untuk Blacklist (91).<br>• **6 Aturan Validasi Rekomendasi Ulang**: Cek riwayat per perusahaan dalam 6 bulan, deteksi duplikasi aktif, dan perlindungan izin manajer.<br>• **URL Query Sync (RL-07)**: Sinkronisasi parameter filter ke query URL peramban. | **SELESAI (Verified)** |
| **Fase 2 (P1 - Agency Operations & Governance)** | • **Role-Based Access Control (RBAC)**: Role Switcher di header dengan 3 persona (Super Admin, Team Manager, Consultant) beserta penegakan hak akses.<br>• **Ekspor CSV Terproteksi (RL-23)**: Hanya dapat diunduh oleh Manager dan Super Admin.<br>• **Impor Massal CSV & Unduh Template (RL-22)**: Unggah file CSV atau salin-tempel baris data dengan deteksi duplikat otomatis.<br>• **Pusat Notifikasi Interaktif (NT-01, NT-02)**: Lonceng notifikasi dengan counter belum dibaca (*unread badge*) dan panel popover interaktif.<br>• **Konsultan Business & Klien**: Rekapitulasi rekomendasi kandidat lintas klien dan matrix posisi aktif. | **SELESAI (Verified)** |
| **Fase 3 (P2 - Visual Analytics & Master Data)** | • **Recruitment Funnel Chart (DA-01 s.d DA-05)**: Visualisasi horizontal bar persentase konversi kandidat dari New hingga Entry.<br>• **Master Data Settings (PG-01, PG-02)**: Manajemen kamus perusahaan klien dan daftar posisi pekerjaan terstandarisasi untuk Super Admin.<br>• **Tri-lingual Localization**: Dukungan penuh English, 中文 (Chinese), dan Bahasa Indonesia dengan tombol toggle cepat dan dropdown. | **SELESAI (Verified)** |
| **Fase 4 (P3 - Advanced Enterprise ATS & Candidate Engagement)** | • **Public Career Portal (Job Board)**: Eksplorasi lowongan kerja terbuka lintas klien (*alauda*, *ByteDance*, *Shopee*, *GoTo*), filter perusahaan, pencarian skill, modal lamaran publik mandiri dengan ingest otomatis ke Resume Lib (Code 0 - New).<br>• **Interview Calendar & .ICS Scheduler**: Agenda jadwal wawancara terpadu, integrasi room Google Meet/Zoom, auto-update status kandidat ke Code 20 (Interview Scheduled) & Code 21 (Interview Passed), serta ekspor file kalender standar RFC-5545 (`.ics`).<br>• **Official Employment Offer Letter Generator**: Pembuatan surat penawaran kerja resmi berstandar korporat, tabel kompensasi (gaji gross, bonus tahunan, BPJS, asuransi swasta), blok tanda tangan direksi & kandidat, ekspor cetak/PDF, dan auto-advance ke Code 30 (Offer Proposed).<br>• **Heuristic Smart CV Parser**: Ekstraksi cerdas teks CV mentah (Nama, Email, No. HP/WA, Masa Kerja, Pendidikan, Posisi, Skill) dengan auto-fill formulir pendaftaran kandidat. | **SELESAI (Verified)** |
| **Fase 5 (P4 - Kanban Board, Warranty & Fee Tracker, E-Signature & Full PRD Governance)** | • **Visual Kanban Pipeline Board**: Mode kanban *drag-and-drop* dan dropdown keyboard-accessible di 7 tahap rekrutmen serta ikon *header* utilitas ke-2.<br>• **Placement Fee & 90-Day Probation Warranty Tracker**: Kalkulasi estimasi fee agensi (default 18%), jatuh tempo garansi 90 hari, status invoice, serta transisi cepat Code 40 → 41 / 49.<br>• **Digital E-Signature Acceptance (Code 31)**: Tanda tangan elektronik dan tanggal mulai kerja wajib pada Offer Letter yang otomatis menutup rekomendasi paralel ke Code 90.<br>• **Deep PRD Compliance**: Multi-versi CV & unggah versi (DK-03), editor tag & catatan internal (DK-06), filter penuh RL-06 (Bahasa, Perusahaan, Konsultan, Arsip), kebijakan jendela duplikat terkonfigurasi, *Soft Delete* & *Super Admin Hard Delete*, serta *JSON Backup/Restore* dari menu Avatar pengguna. | **SELESAI (Verified)** |
| **Fase 6 (P5 - 100% PRD Parity & Operational Productivity)** | • **Filter RL-06 & Rentang Tanggal Penuh**: Penambahan *Max Service Year*, filter Posisi Direkomendasikan, dan rentang tanggal masuk (*From* / *To*).<br>• **Multi-Select Batch Operations Toolbar**: Pemilihan beberapa kandidat sekaligus di Resume Lib dengan aksi *Batch Recommend* (mematuhi 6 aturan validasi), *Batch Tag*, dan *Batch Archive* (melindungi status terkunci `>= 40`).<br>• **Editor Inline DK-02 (Work & Education)**: Penambahan langsung riwayat pekerjaan dan pendidikan di dalam modal profil kandidat.<br>• **PG-02 Master Dictionaries & Status Registry**: Pengelolaan dinamis Master Bahasa & Negara/Kebangsaan serta tabel referensi kamus 17 kode status tri-lingual (`0`–`91`).<br>• **Candidate WhatsApp & Email Outreach Generator**: Pembuat draf pesan *outreach* berbasis template dengan tautan langsung `wa.me` dan `mailto:`.<br>• **Analytics DA-01 / DA-02 / DA-04 Lanjutan**: Filter rentang waktu analitik, grafik batang *Monthly Talent Inflow* (`2026-05` s.d `2026-11`), rincian kode gagal (`19/29/39/49/90/91`), serta capaian *placement* per konsultan. | **SELESAI (Verified)** |
| **Fase 7 (P6 - In-App Centered Popups & Glassmorphism Blur System)** | • **Zero Native Browser Dialogs**: Eliminasi penuh 8 panggilan native `confirm()` dan 20 native `alert()` browser.<br>• **Custom In-App Prompt Dialog (`#customPromptModal`)**: Dialog konfirmasi hapus/aksi dan pemberitahuan di tengah layar (*centered*) dengan sudut membulat 18px, animasi `modalPopIn`, serta badge ikon semantik (danger, warning, info, success).<br>• **Frosted Glass Backdrop Blur**: Penerapan `backdrop-filter: blur(8px) saturate(180%)` pada seluruh overlay `dialog::backdrop` di seluruh aplikasi, mendukung modal bertumpuk (*stacked dialog on modal*). | **SELESAI (Verified)** |
