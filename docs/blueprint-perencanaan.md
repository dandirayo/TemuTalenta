# Blueprint Perencanaan: TemuTalenta (Enterprise Recruitment & Resume Library)

Dokumen ini memuat cetak biru arsitektur, alur operasional konsultan rekrutmen, skema data kandidat & rekomendasi, serta peta jalan pengembangan platform **TemuTalenta**.

---

## 1. Ringkasan Eksekutif

**TemuTalenta** adalah platform manajemen rekrutmen terpadu (*Applicant Tracking System & Consultant Resume Library*) yang memfasilitasi konsultan rekrutmen dan tim HR dalam mengelola ribuan resume kandidat, memfilter kualifikasi multibahasa, serta melacak riwayat pengajuan kandidat ke berbagai perusahaan mitra (*Recommended Repeat & Recommended List*).

### Fitur Pilar Utama:
- **Enterprise Resume Library (`Resume Lib`)**: Tabel data kepadatan tinggi (*high-density data table*) dengan penyaringan multi-parameter, pengurutan waktu masuk (*Entry time*), dan visibilitas kolom yang dapat dikustomisasi.
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

## 4. Peta Jalan Pengembangan (Roadmap)

| Fase | Fokus Pengembangan | Status |
| :--- | :--- | :---: |
| **Fase 1** | Core UI `Resume Lib`, Filter Pipeline 7 Tahap, Sortable Table, Bilingual (ID/EN), Light/Dark Theme, Operasi Baris (`Download Resume`, `Recommended Repeat`, `Recommended List`). | **Selesai (Aktif)** |
| **Fase 2** | Modul `Consultant Business` (Manajemen Klien & Rekap Rekomendasi) dan Modul `Data Analysis` (Statistik Konversi Pipeline). | **Selesai (Aktif)** |
| **Fase 3** | Ekspor/Impor Massal CSV/Excel dan Parser Dokumen PDF/Word Otomatis. | **Terencana** |
| **Fase 4** | Sinkronisasi Backend Terpusat (PostgreSQL + REST API) & Role-Based Access Control (RBAC) antar Tim Konsultan. | **Terencana** |
