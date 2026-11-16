# Knowledge Core: TemuTalenta

Dokumen ini mendefinisikan struktur data inti, status tahapan pipeline rekrutmen, aturan bisnis rekomendasi kandidat, serta kamus lokalisasi dwibahasa (**Indonesia / English**) untuk platform **TemuTalenta**.

---

## 1. Definisi Status Pipeline Seleksi

Setiap kandidat di dalam pustaka resume (`Resume Lib`) memiliki status tahapan utama (`stage`) serta penghitung frekuensi rekomendasi (`statusCount`):

| Kode Status | Label (English) | Label (Indonesia) | Deskripsi Operasional |
| :--- | :--- | :--- | :--- |
| `new` | `New` | `Baru` | Kandidat baru terdaftar di pustaka resume dan siap dikurasi. |
| `pending` | `Pending` | `Menunggu` | Resume sedang ditinjau oleh konsultan atau menunggu respons klien. |
| `pass` | `Original resume pass` | `Lolos Seleksi CV` | Resume asli telah disetujui klien untuk lanjut ke tahap tes/wawancara. |
| `interview` | `Interview` | `Wawancara` | Kandidat sedang menjalani rangkaian wawancara (HR, User, atau Direksi). |
| `failed` | `Failed` | `Tidak Lolos` | Kandidat belum lolos pada salah satu tahapan seleksi (memiliki indikator titik merah). |
| `entry` | `Entry` | `Diterima / Masuk` | Kandidat telah menandatangani penawaran kerja dan masuk bekerja (*Onboarded*). |

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

---

## 4. Standar Antarmuka & Kepatuhan

- **Zero Decorative Emoji Policy**: Antarmuka bisnis menggunakan ikonografi vektor SVG garis tipis standar enterprise, bukan emoji kasual.
- **Pelindungan Data Pribadi (UU PDP No. 27/2022)**: Penyimpanan lokal menjamin data kandidat tidak dikirim ke pihak ketiga tanpa otorisasi eksplisit.
