# PRD — Website ATS (Applicant Tracking System)

Nov 16, 2026 · @dendiz

## Ringkasan produk

Versi pertama (MVP) adalah website ATS untuk agensi rekrutmen: konsultan menyimpan CV kandidat di satu bank resume, menggerakkan kandidat lewat status rekrutmen, dan merekomendasikan kandidat ke perusahaan klien. Tampilan dan alur mengikuti layar **Resume Lib** pada referensi (GSrecruit).

**Masalah yang diselesaikan**

- CV kandidat tersebar di email, WhatsApp, dan folder pribadi, sehingga sulit dicari ulang.
- Status tiap kandidat (baru, diproses, interview, gagal, masuk kerja) tidak tercatat di satu tempat.
- Riwayat "kandidat ini sudah pernah dikirim ke klien mana" tidak terlacak, sehingga terjadi rekomendasi ganda.

**Tujuan MVP**

1. Semua CV kandidat bisa diunggah, dicari, dan diunduh dari satu halaman.
2. Setiap kandidat punya status yang jelas dan riwayat perubahannya.
3. Setiap rekomendasi kandidat ke perusahaan klien tercatat, dan rekomendasi ganda terdeteksi.
4. Antarmuka tersedia dalam Bahasa Inggris dan Mandarin (sesuai toggle di referensi), dengan opsi Bahasa Indonesia.

**Di luar cakupan MVP** (bisa masuk fase berikutnya): portal lamaran publik untuk kandidat, parsing CV otomatis dengan AI, integrasi job board (LinkedIn, JobStreet), penjadwalan interview dengan kalender, dan e-signature kontrak.

## Pengguna dan role

**Mode Implementasi: Single-User Full Control (Super Admin)**
Sistem saat ini dikonfigurasikan untuk penggunaan personal/internal tunggal dengan kendali penuh (*Full Control*). Seluruh modul, pengaturan, database kandidat, portal lowongan, kalender wawancara, pelacak garansi/penempatan, analitik, dan log audit dipegang oleh satu akun pengguna:
- **Nama Akun**: `AUL SuperAdmin`
- **Role**: `superadmin` (*Super Admin / Full Control*)
- **Cakupan Akses**: Tidak terbatas (bisa mengakses, menginput, mengedit, menghapus, mengunduh, mengekspor, serta mengonfigurasi seluruh modul tanpa batasan).

Meskipun sistem beroperasi dalam mode satu pengguna (*Single-User Mode*), fondasi arsitektur role enterprise tetap dipertahankan untuk fleksibilitas jangka panjang:

| Role | Identitas Default | Hak Akses |
| --- | --- | --- |
| **Super Admin** | `AUL SuperAdmin` | **Full Control**: Kelola kandidat, posting lowongan kerja klien, edit/hapus lowongan, atur jadwal wawancara, buat offer letter & e-sign, kelola kamus master data (perusahaan, posisi, bahasa, negara), atur user, dan ekspor seluruh analitik CSV. |
| Manajer | *(Arsitektur Multi-User)* | Monitoring pipeline tim, persetujuan lintas konsultan, ekspor data, analitik. |
| Konsultan (Recruiter) | *(Arsitektur Multi-User)* | Tambah/edit kandidat, unduh resume, ajukan rekomendasi klien, outreach WhatsApp/Email. |
| Klien Portal | *(Arsitektur Multi-User)* | Portal khusus perwakilan klien (misal: HR alauda) untuk mereview dan approve/reject CV. |

Setiap aksi penting (ubah status, rekomendasi, unduh CV, hapus) dicatat di log audit beserta pelaku dan waktunya.

## Struktur menu dan navigasi

Tata letak mengikuti referensi: sidebar gelap di kiri, header tipis di atas, area konten putih di kanan.

**Sidebar (bisa dilipat lewat ikon ☰ di header)**

1. Talent Management
   - Resume Lib (bank resume kandidat) — halaman utama MVP
2. Consultant Business
   - Daftar rekomendasi saya, target dan pencapaian konsultan
3. Data Analysis
   - Dashboard statistik kandidat dan rekomendasi
4. Pengaturan (hanya Super Admin): pengguna, role, master data

**Header kanan**

- Toggle bahasa Chinese / English (diusulkan ditambah Bahasa Indonesia)
- Ikon lonceng notifikasi dengan badge jumlah belum dibaca
- Ikon kedua di sebelah lonceng (fungsinya belum jelas dari gambar, lihat Pertanyaan terbuka)
- Toggle mode terang / gelap
- Avatar pengguna: profil, ganti kata sandi, logout

**Bar navigasi halaman** di bawah header: tombol kembali, muat ulang, dan beranda.

## Modul Resume Lib (bank resume)

Resume Lib adalah halaman kerja utama: satu tabel kandidat dengan pencarian di atas, tab status, dan tombol aksi per baris.

### Pencarian dan filter

| ID | Elemen | Perilaku |
| --- | --- | --- |
| RL-01 | Kolom Candidate Name | Cari sebagian nama, tidak peka huruf besar/kecil |
| RL-02 | Kolom Key word | Cari teks bebas di posisi, perusahaan, skill, dan isi CV (jika CV bisa dibaca teksnya) |
| RL-03 | Dropdown State | Filter status kandidat (daftar sama dengan tab status) |
| RL-04 | Tombol Search | Jalankan pencarian dengan semua isian yang terisi (logika AND) |
| RL-05 | Tombol Search All | Kosongkan semua filter dan tampilkan semua kandidat |
| RL-06 | Tombol "Tampilkan pencarian lanjutan" | Buka panel filter tambahan: kewarganegaraan, gender, rentang usia, pendidikan, bahasa, rentang lama pengalaman, posisi, perusahaan rekomendasi, rentang tanggal masuk, konsultan pemilik |
| RL-07 | Simpan filter di URL | Hasil pencarian bisa dibagikan lewat link dan tetap sama setelah muat ulang |

### Tab status

Tab: **All, New, Pending, Original resume pass, Interview, Offer, Failed, Entry**. Setiap tab memfilter berdasarkan kelompok kode status (lihat Daftar kode status); Offer adalah tab tambahan dari referensi. Titik merah pada tab menandai ada kandidat yang baru masuk tab itu dan belum dilihat pengguna.

### Pengaturan kolom ("Tampilkan kolom")

Multi-select berisi semua kolom; Candidate selalu tampil. Pilihan kolom disimpan per pengguna. Default 13 kolom seperti referensi.

### Tabel kandidat

| Kolom | Isi | Bisa diurutkan |
| --- | --- | --- |
| Candidate | Nama, berupa link ke detail kandidat | Ya |
| Nationality | Kewarganegaraan | Ya |
| Status | Badge kode status dua digit (0 = belum pernah direkomendasikan); warna per tahap, merah untuk kode gagal | Ya |
| Gender | Laki-laki / Perempuan | Tidak |
| Age | Dihitung otomatis dari tanggal lahir | Ya |
| Education | Jenjang pendidikan terakhir | Ya |
| Language | Daftar bahasa yang dikuasai, dipisah koma | Tidak |
| Year of service | Total lama pengalaman kerja (tahun) | Ya |
| Recommended Position | Posisi yang direkomendasikan terakhir | Tidak |
| Recommended Company | Perusahaan klien yang direkomendasikan terakhir | Tidak |
| Entry time | Waktu data kandidat dibuat, format YYYY-MM-DD HH:mm:ss | Ya (default terbaru di atas) |
| Operation | Tombol aksi | — |

Tabel memakai paginasi (10/20/50 baris per halaman) dan menampilkan total hasil. Sel kosong ditampilkan kosong, bukan "null".

### Aksi per baris (kolom Operation)

| ID | Tombol | Perilaku |
| --- | --- | --- |
| RL-10 | Download Resume | Unduh file CV asli (PDF/DOCX). Jika kandidat punya beberapa versi CV, unduh versi terbaru. Aksi dicatat di log |
| RL-11 | Recommended Repeat | Cek riwayat rekomendasi kandidat ke perusahaan yang dipilih sesuai Aturan rekomendasi ganda. Tampilkan peringatan berisi daftar rekomendasi sebelumnya (perusahaan, posisi, konsultan, tanggal, status), lalu blokir, minta alasan, atau minta persetujuan Manajer sesuai aturan |
| RL-12 | Recommended List | Buka panel samping berisi seluruh riwayat rekomendasi kandidat ini, plus tombol "Rekomendasikan ke perusahaan baru" |

### Tambah dan impor kandidat

- RL-20 Tombol **Tambah kandidat**: form data diri + unggah CV (maks. 10 MB, PDF/DOC/DOCX).
- RL-21 **Cek duplikat** saat simpan: nama + tanggal lahir, email, atau nomor telepon yang sama memunculkan peringatan.
- RL-22 **Impor massal** dari Excel/CSV dengan template yang bisa diunduh, plus laporan baris yang gagal.
- RL-23 **Ekspor** hasil pencarian ke Excel (hanya Manajer dan Super Admin).

## Modul pendukung

### Detail kandidat (klik nama)

- DK-01 Profil: nama, foto, kewarganegaraan, gender, tanggal lahir, kontak (email, telepon, WhatsApp), domisili, pendidikan, bahasa beserta level, lama pengalaman, ekspektasi gaji, gaji saat ini, ketersediaan mulai kerja.
- DK-02 Riwayat kerja dan pendidikan (bisa lebih dari satu baris).
- DK-03 Pratinjau CV langsung di browser, plus daftar versi CV.
- DK-04 Ubah kode status per rekomendasi lewat dropdown yang hanya menampilkan langkah sah berikutnya; alasan wajib untuk kode gagal (x9) dan 90.
- DK-05 Linimasa aktivitas: perubahan status, rekomendasi, catatan konsultan, unduhan CV.
- DK-06 Catatan internal dan tag bebas (misal "siap relokasi", "bahasa Mandarin fasih").

### Rekomendasi kandidat

- RK-01 Konsultan memilih perusahaan klien dan posisi (dari master data), lalu mengirim rekomendasi.
- RK-02 Satu kandidat bisa direkomendasikan ke beberapa perusahaan sekaligus. Tiap rekomendasi menyimpan kodenya sendiri, dan badge kandidat dihitung otomatis darinya (lihat Satu badge per kandidat).
- RK-03 Rekomendasi ganda dicek per perusahaan dengan jangka 6 bulan (lihat Aturan rekomendasi ganda).
- RK-04 Kolom Recommended Position dan Recommended Company di tabel menampilkan rekomendasi terakhir.

### Consultant Business

- CB-01 Daftar rekomendasi milik konsultan yang login, dengan filter status dan perusahaan.
- CB-02 Ringkasan pencapaian: jumlah kandidat baru, rekomendasi, interview, dan Entry per bulan.
- CB-03 Manajer bisa melihat semua konsultan dan membandingkannya.

### Data Analysis

- DA-01 Funnel kandidat per tahap: New → Pending → Original resume pass → Interview → Entry, dengan angka Failed per tahap.
- DA-02 Jumlah kandidat baru per minggu/bulan.
- DA-03 Sebaran kandidat per kewarganegaraan, pendidikan, bahasa, dan posisi.
- DA-04 Rekomendasi dan Entry per perusahaan klien dan per konsultan.
- DA-05 Filter rentang tanggal dan ekspor ke Excel.

### Notifikasi

- NT-01 Lonceng di header: kandidat baru di-assign, status rekomendasi berubah, peringatan rekomendasi ganda.
- NT-02 Klik notifikasi membuka detail kandidat terkait dan menandainya terbaca.

### Bahasa dan tampilan

- BH-01 Semua label antarmuka tersedia dalam English dan Chinese; pilihan disimpan per pengguna.
- BH-02 Data kandidat (nama, posisi) tidak diterjemahkan, ditampilkan apa adanya.
- BH-03 Mode terang dan gelap.

### Pengaturan (Super Admin)

- PG-01 Kelola pengguna: tambah, nonaktifkan, reset kata sandi, atur role.
- PG-02 Master data: perusahaan klien, posisi, status, jenjang pendidikan, bahasa, negara.

## Kode status dan aturan rekomendasi (keputusan)

Setiap kandidat punya **satu kode status dua digit** yang tampil di badge tabel. Digit pertama = tahap, digit kedua = langkah di dalam tahap, dan angka 9 di belakang = gagal di tahap itu. Kode hanya bisa maju ke langkah sah berikutnya; mundur hanya oleh Manajer dan tercatat di log. Nomor yang belum dipakai (13–18, 23–28, dst.) dicadangkan agar tahap baru bisa ditambah tanpa mengubah kode lama.

### Daftar kode status

| Kode | Nama | Tab | Arti | Diubah oleh |
| --- | --- | --- | --- | --- |
| 0 | New | New | Kandidat baru, belum pernah direkomendasikan ke perusahaan mana pun | Otomatis saat kandidat dibuat |
| 10 | Direkomendasikan | Pending | CV sudah dikirim ke klien, menunggu respons | Otomatis saat rekomendasi dibuat |
| 11 | Ditinjau klien | Pending | Klien mengonfirmasi sedang meninjau CV | Konsultan |
| 12 | CV lolos | Original resume pass | Klien menyetujui CV untuk lanjut | Konsultan |
| 19 | CV ditolak | Failed | Klien menolak CV | Konsultan, alasan wajib |
| 20 | Interview dijadwalkan | Interview | Tanggal interview sudah ditetapkan | Konsultan, tanggal wajib |
| 21 | Lolos interview awal | Interview | Lolos interview pertama (HR) | Konsultan |
| 22 | Interview final | Interview | Interview dengan user atau manajer klien | Konsultan |
| 29 | Gagal interview | Failed | Tidak lolos di interview mana pun | Konsultan, alasan wajib |
| 30 | Offer diajukan | Offer | Klien mengirim penawaran kerja | Konsultan |
| 31 | Offer diterima | Offer | Kandidat menerima penawaran | Konsultan, tanggal mulai kerja wajib |
| 39 | Offer batal / ditolak | Failed | Kandidat menolak atau klien membatalkan penawaran | Konsultan, alasan wajib |
| 40 | Mulai bekerja | Entry | Kandidat sudah masuk hari pertama | Konsultan |
| 41 | Lulus probation | Entry | Lolos masa percobaan; masa garansi penempatan selesai | Konsultan |
| 49 | Gagal probation / resign | Failed | Keluar selama masa percobaan | Konsultan, alasan wajib |
| 90 | Kandidat mundur | Failed | Kandidat menarik diri di tahap mana pun | Konsultan, alasan wajib |
| 91 | Blacklist | Failed | Tidak boleh direkomendasikan lagi ke perusahaan mana pun | Manajer saja |

Tab **Offer** adalah tambahan dari referensi. Tanpa tab ini, kandidat yang sudah ditawari kerja tercampur dengan yang masih interview, padahal di tahap ini kandidat paling sering mundur.

### Satu badge per kandidat, dihitung otomatis

Sesuai keputusan, status kandidat dan status rekomendasi digabung menjadi satu angka di badge. Supaya riwayat tidak hilang, kode tetap disimpan di setiap rekomendasi, lalu server menghitung badge kandidat dengan aturan ini:

1. Belum pernah direkomendasikan → **0**.
2. Ada rekomendasi yang masih berjalan → kode **paling maju** di antara rekomendasi yang berjalan. Contoh: Andi di Alauda 21 dan di Midea 12 → badge **21**.
3. Semua rekomendasi sudah selesai → kode rekomendasi yang **terakhir berubah**.
4. Kode 91 (Blacklist) selalu menang atas aturan lain.
5. Saat satu rekomendasi mencapai 31 (offer diterima), sistem menawarkan menutup rekomendasi lain yang masih berjalan dengan kode 90.

Badge tidak bisa diubah manual. Konsultan mengubah kode lewat rekomendasinya, dan badge ikut berubah.

### Aturan rekomendasi ganda (Recommended Repeat)

Pengecekan dilakukan **per perusahaan**, bukan per posisi. Alasannya: kolom di referensi adalah Recommended Company, dan di agensi rekrutmen kepemilikan kandidat serta fee biasanya dihitung per perusahaan klien.

| Kondisi | Tindakan sistem |
| --- | --- |
| Kandidat berkode 91 Blacklist | Diblokir untuk semua perusahaan |
| Perusahaan + posisi sama, rekomendasi sebelumnya masih berjalan | Diblokir; tampil rekomendasi yang sedang berjalan |
| Perusahaan sama, oleh konsultan lain, dalam 6 bulan terakhir | Peringatan berisi nama konsultan pertama; perlu persetujuan Manajer sebelum terkirim |
| Perusahaan sama (posisi apa pun), dalam 6 bulan terakhir | Peringatan + alasan wajib, tercatat di log |
| Kandidat sedang berkode 31 atau 40 | Peringatan + alasan wajib |
| Selain di atas | Bebas |

Jangka 6 bulan disimpan sebagai pengaturan yang bisa diubah Super Admin.

## Model data inti

Delapan entitas utama cukup untuk MVP. Nama tabel masih usulan.

| Entitas | Field utama | Relasi |
| --- | --- | --- |
| users | id, nama, email, password\_hash, role, bahasa\_ui, aktif | 1 user → banyak kandidat (pemilik) dan rekomendasi |
| candidates | id, nama, kewarganegaraan, gender, tanggal\_lahir, email, telepon, pendidikan, lama\_pengalaman, status\_code (dihitung server), owner\_id, created\_at | 1 kandidat → banyak CV, bahasa, rekomendasi, aktivitas |
| candidate\_languages | candidate\_id, bahasa, level | Banyak ke satu kandidat |
| resumes | id, candidate\_id, file\_path, nama\_file, ukuran, versi, uploaded\_by, uploaded\_at | Banyak ke satu kandidat |
| companies | id, nama, industri, kontak, aktif | 1 perusahaan → banyak posisi dan rekomendasi |
| positions | id, company\_id, nama\_posisi, aktif | Banyak ke satu perusahaan |
| recommendations | id, candidate\_id, company\_id, position\_id, consultant\_id, status\_code, alasan, approved\_by, catatan, created\_at | Inti pengecekan Recommended Repeat |
| activity\_logs | id, entity, entity\_id, aksi, data\_lama, data\_baru, user\_id, created\_at | Log audit semua perubahan |

Usia tidak disimpan, melainkan dihitung dari tanggal lahir agar tidak basi. Daftar kode disimpan di tabel master statuses (kode, nama EN/ZH/ID, tab, is\_gagal, is\_final) agar label bisa diterjemahkan. candidates.status\_code diperbarui server setiap kali rekomendasi berubah, lewat satu fungsi di database, bukan diisi dari tampilan.

## Kebutuhan non-fungsional

| Aspek | Target |
| --- | --- |
| Kinerja | Pencarian dan pindah halaman tabel < 2 detik untuk 50.000 kandidat |
| Perangkat | Desktop (utama, lebar ≥ 1280 px); tablet dan HP bisa dipakai untuk melihat data |
| Browser | Chrome, Edge, Firefox, Safari versi terbaru |
| Keamanan | HTTPS, kata sandi di-hash, sesi kedaluwarsa setelah 8 jam tidak aktif, hak akses dicek di server (bukan hanya disembunyikan di tampilan) |
| Data pribadi | File CV disimpan privat; link unduhan sementara (berlaku beberapa menit); mengikuti UU PDP Indonesia No. 27/2022 |
| Audit | Semua perubahan status, rekomendasi, unduhan, dan penghapusan tercatat |
| Hapus data | Hapus kandidat bersifat soft delete; hapus permanen hanya Super Admin |
| Backup | Backup database dan file CV harian, disimpan minimal 30 hari |
| Zona waktu | Disimpan dalam UTC, ditampilkan sesuai zona waktu pengguna (default Asia/Jakarta) |

## Prioritas rilis dan kriteria penerimaan

| Prioritas | Fitur | Selesai jika |
| --- | --- | --- |
| P0 (MVP) | Login, role, Resume Lib (RL-01 s.d. RL-12), tambah kandidat + unggah CV, detail kandidat, ubah status, rekomendasi | Konsultan bisa menambah kandidat, mencarinya kembali, mengubah status, merekomendasikan, dan mengunduh CV-nya |
| P0 (MVP) | Recommended Repeat | Enam kondisi di tabel Aturan rekomendasi ganda berperilaku sesuai tabel, dan badge kandidat berubah otomatis mengikuti rekomendasi |
| P0 (MVP) | Bahasa English/Chinese | Semua label berganti saat toggle ditekan, tanpa muat ulang halaman |
| P1 | Pencarian lanjutan, pengaturan kolom, impor/ekspor Excel, cek duplikat | Filter gabungan menghasilkan data yang benar; impor 1.000 baris selesai dengan laporan gagal |
| P1 | Consultant Business, notifikasi | Konsultan melihat pencapaian bulanannya; notifikasi muncul untuk perubahan status rekomendasi |
| P2 | Data Analysis, mode gelap, portal klien | Angka dashboard cocok dengan hitungan manual dari tabel |
