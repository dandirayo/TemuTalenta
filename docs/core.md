# Knowledge Core: TemuTalenta

Dokumen ini mendefinisikan struktur data inti, status tahapan pipeline rekrutmen, aturan bisnis rekomendasi kandidat, serta kamus lokalisasi dwibahasa (**Indonesia / English**) untuk platform **TemuTalenta**.

---

## 1. Definisi Kamus Kode Status Dua Digit (Status Code Dictionary)

Sesuai spesifikasi PRD ATS, badge status pada tabel data menampilkan kode angka dua digit terstandardisasi:

| Kode | Stage Tab | Nama (EN) | Nama (ID) | Nama (ZH) | Keterangan & Aturan |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **0** | `new` | New Candidate | Kandidat Baru | 新录入 | Baru diinput, belum diajukan ke klien mana pun. |
| **10** | `pending` | Recommended to Client | Direkomendasikan ke Klien | 推荐给客户 | CV telah dikirim ke PIC klien. |
| **11** | `pending` | Client Reviewing | Klien Meninjau CV | 客户初审中 | Klien sedang meninjau kelayakan resume. |
| **12** | `pass` | Original Resume Pass | Lolos Seleksi CV Klien | 原简历通过 | Klien menyetujui CV dan meminta jadwal interview. |
| **19** | `failed` | Resume Rejected | CV Ditolak Klien | 简历不通过 | Wajib mengisi alasan penolakan (DK-05). |
| **20** | `interview` | Interview Scheduled | Wawancara Dijadwalkan | 面试已安排 | Tanggal dan waktu wawancara telah disepakati. |
| **21** | `interview` | Passed Initial Interview | Lolos Wawancara Awal | 初试通过 | Lolos babak awal (User/HR), lanjut tahap berikutnya. |
| **22** | `interview` | Final Interview | Wawancara Akhir | 终试阶段 | Tahap wawancara direksi/komisaris. |
| **29** | `failed` | Interview Failed | Tidak Lolos Wawancara | 面试未通过 | Wajib mengisi catatan kegagalan wawancara. |
| **30** | `offer` | Offer Issued | Penawaran Diberikan | 发放Offer | Klien menerbitkan offering letter resmi. |
| **31** | `offer` | Offer Accepted | Penawaran Diterima | 接受Offer | Kandidat menandatangani offering letter. |
| **39** | `failed` | Offer Rejected | Penawaran Ditolak | 拒绝Offer | Kandidat menolak penawaran kerja (wajib alasan). |
| **40** | `entry` | Onboarded / Entry | Masuk Kerja (Entry) | 已入职 | Kandidat resmi mulai bekerja di perusahaan klien. |
| **41** | `entry` | Passed Probation | Lolos Masa Percobaan | 试用期通过 | Garansi agency selesai dan invoice terkonfirmasi. |
| **49** | `failed` | Resigned / Failed Probation | Resign / Gagal Percobaan | 离职/未过试用 | Keluar sebelum masa probation usai (wajib alasan). |
| **90** | `failed` | Candidate Withdrew | Mengundurkan Diri | 候选人主动放弃 | Kandidat mundur atas kemauan sendiri. |
| **91** | `failed` | Blacklisted | Masuk Daftar Hitam | 加入黑名单 | Hanya dapat dilakukan oleh Manajer / Super Admin. |

---

## 2. Aturan Validasi Rekomendasi Ulang (Recommended Repeat RL-11)

Validasi otomatis sebelum pengajuan kandidat ke perusahaan:
1. **Rule 1 (Duplicate Active)**: Jika ada status aktif (`10-31`) di perusahaan yang sama dalam 6 bulan terakhir, sistem **memblokir pengajuan**.
2. **Rule 2 (Recent Entry)**: Jika status `40` (Entry) tercapai dalam 6 bulan terakhir di perusahaan mana pun, sistem **memblokir pengajuan**.
3. **Rule 3 (Re-apply after Failure)**: Jika berstatus gagal (`19`, `29`, `39`) pada perusahaan yang sama dalam 6 bulan, wajib menyertakan **alasan justifikasi** perubahan kompetensi/pengalaman.
4. **Rule 4 (Cross-Consultant Conflict)**: Jika kandidat direkomendasikan oleh konsultan lain dalam kurun waktu 30 hari, wajib mendapatkan **persetujuan Manajer**.
5. **Rule 5 (Passed 6 Months)**: Pengajuan ke perusahaan yang sama setelah lebih dari 6 bulan diperbolehkan sebagai siklus rekrutmen baru.
6. **Rule 6 (Different Company)**: Pengajuan ke perusahaan yang berbeda diperbolehkan paralel tanpa batasan siklus.

---

## 2. Skema Data Utama (`CandidateRecord`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CandidateRecord",
  "type": "object",
  "required": [
    "id",
    "name",
    "nationality",
    "statusCount",
    "stage",
    "gender",
    "age",
    "education",
    "language",
    "yearsOfService",
    "recommendedPosition",
    "recommendedCompany",
    "entryTime"
  ],
  "properties": {
    "id": { "type": "string", "description": "ID unik kandidat, misal CND-1001" },
    "name": { "type": "string", "description": "Nama lengkap kandidat" },
    "nationality": { "type": "string", "default": "Indonesia" },
    "statusCount": { "type": "integer", "description": "Jumlah total pengajuan/aktivitas rekomendasi" },
    "stage": {
      "type": "string",
      "enum": ["new", "pending", "pass", "interview", "failed", "entry"]
    },
    "gender": { "type": "string", "enum": ["Male", "Female"] },
    "age": { "type": "integer", "minimum": 18, "maximum": 70 },
    "education": {
      "type": "string",
      "enum": ["undergraduate", "master", "diploma", "highschool", "doctorate"]
    },
    "language": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Daftar bahasa yang dikuasai, misal ['Indonesian', 'English', 'Chinese']"
    },
    "yearsOfService": { "type": "number", "minimum": 0 },
    "recommendedPosition": { "type": "string" },
    "recommendedCompany": { "type": "string" },
    "entryTime": { "type": "string", "format": "date-time" },
    "email": { "type": "string" },
    "phone": { "type": "string" },
    "summary": { "type": "string" },
    "skills": { "type": "array", "items": { "type": "string" } },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "position": { "type": "string" },
          "company": { "type": "string" },
          "stage": { "type": "string" },
          "consultant": { "type": "string" },
          "timestamp": { "type": "string" },
          "notes": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 3. Aturan Bisnis Operasi Kandidat

1. **`Download Resume` (`Unduh Resume`)**:
   - Menghasilkan berkas dokumen ringkasan resume terstruktur (`.txt` / `.html` siap cetak) yang memuat profil pribadi, pendidikan, bahasa, pengalaman kerja, riwayat rekomendasi klien, dan ringkasan kompetensi.
2. **`Recommended Repeat` (`Rekomendasi Ulang`)**:
   - Setiap kali seorang kandidat direkomendasikan ke posisi atau perusahaan baru:
     - Nilai `statusCount` bertambah `+1`.
     - Kolom `recommendedPosition` dan `recommendedCompany` pada baris utama diperbarui ke rekomendasi paling mutakhir.
     - Entri baru ditambahkan ke dalam array `recommendations` kandidat tersebut.
3. **`Recommended List` (`Daftar Rekomendasi`)**:
   - Menampilkan tabel historis seluruh rekomendasi kandidat yang bersangkutan.
   - Memungkinkan konsultan memperbarui status tahapan (`stage`) kandidat secara langsung.
4. **`Public Career Portal` (`Portal Karier Publik`)**:
   - Menampilkan lowongan terbuka klien dan memungkinkan kandidat melamar secara mandiri.
   - Lamaran baru langsung dialirkan ke `Resume Lib` dengan status awal Code `0` (`New`).
5. **`Interview Calendar & .ICS Scheduler` (`Kalender Wawancara`)**:
   - Koordinasi putaran wawancara dengan tautan meeting dan ekspor kalender standar `.ics`.
   - Mengubah status kandidat ke Code `20` (`Interview Scheduled`) dan Code `21` (`Interview Passed`).
6. **`Official Offer Letter Generator` (`Generator Surat Penawaran Kerja`)**:
   - Menghasilkan draf dokumen penawaran kerja resmi dengan perincian kompensasi dan blok tanda tangan.
   - Mengubah status kandidat ke Code `30` (`Offer Proposed`).
7. **`Smart Heuristic CV Parser` (`Ekstraktor CV Cerdas`)**:
   - Menganalisis teks CV bebas dan secara cerdas mengisi formulir pendaftaran kandidat.
8. **`Visual Kanban Board` (`Papan Pipeline Kanban`)**:
   - Memungkinkan pemindahan kandidat antar-tahap melalui *drag-and-drop* atau kontrol keyboard dengan seluruh validasi bisnis tetap berlaku.
9. **`Placement Fee & Warranty Tracker` (`Pelacak Komisi & Garansi 90 Hari`)**:
   - Menghitung estimasi kompensasi agensi, melacak masa garansi *probation* 90 hari, status *invoice*, serta pengarsipan *Soft Delete* dan pencadangan JSON penuh.
10. **`Multi-Select Batch Operations` (`Operasi Massal Kandidat`)**:
   - Mendukung aksi *Batch Recommend* (tetap menegakkan 6 aturan validasi pengajuan berulang), *Batch Tag*, dan *Batch Archive* (otomatis melewati kandidat berstatus terkunci `>= 40`).
11. **`Master Dictionaries & Candidate Outreach` (`Kamus PG-02 & Outreach WA/Email`)**:
   - Mengelola daftar bahasa, negara/kebangsaan, serta referensi resmi kamus 17 kode status tri-lingual (`0`–`91`), dilengkapi draf pesan cepat kandidat ke WhatsApp (`wa.me`) dan email (`mailto:`).

---

## 4. Standar Antarmuka & Kepatuhan

- **Zero Decorative Emoji Policy**: Antarmuka bisnis menggunakan ikonografi vektor SVG garis tipis standar enterprise, bukan emoji kasual.
- **Pelindungan Data Pribadi (UU PDP No. 27/2022)**: Penyimpanan lokal menjamin data kandidat tidak dikirim ke pihak ketiga tanpa otorisasi eksplisit.

---

## 5. Model Deployment: Single-User Full Control (AUL SuperAdmin)

Platform dikonfigurasi untuk operasional **Single-User Full Control**:
- **Profil Pengguna Utama**: `AUL SuperAdmin` (`USR-AUL`).
- **Tingkat Otoritas**: `superadmin` (*Super Administrator - Full Control*).
- **Hak Akses Eksklusif**:
  - Penuh atas seluruh tab navigasi (*Talent Management*, *Consultant Business*, *Data Analysis*, dan *Settings*).
  - Mengelola bank data kandidat (tambah, edit, tagging, internal notes, CV multi-versi, hapus/arsip).
  - Mengelola lowongan klien di Portal Karir (buat lowongan baru, edit rincian posisi, hapus lowongan).
  - Mengatur jadwal wawancara di Kalender Interaktif dan unduh file `.ics`.
  - Menerbitkan Offering Letter dengan tanggal mulai kerja dan e-signature digital.
  - Memantau garansi 90 hari probation, fee agensi, dan status invoice.
  - Mengatur kamus Master Data (perusahaan, posisi, bahasa, negara) dan manajemen akun pengguna.
  - Melakukan ekspor/impor CSV dan backup/restore JSON database secara mandiri.

---

## 6. Standar Dialog & Pop-up In-App (Glassmorphism & Zero Browser Dialogs)

Untuk menjaga standar pengalaman pengguna (UX) enterprise dan konsistensi visual:
1. **Zero Browser Native Dialogs**: Seluruh interaksi pengguna tidak lagi memicu `alert()` atau `confirm()` bawaan peramban (`dandirayo.github.io says...`). Seluruh konfirmasi dan pemberitahuan dialihkan ke `<dialog id="customPromptModal">`.
2. **Backdrop Blur & Top Layer Glassmorphism**:
   - Seluruh elemen `<dialog::backdrop>` memiliki efek *frosted glass* (`backdrop-filter: blur(8px) saturate(180%)`).
   - Modal konfirmasi dan peringatan berada di posisi tengah layar (*centered viewport*) dengan sudut melengkung halus (`18px`), bayangan elevasi dalam, dan animasi pop-in `modalPopIn`.
   - Mendukung penumpukan modal (*stacked modal on modal*, misalnya konfirmasi hapus lowongan di atas modal edit lowongan).
3. **Semantik Ikon & Aksi**:
   - **Danger / Deletion**: Ikon tempat sampah merah dengan tombol konfirmasi merah coral `.btn-danger`.
   - **Warning**: Ikon segitiga peringatan kuning amber dengan tombol konfirmasi standar.
   - **Info / Success**: Ikon informatif biru / centang hijau dengan tombol "Mengerti".

---

## 7. Kustomisasi Kolom Tabel & Mode Tampilan Ringkas (Compact vs Full View)

Untuk mengoptimalkan densitas informasi pada layar desktop dan laptop tanpa scroll horizontal yang berlebihan:
1. **Mode Ringkas (Compact View)**:
   - Menampilkan 5 kolom inti: `Kandidat` (terkunci), `Status Tahapan`, `Posisi Rekomendasi`, `Perusahaan Tujuan`, dan `Operasi`.
   - Tabel otomatis pas 100% pada resolusi layar standar tanpa scroll horizontal.
2. **Mode Lengkap (Full View)**:
   - Menampilkan seluruh 12 kolom database lengkap (termasuk Kebangsaan, Gender, Usia, Pendidikan, Bahasa, Masa Kerja, dan Waktu Masuk).
3. **Penyembunyian Langsung dari Header (`✕`)**:
   - Pengguna dapat mengarahkan kursor ke header kolom yang tidak terkunci dan mengklik tombol `✕` untuk langsung menyembunyikan kolom tersebut secara instan.
4. **Penyimpanan Preferensi**:
   - Pilihan kolom tersimpan otomatis di `localStorage` (`STORAGE_KEYS.VISIBLE_COLS`).

