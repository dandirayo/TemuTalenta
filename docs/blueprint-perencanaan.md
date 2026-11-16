# Blueprint Perencanaan: TemuTalenta

Dokumen ini memuat arsitektur menyeluruh, peta jalan produk (*product roadmap*), spesifikasi teknis, serta strategi implementasi platform **TemuTalenta**.

---

## 1. Ringkasan Eksekutif & Visi Produk

### 1.1 Visi
Menjadi platform kurasi dan pencocokan talenta profesional Indonesia yang efisien, transparan, dan terstandarisasi, menghubungkan pencari kerja/freelancer dengan pemilik proyek (*project owner*), instansi, dan korporasi.

### 1.2 Masalah yang Diselesaikan
1. **Ketimpangan Validasi Skill**: Portofolio kandidat sering kali sulit diverifikasi keasliannya dan tingkat kedalamannya.
2. **Pencarian Tidak Efisien**: Pencarian berbasis kata kunci konvensional kerap menghasilkan kandidat yang tidak cocok dengan kebutuhan riil proyek.
3. **Standarisasi Kontrak & Pembayaran Domestik**: Belum optimalnya integrasi tata kelola ketenagakerjaan lokal (seperti PPh 21, SPK/PKWT, dan rekening bank domestik).

### 1.3 Nilai Tambah (*Value Propositions*)
- **Scoring Matchmaking Cerdas**: Algoritma pembobotan berbasis skill spesifik, pengalaman, ketersediaan, serta ekspektasi rate/anggaran.
- **Offline-First & Mandiri**: Dapat dijalankan secara lokal/mandiri tanpa ketergantungan wajib pada cloud saat demonstrasi internal, verifikasi awal, atau lingkungan terbatas (*on-premise*).
- **Format Data Terbuka (JSON Standard)**: Profil talenta dan lowongan pekerjaan menggunakan skema baku yang portabel.

---

## 2. Arsitektur Sistem

TemuTalenta mengadopsi pendekatan arsitektur bertahap (*Evolutionary Architecture*):

```
+--------------------------------------------------------------------------+
|                            USER INTERFACE (UI)                           |
|       SPA / PWA (Modern HTML5, Semantic Elements, Native Dialog)         |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                     OFFLINE CLIENT CORE ENGINE                           |
|  - Local Data Manager (IndexedDB / LocalStorage)                         |
|  - Matchmaking Scoring Engine (Vector & Tag Distance)                   |
|  - JSON Importer / Exporter                                              |
+--------------------------------------------------------------------------+
                                     | (Fase 2 & 3: Sinkronisasi)
                                     v
+--------------------------------------------------------------------------+
|                         BACKEND SERVICE (Opsional)                       |
|  - RESTful / GraphQL API (FastAPI / Node.js)                             |
|  - PostgreSQL / SQLite (Data Terpusat & Audit Trail)                     |
|  - Auth & Role-Based Access Control (RBAC)                               |
+--------------------------------------------------------------------------+
```

### 2.1 Fase Arsitektur
1. **Fase 1 (Offline Standalone - Saat Ini)**:
   - Berjalan murni di sisi browser klien (Zero Dependencies, Zero Server required).
   - Penyimpanan data lokal (*Local Storage / In-Memory Mock Store*).
   - Pencocokan talenta komputasi di sisi klien (*Client-side scoring*).
   - Fitur ekspor/impor data profil & lowongan dalam format JSON.
2. **Fase 2 (PWA & Local-first Sync)**:
   - Dukungan Service Worker untuk caching penuh offline.
   - Sinkronisasi peer-to-peer / local network (LAN SQLite/PouchDB).
3. **Fase 3 (Enterprise Hybrid Cloud)**:
   - Sinkronisasi berkala ke database terpusat (PostgreSQL).
   - Verifikasi identitas e-KYC dan integrasi sistem absensi/payroll korporasi.

---

## 3. User Personas & User Journeys

### 3.1 Persona

| Role | Karakteristik | Kebutuhan Utama |
| :--- | :--- | :--- |
| **Talenta / Kandidat** | Software Engineer, UI/UX Designer, Data Analyst, dsb. | Menampilkan portofolio, menetapkan ketersediaan (*availability*), dan mendapatkan tawaran proyek relevan. |
| **Recruiter / Project Owner** | Tech Lead, HR Manager, Founder Startup, Project Manager. | Mencari kandidat berdasarkan kriteria spesifik, menyaring kandidat cepat, dan membuat lowongan proyek. |
| **Administrator** | Verifikator internal sistem TemuTalenta. | Mengelola taksonomi skill, memvalidasi kepatuhan data, dan memonitor kualitas pencocokan. |

### 3.2 User Journey: Rekrutmen Cepat
1. **Pemberi Kerja** membuka katalog atau halaman *Matchmaker*.
2. Memasukkan kriteria: Kategori (misal: *Backend Development*), Skill utama (misal: *Go, PostgreSQL, Docker*), Budget maks (Rp/bulan), dan Tipe Kerja (*Remote/Hybrid*).
3. Sistem menghitung skor kecocokan (*Match Score*) secara instan dari 0% hingga 100%.
4. Pemberi kerja meninjau profil lengkap talenta, portofolio, dan kontak melalui jendela modal interaktif.
5. Pemberi kerja menyimpan kandidat terpilih ke daftar *Bookmark* atau mengunduh ringkasan kandidat.

---

## 4. Skema Entitas Data (Entity Relationship)

### 4.1 Entitas Kunci
- **Talent (`talents`)**: ID, Nama, Gelar/Peran, Bio, Lokasi, Kategori, Status Ketersediaan, Pengalaman (Tahun), Expected Rate (IDR), Rating, Skills, Portofolio, Kontak.
- **Skill (`skills`)**: ID, Nama, Kategori, Tingkat Kepentingan (Wajib/Opsional).
- **Portfolio (`portfolios`)**: ID, Judul, Klien/Organisasi, Tahun, Tautan, Deskripsi, Tech Stack Terkait.
- **Job / Project (`jobs`)**: ID, Judul Proyek, Pemilik, Deskripsi, Budget, Kategori, Skill yang Dibutuhkan, Tanggal Dibuat, Status (Open/Closed).
- **MatchResult (`matches`)**: ID, TalentID, JobID, MatchScore, Breakdown Skor (Skill, Experience, Budget, Location).

---

## 5. Algoritma Matchmaking (Pencocokan Talenta)

Algoritma scoring menggunakan formula pembobotan multi-faktor:

$$\text{Total Score} = (W_s \times S_s) + (W_e \times S_e) + (W_b \times S_b) + (W_a \times S_a)$$

Dimana bobot default:
- **$W_s$ (Bobot Skill)**: 0.45 (45%) — Mengukur rasio kecocokan keahlian wajib dan pendukung.
- **$W_e$ (Bobot Pengalaman)**: 0.25 (25%) — Mengukur pemenuhan standar tahun pengalaman yang diminta.
- **$W_b$ (Bobot Budget/Rate)**: 0.20 (20%) — Toleransi kesesuaian anggaran vs ekspektasi honor talenta.
- **$W_a$ (Bobot Ketersediaan)**: 0.10 (10%) — Status siap kerja (Immediately, 2 Weeks, 1 Month).

---

## 6. Kepatuhan & Keamanan Data (Indonesian Regulatory Compliance)
- **UU Pelindungan Data Pribadi (UU PDP No. 27/2022)**: Data sensitif (NIK, nomor telepon pribadi, rekening) hanya dipertukarkan setelah persetujuan eksplisit (*explicit consent*).
- **Kerahasiaan Portofolio (NDA)**: Pilihan bagi talenta untuk menandai portofolio tertentu sebagai *Confidential/Redacted* (hanya menampilkan ringkasan metrik tanpa membocorkan kode atau rahasia dagang klien).

---

## 7. Rencana Rilis & Milestone

| Fase | Target Waktu | Output Kunci |
| :--- | :--- | :--- |
| **M1: Core Docs & Offline App** | Minggu 1 | Dokumen Blueprint, Core Knowledge, dan Web UI Offline-First yang interaktif. |
| **M2: Filter Cerdas & Formulir Interaktif** | Minggu 2 | Pencarian multi-kategori, modul simulasi kalkulasi matchmaker, serta manajemen bookmark talenta. |
| **M3: Ekspor/Impor & PWA** | Minggu 3 | Penyimpanan LocalStorage persisten, ekspor data profil JSON, dan cache offline PWA. |
| **M4: Integrasi REST API & Backend** | Minggu 4+ | Pengembangan API terpusat jika beralih ke mode multi-user daring. |
