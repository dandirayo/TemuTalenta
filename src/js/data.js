/**
 * NextKerja Enterprise ATS & Resume Library
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
  { id: "USR-AUL", name: "AUL SuperAdmin", role: "superadmin", roleName: "Super Admin (Full Control)", avatar: "AUL", email: "aul.superadmin@nextkerja.com", active: true }
];

let USERS = [...INITIAL_USERS];

// Master Status Codes sesuai tabel PRD
const STATUS_CODES = {
  0:  { code: 0,  tab: "new",       nameEn: "New",     nameId: "Kandidat Baru",         isFailed: false, isFinal: false },
  10: { code: 10, tab: "pending",   nameEn: "Recommended to Client",   nameId: "Direkomendasikan",       isFailed: false, isFinal: false },
  11: { code: 11, tab: "pending",   nameEn: "Client Reviewing",     nameId: "Ditinjau Klien",        isFailed: false, isFinal: false },
  12: { code: 12, tab: "pass",      nameEn: "Original Resume Pass",   nameId: "CV Lolos",              isFailed: false, isFinal: false },
  19: { code: 19, tab: "failed",    nameEn: "Resume Rejected",   nameId: "CV Ditolak",            isFailed: true,  isFinal: true  },
  20: { code: 20, tab: "interview", nameEn: "Interview Scheduled",     nameId: "Interview Dijadwalkan", isFailed: false, isFinal: false },
  21: { code: 21, tab: "interview", nameEn: "Initial Interview Passed",       nameId: "Lolos Interview Awal",  isFailed: false, isFinal: false },
  22: { code: 22, tab: "interview", nameEn: "Final Interview",         nameId: "Interview Final",       isFailed: false, isFinal: false },
  29: { code: 29, tab: "failed",    nameEn: "Interview Failed",     nameId: "Gagal Interview",       isFailed: true,  isFinal: true  },
  30: { code: 30, tab: "offer",     nameEn: "Offer Proposed",      nameId: "Offer Diajukan",        isFailed: false, isFinal: false },
  31: { code: 31, tab: "offer",     nameEn: "Offer Accepted",    nameId: "Offer Diterima",        isFailed: false, isFinal: false },
  39: { code: 39, tab: "failed",    nameEn: "Offer Cancelled / Declined", nameId: "Offer Batal / Ditolak", isFailed: true,  isFinal: true  },
  40: { code: 40, tab: "entry",     nameEn: "Started Work (Entry)",         nameId: "Mulai Bekerja (Entry)", isFailed: false, isFinal: false },
  41: { code: 41, tab: "entry",     nameEn: "Passed Probation",   nameId: "Lulus Probation",       isFailed: false, isFinal: true  },
  49: { code: 49, tab: "failed",    nameEn: "Failed Probation / Resigned",nameId: "Gagal Probation/Resign",isFailed: true,  isFinal: true  },
  90: { code: 90, tab: "failed",    nameEn: "Candidate Withdrew",     nameId: "Kandidat Mundur",       isFailed: true,  isFinal: true  },
  91: { code: 91, tab: "failed",    nameEn: "Blacklist",         nameId: "Blacklist",             isFailed: true,  isFinal: true  }
};

const I18N = {
  en: {
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
    langEnglish: "English",
    langIndonesian: "Indonesian",
    btnBack: "Back",
    btnRefresh: "Refresh",
    btnHome: "Home",
    lblActiveRole: "Active User:",
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
    stageAll: "All",
    stageNew: "New",
    stagePending: "Pending",
    stagePass: "Original resume pass",
    stageInterview: "Interview",
    stageOffer: "Offer",
    stageFailed: "Failed",
    stageEntry: "Entry",
    lblDisplayCols: "Columns:",
    btnPresetSimple: "Compact",
    btnPresetAll: "Full",
    btnPresetReset: "Reset",
    tipHideCol: "Hide this column",
    lblColsActive: "columns active",
    colLocked: "(Mandatory)",
    msgPresetSimpleApplied: "Compact View activated (5 core columns).",
    msgPresetAllApplied: "Full View activated (all 12 columns).",
    msgColHidden: "Column \"{col}\" hidden.",
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
    actDownloadResume: "Download Resume",
    actRecRepeat: "Recommended Repeat",
    actRecList: "Recommended List",
    lblShowing: "Showing",
    lblOf: "of",
    lblRecords: "candidates",
    lblRowsPerPage: "Rows per page:",
    emptyTable: "No candidates found matching the search criteria.",
    modalProfileTitle: "Candidate Profile & Recommendations",
    modalRecRepeatTitle: "Recommended Repeat (Client Submission)",
    modalRecListTitle: "Candidate Recommendation History",
    modalAddTitle: "Add New Candidate",
    modalImportTitle: "Import Candidates from CSV / Excel",
    btnClose: "Close",
    btnMaximize: "Full Screen (Maximize)",
    btnRestore: "Restore Size",
    btnSave: "Save",
    btnCancel: "Cancel",
    btnSubmitRec: "Submit Recommendation",
    btnUploadCsv: "Upload & Import",
    btnDownloadTemplate: "Download CSV Template",
    btnUploadNewCvVersion: "Upload New Version",
    btnDownloadThisVersion: "Download This Version",
    btnDownloadOriginalFile: "Download Original File",
    btnPreviewCvFile: "Preview File",
    lblCvVersion: "CV Version",
    lblOriginalFileAttached: "Original File Attached",
    lblNoOriginalFile: "This version is using standard text resume format. Click '+ Upload New Version' to attach an original CV file (.PDF, .DOCX, .DOC, .TXT).",
    tabOverview: "Overview & Contacts",
    tabWorkEdu: "Experience & Education",
    tabCvViewer: "CV Document Viewer",
    tabTimeline: "Activity Timeline",
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
    msgRoleChanged: "Switched active user to:",
    greetingWelcome: "Welcome back",
    cvDropzoneHint: "Drop CV file (.PDF, .DOCX, .TXT) here, or click to browse",
    cvDropzoneSub: "Automatically extracts Name, Email, Phone, Birth Date, Gender, Education, Experience, Languages, Position & Summary",
    cvAutoExtracted: "Auto-extracted from CV",
    cvViewRawText: "Click to view / edit raw CV text",
    cvSuccessExtract: "Successfully extracted {count} candidate fields from CV!",
    btnTryDemoCv: "Try Demo CV",
    btnPasteManual: "Paste Text Manually",
    btnParseText: "Parse & Auto-Fill Text",
    phPasteCvText: "Paste candidate resume / CV text here...",
    emptyDatabaseTitle: "No candidate data in database",
    emptyDatabaseDesc: "Your candidate database is currently empty. Start adding new candidates manually or import from Excel / CSV.",
    btnLoadDemo: "Load Demo Data",
    msgDemoLoaded: "7 sample candidates successfully loaded into the database!",
    emptyRecsDesc: "No candidate recommendation history found for client companies.",
    kanbanNew: "New (0)",
    kanbanPending: "Pending Client (10-11)",
    kanbanPass: "CV Pass (12)",
    kanbanInterview: "Interview (20-22)",
    kanbanOffer: "Offer (30-31)",
    kanbanEntry: "Entry (40-41)",
    kanbanFailed: "Failed / Closed",
    btnBatchRecommend: "Batch Recommend to Client",
    btnBatchTag: "+ Batch Add Tag",
    btnBatchArchive: "Batch Archive",
    btnBatchClear: "Clear Selection",
    advMaxService: "Max Year of Service",
    advDateFrom: "Entry Date From",
    advDateTo: "Entry Date To",
    advArchiveMode: "Record State",
    optActiveOnly: "Active Only",
    optArchivedOnly: "Archived Only",
    optAllRecords: "All Records",
    modalEditJobTitle: "Edit Job Order",
    lblJobTitle: "Job Title *",
    lblClientCompany: "Client Company *",
    lblDepartment: "Department",
    lblLocation: "Location *",
    lblEmploymentType: "Employment Type",
    lblSalaryRange: "Salary Budget Range",
    lblMinExp: "Min Experience",
    lblKeySkills: "Key Skills (comma separated)",
    lblJobDesc: "Role Scope & Requirements *",
    btnDeleteJob: "Delete Job Order",
    btnSaveJobChanges: "Save Changes",
    btnPublishJob: "Publish to Career Portal",
    confirmAction: "Confirm Action",
    confirmProceedMsg: "Are you sure you want to proceed?",
    confirmDeleteJobTitle: "Delete Job Order?",
    confirmDeleteJobMsg: "Delete job order \"{job}\" at {company}? This action cannot be undone.",
    confirmDeleteCandidateTitle: "Permanently Delete Candidate?",
    confirmDeleteCandidateMsg: "Permanently delete candidate {name} ({id}) from the database? This cannot be undone.",
    confirmDeleteUserTitle: "Delete User Account?",
    confirmDeleteUserMsg: "Are you sure you want to delete user account {name} ({email})?",
    confirmResetPasswordTitle: "Reset User Password?",
    confirmResetPasswordMsg: "Reset password for {name} ({email})? A new temporary password will be generated.",
    confirmResetDbTitle: "Reset Database to Initial State?",
    confirmResetDbMsg: "All candidate data, settings, and history will be restored to clean demo data. Continue?",
    confirmDeleteMasterTitle: "Delete Master Entry?",
    confirmDeleteMasterMsg: "Are you sure you want to delete {label} \"{name}\"?",
    confirmDuplicateTitle: "Duplicate Candidate Warning (RL-21)",
    confirmDuplicateMsg: "Candidate \"{name}\" with birth date {birthDate} and contact {contact} already exists ({id}). Save anyway?",
    confirmBatchArchiveTitle: "Archive Selected Candidates?",
    confirmBatchArchiveMsg: "Archive {count} selected candidates? Note: Candidates with active placements cannot be archived.",
    alertNotification: "Notification",
    alertAccessDenied: "Access Denied",
    alertSuperAdminOnly: "This action is restricted to Super Admin accounts.",
    alertRuleRejected: "Recommendation Blocked (Business Rule)",
    alertSuperAdminDeleteOnly: "Permanent candidate deletion is restricted to Super Admin role.",
    alertCvNoTextTitle: "CV Text Unreadable",
    alertCvNoTextMsg: "File \"{filename}\" opened successfully but no readable text was detected (likely a scanned image PDF). Please copy-paste CV text manually.",
    alertCvReadFailedTitle: "Failed to Read CV File",
    alertCvReadFailedMsg: "Unable to extract text from \"{filename}\". Please ensure the file is a valid .PDF, .DOCX, or .TXT file.",
    emptyClientList: "No candidate recommendation history found for client companies.",
    mobileNavResume: "Resume Lib",
    mobileNavJobs: "Jobs",
    mobileNavCalendar: "Calendar",
    mobileNavBusiness: "Business",
    alertManagerExport: "Only Managers and Super Admins are permitted to export data.",
    alertEmptyExport: "No candidate records found in current filter to export.",
    alertSelectCsv: "Please select a CSV file or paste CSV text first.",
    alertEmptyCsv: "CSV data is empty or contains only header row.",
    alertImportSuccess: "Import complete: {count} records imported successfully.",
    alertFillRequired: "Please complete required fields (Full Name and Email) before saving.",
    alertFillJobRequired: "Please fill in Job Title, Client Company, and Location.",
    alertEmptyCv: "Please upload a CV file (.PDF / .DOCX / .TXT) or paste CV text first.",
    alertReasonRequired: "A valid recommendation reason is required to proceed with this candidate.",
    alertManagerApprovalRequired: "Manager approval checkbox is required for this candidate stage.",
    btnConfirm: "Confirm",
    btnDelete: "Delete",
    btnUnderstood: "Got it",
    btnKeepSaving: "Save Anyway",
    btnAddLanguage: "+ Add Language",
    btnAddCountry: "+ Add Country",
    btnSavePolicy: "Save Policy",
    btnDownloadBackup: "Download JSON Backup",
    btnRestoreBackup: "Restore JSON Backup",
    btnChangePassword: "Change Password",
    btnDemoScenarios: "⚡ Interactive Feature Tester (18 Scenarios)",
    btnDeletePermanent: "Permanently Delete",
    settingsStatusCodeTitle: "Master Status Code Dictionary (Bilingual Registry)",
    msgCvProcessed: "CV \"{fileName}\" processed! {count} form fields auto-filled.",
    msgCvSampleProcessed: "Sample CV processed! {count} form fields auto-filled.",
    msgCvTextProcessed: "CV text processed! {count} form fields auto-filled.",
    msgCvCleared: "CV attachment cleared.",
    msgSidebarReset: "Side navigation width reset to default (215px).",
    dialogResetPasswordTitle: "Reset User Password?",
    dialogResetPasswordMsg: "Reset password for {name} ({email})? A new secure temporary password link will be generated.",
    dialogDeleteUserTitle: "Delete User Account?",
    dialogDeleteUserMsg: "Are you sure you want to permanently delete user account \"{name}\"? This action cannot be undone.",
    dialogImportResultTitle: "CSV Import Results",
    dialogImportResultSuccess: "Import completed successfully: {count} candidates imported.",
    dialogImportResultError: "Import completed: {count} succeeded. Errors found on {errorCount} rows:\n{errors}",
    msgCandidateRejected: "Marked {name} as Resume Rejected (Code 19)",
    msgInterviewApproved: "Approved interview for {name} (Code 12)",
    msgInterviewCompleted: "Round marked as Completed! Candidate advanced to Code 21 (Interview Passed).",
    msgOfferProposed: "Offer letter issued! {name} advanced to Code 30 (Offer Proposed).",
    msgOfferAccepted: "E-Signature captured! {name} advanced to Code 31 (Offer Accepted).",
    msgPlacementPaid: "Placement invoice marked Paid for {name}.",
    msgUserRemoved: "User {name} removed.",
    msgPasswordResetSent: "Temporary password reset link sent to {email}",
    msgCandidateDeleted: "Permanently deleted {name}.",
    msgPolicySaved: "Saved policy: {months}-month duplicate window & {fee}% agency fee.",
    msgCvVersionAdded: "Added CV version: {version}",
    msgBatchArchived: "Archived {count} candidate(s).",
    msgJobNotFound: "Job vacancy not found.",
    msgFillRoleAndCompany: "Please fill Role and Company name.",
    msgFillDegreeAndInstitution: "Please fill Degree and Institution name."
  },
  id: {
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
    langEnglish: "Inggris",
    langIndonesian: "Indonesia",
    btnBack: "Kembali",
    btnRefresh: "Muat Ulang",
    btnHome: "Beranda",
    lblActiveRole: "Pengguna Aktif:",
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
    stageAll: "Semua",
    stageNew: "Baru",
    stagePending: "Menunggu",
    stagePass: "Lolos Seleksi CV",
    stageInterview: "Wawancara",
    stageOffer: "Penawaran (Offer)",
    stageFailed: "Tidak Lolos",
    stageEntry: "Diterima / Masuk",
    lblDisplayCols: "Kolom Tampil:",
    btnPresetSimple: "Ringkas",
    btnPresetAll: "Lengkap",
    btnPresetReset: "Reset",
    tipHideCol: "Sembunyikan kolom ini",
    lblColsActive: "kolom aktif",
    colLocked: "(Wajib)",
    msgPresetSimpleApplied: "Mode Ringkas aktif (5 kolom inti).",
    msgPresetAllApplied: "Mode Lengkap aktif (seluruh 12 kolom).",
    msgColHidden: "Kolom \"{col}\" disembunyikan.",
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
    actDownloadResume: "Unduh Resume",
    actRecRepeat: "Rekomendasi Ulang",
    actRecList: "Daftar Rekomendasi",
    lblShowing: "Menampilkan",
    lblOf: "dari",
    lblRecords: "kandidat",
    lblRowsPerPage: "Baris per halaman:",
    emptyTable: "Tidak ada kandidat yang memenuhi kriteria pencarian.",
    modalProfileTitle: "Profil Kandidat & Riwayat Rekomendasi",
    modalRecRepeatTitle: "Rekomendasi Ulang (Recommended Repeat)",
    modalRecListTitle: "Riwayat Rekomendasi Kandidat",
    modalAddTitle: "Tambah Kandidat Baru",
    modalImportTitle: "Impor Kandidat Massal (CSV / Excel)",
    btnClose: "Tutup",
    btnMaximize: "Layar Penuh (Maximize)",
    btnRestore: "Kecilkan Ukuran",
    btnSave: "Simpan",
    btnCancel: "Batal",
    btnSubmitRec: "Kirim Rekomendasi",
    btnUploadCsv: "Unggah & Impor",
    btnDownloadTemplate: "Unduh Template CSV",
    btnUploadNewCvVersion: "Unggah Versi Baru",
    btnDownloadThisVersion: "Unduh Versi Ini",
    btnDownloadOriginalFile: "Unduh File Asli",
    btnPreviewCvFile: "Pratinjau File",
    lblCvVersion: "Versi CV",
    lblOriginalFileAttached: "File Dokumen Asli Terlampir",
    lblNoOriginalFile: "Versi ini menggunakan format resume teks standar. Klik '+ Unggah Versi Baru' jika ingin melampirkan file CV asli (.PDF, .DOCX, .DOC, .TXT).",
    tabOverview: "Profil & Kontak",
    tabWorkEdu: "Pengalaman & Pendidikan",
    tabCvViewer: "Pratinjau CV Dokumen",
    tabTimeline: "Linimasa Aktivitas",
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
    lblBatchSelected: "terpilih",
    msgRefreshed: "Data berhasil dimuat ulang.",
    msgResetDone: "Data awal berhasil dipulihkan.",
    msgResumeDownloaded: "Dokumen resume diunduh untuk",
    msgRecSuccess: "Rekomendasi berhasil dikirim untuk",
    msgStatusChanged: "Status diperbarui untuk",
    msgCandidateAdded: "Kandidat baru ditambahkan:",
    msgExportSuccess: "Data kandidat berhasil diekspor ke CSV.",
    msgImportSuccess: "Kandidat berhasil diimpor:",
    msgRoleChanged: "Pengguna aktif dialihkan ke:",
    greetingWelcome: "Selamat datang kembali",
    cvDropzoneHint: "Seret & lepas file CV (.PDF, .DOCX, .TXT) ke sini, atau klik untuk memilih",
    cvDropzoneSub: "Otomatis mengisi Nama, Email, No. HP, Tgl Lahir, Gender, Pendidikan, Pengalaman, Bahasa, Posisi & Ringkasan",
    cvAutoExtracted: "Terekstrak otomatis dari CV",
    cvViewRawText: "Klik untuk melihat / mengedit teks mentah CV",
    cvSuccessExtract: "Berhasil mengekstrak {count} kolom kandidat dari CV!",
    btnTryDemoCv: "Coba Contoh CV",
    btnPasteManual: "Tempel Teks Manual",
    btnParseText: "Parse & Auto-Fill Teks",
    phPasteCvText: "Tempel teks resume / CV kandidat di sini...",
    emptyDatabaseTitle: "Belum ada data kandidat di database",
    emptyDatabaseDesc: "Database kandidat Anda masih kosong. Silakan mulai input kandidat baru secara manual atau impor berkas data dari Excel / CSV.",
    btnLoadDemo: "Muat Data Contoh",
    msgDemoLoaded: "7 data kandidat contoh berhasil dimuat ke database!",
    emptyRecsDesc: "Belum ada riwayat kandidat yang direkomendasikan ke perusahaan klien.",
    kanbanNew: "Baru (0)",
    kanbanPending: "Menunggu Klien (10-11)",
    kanbanPass: "Lolos Seleksi CV (12)",
    kanbanInterview: "Wawancara (20-22)",
    kanbanOffer: "Penawaran / Offer (30-31)",
    kanbanEntry: "Diterima / Masuk (40-41)",
    kanbanFailed: "Tidak Lolos / Arsip",
    btnBatchRecommend: "Rekomendasi Massal ke Klien",
    btnBatchTag: "+ Tambah Tag Massal",
    btnBatchArchive: "Arsip Massal",
    btnBatchClear: "Batal Pilih",
    advMaxService: "Maks. Masa Kerja (Tahun)",
    advDateFrom: "Tanggal Masuk Dari",
    advDateTo: "Tanggal Masuk Sampai",
    advArchiveMode: "Status Arsip Data",
    optActiveOnly: "Hanya Aktif",
    optArchivedOnly: "Hanya Terarsip",
    optAllRecords: "Semua Data",
    modalEditJobTitle: "Edit Lowongan Pekerjaan",
    lblJobTitle: "Nama Posisi / Job Title *",
    lblClientCompany: "Perusahaan Klien *",
    lblDepartment: "Departemen",
    lblLocation: "Lokasi *",
    lblEmploymentType: "Tipe Pekerjaan",
    lblSalaryRange: "Kisaran Gaji / Budget",
    lblMinExp: "Minimal Pengalaman",
    lblKeySkills: "Keahlian Utama (Pisahkan koma)",
    lblJobDesc: "Deskripsi & Kualifikasi Lowongan *",
    btnDeleteJob: "Hapus Lowongan",
    btnSaveJobChanges: "Simpan Perubahan",
    btnPublishJob: "Publikasikan ke Portal Karir",
    confirmAction: "Konfirmasi Tindakan",
    confirmProceedMsg: "Apakah Anda yakin ingin melanjutkan?",
    confirmDeleteJobTitle: "Hapus Lowongan Kerja?",
    confirmDeleteJobMsg: "Hapus lowongan \"{job}\" di {company}? Tindakan ini tidak dapat dibatalkan.",
    confirmDeleteCandidateTitle: "Hapus Kandidat Permanen?",
    confirmDeleteCandidateMsg: "Hapus kandidat {name} ({id}) secara permanen dari database? Tindakan ini tidak dapat dibatalkan.",
    confirmDeleteUserTitle: "Hapus Akun Pengguna?",
    confirmDeleteUserMsg: "Apakah Anda yakin ingin menghapus akun pengguna {name} ({email})?",
    confirmResetPasswordTitle: "Reset Password Pengguna?",
    confirmResetPasswordMsg: "Reset password untuk {name} ({email})? Password sementara baru akan diterbitkan.",
    confirmResetDbTitle: "Reset Database ke Kondisi Awal?",
    confirmResetDbMsg: "Seluruh data kandidat, konfigurasi, dan riwayat akan dikembalikan ke data awal demo. Lanjutkan?",
    confirmDeleteMasterTitle: "Hapus Entri Data Master?",
    confirmDeleteMasterMsg: "Apakah Anda yakin ingin menghapus {label} \"{name}\"?",
    confirmDuplicateTitle: "Peringatan Duplikasi (RL-21)",
    confirmDuplicateMsg: "Kandidat \"{name}\" dengan tanggal lahir {birthDate} dan kontak {contact} sudah terdaftar ({id}). Tetap simpan?",
    confirmBatchArchiveTitle: "Arsipkan Kandidat Terpilih?",
    confirmBatchArchiveMsg: "Arsipkan {count} kandidat yang dipilih? Catatan: Kandidat berstatus penempatan aktif tidak dapat diarsip.",
    alertNotification: "Pemberitahuan",
    alertAccessDenied: "Akses Ditolak",
    alertSuperAdminOnly: "Tindakan ini hanya diizinkan untuk akun Super Admin.",
    alertRuleRejected: "Rekomendasi Ditolak (Aturan Bisnis)",
    alertSuperAdminDeleteOnly: "Penghapusan permanen hanya diizinkan untuk akun Super Admin.",
    alertCvNoTextTitle: "Teks CV Tidak Terbaca",
    alertCvNoTextMsg: "File \"{filename}\" berhasil dibuka tetapi tidak ditemukan teks terbaca (kemungkinan PDF hasil scan gambar). Silakan salin-tempel teks CV secara manual.",
    alertCvReadFailedTitle: "Gagal Membaca File CV",
    alertCvReadFailedMsg: "Terjadi kendala saat membaca file \"{filename}\". Pastikan file berformat .PDF, .DOCX, atau .TXT yang valid.",
    emptyClientList: "Belum ada riwayat kandidat yang direkomendasikan ke perusahaan klien.",
    mobileNavResume: "Pustaka Resume",
    mobileNavJobs: "Lowongan",
    mobileNavCalendar: "Kalender",
    mobileNavBusiness: "Bisnis",
    alertManagerExport: "Hanya Manajer dan Super Admin yang dapat mengekspor data.",
    alertEmptyExport: "Tidak ada data kandidat pada filter saat ini untuk diekspor ke CSV.",
    alertSelectCsv: "Silakan pilih file CSV atau tempel teks data CSV terlebih dahulu.",
    alertEmptyCsv: "Data CSV kosong atau hanya berisi baris header.",
    alertImportSuccess: "Impor selesai: {count} data berhasil diimpor.",
    alertFillRequired: "Silakan lengkapi data wajib (Nama Lengkap dan Email) sebelum menyimpan.",
    alertFillJobRequired: "Mohon lengkapi judul posisi, perusahaan klien, dan lokasi.",
    alertEmptyCv: "Silakan unggah file CV (.PDF / .DOCX / .TXT) atau tempel teks CV terlebih dahulu.",
    alertReasonRequired: "Alasan rekomendasi wajib diisi untuk melanjutkan proses kandidat ini.",
    alertManagerApprovalRequired: "Centang persetujuan manajer diperlukan untuk tahapan kandidat ini.",
    btnConfirm: "Konfirmasi",
    btnDelete: "Hapus",
    btnUnderstood: "Mengerti",
    btnKeepSaving: "Tetap Simpan",
    btnAddLanguage: "+ Tambah Bahasa",
    btnAddCountry: "+ Tambah Negara",
    btnSavePolicy: "Simpan Kebijakan",
    btnDownloadBackup: "Unduh Cadangan JSON",
    btnRestoreBackup: "Pulihkan Cadangan JSON",
    btnChangePassword: "Ubah Password",
    btnDemoScenarios: "⚡ Uji Fitur Interaktif (18 Skenario)",
    btnDeletePermanent: "Hapus Permanen",
    settingsStatusCodeTitle: "Kamus Kode Status Kandidat (Registri Dwibahasa)",
    msgCvProcessed: "CV \"{fileName}\" diproses! {count} kolom form terisi otomatis.",
    msgCvSampleProcessed: "Contoh CV diproses! {count} kolom form terisi otomatis.",
    msgCvTextProcessed: "Teks CV diproses! {count} kolom form terisi otomatis.",
    msgCvCleared: "Lampiran CV dibersihkan.",
    msgSidebarReset: "Lebar menu samping di-reset ke standar (215px).",
    dialogResetPasswordTitle: "Reset Password Pengguna?",
    dialogResetPasswordMsg: "Reset password untuk {name} ({email})? Tautan password sementara baru yang aman akan diterbitkan.",
    dialogDeleteUserTitle: "Hapus Akun Pengguna?",
    dialogDeleteUserMsg: "Apakah Anda yakin ingin menghapus akun pengguna \"{name}\"? Tindakan ini tidak dapat dibatalkan.",
    dialogImportResultTitle: "Hasil Impor CSV",
    dialogImportResultSuccess: "Impor selesai: {count} kandidat berhasil ditambahkan.",
    dialogImportResultError: "Impor selesai: {count} berhasil. Terdapat error pada {errorCount} baris:\n{errors}",
    msgCandidateRejected: "Menandai {name} sebagai Lolos Seleksi CV Ditolak (Kode 19)",
    msgInterviewApproved: "Menyetujui jadwal wawancara untuk {name} (Kode 12)",
    msgInterviewCompleted: "Sesi wawancara selesai! Kandidat maju ke Kode 21 (Lolos Wawancara).",
    msgOfferProposed: "Surat penawaran kerja diterbitkan! {name} maju ke Kode 30 (Penawaran Kerja).",
    msgOfferAccepted: "Tanda tangan digital tercatat! {name} maju ke Kode 31 (Penawaran Diterima).",
    msgPlacementPaid: "Faktur komisi penempatan ditandai Lunas untuk {name}.",
    msgUserRemoved: "Pengguna {name} telah dihapus.",
    msgPasswordResetSent: "Tautan reset password sementara telah dikirim ke {email}",
    msgCandidateDeleted: "Menghapus permanen {name}.",
    msgPolicySaved: "Kebijakan tersimpan: batas duplikat {months} bulan & komisi agensi {fee}%.",
    msgCvVersionAdded: "Versi CV ditambahkan: {version}",
    msgBatchArchived: "Mengarsipkan {count} kandidat.",
    msgJobNotFound: "Lowongan kerja tidak ditemukan.",
    msgFillRoleAndCompany: "Silakan isi Posisi dan Nama Perusahaan.",
    msgFillDegreeAndInstitution: "Silakan isi Gelar/Jenjang dan Nama Institusi."
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
  } catch (e) {
    try {
      // If localStorage quota is exceeded, prune large inlined data URLs from the localStorage JSON copy.
      // The binary files remain safely stored in IndexedDB under ver.fileKey.
      const sanitized = list.map(c => {
        if (!c.cvVersions || !c.cvVersions.length) return c;
        return {
          ...c,
          cvVersions: c.cvVersions.map(v => {
            if (v.fileDataUrl && v.fileDataUrl.length > 50000) {
              const { fileDataUrl, ...rest } = v;
              return rest;
            }
            return v;
          })
        };
      });
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(sanitized));
    } catch (e2) {
      console.warn("Could not save candidates to localStorage:", e2);
    }
  }
}

function getStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LANG);
    if (stored === "id" || stored === "en") return stored;
    return "id";
  } catch (e) {
    return "id";
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
