# Knowledge Core: TemuTalenta

Dokumen ini merupakan basis pengetahuan inti (*knowledge core*) yang mendefinisikan ontologi domain, taksonomi keahlian, standar kompetensi, skema data baku, serta logika bisnis untuk platform **TemuTalenta**.

---

## 1. Glosarium Domain & Definisi

- **Talenta (*Talent*)**: Individu profesional yang memiliki kompetensi teknis terverifikasi, riwayat proyek/portofolio, dan ketersediaan waktu untuk bekerja secara penuh waktu (*full-time*), paruh waktu (*part-time*), kontrak (*contract*), maupun proyek lepas (*freelance*).
- **Pemberi Kerja (*Client / Project Owner*)**: Entitas (individu, startup, UMKM, korporasi, atau lembaga) yang mempublikasikan kebutuhan tenaga ahli atau proyek dan melakukan kurasi kandidat.
- **Match Score**: Nilai numerik (0–100%) yang menunjukkan tingkat kesesuaian antara profil talenta dengan parameter kebutuhan proyek.
- **Rate Standar (IDR)**: Estimasi kompensasi finansial dalam Rupiah, dapat berupa tarif per jam (*hourly rate*), harian (*daily rate*), atau bulanan (*monthly retainers*).
- **Ketersediaan (*Availability Status*)**:
  - `Available Now`: Siap bergabung segera (< 7 hari kerja).
  - `Open to Offers`: Sedang bekerja namun terbuka menerima tawaran proyek relevan (notice period 2–4 minggu).
  - `Busy`: Tidak menerima proyek baru saat ini.

---

## 2. Taksonomi Keahlian & Kategori

### 2.1 Kategori Utama

| Kode Kategori | Nama Kategori | Sub-Bidang Spesialisasi |
| :--- | :--- | :--- |
| `TECH-ENG` | **Software Engineering** | Frontend, Backend, Fullstack, Mobile (Flutter/Android/iOS), DevOps, Cloud Infrastructure, QA & Automated Testing. |
| `DATA-AI` | **Data & Artificial Intelligence** | Data Engineering, Data Science, Machine Learning, Business Intelligence & Data Viz, MLOps, LLM Engineering. |
| `PROD-DES` | **Product & Design** | UI/UX Design, Interaction Design, Product Management, UX Research, Design Systems. |
| `CYBER-SEC` | **Cybersecurity & Infra** | Penetration Testing, Security Analyst, Network Engineering, Cloud Security, DevSecOps. |

### 2.2 Taksonomi Skill & Ekosistem Teknologi
- **Backend**: Go, Java (Spring Boot), Node.js (NestJS/Express), Python (FastAPI/Django), C# (.NET), PHP (Laravel), SQL (PostgreSQL, MySQL, Oracle), NoSQL (MongoDB, Redis), Message Broker (Kafka, RabbitMQ).
- **Frontend & Mobile**: React, Next.js, Vue.js, Tailwind CSS, TypeScript, Flutter, Dart, Swift, Kotlin, React Native.
- **Data & AI**: Python, PyTorch, TensorFlow, Pandas, Spark, Airflow, BigQuery, Snowflake, Databricks, HuggingFace, RAG pipelines.
- **DevOps & Cloud**: Docker, Kubernetes, Terraform, AWS, Google Cloud Platform (GCP), Azure, CI/CD (GitHub Actions, GitLab CI).
- **UI/UX & Product**: Figma, Design System, Miro, User Testing, Jira, Agile/Scrum.

---

## 3. Matriks Jenjang Kompetensi (*Seniority Levels*)

| Level | Pengalaman (Tahun) | Kemandirian | Ruang Lingkup Masalah |
| :--- | :---: | :--- | :--- |
| **Junior** | 0 – 2 | Memerlukan supervisi berkala; eksekusi tugas terstruktur. | Memperbaiki bug sederhana, membuat komponen UI modular, menulis unit test dasar. |
| **Middle** | 2 – 5 | Mandiri dalam penyelesaian fitur dari ujung ke ujung (*end-to-end*). | Merancang API, mengoptimalkan query database, integrasi sistem pihak ketiga. |
| **Senior** | 5 – 8 | Mengarahkan desain arsitektur dan membimbing rekan tim (*mentorship*). | Menangani skalabilitas, keamanan sistem, perbaikan arsitektur legacy, *code review* kritis. |
| **Lead / Principal** | > 8 | Menentukan arah teknologi, mitigasi risiko teknis, dan komunikasi lintas departemen. | Merancang arsitektur terdistribusi skala besar (*high-throughput*), standarisasi rekayasa perusahaan. |

---

## 4. Formula & Algoritma Matchmaking

Sistem mencocokkan profil talenta terhadap kriteria pencarian menggunakan formula vektor pembobotan:

$$\text{Final Match Score} = \min\left(100, \left( \sum_{i=1}^{n} W_i \times S_i \right) + B_{\text{bonus}} - P_{\text{penalty}}\right)$$

### 4.1 Komponen Penilaian

1. **Skor Keahlian ($S_{\text{skills}}$) — Bobot 45%**:
   $$S_{\text{skills}} = \left( \frac{|\text{Talent Skills} \cap \text{Required Skills}|}{|\text{Required Skills}|} \times 80\% \right) + \left( \frac{|\text{Talent Skills} \cap \text{Preferred Skills}|}{|\text{Preferred Skills}|} \times 20\% \right)$$

2. **Skor Pengalaman ($S_{\text{experience}}$) — Bobot 25%**:
   - Jika $\text{Tahun Pengalaman Talenta} \ge \text{Target Tahun}$: Skor = $100\%$
   - Jika kurang: Skor = $\frac{\text{Tahun Pengalaman}}{\text{Target Tahun}} \times 100\%$

3. **Skor Kesesuaian Rate/Anggaran ($S_{\text{budget}}$) — Bobot 20%**:
   - Jika $\text{Expected Rate Talenta} \le \text{Max Budget}$: Skor = $100\%$
   - Jika berada di atas anggaran hingga margin +20%: Skor = $\left(1 - \frac{\text{Rate} - \text{Budget}}{\text{Budget}}\right) \times 100\%$
   - Jika melebihi margin +20%: Skor = $20\%$ (penurunan signifikan).

4. **Skor Ketersediaan ($S_{\text{availability}}$) — Bobot 10%**:
   - `Available Now`: $100\%$
   - `Open to Offers`: $75\%$
   - `Busy`: $20\%$

---

## 5. Standar Skema Data (JSON Schemas)

### 5.1 Skema Profil Talenta (`talent.schema.json`)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TalentProfile",
  "type": "object",
  "required": ["id", "fullName", "title", "category", "skills", "experienceYears", "expectedRate", "availability"],
  "properties": {
    "id": { "type": "string" },
    "fullName": { "type": "string" },
    "title": { "type": "string" },
    "category": { "type": "string", "enum": ["TECH-ENG", "DATA-AI", "PROD-DES", "CYBER-SEC"] },
    "bio": { "type": "string" },
    "location": { "type": "string" },
    "workPreference": { "type": "string", "enum": ["remote", "hybrid", "onsite"] },
    "experienceYears": { "type": "number", "minimum": 0 },
    "expectedRate": {
      "type": "object",
      "properties": {
        "amount": { "type": "number" },
        "period": { "type": "string", "enum": ["hourly", "monthly", "project"] },
        "currency": { "type": "string", "default": "IDR" }
      }
    },
    "availability": { "type": "string", "enum": ["Available Now", "Open to Offers", "Busy"] },
    "skills": {
      "type": "array",
      "items": { "type": "string" }
    },
    "portfolios": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "clientOrOrg": { "type": "string" },
          "year": { "type": "string" },
          "description": { "type": "string" },
          "technologies": { "type": "array", "items": { "type": "string" } },
          "url": { "type": "string" }
        }
      }
    },
    "contact": {
      "type": "object",
      "properties": {
        "email": { "type": "string", "format": "email" },
        "github": { "type": "string" },
        "linkedin": { "type": "string" }
      }
    }
  }
}
```

---

## 6. Tata Kelola Hukum & Perpajakan Indonesia

Untuk menjamin kelancaran adopsi oleh institusi dan bisnis lokal, platform menyertakan acuan dasar berikut:

1. **Surat Perjanjian Kerja (SPK / PKWT)**:
   - Proyek freelance/kontrak wajib mencakup ruang lingkup pekerjaan (*Scope of Work*), batas waktu serah terima (*deliverables*), tata cara pembayaran berbasis termin/milestone, dan klausul kerahasiaan (*Non-Disclosure Agreement*).
2. **Pajak Penghasilan (PPh 21 Tenaga Ahli / Bukan Pegawai)**:
   - Penghitungan PPh 21 atas imbalan kepada tenaga ahli yang tidak terikat hubungan kerja berkesinambungan:
     $$\text{Dasar Pengenaan Pajak (DPP)} = 50\% \times \text{Penghasilan Bruto}$$
     $$\text{PPh 21} = \text{Tarif Pasal 17 UU HPP} \times \text{DPP}$$
   - Rekomendasi penyediaan rekapitulasi bukti potong elektronik (e-Bupot) bagi pemberi kerja.
3. **Kepatuhan Privasi Data (UU PDP No. 27/2022)**:
   - Pemrosesan data pribadi talenta harus berlandaskan persetujuan (*consent*).
   - Opsi penghapusan data (*Right to be Forgotten*) harus disediakan secara jelas bagi setiap akun talenta.
