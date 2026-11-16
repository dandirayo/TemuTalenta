/**
 * TemuTalenta Enterprise ATS & Resume Library
 * Dataset, Status Codes, & Tri-lingual I18N (English, Chinese / 中文, Indonesian)
 * Sesuai spesifikasi PRD.md (Nov 16, 2026)
 */

const STORAGE_KEYS = {
  CANDIDATES: "temutalenta_ats_candidates_v3",
  LANG: "temutalenta_lang_v3",
  COLOR_SCHEME: "color-scheme",
  VISIBLE_COLS: "temutalenta_visible_cols_v3",
  AUDIT_LOGS: "temutalenta_audit_logs_v3",
  PAGE_SIZE: "temutalenta_page_size_v3"
};

// Master Status Codes sesuai tabel PRD (Daftar kode status)
const STATUS_CODES = {
  0:  { code: 0,  tab: "new",       nameEn: "New",                       nameZh: "新增简历",     nameId: "Kandidat Baru",         isFailed: false, isFinal: false },
  10: { code: 10, tab: "pending",   nameEn: "Recommended to Client",     nameZh: "已推荐给客户",   nameId: "Direkomendasikan",       isFailed: false, isFinal: false },
  11: { code: 11, tab: "pending",   nameEn: "Client Reviewing",          nameZh: "客户评估中",     nameId: "Ditinjau Klien",        isFailed: false, isFinal: false },
  12: { code: 12, tab: "pass",      nameEn: "Original Resume Pass",      nameZh: "简历初筛通过",   nameId: "CV Lolos",              isFailed: false, isFinal: false },
  19: { code: 19, tab: "failed",    nameEn: "Resume Rejected",           nameZh: "简历初筛淘汰",   nameId: "CV Ditolak",            isFailed: true,  isFinal: true  },
  20: { code: 20, tab: "interview", nameEn: "Interview Scheduled",       nameZh: "已安排面试",     nameId: "Interview Dijadwalkan", isFailed: false, isFinal: false },
  21: { code: 21, tab: "interview", nameEn: "Initial Interview Passed",  nameZh: "初试通过",       nameId: "Lolos Interview Awal",  isFailed: false, isFinal: false },
  22: { code: 22, tab: "interview", nameEn: "Final Interview",           nameZh: "终试中",         nameId: "Interview Final",       isFailed: false, isFinal: false },
  29: { code: 29, tab: "failed",    nameEn: "Interview Failed",          nameZh: "面试未通过",     nameId: "Gagal Interview",       isFailed: true,  isFinal: true  },
  30: { code: 30, tab: "offer",     nameEn: "Offer Proposed",            nameZh: "已发Offer",      nameId: "Offer Diajukan",        isFailed: false, isFinal: false },
  31: { code: 31, tab: "offer",     nameEn: "Offer Accepted",            nameZh: "已接受Offer",    nameId: "Offer Diterima",        isFailed: false, isFinal: false },
  39: { code: 39, tab: "failed",    nameEn: "Offer Cancelled / Declined",nameZh: "Offer取消/拒绝", nameId: "Offer Batal / Ditolak", isFailed: true,  isFinal: true  },
  40: { code: 40, tab: "entry",     nameEn: "Started Work (Entry)",      nameZh: "已入职",         nameId: "Mulai Bekerja (Entry)", isFailed: false, isFinal: false },
  41: { code: 41, tab: "entry",     nameEn: "Passed Probation",          nameZh: "已通过试用期",   nameId: "Lulus Probation",       isFailed: false, isFinal: true  },
  49: { code: 49, tab: "failed",    nameEn: "Failed Probation / Resigned",nameZh: "试用期未过/离职",nameId: "Gagal Probation/Resign",isFailed: true,  isFinal: true  },
  90: { code: 90, tab: "failed",    nameEn: "Candidate Withdrew",        nameZh: "候选人放弃",     nameId: "Kandidat Mundur",       isFailed: true,  isFinal: true  },
  91: { code: 91, tab: "failed",    nameEn: "Blacklist",                 nameZh: "黑名单",         nameId: "Blacklist",             isFailed: true,  isFinal: true  }
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
    navAuditLogs: "Audit Logs",
    navPrdDocs: "PRD & Specs",

    // Header & Subnav
    langChinese: "Chinese",
    langEnglish: "English",
    langIndonesian: "Indonesian",
    btnBack: "Back",
    btnRefresh: "Refresh",
    btnHome: "Home",

    // Search Controls
    phCandidateName: "Candidate Name",
    phKeyword: "Key word",
    phState: "State",
    btnSearch: "Search",
    btnSearchAll: "Search All",
    btnAdvSearch: "Advanced Search",
    btnHideAdvSearch: "Hide Advanced Search",
    btnNewCandidate: "+ New Candidate",
    btnResetData: "Reset Data",

    // Advanced Search
    lblNationality: "Nationality",
    lblGender: "Gender",
    lblMinAge: "Min Age",
    lblMaxAge: "Max Age",
    lblEducation: "Education",
    lblMinService: "Min Service (Yrs)",
    lblConsultantOwner: "Consultant",
    optAll: "All",
    optMale: "Male",
    optFemale: "Female",
    optUndergraduate: "undergraduate",
    optMaster: "master",
    optDiploma: "diploma",

    // Stage Tabs (Matches PRD: All, New, Pending, Original resume pass, Interview, Offer, Failed, Entry)
    stageAll: "All",
    stageNew: "New",
    stagePending: "Pending",
    stagePass: "Original resume pass",
    stageInterview: "Interview",
    stageOffer: "Offer",
    stageFailed: "Failed",
    stageEntry: "Entry",

    // Columns
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

    // Row Operations
    actDownloadResume: "Download Resume",
    actRecRepeat: "Recommended Repeat",
    actRecList: "Recommended List",

    // Pagination & Footer
    lblShowing: "Showing",
    lblOf: "of",
    lblRecords: "candidates",
    lblRowsPerPage: "Rows per page:",
    emptyTable: "No candidates found matching the search criteria.",

    // Modals
    modalProfileTitle: "Candidate Profile & Recommendations",
    modalRecRepeatTitle: "Recommended Repeat (Client Submission)",
    modalRecListTitle: "Candidate Recommendation History",
    modalAddTitle: "Add New Candidate",
    btnClose: "Close",
    btnSave: "Save",
    btnCancel: "Cancel",
    btnSubmitRec: "Submit Recommendation",

    // Fields
    fldFullName: "Candidate Name",
    fldNationality: "Nationality",
    fldGender: "Gender",
    fldBirthDate: "Date of Birth",
    fldAge: "Age",
    fldEducation: "Education",
    fldLanguages: "Languages",
    fldYearsService: "Year of Service",
    fldRecPosition: "Recommended Position",
    fldRecCompany: "Recommended Company",
    fldStage: "Status Code",
    fldEmail: "Email",
    fldPhone: "Phone",
    fldSummary: "Summary",
    fldReason: "Reason / Justification",
    fldNotes: "Consultant Notes",
    fldConsultant: "Consultant",
    fldDate: "Submission Date",
    fldManagerApproval: "Manager Approval Granted",

    // Validation Warnings
    warnBlacklist: "Action blocked: Candidate is Blacklisted (Code 91) and cannot be recommended.",
    warnActiveSame: "Action blocked: Candidate has an ongoing recommendation for this company and position.",
    warnDiffConsultant6Mo: "Warning: Recommended to this company by another consultant in the last 6 months. Manager approval and justification required.",
    warnSameCompany6Mo: "Notice: Candidate was recommended to this company within the last 6 months. Reason is mandatory.",
    warnAlreadyHired: "Notice: Candidate already accepted an offer (31) or started work (40). Reason is required.",

    // Notifications
    msgRefreshed: "Data refreshed.",
    msgResetDone: "Restored to default candidate records.",
    msgResumeDownloaded: "Downloaded resume for",
    msgRecSuccess: "Recommendation submitted for",
    msgStatusChanged: "Status updated for",
    msgCandidateAdded: "Candidate added:"
  },
  zh: {
    // Sidebar
    navTalentMgmt: "人才管理",
    navResumeLib: "简历库",
    navAddCandidate: "添加候选人",
    navConsultantBiz: "顾问业务",
    navRecList: "推荐列表",
    navClientList: "客户公司",
    navDataAnalysis: "数据分析",
    navPipelineReport: "招聘漏斗报表",
    navAuditLogs: "操作日志",
    navPrdDocs: "PRD需求文档",

    // Header & Subnav
    langChinese: "中文",
    langEnglish: "English",
    langIndonesian: "印尼语",
    btnBack: "返回",
    btnRefresh: "刷新",
    btnHome: "首页",

    // Search Controls
    phCandidateName: "候选人姓名",
    phKeyword: "关键字",
    phState: "状态",
    btnSearch: "搜索",
    btnSearchAll: "显示全部",
    btnAdvSearch: "显示高级搜索",
    btnHideAdvSearch: "隐藏高级搜索",
    btnNewCandidate: "+ 新增候选人",
    btnResetData: "重置数据",

    // Advanced Search
    lblNationality: "国籍",
    lblGender: "性别",
    lblMinAge: "最小年龄",
    lblMaxAge: "最大年龄",
    lblEducation: "学历",
    lblMinService: "工作年限(年)",
    lblConsultantOwner: "所属顾问",
    optAll: "全部",
    optMale: "男",
    optFemale: "女",
    optUndergraduate: "本科 (undergraduate)",
    optMaster: "硕士 (master)",
    optDiploma: "大专 (diploma)",

    // Stage Tabs
    stageAll: "全部",
    stageNew: "新增",
    stagePending: "待处理",
    stagePass: "初筛通过",
    stageInterview: "面试",
    stageOffer: "录用意向",
    stageFailed: "已淘汰",
    stageEntry: "已入职",

    // Columns
    lblDisplayCols: "展示列:",
    colCandidate: "候选人",
    colNationality: "国籍",
    colStatus: "状态",
    colGender: "性别",
    colAge: "年龄",
    colEducation: "学历",
    colLanguage: "语言",
    colYearOfService: "工作年限",
    colRecPosition: "推荐职位",
    colRecCompany: "推荐公司",
    colEntryTime: "录入时间",
    colOperation: "操作",

    // Row Operations
    actDownloadResume: "下载简历",
    actRecRepeat: "查重与推荐",
    actRecList: "推荐记录",

    // Pagination & Footer
    lblShowing: "显示",
    lblOf: "共",
    lblRecords: "位候选人",
    lblRowsPerPage: "每页行数:",
    emptyTable: "未找到符合条件的候选人。",

    // Modals
    modalProfileTitle: "候选人档案与推荐历史",
    modalRecRepeatTitle: "查重与再次推荐 (Recommended Repeat)",
    modalRecListTitle: "推荐历史记录",
    modalAddTitle: "录入新候选人",
    btnClose: "关闭",
    btnSave: "保存",
    btnCancel: "取消",
    btnSubmitRec: "提交推荐",

    // Fields
    fldFullName: "姓名",
    fldNationality: "国籍",
    fldGender: "性别",
    fldBirthDate: "出生日期",
    fldAge: "年龄",
    fldEducation: "学历",
    fldLanguages: "掌握语言",
    fldYearsService: "工作年数",
    fldRecPosition: "推荐职位",
    fldRecCompany: "推荐公司",
    fldStage: "状态代码",
    fldEmail: "邮箱",
    fldPhone: "电话",
    fldSummary: "个人简介",
    fldReason: "推荐理由/说明",
    fldNotes: "顾问评估备注",
    fldConsultant: "经办顾问",
    fldDate: "提交时间",
    fldManagerApproval: "主管已审批同意",

    // Validation Warnings
    warnBlacklist: "操作受限：该候选人已被列入黑名单 (代码 91)，禁止推荐！",
    warnActiveSame: "操作受限：该候选人在该公司的同职位推荐流程仍在进行中！",
    warnDiffConsultant6Mo: "提示：过去6个月内已有其他顾问推荐该候选人至此公司，需经主管审批并填写理由。",
    warnSameCompany6Mo: "提示：该候选人在过去6个月内曾被推荐至此公司，必须填写推荐理由。",
    warnAlreadyHired: "提示：该候选人已接受Offer或已入职，再次推荐需填写必要理由。",

    // Notifications
    msgRefreshed: "数据已刷新。",
    msgResetDone: "已恢复为默认候选人数据。",
    msgResumeDownloaded: "已下载简历：",
    msgRecSuccess: "推荐提交成功：",
    msgStatusChanged: "状态已更新：",
    msgCandidateAdded: "成功添加候选人："
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
    navAuditLogs: "Log Audit",
    navPrdDocs: "PRD & Spesifikasi",

    // Header & Subnav
    langChinese: "Mandarin",
    langEnglish: "Inggris",
    langIndonesian: "Indonesia",
    btnBack: "Kembali",
    btnRefresh: "Muat Ulang",
    btnHome: "Beranda",

    // Search Controls
    phCandidateName: "Nama Kandidat",
    phKeyword: "Kata kunci",
    phState: "Status Tahapan",
    btnSearch: "Cari",
    btnSearchAll: "Tampilkan Semua",
    btnAdvSearch: "Pencarian Lanjutan",
    btnHideAdvSearch: "Tutup Filter Lanjutan",
    btnNewCandidate: "+ Kandidat Baru",
    btnResetData: "Reset Data Awal",

    // Advanced Search
    lblNationality: "Kewarganegaraan",
    lblGender: "Jenis Kelamin",
    lblMinAge: "Usia Min",
    lblMaxAge: "Usia Maks",
    lblEducation: "Pendidikan",
    lblMinService: "Min Masa Kerja (Thn)",
    lblConsultantOwner: "Konsultan PIC",
    optAll: "Semua",
    optMale: "Laki-laki",
    optFemale: "Perempuan",
    optUndergraduate: "undergraduate",
    optMaster: "master",
    optDiploma: "diploma",

    // Stage Tabs
    stageAll: "Semua",
    stageNew: "Baru",
    stagePending: "Menunggu",
    stagePass: "Lolos Seleksi CV",
    stageInterview: "Wawancara",
    stageOffer: "Penawaran (Offer)",
    stageFailed: "Tidak Lolos",
    stageEntry: "Diterima / Masuk",

    // Columns
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

    // Row Operations
    actDownloadResume: "Unduh Resume",
    actRecRepeat: "Rekomendasi Ulang",
    actRecList: "Daftar Rekomendasi",

    // Pagination & Footer
    lblShowing: "Menampilkan",
    lblOf: "dari",
    lblRecords: "kandidat",
    lblRowsPerPage: "Baris per halaman:",
    emptyTable: "Tidak ada kandidat yang memenuhi kriteria pencarian.",

    // Modals
    modalProfileTitle: "Profil Kandidat & Riwayat Rekomendasi",
    modalRecRepeatTitle: "Rekomendasi Ulang (Recommended Repeat)",
    modalRecListTitle: "Riwayat Rekomendasi Kandidat",
    modalAddTitle: "Tambah Kandidat Baru",
    btnClose: "Tutup",
    btnSave: "Simpan",
    btnCancel: "Batal",
    btnSubmitRec: "Kirim Rekomendasi",

    // Fields
    fldFullName: "Nama Lengkap",
    fldNationality: "Kewarganegaraan",
    fldGender: "Jenis Kelamin",
    fldBirthDate: "Tanggal Lahir",
    fldAge: "Usia",
    fldEducation: "Pendidikan",
    fldLanguages: "Bahasa yang Dikuasai",
    fldYearsService: "Masa Kerja (Tahun)",
    fldRecPosition: "Posisi Rekomendasi",
    fldRecCompany: "Perusahaan Tujuan",
    fldStage: "Kode Status",
    fldEmail: "Email",
    fldPhone: "Nomor Telepon",
    fldSummary: "Ringkasan Pengalaman",
    fldReason: "Alasan / Justifikasi",
    fldNotes: "Catatan Evaluasi Konsultan",
    fldConsultant: "Konsultan PIC",
    fldDate: "Waktu Pengajuan",
    fldManagerApproval: "Persetujuan Manajer Telah Diberikan",

    // Validation Warnings
    warnBlacklist: "Aksi diblokir: Kandidat masuk daftar Blacklist (Kode 91) dan tidak boleh direkomendasikan.",
    warnActiveSame: "Aksi diblokir: Pengajuan untuk perusahaan dan posisi yang sama masih berjalan.",
    warnDiffConsultant6Mo: "Peringatan: Kandidat sudah pernah diajukan ke perusahaan ini oleh konsultan lain dalam 6 bulan terakhir. Membutuhkan persetujuan Manajer dan alasan.",
    warnSameCompany6Mo: "Pemberitahuan: Kandidat pernah diajukan ke perusahaan ini dalam 6 bulan terakhir. Alasan pengajuan wajib diisi.",
    warnAlreadyHired: "Pemberitahuan: Kandidat sedang dalam status Offer diterima (31) atau Mulai bekerja (40). Alasan wajib diisi.",

    // Notifications
    msgRefreshed: "Data berhasil dimuat ulang.",
    msgResetDone: "Data awal berhasil dipulihkan.",
    msgResumeDownloaded: "Dokumen resume diunduh untuk",
    msgRecSuccess: "Rekomendasi berhasil dikirim untuk",
    msgStatusChanged: "Status diperbarui untuk",
    msgCandidateAdded: "Kandidat baru ditambahkan:"
  }
};

/**
 * Initial candidate dataset matching the exact reference screenshot
 * Andi Candera (21), DIMAS RIZALDI (12), Zulfikri Akif (12), etc.
 */
const INITIAL_CANDIDATES = [
  {
    id: "CND-1001",
    name: "Andi Candera",
    nationality: "Indonesia",
    gender: "Male",
    birthDate: "2000-04-12",
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 9,
    recommendedPosition: "Indonesia Pre sales",
    recommendedCompany: "alauda",
    entryTime: "2026-09-26 17:55:00",
    email: "andi.candera@example.id",
    phone: "+62 812-3456-7801",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Cloud Native", "Pre-Sales", "Kubernetes", "Mandarin HSK 6", "Enterprise B2B"],
    summary: "Senior Pre-Sales specialist with 9 years in enterprise cloud platforms. Fluent in Mandarin, English, and Indonesian.",
    recommendations: [
      {
        id: "REC-101",
        company: "alauda",
        position: "Indonesia Pre sales",
        statusCode: 21, // 21: Lolos interview awal (Matches screenshot badge 21)
        consultantId: "USR-01",
        consultantName: "Rina Wijaya",
        timestamp: "2026-09-26 17:55:00",
        notes: "Passed 1st round technical interview with Alauda Regional Director.",
        isActive: true
      },
      {
        id: "REC-100",
        company: "Huawei Cloud",
        position: "Solutions Architect",
        statusCode: 12,
        consultantId: "USR-02",
        consultantName: "Budi Hartono",
        timestamp: "2026-08-10 10:15:00",
        notes: "CV passed screening, later candidate prioritized Alauda role.",
        isActive: false
      }
    ]
  },
  {
    id: "CND-1002",
    name: "DIMAS RIZALDI",
    nationality: "Indonesia",
    gender: "Male",
    birthDate: "1996-08-20",
    education: "",
    language: "Indonesian, English",
    yearsOfService: 10,
    recommendedPosition: "Business Development - Sugo Indonesia",
    recommendedCompany: "Mico World",
    entryTime: "2026-09-23 15:37:14",
    email: "dimas.rizaldi@example.id",
    phone: "+62 811-9870-2210",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Business Development", "Sugo App", "Live Streaming", "Partnerships"],
    summary: "Commercial director with 10 years experience expanding international mobile apps and live entertainment platforms in Indonesia.",
    recommendations: [
      {
        id: "REC-102",
        company: "Mico World",
        position: "Business Development - Sugo Indonesia",
        statusCode: 12, // 12: CV lolos (Matches screenshot badge 12)
        consultantId: "USR-01",
        consultantName: "Rina Wijaya",
        timestamp: "2026-09-23 15:37:14",
        notes: "Resume passed client review. Awaiting interview schedule confirmation.",
        isActive: true
      }
    ]
  },
  {
    id: "CND-1003",
    name: "Zulfikri Akif",
    nationality: "Indonesia",
    gender: "Male",
    birthDate: "1998-02-14",
    education: "undergraduate",
    language: "English, Indonesian",
    yearsOfService: 6,
    recommendedPosition: "Customs Documentation Clerk",
    recommendedCompany: "Midea",
    entryTime: "2026-09-22 10:36:16",
    email: "zulfikri.akif@example.id",
    phone: "+62 813-8821-4090",
    ownerId: "USR-03",
    ownerName: "Hendra Kusuma",
    skills: ["Customs Documentation", "CEISA 4.0", "Import Clearance", "Bonded Logistics"],
    summary: "Supply chain and customs documentation specialist with 6 years experience in manufacturing import compliance.",
    recommendations: [
      {
        id: "REC-103",
        company: "Midea",
        position: "Customs Documentation Clerk",
        statusCode: 12, // 12: CV lolos (Matches screenshot badge 12)
        consultantId: "USR-03",
        consultantName: "Hendra Kusuma",
        timestamp: "2026-09-22 10:36:16",
        notes: "Original resume passed client plant HR manager.",
        isActive: true
      }
    ]
  },
  {
    id: "CND-1004",
    name: "Clarissa Wijaya",
    nationality: "Indonesia",
    gender: "Female",
    birthDate: "1999-05-18",
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 5,
    recommendedPosition: "Regional HRBP Specialist",
    recommendedCompany: "Midea",
    entryTime: "2026-09-20 14:15:30",
    email: "clarissa.wijaya@example.id",
    phone: "+62 812-7700-1928",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["HRBP", "Talent Acquisition", "Labor Law", "Bilingual HR"],
    summary: "Bilingual HRBP experienced in corporate HR operations and industrial relations for multinational electronics manufacturers.",
    recommendations: [
      {
        id: "REC-104",
        company: "Midea",
        position: "Regional HRBP Specialist",
        statusCode: 40, // 40: Mulai bekerja (Entry)
        consultantId: "USR-01",
        consultantName: "Rina Wijaya",
        timestamp: "2026-09-20 14:15:30",
        notes: "Officially started work at Midea Head Office on Sep 20.",
        isActive: true
      }
    ]
  },
  {
    id: "CND-1005",
    name: "Fajar Nugroho",
    nationality: "Indonesia",
    gender: "Male",
    birthDate: "2001-11-03",
    education: "undergraduate",
    language: "Indonesian, English",
    yearsOfService: 3,
    recommendedPosition: "Channel Sales Supervisor",
    recommendedCompany: "Mico World",
    entryTime: "2026-09-17 16:20:05",
    email: "fajar.nugroho@example.id",
    phone: "+62 818-4455-9901",
    ownerId: "USR-03",
    ownerName: "Hendra Kusuma",
    skills: ["B2B Channel Sales", "Dealer Relations", "FMCG"],
    summary: "Channel sales representative handling tier-1 electronics retailers.",
    recommendations: [
      {
        id: "REC-105",
        company: "Mico World",
        position: "Channel Sales Supervisor",
        statusCode: 29, // 29: Gagal interview (Failed, red badge)
        consultantId: "USR-03",
        consultantName: "Hendra Kusuma",
        timestamp: "2026-09-17 16:20:05",
        notes: "Client required agency live streaming experience.",
        reason: "Mismatch with live-streaming agency requirements.",
        isActive: false
      }
    ]
  },
  {
    id: "CND-1006",
    name: "Meilinda Tan",
    nationality: "Indonesia",
    gender: "Female",
    birthDate: "2002-07-29",
    education: "undergraduate",
    language: "Indonesian, English, Chinese",
    yearsOfService: 2,
    recommendedPosition: "",
    recommendedCompany: "",
    entryTime: "2026-09-16 11:05:49",
    email: "meilinda.tan@example.id",
    phone: "+62 812-6611-8823",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Interpretation", "HSK 6", "Project Coordinator"],
    summary: "Fresh trilingual graduate with high fluency in Mandarin and English, ready for project coordinator and executive interpreter roles.",
    recommendations: [] // 0: New (Never recommended)
  },
  {
    id: "CND-1007",
    name: "Kevin Ardianto",
    nationality: "Indonesia",
    gender: "Male",
    birthDate: "1997-09-12",
    education: "master",
    language: "Indonesian, English",
    yearsOfService: 7,
    recommendedPosition: "Senior DevOps Architect",
    recommendedCompany: "alauda",
    entryTime: "2026-09-15 13:40:00",
    email: "kevin.ardianto@example.id",
    phone: "+62 813-9000-1122",
    ownerId: "USR-02",
    ownerName: "Budi Hartono",
    skills: ["Terraform", "Kubernetes", "AWS", "CI/CD"],
    summary: "DevOps Engineer with Master's degree and extensive hands-on experience in production Kubernetes cluster architectures.",
    recommendations: [
      {
        id: "REC-106",
        company: "alauda",
        position: "Senior DevOps Architect",
        statusCode: 30, // 30: Offer diajukan (Tab: Offer)
        consultantId: "USR-02",
        consultantName: "Budi Hartono",
        timestamp: "2026-09-15 13:40:00",
        notes: "Formal offer package sent to candidate on Sep 15.",
        isActive: true
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

/**
 * Calculates current candidate age from birthDate
 */
function calculateAge(birthDateStr) {
  if (!birthDateStr) return 26;
  const birth = new Date(birthDateStr);
  const now = new Date("2026-11-16");
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * One badge per candidate calculation rule (PRD lines 197-207)
 */
function computeCandidateBadge(candidate) {
  const recs = candidate.recommendations || [];
  if (recs.length === 0) return 0;

  // Rule 4: Blacklist 91 always overrides
  if (recs.some(r => r.statusCode === 91)) return 91;

  // Rule 2: Active recommendations -> highest progress code
  const activeRecs = recs.filter(r => r.isActive !== false);
  if (activeRecs.length > 0) {
    const codes = activeRecs.map(r => r.statusCode);
    return Math.max(...codes);
  }

  // Rule 3: All finished -> last changed recommendation code
  return recs[0].statusCode;
}

/**
 * Resolves which tab a candidate belongs to based on their computed badge code
 */
function getStageTabForCode(statusCode) {
  const statusMeta = STATUS_CODES[statusCode];
  return statusMeta ? statusMeta.tab : "new";
}

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

function getStoredAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addAuditLog(action, entity, details) {
  const logs = getStoredAuditLogs();
  logs.unshift({
    id: `LOG-${Date.now()}`,
    action,
    entity,
    details,
    user: "Rina Wijaya (Consultant)",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19)
  });
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {}
}
