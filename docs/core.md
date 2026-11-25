# Knowledge Core: NextKerja (TemuTalenta)

Dokumen ini mendefinisikan seluruh arsitektur inti, struktur data, kamus status pipeline dua digit, aturan validasi bisnis rekrutmen, kontrol akses berbasis peran (RBAC), standar dialog & UX, serta sistem desain visual resmi untuk platform **NextKerja (TemuTalenta)**.

---

## 1. Identitas Visual & Design System Resmi

Platform mengadopsi identitas visual **NextKerja** bertema modern B2B Enterprise ATS:
- **Warna Primer (Brand Primary)**: Lime Green (`#ccf535`) — aksen tombol utama, indikator aktif, tab segmen, dan sorotan visual.
- **Warna Gelap Primer (Brand Dark)**: Dark Slate (`#121603`) — warna latar belakang sidebar dan elemen kontras tinggi.
- **Kontrol Bentuk (Pill Controls)**: Tombol (`.btn-solid`, `.btn-outlined`), tab segmen (`.stage-tab`, `.subtab-btn`), serta badge status menggunakan kurva melengkung halus (*rounded pill* / `border-radius: 9999px` atau `18px`).
- **Tema Ganda Penuh (Dual Theme)**: Mendukung penuh `Light Mode` dan `Dark Mode` dengan sinkronisasi `<meta name="color-scheme">` dan variabel CSS `--bg-base`, `--surface-card`, `--text-primary`, `--border-base`, dan `--shadow-card`.
- **Aksesibilitas & Focus Ring**: Seluruh kontrol interaktif memiliki outline `:focus-visible` (2px solid aksen Lime/Cyan dengan offset 2px) untuk kenyamanan navigasi keyboard (WCAG 2.1 AA).
- **Zero Decorative Emoji Policy**: Seluruh antarmuka menggunakan ikonografi vektor **Inline SVG** garis tipis terstandarisasi tanpa emoji kasual untuk menjaga estetika enterprise.

---

## 2. Kamus Kode Status Dua Digit (Status Code Dictionary)

Sesuai spesifikasi PRD ATS, badge status pada tabel data menampilkan kode angka dua digit terstandardisasi dengan pemetaan dwibahasa (**Indonesia & English**):

| Kode | Stage Tab | Nama (EN) | Nama (ID) | Kategori & Sifat | Keterangan & Aturan Bisnis |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **0** | `new` | New Candidate | Kandidat Baru | Inflow (Awal) | Baru diinput, belum diajukan ke klien mana pun. |
| **10** | `pending` | Recommended to Client | Direkomendasikan | Active Pipeline | CV telah dikirimkan ke PIC perusahaan klien. |
| **11** | `pending` | Client Reviewing | Ditinjau Klien | Active Pipeline | Klien sedang meninjau resume untuk persetujuan interview. |
| **12** | `pass` | Original Resume Pass | CV Lolos | Active Pipeline | Klien menyetujui CV dan meminta koordinasi jadwal interview. |
| **19** | `failed` | Resume Rejected | CV Ditolak | Final (Failed) | Klien menolak CV (wajib mengisi alasan penolakan via dialog input). |
| **20** | `interview` | Interview Scheduled | Interview Dijadwalkan | Active Pipeline | Putaran dan jadwal wawancara telah disepakati (sinkron ke kalender). |
| **21** | `interview` | Initial Interview Passed | Lolos Interview Awal | Active Pipeline | Kandidat lolos babak teknis/HR awal, siap masuk tahap lanjutan. |
| **22** | `interview` | Final Interview | Interview Final | Active Pipeline | Wawancara tahap akhir bersama manajemen eksekutif/direksi. |
| **29** | `failed` | Interview Failed | Gagal Interview | Final (Failed) | Kandidat tidak lolos tahapan wawancara (wajib catatan evaluasi). |
| **30** | `offer` | Offer Proposed | Offer Diajukan | Active Pipeline | Klien menerbitkan penawaran kerja (Offer Letter resmi). |
| **31** | `offer` | Offer Accepted | Offer Diterima | Active Pipeline | Kandidat menandatangani offering letter (menutup pipeline lain). |
| **39** | `failed` | Offer Cancelled / Declined | Offer Batal / Ditolak | Final (Failed) | Penawaran dibatalkan atau ditolak kandidat (wajib alasan). |
| **40** | `entry` | Started Work (Entry) | Mulai Bekerja (Entry) | Active Placement | Kandidat resmi mulai bekerja (onboard) di perusahaan klien. |
| **41** | `entry` | Passed Probation | Lulus Probation | Final (Success) | Kandidat menyelesaikan masa percobaan 90 hari, garansi tuntas. |
| **49** | `failed` | Failed Probation / Resigned | Gagal Probation/Resign | Final (Failed) | Kandidat keluar sebelum masa garansi probation berakhir. |
| **90** | `failed` | Candidate Withdrew | Kandidat Mundur | Final (Failed) | Kandidat mengundurkan diri atas inisiatif pribadi. |
| **91** | `failed` | Blacklisted | Masuk Daftar Hitam | Final (Blocked) | Kandidat diblacklist permanen (hanya oleh Manager/SuperAdmin). |

---

## 3. Enam Aturan Bisnis Rekomendasi Ulang & Proteksi Penjadwalan

Fungsi `evaluateRecRepeatRules(candidate, targetCompany, targetPosition, currentConsultant)` menegakkan aturan integritas data:

1. **Rule 1 (Duplicate Active Block)**:
   Jika kandidat memiliki status aktif (`10` s/d `31`) pada perusahaan dan posisi yang sama, pengajuan **diblokir** untuk mencegah duplikasi proses seleksi.
2. **Rule 2 (Recent Entry / Active Placement Block)**:
   Jika kandidat sedang berstatus `40` (Entry / Mulai Bekerja) atau `41` (Lolos Probation), pengajuan ke perusahaan mana pun **diblokir permanen** hingga status placement selesai.
3. **Rule 3 (Re-apply after Failure Justification)**:
   Jika kandidat sebelumnya gagal (`19`, `29`, `39`) pada perusahaan yang sama dalam kurun waktu 6 bulan terakhir, sistem mewajibkan pengisian **alasan justifikasi peningkatan kompetensi**.
4. **Rule 4 (Cross-Consultant Conflict & Manager Approval)**:
   Jika kandidat diajukan ke perusahaan yang sama oleh konsultan berbeda dalam kurun waktu 6 bulan (dikonfigurasi di `duplicateWindowMonths`), pengajuan mewajibkan **persetujuan Manajer** dan justifikasi.
5. **Rule 5 (Passed Configured Window)**:
   Pengajuan ke perusahaan yang sama setelah melewati masa *duplicate window* (default 6 bulan) diperbolehkan sebagai siklus rekrutmen baru.
6. **Rule 6 (Parallel Multi-Company)**:
   Kandidat diperbolehkan diajukan ke beberapa perusahaan berbeda secara paralel asalkan belum mencapai tahap penempatan kerja (Code `40`/`41`).

### Proteksi Tambahan pada Penjadwalan Wawancara (Interview Guard):
- **Entry Guard**: Sistem menolak penjadwalan wawancara jika kandidat telah berstatus Onboard (`40`) atau Lolos Probation (`41`) pada perusahaan yang sama.
- **Anti-Downgrade Guard**: Penjadwalan wawancara tambahan tidak boleh menurunkan status kandidat yang sudah berada di tahapan lebih tinggi (misal: kandidat di status `22` Final Interview atau `30` Offer tidak akan diturunkan kembali ke status `20`).

---

## 4. Hak Akses Berbasis Peran (Role-Based Access Control / RBAC)

Sistem mendukung multi-role dinamis dengan proteksi akun aktif:

| Peran (Role) | Pengguna Default | Hak Akses & Pembatasan Khusus |
| :--- | :--- | :--- |
| **SuperAdmin** | `USR-AUL` (AUL SuperAdmin) | **Full Control**: Akses tak terbatas ke seluruh modul, manajemen pengguna, kamus master data, reset database, cadangan/pemulihan JSON, dan audit log. |
| **Manager** | `USR-02` (Budi Hartono) | **Supervisi & Analitik**: Akses modul Talent & Analisis, menyetujui rekomendasi lintas konsultan (Rule 4), serta ekspor data ke Excel/CSV. |
| **Consultant** | `USR-01` (Rina Wijaya)<br>`USR-03` (Hendra Kusuma) | **Operasional Rekruter**: Menambah/mengedit kandidat, mengunggah CV, menjadwalkan wawancara, menerbitkan offer letter, serta kontak cepat WhatsApp/Email. |
| **Client HR** | `USR-04` (David Chen - alauda) | **Client Portal Terisolasi**: Mode khusus perwakilan HR klien. Menu Tambah Kandidat, Analisis Data, Pengaturan, Operasi Massal, dan Catatan Internal Konsultan disembunyikan. Hanya dapat melihat kandidat yang diajukan ke perusahaannya, serta memiliki tombol cepat *Approve Interview* dan *Reject CV* (dengan dialog alasan). |

### Proteksi Keamanan Akun (Account Lockout Guard):
- Akun yang sedang aktif digunakan (termasuk SuperAdmin terakhir) **tidak dapat dihapus atau dinonaktifkan** oleh dirinya sendiri.
- Akun berstatus tidak aktif (`active: false`) otomatis disaring dari *role switcher* header dan dicegah login ke dalam sistem.

---

## 5. Skema Data Inti (Core Data Schemas)

### A. Skema Data Kandidat (`CandidateRecord`)
```json
{
  "id": "CND-1001",
  "name": "Andi Candera",
  "nationality": "Indonesia",
  "gender": "Male",
  "birthDate": "2000-04-12",
  "age": 26,
  "education": "undergraduate",
  "language": "Indonesian, English",
  "yearsOfService": 9,
  "recommendedPosition": "Presales Lead",
  "recommendedCompany": "alauda",
  "entryTime": "2026-09-18 10:30:00",
  "email": "andi.c@example.id",
  "phone": "+62 812-3456-7011",
  "whatsapp": "+62 812-3456-7011",
  "domicile": "Jakarta Selatan",
  "salaryExpectation": "IDR 35.000.000",
  "currentSalary": "IDR 28.000.000",
  "availability": "1 Month Notice",
  "ownerId": "USR-01",
  "ownerName": "Rina Wijaya",
  "skills": ["Kubernetes", "DevOps", "Solution Architecture", "Presales"],
  "tags": ["Fast Track", "Enterprise Ready"],
  "summary": "Senior Solutions Architect with strong track record in cloud infrastructure.",
  "isDeleted": false,
  "originalCvFile": {
    "name": "CV_Andi_Candera_2026.pdf",
    "size": 154280,
    "type": "application/pdf",
    "uploadDate": "2026-09-18 10:30:00",
    "text": "Ringkasan teks CV..."
  },
  "workHistory": [
    {
      "role": "Cloud Solutions Architect",
      "company": "PT Tech Solusi Indonesia",
      "period": "2021 - Present",
      "desc": "Leading cloud modernization projects."
    }
  ],
  "educationHistory": [
    {
      "degree": "Bachelor of Computer Science",
      "institution": "Universitas Indonesia",
      "year": "2019"
    }
  ],
  "recommendations": [
    {
      "id": "REC-101",
      "company": "alauda",
      "position": "Presales Lead",
      "statusCode": 10,
      "consultantId": "USR-01",
      "consultantName": "Rina Wijaya",
      "timestamp": "2026-09-18 10:30:00",
      "notes": "Submitted profile to Client HR.",
      "isActive": true
    }
  ]
}
```

### B. Skema Lowongan Kerja Klien (`JobOrder`)
```json
{
  "id": "JOB-1001",
  "title": "Senior Pre-sales Specialist",
  "company": "alauda",
  "department": "Enterprise Cloud Solutions",
  "location": "Jakarta (Hybrid)",
  "type": "Full-time",
  "salaryRange": "IDR 20,000,000 - 32,000,000",
  "experience": "5+ Years",
  "tags": ["Kubernetes", "DevOps", "Bilingual", "Enterprise IT"],
  "description": "Lead technical discovery, solution architecture presentations, and POC delivery.",
  "status": "Active",
  "postedDate": "2026-11-10"
}
```

### C. Skema Wawancara Terjadwal (`InterviewRecord`)
```json
{
  "id": "INT-1001",
  "candidateId": "CND-1001",
  "candidateName": "Andi Candera",
  "company": "alauda",
  "position": "Presales Lead",
  "round": "Round 1 - Technical Interview",
  "dateTime": "2026-11-20T14:00",
  "platform": "Google Meet",
  "interviewers": "David Chen (alauda HR), Kevin (Lead Architect)",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "notes": "Focus on Kubernetes multi-cluster networking.",
  "status": "Scheduled"
}
```

---

## 6. Standar Dialog Kustom & Zero Native Browser Dialogs

Platform mengeliminasi 100% dialog bawaan peramban (`alert()`, `confirm()`, dan `prompt()`):
1. **Glassmorphism Backdrop & Centered Overlay**:
   - Seluruh modal menggunakan `<dialog>` modern dengan efek *frosted blur* (`backdrop-filter: blur(8px) saturate(180%)`), bayangan elevasi dalam, dan sudut melengkung `18px`.
2. **Komponen Pengganti Dialog**:
   - `showAlertDialog({ title, message, type })`: Pemberitahuan sistem dengan ikon tematik (sukses, peringatan, bahaya).
   - `showConfirmDialog({ title, message, type, confirmText, cancelText })`: Konfirmasi aksi penting (reset database, hapus kandidat, hapus lowongan).
   - `showInputDialog({ title, message, inputType, options, placeholder, defaultValue, min, max })`: Dialog input kustom pengganti `window.prompt()` yang mendukung elemen `<input>`, `<select>`, dan `<textarea>`. Digunakan pada:
     - Input alasan penolakan CV klien (Kode 19).
     - Input alasan kegagalan kandidat (Kode 29, 39, 49, 90).
     - Input tanggal mulai kerja resmi saat penerimaan penawaran kerja (Kode 31) dengan validasi format ISO (`YYYY-MM-DD`).
     - Input penambahan label massal (*Batch Tagging*).
     - Input justifikasi pengajuan berulang (*Batch Recommend*).

---

## 7. Penanganan Berkas & Parser Dokumen (CSV & CV File Parser)

### Parser CSV Standar RFC-4180
Fungsi `parseCsvLine(line)` mengurai baris CSV secara tangguh:
- Menangani nilai berpagar tanda kutip ganda (`"..."`) yang memuat karakter koma, seperti `"Indonesian, English"`.
- Menghapus spasi dan tanda kutip pembungkus secara presisi tanpa merusak struktur kolom.
- Generator ID unik kandidat (`generateUniqueCandidateId()`) memindai nilai numerik tertinggi di seluruh database (`CND-1008+`) sehingga tidak terjadi benturan ID setelah kandidat dihapus.

### Validasi Ekstensi Berkas CV
Fungsi `isSupportedCvFile(fileName)` membatasi unggahan resume hanya ke ekstensi dokumen resmi:
- Ekstensi diizinkan: `.pdf`, `.docx`, `.doc`, `.txt`, `.md`, `.rtf`.
- Berkas yang tidak valid atau berpotensi berbahaya (seperti `.exe`, `.bat`, `.js`) ditolak secara instan dengan notifikasi peringatan.

---

## 8. Persistensi Status, URL Deep-Linking & Transisi Tampilan

1. **Sinkronisasi Parameter URL**:
   Fungsi `syncFiltersToUrl()` dan `restoreFiltersFromUrl()` menjaga status navigasi di URL peramban:
   - Tampilan aktif (`?view=clientList`, `?view=resumeLib`, `?view=interviewCalendar`, dll.).
   - Subtab aktif (`&subtab=jobs` vs `&subtab=clients`).
   - Kata kunci pencarian, filter nama, dan tab tahapan seleksi.
   - Status tetap utuh saat halaman direfresh (*full page reload*).
2. **Safe View Transitions**:
   Pemanfaatan Document View Transitions API (`document.startViewTransition`) dilengkapi penanganan *error catch* pada `transition.ready`, `transition.updateCallbackDone`, dan `transition.finished` guna mencegah `AbortError` saat pengguna beralih menu dengan cepat.

---

## 9. Standar Centering & Keselarasan Tombol (Flex Centering Standard)

Untuk menjamin kenyamanan visual pada seluruh resolusi layar:
1. **Aturan Dasar Tombol**:
   Semua elemen tombol interaktif (`:where(button)`, `.btn-solid`, `.btn-outlined`, `.stage-tab`, `.op-btn`) wajib menggunakan:
   ```css
   display: inline-flex;
   align-items: center;
   justify-content: center;
   text-align: center;
   line-height: 1;
   vertical-align: middle;
   box-sizing: border-box;
   ```
2. **Penyelarasan Komponen Toolbar**:
   Input teks, selektor dropdown, dan tombol aksi pada toolbar pencarian memiliki tinggi seragam (32px pada desktop) dan dibungkus dalam wadah flex dengan `align-items: center` untuk memastikan sumbu vertikal sejajar sempurna (selisih atas-bawah = 0px).

---

## 10. Protokol Pengujian Kualitas (QA Verification Suite)

Integritas aplikasi diverifikasi melalui skenario pengujian otomatis berbasis CDP (Chrome/Edge DevTools Protocol):
- **Zero Runtime Errors**: 0 uncaught exception (`TypeError`, `ReferenceError`, `AbortError`).
- **16 Skenario QA Inti**: Mencakup parsing CSV RFC-4180, isolasi hak akses Client HR, proteksi lockout akun, aturan bisnis rekomendasi berulang, sanitasi XSS (termasuk karakter petik `&#39;`), validasi berkas resume, pencegahan penurunan status interview, hingga persistensi subtab URL.
- **Audit UI/UX Lintas Perangkat**: Menjamin responsivitas penuh dari perangkat mobile (360px–412px), tablet (768px), hingga desktop ultra-lebar (1440px).
