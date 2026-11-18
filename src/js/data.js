/**
 * TemuTalenta Enterprise ATS & Resume Library
 * Dataset, Status Codes, Master Data, & Tri-lingual I18N
 * Sesuai spesifikasi PRD.md (Nov 16, 2026)
 */

const STORAGE_KEYS = {
  CANDIDATES: "temutalenta_candidates_clean_v1",
  LANG: "temutalenta_lang_v4",
  COLOR_SCHEME: "color-scheme",
  VISIBLE_COLS: "temutalenta_visible_cols_v4",
  AUDIT_LOGS: "temutalenta_audit_logs_v4",
  PAGE_SIZE: "temutalenta_page_size_v4",
  ACTIVE_USER: "temutalenta_active_user_v5",
  NOTIFICATIONS: "temutalenta_notifications_clean_v1",
  MASTER_COMPANIES: "temutalenta_master_companies_v4",
  MASTER_POSITIONS: "temutalenta_master_positions_v4",
  USERS: "temutalenta_users_v5",
  OPEN_JOBS: "temutalenta_open_jobs_v4",
  INTERVIEWS: "temutalenta_interviews_clean_v1",
  SETTINGS: "temutalenta_system_settings_v1",
  MASTER_LANGUAGES: "temutalenta_master_languages_v1",
  MASTER_COUNTRIES: "temutalenta_master_countries_v1"
};

// Users & Roles: Single-user Full Control / SuperAdmin deployment (AUL SuperAdmin)
const INITIAL_USERS = [
  { id: "USR-AUL", name: "AUL SuperAdmin", role: "superadmin", roleName: "Super Admin (Full Control)", avatar: "AUL", email: "aul.superadmin@temutalenta.com", active: true }
];

let USERS = [...INITIAL_USERS];

// Master Status Codes sesuai tabel PRD
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
    navSettings: "Settings (Master Data)",
    navPrdDocs: "PRD & Specs",

    // Header & Subnav
    langChinese: "Chinese",
    langEnglish: "English",
    langIndonesian: "Indonesian",
    btnBack: "Back",
    btnRefresh: "Refresh",
    btnHome: "Home",
    lblActiveRole: "Active User:",

    // Search Controls
    phCandidateName: "Candidate Name",
    phKeyword: "Key word",
    phState: "State",
    btnSearch: "Search",
    btnSearchAll: "Search All",
    btnAdvSearch: "Advanced Search",
    btnHideAdvSearch: "Hide Advanced Search",
    btnNewCandidate: "+ New Candidate",
    btnImportCsv: "Import CSV/Excel",
    btnExportCsv: "Export CSV",
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

    // Stage Tabs
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
    btnPresetSimple: "Compact",
    btnPresetAll: "Full",
    btnPresetReset: "Reset",
    tipHideCol: "Hide this column",
    lblColsActive: "columns active",
    colLocked: "(Mandatory)",
    msgPresetSimpleApplied: "Compact View activated (5 core columns).",
    msgPresetAllApplied: "Full View activated (all 12 columns).",
    msgColHidden: 'Column "{col}" hidden.',
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
    modalImportTitle: "Import Candidates from CSV / Excel",
    btnClose: "Close",
    btnSave: "Save",
    btnCancel: "Cancel",
    btnSubmitRec: "Submit Recommendation",
    btnUploadCsv: "Upload & Import",
    btnDownloadTemplate: "Download CSV Template",

    // Tabs inside Candidate Profile
    tabOverview: "Overview & Contacts",
    tabWorkEdu: "Experience & Education",
    tabCvViewer: "CV Document Viewer",
    tabTimeline: "Activity Timeline",

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
    fldWhatsApp: "WhatsApp",
    fldDomicile: "Domicile / City",
    fldSalaryExpectation: "Expected Salary",
    fldCurrentSalary: "Current Salary",
    fldAvailability: "Availability",
    fldSummary: "Summary",
    fldTags: "Tags (comma separated)",
    fldReason: "Reason / Justification",
    fldNotes: "Consultant Notes",
    fldConsultant: "Consultant",
    fldDate: "Submission Date",
    fldManagerApproval: "Manager Approval Granted",

    // Notifications
    lblNotifications: "Notifications",
    btnMarkAllRead: "Mark all read",
    lblRecruitmentFunnel: "Recruitment Pipeline Funnel",
    lblMasterData: "Master Data Management",
    lblClientCompanies: "Client Companies",
    lblPositions: "Job Positions",
    btnAddCompany: "+ Add Client",
    btnAddPosition: "+ Add Position",
    btnInteractiveTester: "Interactive Feature Tester",
    modalDemoTitle: "Interactive ATS Feature Tester & Scenarios",
    tabMyTargets: "My Recommendations & Targets",
    tabLeaderboard: "Team Leaderboard & Comparison",
    lblUserManagement: "User Management & Role Access",
    btnAddUser: "+ Add User",
    btnExportAnalytics: "Export Analytics CSV",
    lblDemographics: "Candidate Demographics & Distribution",
    navCareerPortal: "Career Portal (Job Board)",
    navInterviewCalendar: "Interview Calendar",
    btnScheduleInterview: "Schedule Interview",
    btnGenerateOffer: "Generate Offer Letter",
    btnParseCv: "Auto-Fill from CV Document",
    lblCvDropzoneTitle: "Upload CV Document (Auto-Fill All Fields)",
    lblCvDropzoneSub: "Drag & drop CV (.PDF, .DOCX, .TXT) here, or click to browse",
    lblCvDropzoneHint: "Auto-fills Name, Email, Phone, DOB, Gender, Education, Experience, Languages, Position & Summary",
    btnChooseCvFile: "Choose CV File",
    btnTrySampleCv: "Try Sample CV",
    btnToggleManualText: "Paste Text Manually",
    lblOpenPositions: "Open Career Opportunities",
    btnApplyJob: "Apply for Position",
    lblUpcomingInterviews: "Upcoming Scheduled Interviews",
    lblOfferDocument: "Official Employment Offer Letter",
    btnViewTable: "Table View",
    btnViewKanban: "Kanban Board",
    tabWarrantyTracker: "Placement & Warranty (Fee)",
    btnPostJob: "+ Post Job Order",
    btnAcceptOfferEsign: "Sign & Accept Offer (Code 31)",
    lblBackupRestore: "Database Backup & Restore",
    btnContactWa: "Contact (WA/Email)",
    lblMonthlyInflow: "Monthly Candidate Inflow (DA-02)",
    lblBatchSelected: "selected",
    msgRefreshed: "Data refreshed.",
    msgResetDone: "Restored to default candidate records.",
    msgResumeDownloaded: "Downloaded resume for",
    msgRecSuccess: "Recommendation submitted for",
    msgStatusChanged: "Status updated for",
    msgCandidateAdded: "Candidate added:",
    msgExportSuccess: "Exported candidates to CSV.",
    msgImportSuccess: "Successfully imported candidates:",
    msgRoleChanged: "Switched active user to:"
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
    navSettings: "系统设置 (基础数据)",
    navPrdDocs: "PRD需求文档",

    // Header & Subnav
    langChinese: "中文",
    langEnglish: "English",
    langIndonesian: "印尼语",
    btnBack: "返回",
    btnRefresh: "刷新",
    btnHome: "首页",
    lblActiveRole: "当前用户:",

    // Search Controls
    phCandidateName: "候选人姓名",
    phKeyword: "关键字",
    phState: "状态",
    btnSearch: "搜索",
    btnSearchAll: "显示全部",
    btnAdvSearch: "显示高级搜索",
    btnHideAdvSearch: "隐藏高级搜索",
    btnNewCandidate: "+ 新增候选人",
    btnImportCsv: "导入CSV/Excel",
    btnExportCsv: "导出CSV",
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
    btnPresetSimple: "精简",
    btnPresetAll: "完整",
    btnPresetReset: "重置",
    tipHideCol: "隐藏此列",
    lblColsActive: "列已激活",
    colLocked: "(必选)",
    msgPresetSimpleApplied: "已开启精简模式（展示5个核心列）。",
    msgPresetAllApplied: "已开启完整模式（展示全部12列）。",
    msgColHidden: '已隐藏列 "{col}"。',
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
    modalImportTitle: "批量导入候选人 (CSV / Excel)",
    btnClose: "关闭",
    btnSave: "保存",
    btnCancel: "取消",
    btnSubmitRec: "提交推荐",
    btnUploadCsv: "上传并导入",
    btnDownloadTemplate: "下载CSV模板",

    // Tabs inside Candidate Profile
    tabOverview: "基本信息与联系方式",
    tabWorkEdu: "工作与教育履历",
    tabCvViewer: "CV简历原件预览",
    tabTimeline: "跟进与操作日志",

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
    fldWhatsApp: "WhatsApp",
    fldDomicile: "常住城市",
    fldSalaryExpectation: "期望薪资",
    fldCurrentSalary: "目前薪资",
    fldAvailability: "到岗时间",
    fldSummary: "个人简介",
    fldTags: "个性化标签",
    fldReason: "推荐理由/说明",
    fldNotes: "顾问评估备注",
    fldConsultant: "经办顾问",
    fldDate: "提交时间",
    fldManagerApproval: "主管已审批同意",

    // Notifications
    lblNotifications: "消息通知",
    btnMarkAllRead: "全部标为已读",
    lblRecruitmentFunnel: "招聘漏斗转化分析",
    lblMasterData: "基础数据设置 (字典)",
    lblClientCompanies: "合作客户公司",
    lblPositions: "标准岗位字典",
    btnAddCompany: "+ 新增客户",
    btnAddPosition: "+ 新增岗位",
    btnInteractiveTester: "交互功能测试器",
    modalDemoTitle: "ATS 核心场景交互测试",
    tabMyTargets: "我的推荐与月度目标",
    tabLeaderboard: "团队业绩榜与对比",
    lblUserManagement: "用户管理与权限设置",
    btnAddUser: "+ 新增用户",
    btnExportAnalytics: "导出分析报表",
    lblDemographics: "人才画像与分布统计",
    navCareerPortal: "人才招聘门户",
    navInterviewCalendar: "面试日历",
    btnScheduleInterview: "安排面试",
    btnGenerateOffer: "生成录用函 (Offer)",
    btnParseCv: "智能解析简历",
    lblCvDropzoneTitle: "上传简历文件（自动填充所有字段）",
    lblCvDropzoneSub: "拖放简历文件 (.PDF, .DOCX, .TXT) 到此处，或点击选择",
    lblCvDropzoneHint: "自动填充姓名、邮箱、电话、出生日期、性别、学历、经验、语言、职位和个人简介",
    btnChooseCvFile: "选择简历文件",
    btnTrySampleCv: "试用示例简历",
    btnToggleManualText: "手动粘贴文本",
    lblOpenPositions: "在招优质岗位",
    btnApplyJob: "立即申请",
    lblUpcomingInterviews: "近期面试日程",
    lblOfferDocument: "正式录用通知书",
    btnViewTable: "表格视图",
    btnViewKanban: "看板视图",
    tabWarrantyTracker: "入职保用期与佣金",
    btnPostJob: "+ 发布招聘岗位",
    btnAcceptOfferEsign: "签署并接受录用 (状态 31)",
    lblBackupRestore: "数据备份与恢复",
    btnContactWa: "联系候选人 (WA/邮件)",
    lblMonthlyInflow: "每月新增候选人趋势 (DA-02)",
    lblBatchSelected: "已选择",
    msgRefreshed: "数据已刷新。",
    msgResetDone: "已恢复为默认候选人数据。",
    msgResumeDownloaded: "已下载简历：",
    msgRecSuccess: "推荐提交成功：",
    msgStatusChanged: "状态已更新：",
    msgCandidateAdded: "成功添加候选人：",
    msgExportSuccess: "已成功导出候选人数据至CSV。",
    msgImportSuccess: "成功批量导入候选人：",
    msgRoleChanged: "已切换当前用户为："
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
    navSettings: "Pengaturan (Master Data)",
    navPrdDocs: "PRD & Spesifikasi",

    // Header & Subnav
    langChinese: "Mandarin",
    langEnglish: "Inggris",
    langIndonesian: "Indonesia",
    btnBack: "Kembali",
    btnRefresh: "Muat Ulang",
    btnHome: "Beranda",
    lblActiveRole: "Pengguna Aktif:",

    // Search Controls
    phCandidateName: "Nama Kandidat",
    phKeyword: "Kata kunci",
    phState: "Status Tahapan",
    btnSearch: "Cari",
    btnSearchAll: "Tampilkan Semua",
    btnAdvSearch: "Pencarian Lanjutan",
    btnHideAdvSearch: "Tutup Filter Lanjutan",
    btnNewCandidate: "+ Kandidat Baru",
    btnImportCsv: "Impor CSV",
    btnExportCsv: "Ekspor CSV",
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
    btnPresetSimple: "Ringkas",
    btnPresetAll: "Lengkap",
    btnPresetReset: "Reset",
    tipHideCol: "Sembunyikan kolom ini",
    lblColsActive: "kolom aktif",
    colLocked: "(Wajib)",
    msgPresetSimpleApplied: "Mode Ringkas aktif (5 kolom inti).",
    msgPresetAllApplied: "Mode Lengkap aktif (seluruh 12 kolom).",
    msgColHidden: 'Kolom "{col}" disembunyikan.',
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
    modalImportTitle: "Impor Kandidat Massal (CSV / Excel)",
    btnClose: "Tutup",
    btnSave: "Simpan",
    btnCancel: "Batal",
    btnSubmitRec: "Kirim Rekomendasi",
    btnUploadCsv: "Unggah & Impor",
    btnDownloadTemplate: "Unduh Template CSV",

    // Tabs inside Candidate Profile
    tabOverview: "Profil & Kontak",
    tabWorkEdu: "Pengalaman & Pendidikan",
    tabCvViewer: "Pratinjau CV Dokumen",
    tabTimeline: "Linimasa Aktivitas",

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
    fldWhatsApp: "WhatsApp",
    fldDomicile: "Domisili",
    fldSalaryExpectation: "Ekspektasi Gaji",
    fldCurrentSalary: "Gaji Saat Ini",
    fldAvailability: "Ketersediaan Mulai Kerja",
    fldSummary: "Ringkasan Pengalaman",
    fldTags: "Tag Bebas",
    fldReason: "Alasan / Justifikasi",
    fldNotes: "Catatan Evaluasi Konsultan",
    fldConsultant: "Konsultan PIC",
    fldDate: "Waktu Pengajuan",
    fldManagerApproval: "Persetujuan Manajer Telah Diberikan",

    // Notifications
    lblNotifications: "Pemberitahuan",
    btnMarkAllRead: "Tandai semua dibaca",
    lblRecruitmentFunnel: "Corong Konversi Rekrutmen",
    lblMasterData: "Manajemen Data Master",
    lblClientCompanies: "Perusahaan Klien",
    lblPositions: "Daftar Posisi Pekerjaan",
    btnAddCompany: "+ Tambah Klien",
    btnAddPosition: "+ Tambah Posisi",
    btnInteractiveTester: "Penguji Fitur Interaktif",
    modalDemoTitle: "Panduan & Pengujian Interaktif Fitur ATS",
    tabMyTargets: "Rekomendasi & Target Saya",
    tabLeaderboard: "Papan Peringkat & Kinerja Tim",
    lblUserManagement: "Manajemen Pengguna & Hak Akses",
    btnAddUser: "+ Tambah Pengguna",
    btnExportAnalytics: "Ekspor Analisis CSV",
    lblDemographics: "Demografi & Distribusi Kandidat",
    navCareerPortal: "Portal Lowongan Kerja",
    navInterviewCalendar: "Kalender Wawancara",
    btnScheduleInterview: "Jadwalkan Wawancara",
    btnGenerateOffer: "Buat Surat Penawaran",
    btnParseCv: "Ekstrak Otomatis dari CV",
    lblCvDropzoneTitle: "Unggah Dokumen CV (Auto-Fill Semua Kolom)",
    lblCvDropzoneSub: "Seret & lepas file CV (.PDF, .DOCX, .TXT) ke sini, atau klik untuk memilih",
    lblCvDropzoneHint: "Otomatis mengisi Nama, Email, No. HP, Tgl Lahir, Gender, Pendidikan, Pengalaman, Bahasa, Posisi & Ringkasan",
    btnChooseCvFile: "Pilih File CV",
    btnTrySampleCv: "Coba Contoh CV",
    btnToggleManualText: "Tempel Teks Manual",
    lblOpenPositions: "Peluang Karier Terbuka",
    btnApplyJob: "Lamar Posisi Ini",
    lblUpcomingInterviews: "Jadwal Wawancara Mendatang",
    lblOfferDocument: "Surat Penawaran Kerja Resmi",
    btnViewTable: "Tampilan Tabel",
    btnViewKanban: "Papan Kanban",
    tabWarrantyTracker: "Garansi & Komisi Penempatan",
    btnPostJob: "+ Buat Lowongan Baru",
    btnAcceptOfferEsign: "Tanda Tangani & Terima Offer (Kode 31)",
    lblBackupRestore: "Backup & Restore Database",
    btnContactWa: "Hubungi (WA/Email)",
    lblMonthlyInflow: "Tren Kandidat Baru Bulanan (DA-02)",
    lblBatchSelected: "dipilih",
    msgRefreshed: "Data berhasil dimuat ulang.",
    msgResetDone: "Data awal berhasil dipulihkan.",
    msgResumeDownloaded: "Dokumen resume diunduh untuk",
    msgRecSuccess: "Rekomendasi berhasil dikirim untuk",
    msgStatusChanged: "Status diperbarui untuk",
    msgCandidateAdded: "Kandidat baru ditambahkan:",
    msgExportSuccess: "Data kandidat berhasil diekspor ke CSV.",
    msgImportSuccess: "Kandidat berhasil diimpor:",
    msgRoleChanged: "Pengguna aktif dialihkan ke:"
  }
};

const PRESET_DEMO_CANDIDATES = [
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
    whatsapp: "+62 812-3456-7801",
    domicile: "Jakarta Selatan",
    salaryExpectation: "IDR 35.000.000",
    currentSalary: "IDR 28.000.000",
    availability: "1 Month Notice",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Cloud Native", "Pre-Sales Solution", "Kubernetes", "Mandarin HSK 6", "Enterprise B2B"],
    tags: ["Mandarin fasih", "Enterprise Cloud", "Siap presentasi C-Level"],
    summary: "Senior Pre-Sales specialist with 9 years in enterprise cloud platforms. Fluent in Mandarin, English, and Indonesian.",
    isUnviewed: true,
    workHistory: [
      { role: "Senior Solutions Engineer", company: "PT Cloud Aksara Nusantara", period: "2021 - 2026", desc: "Led technical demonstrations and architecture designs for tier-1 banking clients." },
      { role: "Pre-Sales Specialist", company: "Cyberindo Solusi", period: "2017 - 2021", desc: "Handled infrastructure sizing and RFP responses." }
    ],
    educationHistory: [
      { degree: "Bachelor of Computer Science", institution: "Institut Teknologi Bandung", year: "2017" }
    ],
    recommendations: [
      {
        id: "REC-101",
        company: "alauda",
        position: "Indonesia Pre sales",
        statusCode: 21,
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
        notes: "CV passed screening, candidate prioritized Alauda role.",
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
    whatsapp: "+62 811-9870-2210",
    domicile: "Jakarta Pusat",
    salaryExpectation: "IDR 30.000.000",
    currentSalary: "IDR 24.000.000",
    availability: "Immediately",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Business Development", "Sugo App", "Live Streaming", "Partnerships"],
    tags: ["Live Streaming Agency", "High Network", "Commercial Acumen"],
    summary: "Commercial director with 10 years experience expanding international mobile apps and live entertainment platforms in Indonesia.",
    isUnviewed: false,
    workHistory: [
      { role: "Head of BD", company: "StreamWave Media", period: "2019 - 2026", desc: "Managed 50+ talent agencies across Java and Bali." },
      { role: "Senior Partnership Specialist", company: "MobileJoy ID", period: "2016 - 2019", desc: "Acquired key content creators and game publishers." }
    ],
    educationHistory: [
      { degree: "Bachelor of Business Administration", institution: "Universitas Bina Nusantara", year: "2016" }
    ],
    recommendations: [
      {
        id: "REC-102",
        company: "Mico World",
        position: "Business Development - Sugo Indonesia",
        statusCode: 12,
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
    whatsapp: "+62 813-8821-4090",
    domicile: "Bekasi / Cikarang",
    salaryExpectation: "IDR 14.000.000",
    currentSalary: "IDR 11.500.000",
    availability: "2 Weeks Notice",
    ownerId: "USR-03",
    ownerName: "Hendra Kusuma",
    skills: ["Customs Documentation", "CEISA 4.0", "Import Clearance", "Bonded Logistics"],
    tags: ["Kawasan Berikat", "CEISA 4.0 Expert"],
    summary: "Supply chain and customs documentation specialist with 6 years experience in manufacturing import compliance.",
    isUnviewed: false,
    workHistory: [
      { role: "Senior Import Officer", company: "PT Global Logistics Cikarang", period: "2020 - 2026", desc: "Managed bonded zone customs clearance for electronic components." }
    ],
    educationHistory: [
      { degree: "Diploma of Logistics & Customs", institution: "Politeknik Negeri Jakarta", year: "2019" }
    ],
    recommendations: [
      {
        id: "REC-103",
        company: "Midea",
        position: "Customs Documentation Clerk",
        statusCode: 12,
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
    whatsapp: "+62 812-7700-1928",
    domicile: "Tangerang",
    salaryExpectation: "IDR 22.000.000",
    currentSalary: "IDR 18.000.000",
    availability: "Employed (Entry Confirmed)",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["HRBP", "Talent Acquisition", "Labor Law", "Bilingual HR"],
    tags: ["Mandarin HSK 5", "Industrial Relations"],
    summary: "Bilingual HRBP experienced in corporate HR operations and industrial relations for multinational electronics manufacturers.",
    isUnviewed: false,
    workHistory: [
      { role: "HR Specialist", company: "Foxconn Subcontractor", period: "2021 - 2026", desc: "Handled talent acquisition and onboarding for bilingual engineering staff." }
    ],
    educationHistory: [
      { degree: "Bachelor of Psychology", institution: "Universitas Indonesia", year: "2021" }
    ],
    recommendations: [
      {
        id: "REC-104",
        company: "Midea",
        position: "Regional HRBP Specialist",
        statusCode: 40,
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
    whatsapp: "+62 818-4455-9901",
    domicile: "Surabaya",
    salaryExpectation: "IDR 12.000.000",
    currentSalary: "IDR 9.500.000",
    availability: "Available Now",
    ownerId: "USR-03",
    ownerName: "Hendra Kusuma",
    skills: ["B2B Channel Sales", "Dealer Relations", "FMCG"],
    tags: ["Retail Channel", "East Java Area"],
    summary: "Channel sales representative handling tier-1 electronics retailers.",
    isUnviewed: false,
    workHistory: [
      { role: "Junior Account Officer", company: "Mitra Elektronika Surabaya", period: "2023 - 2026", desc: "Covered 40+ retailer stores in East Java." }
    ],
    educationHistory: [
      { degree: "Bachelor of Economics", institution: "Universitas Airlangga", year: "2023" }
    ],
    recommendations: [
      {
        id: "REC-105",
        company: "Mico World",
        position: "Channel Sales Supervisor",
        statusCode: 29,
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
    whatsapp: "+62 812-6611-8823",
    domicile: "Jakarta Barat",
    salaryExpectation: "IDR 15.000.000",
    currentSalary: "IDR 11.000.000",
    availability: "Immediately",
    ownerId: "USR-01",
    ownerName: "Rina Wijaya",
    skills: ["Interpretation", "HSK 6", "Project Coordinator"],
    tags: ["Trilingual", "HSK 6 Certified", "Fresh Potential"],
    summary: "Fresh trilingual graduate with high fluency in Mandarin and English, ready for project coordinator and executive interpreter roles.",
    isUnviewed: true,
    workHistory: [
      { role: "Interpreter Intern", company: "Sinohydro Project Office", period: "2024 - 2025", desc: "Assisted engineering translations for infrastructure EPC contracts." }
    ],
    educationHistory: [
      { degree: "Bachelor of Chinese Studies", institution: "Universitas Indonesia", year: "2024" }
    ],
    recommendations: []
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
    whatsapp: "+62 813-9000-1122",
    domicile: "Bandung / Remote",
    salaryExpectation: "IDR 40.000.000",
    currentSalary: "IDR 33.000.000",
    availability: "Offer Decision Stage",
    ownerId: "USR-02",
    ownerName: "Budi Hartono",
    skills: ["Terraform", "Kubernetes", "AWS", "CI/CD"],
    tags: ["DevOps Lead", "Kubernetes CKA", "Cloud Security"],
    summary: "DevOps Engineer with Master's degree and extensive hands-on experience in production Kubernetes cluster architectures.",
    isUnviewed: false,
    workHistory: [
      { role: "Lead DevOps Specialist", company: "Digital Finansial Mandiri", period: "2020 - 2026", desc: "Designed resilient multi-region cloud infrastructure." }
    ],
    educationHistory: [
      { degree: "Master of Software Engineering", institution: "Institut Teknologi Bandung", year: "2020" }
    ],
    recommendations: [
      {
        id: "REC-106",
        company: "alauda",
        position: "Senior DevOps Architect",
        statusCode: 30,
        consultantId: "USR-02",
        consultantName: "Budi Hartono",
        timestamp: "2026-09-15 13:40:00",
        notes: "Formal offer package sent to candidate on Sep 15.",
        isActive: true
      }
    ]
  }
];

// Clean empty start for production data entry
const INITIAL_CANDIDATES = [];

const PRESET_DEMO_NOTIFICATIONS = [
  { id: "NT-1", title: "New Candidate Assigned", message: "Andi Candera was assigned to your review queue.", candidateId: "CND-1001", read: false, time: "10 mins ago" },
  { id: "NT-2", title: "Offer Stage Update", message: "Kevin Ardianto received formal offer from alauda (Code 30).", candidateId: "CND-1007", read: false, time: "1 hour ago" },
  { id: "NT-3", title: "Candidate Started Work", message: "Clarissa Wijaya successfully onboarded at Midea (Code 40).", candidateId: "CND-1004", read: true, time: "2 days ago" }
];
const INITIAL_NOTIFICATIONS = [];

const INITIAL_COMPANIES = ["alauda", "Midea", "Mico World", "Huawei Cloud", "ByteDance ID", "Shopee Indonesia"];
const INITIAL_POSITIONS = ["Indonesia Pre sales", "Business Development - Sugo Indonesia", "Customs Documentation Clerk", "Regional HRBP Specialist", "Channel Sales Supervisor", "Senior DevOps Architect", "Product Manager", "Fullstack Engineer"];

const INITIAL_OPEN_JOBS = [
  {
    id: "JOB-101",
    title: "Senior Pre sales Specialist",
    company: "alauda",
    department: "Enterprise Cloud Solutions",
    location: "Jakarta (Hybrid)",
    salaryRange: "IDR 20,000,000 - 32,000,000",
    experienceReq: "5+ Years",
    educationReq: "Bachelor Degree",
    tags: ["Kubernetes", "DevOps", "Bilingual", "Enterprise IT"],
    description: "Lead technical discovery, solution architecture presentations, and POC delivery for container cloud enterprise clients across Southeast Asia.",
    postedDate: "2026-11-10",
    status: "Active"
  },
  {
    id: "JOB-102",
    title: "Business Development - Sugo Indonesia",
    company: "Mico World",
    department: "Global Expansion",
    location: "Jakarta (Onsite)",
    salaryRange: "IDR 14,000,000 - 22,000,000",
    experienceReq: "3+ Years",
    educationReq: "Bachelor Degree",
    tags: ["Entertainment App", "Talent Acquisition", "Partnership"],
    description: "Drive creator community acquisition, streamer agency partnerships, and strategic local growth initiatives for the Sugo social platform.",
    postedDate: "2026-11-12",
    status: "Active"
  },
  {
    id: "JOB-103",
    title: "Customs Documentation Specialist",
    company: "Midea",
    department: "Supply Chain & Logistics",
    location: "Cikarang / Jakarta",
    salaryRange: "IDR 9,000,000 - 15,000,000",
    experienceReq: "2+ Years",
    educationReq: "Diploma / Bachelor",
    tags: ["Import/Export", "Customs Clearance", "BC 2.0"],
    description: "Oversee international shipment documentation, CEISA compliance, customs tariff declarations, and bonded warehouse port clearance.",
    postedDate: "2026-11-08",
    status: "Active"
  },
  {
    id: "JOB-104",
    title: "Fullstack Engineer (React & Node.js)",
    company: "Shopee Indonesia",
    department: "Fintech & Payments",
    location: "Jakarta (Remote/Hybrid)",
    salaryRange: "IDR 18,000,000 - 28,000,000",
    experienceReq: "4+ Years",
    educationReq: "Bachelor in Computer Science",
    tags: ["TypeScript", "React", "Node.js", "Microservices"],
    description: "Architect and implement scalable user-facing financial microservices, digital wallet integrations, and high-concurrency payment flows.",
    postedDate: "2026-11-14",
    status: "Active"
  },
  {
    id: "JOB-105",
    title: "Bilingual Operations Associate",
    company: "ByteDance ID",
    department: "Content Moderation & Safety",
    location: "Jakarta (Onsite)",
    salaryRange: "IDR 12,000,000 - 18,000,000",
    experienceReq: "2+ Years",
    educationReq: "Bachelor Degree",
    tags: ["Mandarin HSK 5+", "Content Policy", "Social Media"],
    description: "Coordinate cross-border content moderation policies, quality control metrics, and liaison between Beijing product teams and Jakarta regional managers.",
    postedDate: "2026-11-05",
    status: "Active"
  }
];

const PRESET_DEMO_SCHEDULED_INTERVIEWS = [
  {
    id: "INT-501",
    candidateId: "CND-1001",
    candidateName: "Andi Candera",
    company: "alauda",
    position: "Senior Pre sales Specialist",
    interviewType: "Final Interview (User & Director)",
    dateTime: "2026-11-17 14:00",
    consultantName: "Rina Wijaya",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/qmv-ytpk-zbd",
    status: "Confirmed",
    notes: "Review POC technical architecture deck and cloud modernization portfolio."
  },
  {
    id: "INT-502",
    candidateId: "CND-1002",
    candidateName: "DIMAS RIZALDI",
    company: "Mico World",
    position: "Business Development - Sugo Indonesia",
    interviewType: "Initial HR Screening",
    dateTime: "2026-11-18 10:30",
    consultantName: "Rina Wijaya",
    platform: "Zoom Meeting",
    meetingLink: "https://zoom.us/j/98234110822",
    status: "Confirmed",
    notes: "Evaluate agency partnership network and livestream monetization experience."
  },
  {
    id: "INT-503",
    candidateId: "CND-1007",
    candidateName: "Kevin Ardianto",
    company: "Shopee Indonesia",
    position: "Senior DevOps Architect",
    interviewType: "Technical Deep-Dive",
    dateTime: "2026-11-19 15:00",
    consultantName: "Budi Hartono",
    platform: "Google Meet",
    meetingLink: "https://meet.google.com/abc-devops-shp",
    status: "Confirmed",
    notes: "Live system design challenge: multi-cloud disaster recovery."
  }
];
const INITIAL_SCHEDULED_INTERVIEWS = [];

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

const SIMPLE_COLUMNS = [
  "candidate",
  "status",
  "recommendedPosition",
  "recommendedCompany",
  "operation"
];

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

function computeCandidateBadge(candidate) {
  const recs = candidate.recommendations || [];
  if (recs.length === 0) return 0;
  if (recs.some(r => r.statusCode === 91)) return 91;

  const activeRecs = recs.filter(r => r.isActive !== false);
  if (activeRecs.length > 0) {
    const codes = activeRecs.map(r => r.statusCode);
    return Math.max(...codes);
  }
  return recs[0].statusCode;
}

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

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return INITIAL_USERS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USERS;
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {}
}

function getStoredActiveUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (!raw) return getStoredUsers()[0];
    return JSON.parse(raw);
  } catch (e) {
    return getStoredUsers()[0];
  }
}

function saveActiveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  } catch (e) {}
}

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return INITIAL_NOTIFICATIONS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveNotifications(notifs) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
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
  const activeUser = getStoredActiveUser();
  logs.unshift({
    id: `LOG-${Date.now()}`,
    action,
    entity,
    details,
    user: `${activeUser.name} (${activeUser.role})`,
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19)
  });
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {}
}

function getStoredMasterCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_COMPANIES);
    if (!raw) return INITIAL_COMPANIES;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COMPANIES;
  }
}

function saveMasterCompanies(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_COMPANIES, JSON.stringify(list));
  } catch (e) {}
}

function getStoredMasterPositions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_POSITIONS);
    if (!raw) return INITIAL_POSITIONS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_POSITIONS;
  }
}

function saveMasterPositions(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_POSITIONS, JSON.stringify(list));
  } catch (e) {}
}

function getStoredOpenJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OPEN_JOBS);
    if (!raw) return INITIAL_OPEN_JOBS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_OPEN_JOBS;
  }
}

function saveOpenJobs(jobs) {
  try {
    localStorage.setItem(STORAGE_KEYS.OPEN_JOBS, JSON.stringify(jobs));
  } catch (e) {}
}

function getStoredInterviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    if (!raw) return INITIAL_SCHEDULED_INTERVIEWS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SCHEDULED_INTERVIEWS;
  }
}

function saveInterviews(interviews) {
  try {
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));
  } catch (e) {}
}

const DEFAULT_SYSTEM_SETTINGS = {
  duplicateWindowMonths: 6,
  agencyFeePercent: 18,
  warrantyDays: 90
};

function getStoredSystemSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SYSTEM_SETTINGS };
    return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_SYSTEM_SETTINGS };
  }
}

function saveSystemSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

const INITIAL_LANGUAGES = ["Indonesian", "English", "Chinese (Mandarin)", "Japanese", "Korean"];
const INITIAL_COUNTRIES = ["Indonesia", "Singapore", "Malaysia", "China", "Vietnam"];

function getStoredMasterLanguages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_LANGUAGES);
    if (!raw) return [...INITIAL_LANGUAGES];
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_LANGUAGES];
  }
}

function saveMasterLanguages(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_LANGUAGES, JSON.stringify(list));
  } catch (e) {}
}

function getStoredMasterCountries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_COUNTRIES);
    if (!raw) return [...INITIAL_COUNTRIES];
    return JSON.parse(raw);
  } catch (e) {
    return [...INITIAL_COUNTRIES];
  }
}

function saveMasterCountries(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_COUNTRIES, JSON.stringify(list));
  } catch (e) {}
}
