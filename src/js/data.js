/**
 * TemuTalenta Enterprise ATS & Resume Library
 * Dataset Kandidat, Riwayat Rekomendasi, & Kamus Lokalisasi Dwibahasa (ID / EN)
 */

const STORAGE_KEYS = {
  CANDIDATES: "temutalenta_ats_candidates_v2",
  LANG: "temutalenta_lang_v2",
  COLOR_SCHEME: "color-scheme",
  VISIBLE_COLS: "temutalenta_visible_cols_v2"
};

const I18N = {
  en: {
    // Sidebar
    navTalentMgmt: "Talent Management",
    navResumeLib: "Resume Lib",
    navAddCandidate: "Add Candidate",
    navConsultantBiz: "Consultant Business",
    navRecList: "Recommended List",
    navClientList: "Client Companies",
    navDataAnalysis: "Data Analysis",
    navPipelineReport: "Pipeline Report",
    navPrdDocs: "PRD & Blueprint",

    // Topbar & Subheader
    langId: "Indonesia",
    langEn: "English",
    themeLight: "Light",
    themeDark: "Dark",
    btnBack: "Back",
    btnRefresh: "Refresh",
    btnHome: "Home",

    // Search & Filter Bar
    phCandidateName: "Candidate Name",
    phKeyword: "Key word",
    phState: "State",
    btnSearch: "Search",
    btnSearchAll: "Search All",
    btnAdvSearch: "Advanced Search",
    btnHideAdvSearch: "Hide Advanced Search",
    btnNewCandidate: "+ New Candidate",
    btnResetData: "Reset Default Data",

    // Advanced Search Labels
    lblGender: "Gender",
    lblMinAge: "Min Age",
    lblMaxAge: "Max Age",
    lblEducation: "Education",
    lblMinService: "Min Year of Service",
    optAll: "All",
    optMale: "Male",
    optFemale: "Female",
    optUndergraduate: "undergraduate",
    optMaster: "master",
    optDiploma: "diploma",

    // Status Stage Tabs
    stageAll: "All",
    stageNew: "New",
    stagePending: "Pending",
    stagePass: "Original resume pass",
    stageInterview: "Interview",
    stageFailed: "Failed",
    stageEntry: "Entry",

    // Display Columns
    lblDisplayCols: "Columns:",
    colCandidate: "Candidate",
    colNationality: "Nationality",
    colStatus: "Status",
    colGender: "Gender",
    colAge: "Age",
    colEducation: "Education",
    colLanguage: "Language",
    colYearOfService: "Year of service",
    colRecPosition: "Recommended Position",
    colRecCompany: "Recommended Company",
    colEntryTime: "Entry time",
    colOperation: "Operation",

    // Table Row Actions
    actDownloadResume: "Download Resume",
    actRecRepeat: "Recommended Repeat",
    actRecList: "Recommended List",

    // Table Footer / Pagination
    lblShowing: "Showing",
    lblOf: "of",
    lblRecords: "candidates",
    emptyTable: "No candidate records match the current filter criteria.",

    // Modals
    modalProfileTitle: "Candidate Resume Profile",
    modalRecRepeatTitle: "Recommended Repeat - Submit to Client",
    modalRecListTitle: "Candidate Recommendation History",
    modalAddTitle: "Add New Candidate to Resume Library",
    btnClose: "Close",
    btnSave: "Save",
    btnCancel: "Cancel",
    btnSubmitRec: "Submit Recommendation",

    // Form & Profile Fields
    fldFullName: "Candidate Name",
    fldNationality: "Nationality",
    fldGender: "Gender",
    fldAge: "Age",
    fldEducation: "Education",
    fldLanguages: "Languages (comma separated)",
    fldYearsService: "Year of Service",
    fldRecPosition: "Recommended Position",
    fldRecCompany: "Recommended Company",
    fldStage: "Pipeline Stage",
    fldEmail: "Email Address",
    fldPhone: "Phone / WhatsApp",
    fldSkills: "Core Skills",
    fldSummary: "Professional Summary",
    fldNotes: "Consultant Evaluation Notes",
    fldConsultant: "Consultant",
    fldDate: "Submission Time",

    // Notifications
    msgRefreshed: "Resume library data refreshed.",
    msgResetDone: "Database restored to default records.",
    msgResumeDownloaded: "Resume downloaded for",
    msgRecAdded: "New recommendation recorded for",
    msgStageUpdated: "Pipeline stage updated to",
    msgCandidateAdded: "New candidate added to Resume Library:"
  },
  id: {
    // Sidebar
    navTalentMgmt: "Manajemen Talenta",
    navResumeLib: "Pustaka Resume",
    navAddCandidate: "Tambah Kandidat",
    navConsultantBiz: "Bisnis Konsultan",
    navRecList: "Daftar Rekomendasi",
    navClientList: "Perusahaan Klien",
    navDataAnalysis: "Analisis Data",
    navPipelineReport: "Laporan Pipeline",
    navPrdDocs: "Dokumen PRD & Core",

    // Topbar & Subheader
    langId: "Indonesia",
    langEn: "English",
    themeLight: "Terang",
    themeDark: "Gelap",
    btnBack: "Kembali",
    btnRefresh: "Muat Ulang",
    btnHome: "Beranda",

    // Search & Filter Bar
    phCandidateName: "Nama Kandidat",
    phKeyword: "Kata kunci",
    phState: "Status Tahapan",
    btnSearch: "Cari",
    btnSearchAll: "Tampilkan Semua",
    btnAdvSearch: "Pencarian Lanjutan",
    btnHideAdvSearch: "Tutup Filter Lanjutan",
    btnNewCandidate: "+ Kandidat Baru",
    btnResetData: "Reset Data Awal",

    // Advanced Search Labels
    lblGender: "Jenis Kelamin",
    lblMinAge: "Usia Min",
    lblMaxAge: "Usia Maks",
    lblEducation: "Pendidikan",
    lblMinService: "Min Masa Kerja (Thn)",
    optAll: "Semua",
    optMale: "Male",
    optFemale: "Female",
    optUndergraduate: "undergraduate",
    optMaster: "master",
    optDiploma: "diploma",

    // Status Stage Tabs
    stageAll: "Semua",
    stageNew: "Baru",
    stagePending: "Menunggu",
    stagePass: "Lolos Seleksi CV",
    stageInterview: "Wawancara",
    stageFailed: "Tidak Lolos",
    stageEntry: "Diterima Kerja",

    // Display Columns
    lblDisplayCols: "Kolom Tampil:",
    colCandidate: "Kandidat",
    colNationality: "Kebangsaan",
    colStatus: "Status",
    colGender: "Gender",
    colAge: "Usia",
    colEducation: "Pendidikan",
    colLanguage: "Bahasa",
    colYearOfService: "Masa Kerja",
    colRecPosition: "Posisi Rekomendasi",
    colRecCompany: "Perusahaan Tujuan",
    colEntryTime: "Waktu Masuk",
    colOperation: "Operasi",

    // Table Row Actions
    actDownloadResume: "Unduh Resume",
    actRecRepeat: "Rekomendasi Ulang",
    actRecList: "Daftar Rekomendasi",

    // Table Footer / Pagination
    lblShowing: "Menampilkan",
    lblOf: "dari",
    lblRecords: "kandidat",
    emptyTable: "Tidak ada data kandidat yang sesuai dengan filter pencarian.",

    // Modals
    modalProfileTitle: "Profil & Detail Resume Kandidat",
    modalRecRepeatTitle: "Rekomendasi Ulang - Ajukan ke Klien Baru",
    modalRecListTitle: "Riwayat Rekomendasi Kandidat",
    modalAddTitle: "Tambah Kandidat Baru ke Pustaka Resume",
    btnClose: "Tutup",
    btnSave: "Simpan",
    btnCancel: "Batal",
    btnSubmitRec: "Kirim Rekomendasi",

    // Form & Profile Fields
    fldFullName: "Nama Kandidat",
    fldNationality: "Kebangsaan",
    fldGender: "Jenis Kelamin",
    fldAge: "Usia (Tahun)",
    fldEducation: "Pendidikan",
    fldLanguages: "Bahasa (pisahkan koma)",
    fldYearsService: "Masa Kerja (Tahun)",
    fldRecPosition: "Posisi Rekomendasi",
    fldRecCompany: "Perusahaan Tujuan",
    fldStage: "Tahapan Seleksi",
    fldEmail: "Alamat Email",
    fldPhone: "Telepon / WhatsApp",
    fldSkills: "Keahlian Utama",
    fldSummary: "Ringkasan Profesional",
    fldNotes: "Catatan Evaluasi Konsultan",
    fldConsultant: "Konsultan PIC",
    fldDate: "Waktu Pengajuan",

    // Notifications
    msgRefreshed: "Data pustaka resume berhasil dimuat ulang.",
    msgResetDone: "Basis data dikembalikan ke data bawaan.",
    msgResumeDownloaded: "Dokumen resume berhasil diunduh untuk",
    msgRecAdded: "Rekomendasi baru berhasil dicatat untuk",
    msgStageUpdated: "Status tahapan diperbarui menjadi",
    msgCandidateAdded: "Kandidat baru ditambahkan ke Pustaka Resume:"
  }
};

const INITIAL_CANDIDATES = [
  {
    id: "CND-1001",
    name: "Andi Candera",
    nationality: "Indonesia",
    statusCount: 21,
    stage: "pass",
    gender: "Male",
    age: 26,
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 9,
    recommendedPosition: "Indonesia Pre sales",
    recommendedCompany: "alauda",
    entryTime: "2026-09-26 17:55:00",
    email: "andi.candera@example.id",
    phone: "+62 812-3456-7801",
    skills: ["Cloud Native", "Pre-Sales Solution", "Kubernetes", "Mandarin Business", "Enterprise B2B"],
    summary: "Experienced Pre-Sales Solution Specialist with strong trilingual capability (Indonesian, English, Chinese). Proven track record assisting enterprise cloud & container platform rollouts across Southeast Asia.",
    recommendations: [
      {
        id: "REC-01",
        position: "Indonesia Pre sales",
        company: "alauda",
        stage: "pass",
        consultant: "Rina Wijaya",
        timestamp: "2026-09-26 17:55:00",
        notes: "Original resume passed client technical director review. Scheduled for solution demo."
      },
      {
        id: "REC-02",
        position: "Technical Account Manager",
        company: "Huawei Cloud ID",
        stage: "interview",
        consultant: "Budi Hartono",
        timestamp: "2026-09-14 11:20:00",
        notes: "Completed 1st user interview in Mandarin and English."
      }
    ]
  },
  {
    id: "CND-1002",
    name: "DIMAS RIZALDI",
    nationality: "Indonesia",
    statusCount: 12,
    stage: "interview",
    gender: "Male",
    age: 30,
    education: "",
    language: "Indonesian, English",
    yearsOfService: 10,
    recommendedPosition: "Business Development - Sugo Indonesia",
    recommendedCompany: "Mico World",
    entryTime: "2026-09-23 15:37:14",
    email: "dimas.rizaldi@example.id",
    phone: "+62 811-9870-2210",
    skills: ["Business Development", "Social Entertainment Apps", "Partnership", "Key Account", "User Acquisition"],
    summary: "10 years of commercial & business development experience in digital entertainment, live streaming networks, and regional agency partnerships in Indonesia.",
    recommendations: [
      {
        id: "REC-03",
        position: "Business Development - Sugo Indonesia",
        company: "Mico World",
        stage: "interview",
        consultant: "Rina Wijaya",
        timestamp: "2026-09-23 15:37:14",
        notes: "Country Manager interview scheduled for next Tuesday."
      }
    ]
  },
  {
    id: "CND-1003",
    name: "Zulfikri Akif",
    nationality: "Indonesia",
    statusCount: 12,
    stage: "pending",
    gender: "Male",
    age: 28,
    education: "undergraduate",
    language: "English, Indonesian",
    yearsOfService: 6,
    recommendedPosition: "Customs Documentation Clerk",
    recommendedCompany: "Midea",
    entryTime: "2026-09-22 10:36:16",
    email: "zulfikri.akif@example.id",
    phone: "+62 813-8821-4090",
    skills: ["Customs Clearance", "PIB / PEB", "Export-Import Compliance", "HS Code Classification", "Supply Chain"],
    summary: "Specialist in Indonesian customs documentation, import-export logistics, CEISA 4.0 reporting, and bonded zone regulatory compliance for electronics manufacturing.",
    recommendations: [
      {
        id: "REC-04",
        position: "Customs Documentation Clerk",
        company: "Midea",
        stage: "pending",
        consultant: "Hendra Kusuma",
        timestamp: "2026-09-22 10:36:16",
        notes: "CV sent to Midea Cikarang Logistics Manager."
      }
    ]
  },
  {
    id: "CND-1004",
    name: "Clarissa Wijaya",
    nationality: "Indonesia",
    statusCount: 16,
    stage: "entry",
    gender: "Female",
    age: 27,
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 5,
    recommendedPosition: "Regional HRBP Specialist",
    recommendedCompany: "Midea",
    entryTime: "2026-09-20 14:15:30",
    email: "clarissa.wijaya@example.id",
    phone: "+62 812-7700-1928",
    skills: ["HRBP", "Talent Acquisition", "Indonesian Labor Law", "Mandarin HSK 5", "Performance Appraisal"],
    summary: "Bilingual HR Business Partner experienced in setting up manufacturing & commercial teams for multinational companies expanding into Jakarta and Jawa Barat.",
    recommendations: [
      {
        id: "REC-05",
        position: "Regional HRBP Specialist",
        company: "Midea",
        stage: "entry",
        consultant: "Rina Wijaya",
        timestamp: "2026-09-20 14:15:30",
        notes: "Offer signed. Confirmed onboarding date."
      }
    ]
  },
  {
    id: "CND-1005",
    name: "Dian Pratama",
    nationality: "Indonesia",
    statusCount: 19,
    stage: "pass",
    gender: "Male",
    age: 29,
    education: "undergraduate",
    language: "Indonesian, English",
    yearsOfService: 7,
    recommendedPosition: "Senior Cloud Infrastructure Engineer",
    recommendedCompany: "alauda",
    entryTime: "2026-09-19 09:42:11",
    email: "dian.pratama@example.id",
    phone: "+62 857-2100-3344",
    skills: ["Go", "Kubernetes", "DevOps", "Linux Kernel", "Prometheus", "Terraform"],
    summary: "Senior Infrastructure & Platform Engineer specializing in Kubernetes cluster orchestration, high-availability banking backends, and cloud-native observability.",
    recommendations: [
      {
        id: "REC-06",
        position: "Senior Cloud Infrastructure Engineer",
        company: "alauda",
        stage: "pass",
        consultant: "Budi Hartono",
        timestamp: "2026-09-19 09:42:11",
        notes: "Passed architectural screening test with score 92/100."
      }
    ]
  },
  {
    id: "CND-1006",
    name: "Fajar Nugroho",
    nationality: "Indonesia",
    statusCount: 8,
    stage: "failed",
    gender: "Male",
    age: 25,
    education: "undergraduate",
    language: "Indonesian, English",
    yearsOfService: 3,
    recommendedPosition: "Channel Sales Supervisor",
    recommendedCompany: "Mico World",
    entryTime: "2026-09-17 16:20:05",
    email: "fajar.nugroho@example.id",
    phone: "+62 818-4455-9901",
    skills: ["B2B Sales", "Distributor Management", "FMCG & Electronics", "CRM"],
    summary: "Sales professional experienced in managing tier-1 and tier-2 dealers across Greater Jakarta.",
    recommendations: [
      {
        id: "REC-07",
        position: "Channel Sales Supervisor",
        company: "Mico World",
        stage: "failed",
        consultant: "Hendra Kusuma",
        timestamp: "2026-09-17 16:20:05",
        notes: "Client required prior live-streaming agency background; keep in pool for retail roles."
      }
    ]
  },
  {
    id: "CND-1007",
    name: "Meilinda Tan",
    nationality: "Indonesia",
    statusCount: 14,
    stage: "new",
    gender: "Female",
    age: 24,
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 3,
    recommendedPosition: "Executive Interpreter & Project Coordinator",
    recommendedCompany: "alauda",
    entryTime: "2026-09-16 11:05:49",
    email: "meilinda.tan@example.id",
    phone: "+62 812-6611-8823",
    skills: ["Simultaneous Interpretation", "Project Coordination", "HSK 6", "Technical Translation", "Stakeholder Management"],
    summary: "Trilingual Project Coordinator assisting C-level executives and engineering teams with cross-border project delivery and client liaison.",
    recommendations: [
      {
        id: "REC-08",
        position: "Executive Interpreter & Project Coordinator",
        company: "alauda",
        stage: "new",
        consultant: "Rina Wijaya",
        timestamp: "2026-09-16 11:05:49",
        notes: "Newly indexed into Resume Lib. High proficiency in technical Mandarin."
      }
    ]
  },
  {
    id: "CND-1008",
    name: "Hendra Wijaya",
    nationality: "Indonesia",
    statusCount: 15,
    stage: "interview",
    gender: "Male",
    age: 32,
    education: "master",
    language: "Indonesian, English",
    yearsOfService: 9,
    recommendedPosition: "Supply Chain & Warehouse Manager",
    recommendedCompany: "Midea",
    entryTime: "2026-09-14 13:50:22",
    email: "hendra.wijaya@example.id",
    phone: "+62 811-3049-8877",
    skills: ["WMS", "SAP MM", "Inventory Optimization", "3PL Management", "Cold & Dry Chain"],
    summary: "Master of Supply Chain Engineering with 9 years managing national distribution centers and 3PL partners across Java and Sumatra.",
    recommendations: [
      {
        id: "REC-09",
        position: "Supply Chain & Warehouse Manager",
        company: "Midea",
        stage: "interview",
        consultant: "Hendra Kusuma",
        timestamp: "2026-09-14 13:50:22",
        notes: "Final panel interview with Regional Operations Director."
      }
    ]
  }
];

const ALL_COLUMNS = [
  { id: "candidate", key: "colCandidate", locked: true },
  { id: "nationality", key: "colNationality", locked: false },
  { id: "status", key: "colStatus", locked: false },
  { id: "gender", key: "colGender", locked: false },
  { id: "age", key: "colAge", locked: false },
  { id: "education", key: "colEducation", locked: false },
  { id: "language", key: "colLanguage", locked: false },
  { id: "yearsOfService", key: "colYearOfService", locked: false },
  { id: "recommendedPosition", key: "colRecPosition", locked: false },
  { id: "recommendedCompany", key: "colRecCompany", locked: false },
  { id: "entryTime", key: "colEntryTime", locked: false },
  { id: "operation", key: "colOperation", locked: false }
];

function getStoredCandidates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
      return JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
    }
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
  }
}

function saveCandidates(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(list));
  } catch (e) {}
}

function getStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANG) || "en";
  } catch (e) {
    return "en";
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  } catch (e) {}
}

function getStoredVisibleColumns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VISIBLE_COLS);
    if (!raw) return ALL_COLUMNS.map(c => c.id);
    return JSON.parse(raw);
  } catch (e) {
    return ALL_COLUMNS.map(c => c.id);
  }
}

function saveVisibleColumns(cols) {
  try {
    localStorage.setItem(STORAGE_KEYS.VISIBLE_COLS, JSON.stringify(cols));
  } catch (e) {}
}
