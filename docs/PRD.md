# Product Requirements Document (PRD): TemuTalenta ATS & Resume Library

| Metadata Dokumen | Detail |
| :--- | :--- |
| **Nama Produk** | TemuTalenta (Enterprise Recruitment & Consultant ATS) |
| **Versi Dokumen** | 2.0 (Alignment dengan Enterprise Resume Library UI) |
| **Status** | Approved & Implemented (Offline-First Functional MVP) |
| **Target Pengguna** | Recruitment Consultant, HR Talent Acquisition, Account Manager, Lead Hunter |
| **Bahasa Antarmuka** | Bilingual (Bahasa Indonesia & English) |
| **Tema Antarmuka** | Dual Theme (Light Mode & Dark Mode) |

---

## 1. Latar Belakang & Tujuan Produk

**TemuTalenta** adalah sistem manajemen rekrutmen dan pustaka resume (*Applicant Tracking System & Resume Library*) yang dirancang untuk konsultan rekrutmen dan tim *talent acquisition*. Sistem ini memusatkan basis data kandidat, memantau riwayat rekomendasi kandidat ke berbagai perusahaan klien (*Recommended Repeat & Recommended List*), serta memantau konversi tahapan seleksi dari awal masuk hingga diterima bekerja (*Entry*).

### Tujuan Utama:
1. **Sentralisasi Basis Data Resume (`Resume Lib`)**: Menyimpan dan menampilkan profil kandidat secara terstruktur (kebangsaan, usia, pendidikan, penguasaan bahasa, masa kerja, posisi & perusahaan rekomendasi).
2. **Kecepatan Pencarian & Penyaringan**: Mendukung pencarian nama, kata kunci, filter tahapan pipeline (*All, New, Pending, Original resume pass, Interview, Failed, Entry*), serta pengaturan kolom tabel dinamis.
3. **Pelacakan Rekomendasi Berulang (`Recommended Repeat`)**: Memungkinkan konsultan merekomendasikan satu kandidat potensial ke beberapa posisi atau perusahaan klien dan melacak seluruh riwayatnya di `Recommended List`.
4. **Dukungan Multi-Bahasa & Tema**: Menyediakan pengalih bahasa instan (**Indonesia / English**) dan tema tampilan (**Light / Dark**) untuk kenyamanan operasional harian.

---

## 2. Modul & Struktur Navigasi

Sistem memiliki tata letak *Enterprise Admin Dashboard* dengan panel navigasi samping (*Left Sidebar*) dan bilah utilitas atas (*Top Header*):

### 2.1 Navigasi Samping (Sidebar)
1. **Talent Management (`Manajemen Talenta`)**
   - **Resume Lib (`Pustaka Resume`)**: Tabel utama manajemen kandidat, filter tahapan, kustomisasi kolom, dan operasi langsung per baris.
   - **Add Candidate (`Tambah Kandidat`)**: Formulir input kandidat baru ke dalam pustaka resume lokal.
2. **Consultant Business (`Bisnis Konsultan`)**
   - **Recommended List (`Daftar Rekomendasi`)**: Rekapitulasi lintas kandidat atas semua pengajuan ke perusahaan klien beserta pembaruan status seleksinya.
   - **Client Companies (`Perusahaan Klien`)**: Direktori perusahaan mitra dan posisi lowongan aktif.
3. **Data Analysis (`Analisis Data`)**
   - **Pipeline Analytics (`Analitik Pipeline`)**: Ringkasan statistik jumlah kandidat per tahapan seleksi, rasio keberhasilan (*Entry*), dan distribusi bahasa/pendidikan.

### 2.2 Bilah Atas (Top Header & Sub-Header)
- **Tombol Lipat Sidebar**: Menyembunyikan atau menampilkan panel navigasi kiri.
- **Pengalih Bahasa (Indonesia / English)**: Mengubah seluruh label UI, header tabel, tombol aksi, dan pesan status secara *real-time*.
- **Notifikasi & Pengaturan Cepat**: Indikator aktivitas pipeline terbaru.
- **Pengalih Tema (Light / Dark Mode)**: Mengubah skema warna antarmuka tanpa memuat ulang halaman (*zero reload*) dan menyimpannya di penyimpanan lokal.
- **Sub-Header Navigasi**: Tombol Kembali (`<`), Muat Ulang Tabel (`Refresh`), dan Beranda (`Home`).

---

## 3. Spesifikasi Fungsional: Modul Utama `Resume Lib`

### 3.1 Baris Pencarian & Filter (Search Bar)
- **Input `Candidate Name`**: Pencarian parsial (*case-insensitive*) berdasarkan nama kandidat.
- **Input `Key word`**: Pencarian lintas kolom (Posisi Rekomendasi, Perusahaan Klien, Bahasa, Pendidikan, atau Catatan Keahlian).
- **Dropdown `State`**: Filter berdasarkan status tahapan saat ini.
- **Tombol `Search`**: Mengeksekusi filter sesuai kombinasi input aktif.
- **Tombol `Search All`**: Mereset seluruh input pencarian dan menampilkan seluruh data kandidat.
- **Tombol `Advanced Search` (`Pencarian Lanjutan`)**: Membuka panel filter tambahan (Gender, Rentang Usia, Tingkat Pendidikan, Minimal Tahun Pengalaman, serta tombol tambah kandidat baru).

### 3.2 Filter Tahapan Pipeline (Status Tabs)
Kandidat dikelompokkan ke dalam 7 tab tahapan:
1. **`All`**: Menampilkan seluruh kandidat tanpa terkecuali.
2. **`New`**: Kandidat baru masuk ke dalam pustaka resume dan belum diajukan.
3. **`Pending`**: Resume kandidat sedang dalam antrean peninjauan internal/klien.
4. **`Original resume pass`**: Resume asli telah lolos seleksi administrasi awal klien.
5. **`Interview`**: Kandidat sedang dalam proses wawancara (HR / User / Teknis).
6. **`Failed`**: Kandidat belum berhasil pada tahapan seleksi (ditandai indikator titik merah pada tab).
7. **`Entry`**: Kandidat lolos seluruh tahapan dan resmi bergabung (*Onboarding / Hired*).

### 3.3 Pengaturan Kolom Tampilan (`Display Columns`)
- Pengguna dapat memilih kolom mana saja yang ingin ditampilkan atau disembunyikan pada tabel utama melalui kontrol pemilih kolom di sebelah kanan tab status.

### 3.4 Spesifikasi Kolom Tabel `Resume Lib`

| No | Nama Kolom (EN) | Nama Kolom (ID) | Tipe Data & Perilaku |
| :-: | :--- | :--- | :--- |
| 1 | `Candidate` | `Kandidat` | Teks tautan biru. Klik membuka modal profil & detail CV kandidat. |
| 2 | `Nationality` | `Kebangsaan` | Teks (contoh: `Indonesia`). |
| 3 | `Status` | `Status` | Lencana angka biru (jumlah riwayat pengajuan/aktivitas rekomendasi kandidat). |
| 4 | `Gender` | `Jenis Kelamin` | `Male` / `Female` (`Laki-laki` / `Perempuan`). |
| 5 | `Age` | `Usia` | Angka usia kandidat dalam tahun. |
| 6 | `Education` | `Pendidikan` | Jenjang pendidikan (`undergraduate`, `master`, `diploma`). |
| 7 | `Language` | `Bahasa` | Daftar bahasa yang dikuasai (contoh: `Indonesian, English, Chinese`). |
| 8 | `Year of service` | `Masa Kerja` | Angka total tahun pengalaman kerja. |
| 9 | `Recommended Position` | `Posisi Rekomendasi` | Jabatan terakhir yang direkomendasikan kepada klien. |
| 10 | `Recommended Company` | `Perusahaan Tujuan` | Nama perusahaan klien tujuan rekomendasi. |
| 11 | `Entry time` | `Waktu Masuk` | Timestamp (`YYYY-MM-DD HH:mm:ss`), mendukung pengurutan naik/turun (*sortable*). |
| 12 | `Operation` | `Operasi` | Tiga tombol aksi per baris: `Download Resume`, `Recommended Repeat`, `Recommended List`. |

### 3.5 Aksi Operasional Baris (`Operation`)
1. **`Download Resume` (`Unduh Resume`)**:
   - Menghasilkan dan mengunduh berkas ringkasan CV kandidat terformat secara instan untuk dikirimkan ke klien.
2. **`Recommended Repeat` (`Rekomendasi Ulang`)**:
   - Membuka dialog formulir untuk merekomendasikan kandidat tersebut ke posisi dan perusahaan klien baru.
   - Menambahkan skor angka pada kolom `Status` (+1) dan memperbarui posisi/perusahaan rekomendasi terbaru.
3. **`Recommended List` (`Daftar Rekomendasi`)**:
   - Membuka dialog riwayat seluruh pengajuan kandidat ke berbagai perusahaan klien beserta tanggal, tahapan pipeline, catatan konsultan, dan opsi mengubah tahapan seleksi.

---

## 4. Spesifikasi Desain & Non-Fungsional

1. **Estetika B2B Enterprise Bersih (Non-AI Look)**:
   - Dilarang menggunakan emoji dekoratif pada menu, tombol, atau tabel.
   - Seluruh ikon menggunakan **Inline SVG** bergaya garis tipis (*clean stroke icons* 1.5px–1.75px) yang tajam dan profesional.
   - Proporsi tabel padat (*compact enterprise data grid*), border tegas 1px, kontras tipografi tinggi, dan tata letak tombol aksi seragam.
2. **Offline-First & Zero External Dependency**:
   - Berjalan langsung dengan membuka `index.html` atau melalui `node server.js` tanpa ketergantungan library CDN eksternal.
   - Seluruh perubahan (penambahan kandidat, rekomendasi ulang, perubahan tahapan seleksi, pilihan bahasa, dan tema) tersimpan otomatis di `localStorage`.
3. **Aksesibilitas & Standar Web Modern**:
   - Tabel dapat diurutkan menggunakan tombol semantik di dalam `<th scope="col">` dengan atribut `aria-sort`.
   - Jendela dialog menggunakan elemen `<dialog>` asli dengan `overscroll-behavior: contain`.
   - Dukungan skema warna melalui `<meta name="color-scheme" content="light dark">` dan properti CSS `:root`.
