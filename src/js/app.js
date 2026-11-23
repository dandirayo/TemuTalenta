/**
 * NextKerja - Enterprise ATS Controller (Comprehensive & Multi-Phase Implementation)
 * Menjalankan seluruh spesifikasi PRD.md:
 * - Fase 1 (P0): URL query param sync, profil kandidat multi-tab (DK-01 s.d DK-06), validasi transisi kode gagal.
 * - Fase 2 (P1): Role switcher (Super Admin, Manajer, Konsultan), Ekspor & Impor massal CSV, Notifikasi interaktif, Consultant Business.
 * - Fase 3 (P2): Visual funnel chart, Master data settings.
 */

let candidates = [];
let currentLang = "en";
let currentStageFilter = "all";
let currentView = "resumeLib";
let visibleColumns = [];
let sortState = { columnId: "entryTime", direction: "descending" };
let currentPage = 1;
let pageSize = 10;
let navigationHistory = ["resumeLib"];
let activeUser = USERS[0];
let notifications = [];
let masterCompanies = [];
let masterPositions = [];
let openJobs = [];
let scheduledInterviews = [];
let systemSettings = {};
let resumeViewMode = "table";
let masterLanguages = [];
let masterCountries = [];
let selectedCandidateIds = new Set();

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/**
 * ====================================================================
 * IN-APP GLASSMORPHISM PROMPT DIALOGS (Custom Confirm & Alert)
 * Replaces native browser alert() and confirm() with centered frosted-glass popups.
 * ====================================================================
 */
function getPromptIconSvg(type) {
  if (type === "danger") {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  } else if (type === "warning") {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else if (type === "success") {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else {
    // info
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }
}

function closeDialogSmooth(dialog) {
  if (!dialog || !dialog.open) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dialog.close();
    return;
  }
  dialog.setAttribute("data-closing", "true");
  setTimeout(() => {
    dialog.removeAttribute("data-closing");
    if (dialog.open) {
      dialog.close();
    }
  }, 180);
}

function showConfirmDialog({
  title = t("confirmAction"),
  message = t("confirmProceedMsg"),
  confirmText = t("btnConfirm"),
  cancelText = t("btnCancel"),
  type = "danger"
} = {}) {
  return new Promise(resolve => {
    const dialog = document.getElementById("customPromptModal");
    if (!dialog) {
      return resolve(false);
    }
    const titleEl = document.getElementById("customPromptTitle");
    const msgEl = document.getElementById("customPromptMessage");
    const iconEl = document.getElementById("customPromptIcon");
    const btnCancel = document.getElementById("btnCustomPromptCancel");
    const btnConfirm = document.getElementById("btnCustomPromptConfirm");

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) {
      iconEl.className = `custom-prompt-icon ${type}`;
      iconEl.innerHTML = getPromptIconSvg(type);
    }

    if (btnCancel) {
      btnCancel.style.display = "inline-flex";
      btnCancel.textContent = cancelText;
    }
    if (btnConfirm) {
      btnConfirm.textContent = confirmText;
      btnConfirm.className = type === "danger" ? "btn-solid btn-danger" : "btn-solid";
    }

    let settled = false;
    const cleanup = () => {
      dialog.removeEventListener("close", onClose);
      if (btnCancel) btnCancel.onclick = null;
      if (btnConfirm) btnConfirm.onclick = null;
    };

    const onClose = () => {
      cleanup();
      if (!settled) {
        settled = true;
        resolve(false);
      }
    };

    if (btnCancel) {
      btnCancel.onclick = () => {
        if (!settled) {
          settled = true;
          cleanup();
          closeDialogSmooth(dialog);
          resolve(false);
        }
      };
    }

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (!settled) {
          settled = true;
          cleanup();
          closeDialogSmooth(dialog);
          resolve(true);
        }
      };
    }

    dialog.addEventListener("close", onClose, { once: true });
    try {
      dialog.showModal();
    } catch (e) {
      dialog.close();
      dialog.showModal();
    }
  });
}

function showAlertDialog({
  title = t("alertNotification"),
  message = "",
  okText = t("btnUnderstood"),
  type = "info"
} = {}) {
  return new Promise(resolve => {
    const dialog = document.getElementById("customPromptModal");
    if (!dialog) {
      return resolve();
    }
    const titleEl = document.getElementById("customPromptTitle");
    const msgEl = document.getElementById("customPromptMessage");
    const iconEl = document.getElementById("customPromptIcon");
    const btnCancel = document.getElementById("btnCustomPromptCancel");
    const btnConfirm = document.getElementById("btnCustomPromptConfirm");

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) {
      iconEl.className = `custom-prompt-icon ${type}`;
      iconEl.innerHTML = getPromptIconSvg(type);
    }

    if (btnCancel) {
      btnCancel.style.display = "none";
    }
    if (btnConfirm) {
      btnConfirm.textContent = okText;
      btnConfirm.className = type === "danger" ? "btn-solid btn-danger" : "btn-solid";
    }

    let settled = false;
    const cleanup = () => {
      dialog.removeEventListener("close", onClose);
      if (btnConfirm) btnConfirm.onclick = null;
    };

    const onClose = () => {
      cleanup();
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    if (btnConfirm) {
      btnConfirm.onclick = () => {
        if (!settled) {
          settled = true;
          cleanup();
          closeDialogSmooth(dialog);
          resolve();
        }
      };
    }

    dialog.addEventListener("close", onClose, { once: true });
    try {
      dialog.showModal();
    } catch (e) {
      dialog.close();
      dialog.showModal();
    }
  });
}

// Global window.alert override so that all browser alert() calls turn into centered blur modals
window.alert = function (message) {
  showAlertDialog({
    title: t("alertNotification"),
    message: String(message || ""),
    type: "info",
    okText: t("btnUnderstood")
  });
};

window.showConfirmDialog = showConfirmDialog;
window.showAlertDialog = showAlertDialog;

document.addEventListener("DOMContentLoaded", () => {
  initThemeState();
  currentLang = getStoredLang();
  candidates = getStoredCandidates();
  visibleColumns = getStoredVisibleColumns();
  activeUser = getStoredActiveUser();
  notifications = getStoredNotifications();
  masterCompanies = getStoredMasterCompanies();
  masterPositions = getStoredMasterPositions();
  masterLanguages = getStoredMasterLanguages();
  masterCountries = getStoredMasterCountries();
  openJobs = getStoredOpenJobs();
  scheduledInterviews = getStoredInterviews();
  systemSettings = getStoredSystemSettings();

  bindGlobalEvents();
  setupDialogLightDismiss();
  restoreFiltersFromUrl();
  applyTranslations();
  applyRolePermissions();
  syncColumnPresetButtons();
  renderAllViews();
});

/**
 * 1. THEME MANAGEMENT
 */
function initThemeState() {
  const meta = document.querySelector('meta[name="color-scheme"]');
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
  } catch (e) {}

  const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = stored === "dark" || stored === "light" ? stored : (sysDark ? "dark" : "light");

  if (meta) meta.content = stored ?? "light dark";
  document.documentElement.setAttribute("data-theme", resolved);
  syncThemeToggleUI(resolved);
}

function toggleThemeScheme() {
  const meta = document.querySelector('meta[name="color-scheme"]');
  const currentRendered = document.documentElement.getAttribute("data-theme") || "light";
  const target = currentRendered === "dark" ? "light" : "dark";
  const sysPref = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  try {
    if (target === sysPref) {
      localStorage.removeItem(STORAGE_KEYS.COLOR_SCHEME);
      if (meta) meta.content = "light dark";
    } else {
      localStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, target);
      if (meta) meta.content = target;
    }
  } catch (e) {}

  document.documentElement.setAttribute("data-theme", target);
  syncThemeToggleUI(target);
}

function syncThemeToggleUI(theme) {
  const btn = document.getElementById("themeSwitchBtn");
  if (btn) btn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
}

/**
 * 2. TRI-LINGUAL I18N
 */
function t(key) {
  const dict = I18N[currentLang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}

function getStatusName(statusCode) {
  const meta = STATUS_CODES[statusCode];
  if (!meta) return `Status ${statusCode}`;
  if (currentLang === "id") return meta.nameId || meta.nameEn;
  return meta.nameEn;
}

function setLanguage(lang) {
  if (lang !== "id" && lang !== "en") lang = "id";
  currentLang = lang;
  saveLang(lang);
  applyTranslations();
  renderAllViews();
  syncTableResponsiveLabels();
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    el.placeholder = t(key);
  });

  const btnId = document.getElementById("btnLangId");
  const btnEn = document.getElementById("btnLangEn");
  if (btnId) btnId.classList.toggle("active", currentLang === "id");
  if (btnEn) btnEn.classList.toggle("active", currentLang === "en");

  const advBox = document.getElementById("advSearchBox");
  const advBtn = document.getElementById("btnToggleAdvSearch");
  if (advBtn && advBox) {
    advBtn.textContent = advBox.classList.contains("open") ? t("btnHideAdvSearch") : t("btnAdvSearch");
  }
}

/**
 * 3. ROLE SWITCHER & PERMISSION ENFORCEMENT
 */
function switchActiveUser(userId) {
  const target = USERS.find(u => u.id === userId);
  if (!target) return;
  activeUser = target;
  saveActiveUser(activeUser);
  applyRolePermissions();
  renderAllViews();
  showToast(`${t("msgRoleChanged")} ${activeUser.name} (${activeUser.roleName})`);
}

function applyRolePermissions() {
  const userSelect = document.getElementById("roleSelect");
  const userAvatar = document.getElementById("userAvatarIndicator");
  const btnExport = document.getElementById("btnExportCsv");
  const settingsMenuItem = document.getElementById("menuItemSettings");
  const clientBanner = document.getElementById("clientPortalBanner");
  const btnOpenAdd = document.getElementById("btnOpenAddModal");
  const btnOpenImport = document.getElementById("btnOpenImportModal");

  if (userSelect) userSelect.value = activeUser.id;
  if (userAvatar) {
    userAvatar.textContent = activeUser.avatar;
    userAvatar.title = `${activeUser.name} - ${activeUser.roleName}`;
  }
  const userSummary = document.getElementById("userProfileSummary");
  if (userSummary) {
    userSummary.innerHTML = `
      <strong style="font-size: 13px;">${escapeHtml(activeUser.name)}</strong>
      <span style="font-size: 11.5px; font-weight: 700; color: var(--text-primary);">${escapeHtml(activeUser.roleName)}</span>
      <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(activeUser.email || "")} • Asia/Jakarta (UTC+7)</span>
    `;
  }

  // RL-23: Export to Excel/CSV only for Manager and Super Admin
  if (btnExport) {
    const canExport = activeUser.role === "manager" || activeUser.role === "superadmin";
    btnExport.style.display = canExport ? "inline-flex" : "none";
  }

  // PG-01: Settings menu only for Super Admin
  if (settingsMenuItem) {
    settingsMenuItem.style.display = activeUser.role === "superadmin" ? "block" : "none";
  }

  // Client Portal Mode (PRD Role: Klien alauda)
  if (activeUser.role === "client") {
    if (clientBanner) {
      clientBanner.style.display = "flex";
      clientBanner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="client-portal-tag">Client Portal</span>
          <span><strong>${escapeHtml(activeUser.clientCompany || "Client")} Portal</strong> — Logged in as ${escapeHtml(activeUser.name)} (${escapeHtml(activeUser.roleName)}). Review submitted CVs and take quick actions.</span>
        </div>
        <button type="button" class="btn-outlined" style="color: white; border-color: rgba(255,255,255,0.4); font-size: 11px; padding: 3px 8px;" onclick="switchActiveUser('USR-AUL')">Exit Client Portal</button>
      `;
    }
    if (btnOpenAdd) btnOpenAdd.style.display = "none";
    if (btnOpenImport) btnOpenImport.style.display = "none";
  } else {
    if (clientBanner) clientBanner.style.display = "none";
    if (btnOpenAdd) btnOpenAdd.style.display = "inline-flex";
    if (btnOpenImport) btnOpenImport.style.display = "inline-flex";
  }
}

/**
 * 4. URL QUERY PARAMETER SYNC (PRD RL-07)
 */
function syncFiltersToUrl() {
  try {
    const params = new URLSearchParams();
    const nameVal = document.getElementById("searchCandidateName")?.value.trim();
    const kwVal = document.getElementById("searchKeyword")?.value.trim();

    if (nameVal) params.set("name", nameVal);
    if (kwVal) params.set("kw", kwVal);
    if (currentStageFilter !== "all") params.set("stage", currentStageFilter);

    const newUrl = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  } catch (e) {}
}

function restoreFiltersFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get("name");
    const kwParam = params.get("kw");
    const stageParam = params.get("stage");

    if (nameParam) {
      const el = document.getElementById("searchCandidateName");
      if (el) el.value = nameParam;
    }
    if (kwParam) {
      const el = document.getElementById("searchKeyword");
      if (el) el.value = kwParam;
    }
    if (stageParam && ["all","new","pending","pass","interview","offer","failed","entry"].includes(stageParam)) {
      currentStageFilter = stageParam;
      const stateSelect = document.getElementById("searchStateSelect");
      if (stateSelect) stateSelect.value = stageParam;
      syncStageTabsUI();
    }
  } catch (e) {}
}

/**
 * 5. GLOBAL EVENTS BINDING
 */
function closeMobileSidebar() {
  document.getElementById("appSidebar")?.classList.remove("mobile-open");
  document.getElementById("sidebarBackdrop")?.classList.remove("open");
}

function scrollTabIntoView(tabEl) {
  if (!tabEl) return;
  try {
    tabEl.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" });
  } catch (e) {
    tabEl.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

function syncTableResponsiveLabels() {
  document.querySelectorAll(".data-table").forEach(table => {
    const headRow = table.tHead?.rows?.[0];
    if (!headRow) return;
    Array.from(headRow.cells).forEach((th, idx) => {
      const btn = th.querySelector(".sort-header-btn");
      let labelText = "";
      if (btn) {
        const span = btn.querySelector("span[data-i18n], span:not(.sort-icons):not(.sort-icon-wrap)");
        labelText = (span ? span.textContent : btn.textContent).trim();
      } else {
        labelText = th.textContent.trim();
      }
      labelText = labelText.replace(/[▲▼]/g, "").trim();
      table.style.setProperty(`--label-${idx + 1}`, JSON.stringify(labelText || `Col ${idx + 1}`));
    });
  });
}


/**
 * 2B. RESIZABLE SIDEBAR (DRAGGABLE TO CENTER WITH MIN/MAX BOUNDS)
 */
function initSidebarResizer() {
  const sidebar = document.getElementById("appSidebar");
  const handle = document.getElementById("sidebarResizeHandle");
  if (!sidebar || !handle) return;

  const minWidth = 175;
  const getMaxWidth = () => Math.min(450, Math.floor(window.innerWidth * 0.45));

  // Restore saved width from localStorage
  try {
    const saved = localStorage.getItem("temutalenta_sidebar_width");
    if (saved) {
      const w = parseInt(saved, 10);
      if (!isNaN(w) && w >= minWidth && w <= getMaxWidth()) {
        sidebar.style.width = `${w}px`;
      }
    }
  } catch (e) {}

  let isDragging = false;
  let startX = 0;
  let startWidth = 215;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startWidth = sidebar.getBoundingClientRect().width;
    sidebar.classList.add("is-resizing");
    handle.classList.add("is-dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    let newWidth = startWidth + deltaX;

    const maxWidth = getMaxWidth();
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    sidebar.style.width = `${newWidth}px`;
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      sidebar.classList.remove("is-resizing");
      handle.classList.remove("is-dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const currentWidth = Math.round(sidebar.getBoundingClientRect().width);
      try {
        localStorage.setItem("temutalenta_sidebar_width", currentWidth);
      } catch (e) {}
    }
  });

  // Double-click to reset to default 215px
  handle.addEventListener("dblclick", () => {
    sidebar.style.width = "215px";
    try {
      localStorage.removeItem("temutalenta_sidebar_width");
    } catch (e) {}
    showToast(t("msgSidebarReset"));
  });
}

function bindGlobalEvents() {
  document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (window.matchMedia("(max-width: 1024px)").matches) {
      const isOpen = sidebar?.classList.toggle("mobile-open");
      backdrop?.classList.toggle("open", Boolean(isOpen));
    } else {
      sidebar?.classList.toggle("collapsed");
    }
  });

  document.getElementById("sidebarCloseBtn")?.addEventListener("click", closeMobileSidebar);
  document.getElementById("sidebarBackdrop")?.addEventListener("click", closeMobileSidebar);

  document.getElementById("mobileBottomMenuBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.add("mobile-open");
    document.getElementById("sidebarBackdrop")?.classList.add("open");
  });

  document.querySelectorAll(".mobile-bottom-nav [data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchWorkspaceView(view);
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMobileSidebar();
    }
  });

  document.querySelectorAll(".menu-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".menu-group")?.classList.toggle("open");
    });
  });

  document.querySelectorAll(".submenu-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchWorkspaceView(view);
    });
  });

  document.getElementById("roleSelect")?.addEventListener("change", (e) => {
    switchActiveUser(e.target.value);
  });

  document.getElementById("btnLangId")?.addEventListener("click", () => setLanguage("id"));
  document.getElementById("btnLangEn")?.addEventListener("click", () => setLanguage("en"));

  document.getElementById("themeSwitchBtn")?.addEventListener("click", toggleThemeScheme);

  // Subnav (<, Refresh, Home)
  document.getElementById("subNavBack")?.addEventListener("click", () => {
    if (navigationHistory.length > 1) {
      navigationHistory.pop();
      const prev = navigationHistory[navigationHistory.length - 1];
      switchWorkspaceView(prev, false);
    }
  });

  document.getElementById("subNavRefresh")?.addEventListener("click", () => {
    renderAllViews();
    showToast(t("msgRefreshed"));
  });

  document.getElementById("subNavHome")?.addEventListener("click", () => {
    switchWorkspaceView("resumeLib");
  });

  // Search & Filter
  document.getElementById("btnSearch")?.addEventListener("click", () => {
    currentPage = 1;
    syncFiltersToUrl();
    renderResumeTable();
  });
  document.getElementById("btnSearchAll")?.addEventListener("click", resetSearchFilters);

  document.getElementById("searchCandidateName")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      currentPage = 1;
      syncFiltersToUrl();
      renderResumeTable();
    }
  });
  document.getElementById("searchKeyword")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      currentPage = 1;
      syncFiltersToUrl();
      renderResumeTable();
    }
  });
  document.getElementById("searchStateSelect")?.addEventListener("change", e => {
    currentStageFilter = e.target.value;
    currentPage = 1;
    syncStageTabsUI();
    syncFiltersToUrl();
    renderResumeTable();
  });

  document.getElementById("btnToggleAdvSearch")?.addEventListener("click", () => {
    const box = document.getElementById("advSearchBox");
    if (box) {
      box.classList.toggle("open");
      applyTranslations();
    }
  });

  ["advNationality", "advGender", "advMinAge", "advMaxAge", "advEducation", "advMinService", "advMaxService", "advPosition", "advDateFrom", "advDateTo", "advLanguage", "advCompany", "advOwner", "advArchiveMode"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      currentPage = 1;
      renderResumeTable();
    });
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        currentPage = 1;
        renderResumeTable();
      });
    }
  });

  document.getElementById("btnResetDatabase")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    candidates = getStoredCandidates();
    currentPage = 1;
    renderAllViews();
    showToast(t("msgResetDone"));
  });


/**
 * OPEN ADD CANDIDATE MODAL HELPER
 */
function openAddCandidateModal() {
  populateCompanyAndPositionSelects("addCompanySelect", "addPositionSelect");
  resetCvUploadUi("add");
  document.getElementById("addCandidateModal")?.showModal();
}
window.openAddCandidateModal = openAddCandidateModal;

function loadDemoCandidates() {
  if (typeof PRESET_DEMO_CANDIDATES !== "undefined" && Array.isArray(PRESET_DEMO_CANDIDATES)) {
    candidates = JSON.parse(JSON.stringify(PRESET_DEMO_CANDIDATES));
    saveCandidates(candidates);
    currentPage = 1;
    renderAllViews();
    showToast(t("msgDemoLoaded"));
  }
}
window.loadDemoCandidates = loadDemoCandidates;

  // Add Candidate
  document.getElementById("btnOpenAddModal")?.addEventListener("click", openAddCandidateModal);

  // Export & Import CSV (RL-22, RL-23)
  document.getElementById("btnExportCsv")?.addEventListener("click", exportFilteredCandidatesToCsv);
  document.getElementById("btnOpenImportModal")?.addEventListener("click", () => {
    document.getElementById("importCsvModal")?.showModal();
  });
  document.getElementById("btnDownloadSampleCsv")?.addEventListener("click", downloadSampleCsvTemplate);
  document.getElementById("formImportCsv")?.addEventListener("submit", handleCsvImportSubmit);

  // Notifications Bell Popover
  const notifBtn = document.getElementById("notifBellBtn");
  const notifDropdown = document.getElementById("notifDropdown");
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove("open");
      }
    });
  }

  // 8 Stage Tabs
  document.querySelectorAll(".stage-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentStageFilter = tab.getAttribute("data-stage") || "all";
      currentPage = 1;
      const stateSelect = document.getElementById("searchStateSelect");
      if (stateSelect) stateSelect.value = currentStageFilter;
      syncStageTabsUI();
      syncFiltersToUrl();
      renderResumeTable();
      scrollTabIntoView(tab);
    });
  });

  // Columns Selector
  const colTrigger = document.getElementById("colSelectorTrigger");
  const colMenu = document.getElementById("colDropdownMenu");
  if (colTrigger && colMenu) {
    colTrigger.addEventListener("click", e => {
      e.stopPropagation();
      colMenu.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!colMenu.contains(e.target) && !colTrigger.contains(e.target)) {
        colMenu.classList.remove("open");
      }
    });
  }

  // Column Preset Buttons (Ringkas & Lengkap)
  document.getElementById("btnPresetSimple")?.addEventListener("click", () => {
    applyColumnPreset("simple");
  });
  document.getElementById("btnPresetAll")?.addEventListener("click", () => {
    applyColumnPreset("full");
  });

  // Pagination
  document.getElementById("pageSizeSelect")?.addEventListener("change", e => {
    pageSize = parseInt(e.target.value, 10) || 10;
    currentPage = 1;
    renderResumeTable();
  });
  document.getElementById("btnPrevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderResumeTable();
    }
  });
  document.getElementById("btnNextPage")?.addEventListener("click", () => {
    const totalFiltered = getFilteredCandidates().length;
    const maxPages = Math.ceil(totalFiltered / pageSize) || 1;
    if (currentPage < maxPages) {
      currentPage++;
      renderResumeTable();
    }
  });

  // Forms & Modals
  document.getElementById("btnOpenDemoGuide")?.addEventListener("click", () => {
    document.getElementById("demoGuideModal")?.showModal();
  });

  // Consultant Business Tab Pills & Filters (CB-01, CB-02, CB-03)
  document.getElementById("tabBtnCbRecs")?.addEventListener("click", e => {
    switchCbTab("recs");
    scrollTabIntoView(e.currentTarget);
  });
  document.getElementById("tabBtnCbLeaderboard")?.addEventListener("click", e => {
    switchCbTab("leaderboard");
    scrollTabIntoView(e.currentTarget);
  });
  document.getElementById("tabBtnCbWarranty")?.addEventListener("click", e => {
    switchCbTab("warranty");
    scrollTabIntoView(e.currentTarget);
  });
  document.getElementById("cbFilterConsultant")?.addEventListener("change", renderConsultantBusinessHub);
  document.getElementById("cbFilterCompany")?.addEventListener("change", renderConsultantBusinessHub);
  document.getElementById("cbFilterStatus")?.addEventListener("change", renderConsultantBusinessHub);

  // Analytics Date Filter & Export (DA-01, DA-05)
  document.getElementById("analyticsDateRange")?.addEventListener("change", renderAdvancedAnalytics);
  document.getElementById("btnExportAnalytics")?.addEventListener("click", exportAnalyticsCsv);

  // Fase 4: Career Portal, Interview Scheduler, Offer Letter & CV Parser
  initCvUploadAndParserHandlers();
  document.getElementById("btnRunCvParser")?.addEventListener("click", handleRunCvParser);
  document.getElementById("careerFilterCompany")?.addEventListener("change", renderCareerPortal);
  document.getElementById("careerSearchQuery")?.addEventListener("input", renderCareerPortal);
  document.getElementById("btnOpenScheduleModal")?.addEventListener("click", () => openScheduleInterviewModal());
  document.getElementById("formScheduleInterview")?.addEventListener("submit", handleScheduleInterviewSubmit);
  document.getElementById("formApplyJob")?.addEventListener("submit", handleApplyJobSubmit);
  document.getElementById("intCandidateSelect")?.addEventListener("change", handleIntCandidateChange);
  document.getElementById("btnSendOfferCandidate")?.addEventListener("click", handleSendOfferClick);

  // Fase 5: Kanban Toggle, E-Sign Code 31, Post Job Order, System Settings & JSON Backup
  document.getElementById("btnViewTable")?.addEventListener("click", () => switchResumeViewMode("table"));
  document.getElementById("btnViewKanban")?.addEventListener("click", () => switchResumeViewMode("kanban"));
  document.getElementById("headerKanbanToggleBtn")?.addEventListener("click", () => {
    if (currentView !== "resumeLib") switchWorkspaceView("resumeLib");
    switchResumeViewMode(resumeViewMode === "table" ? "kanban" : "table");
  });
  document.getElementById("btnAcceptOfferEsign")?.addEventListener("click", handleAcceptOfferEsign);
  document.getElementById("btnOpenPostJobModal")?.addEventListener("click", () => {
    document.getElementById("postJobModal")?.showModal();
  });
  document.getElementById("formPostJob")?.addEventListener("submit", handlePostJobSubmit);
  document.getElementById("formEditJob")?.addEventListener("submit", handleEditJobSubmit);
  document.getElementById("btnDeleteJob")?.addEventListener("click", handleDeleteJob);
  initSidebarResizer();
  document.getElementById("btnSaveSystemSettings")?.addEventListener("click", handleSaveSystemSettings);

  // Fase 6: Master Dictionaries, Batch Actions & Candidate Outreach Hub
  document.getElementById("formAddMasterLanguage")?.addEventListener("submit", handleAddMasterLanguage);
  document.getElementById("formAddMasterCountry")?.addEventListener("submit", handleAddMasterCountry);
  document.getElementById("btnBatchRecommend")?.addEventListener("click", handleBatchRecommend);
  document.getElementById("btnBatchTag")?.addEventListener("click", handleBatchTag);
  document.getElementById("btnBatchArchive")?.addEventListener("click", handleBatchArchive);
  document.getElementById("btnBatchClear")?.addEventListener("click", clearBatchSelection);
  document.getElementById("outreachTemplateSelect")?.addEventListener("change", refreshOutreachMessageDraft);
  document.getElementById("btnCopyOutreach")?.addEventListener("click", copyOutreachDraft);
  document.getElementById("outreachMessageText")?.addEventListener("input", syncOutreachLinks);

  // User Avatar Profile Popover & JSON Backup / Restore
  const avatarBtn = document.getElementById("userAvatarIndicator");
  const profileDrop = document.getElementById("userProfileDropdown");
  if (avatarBtn && profileDrop) {
    avatarBtn.addEventListener("click", e => {
      e.stopPropagation();
      profileDrop.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!profileDrop.contains(e.target) && !avatarBtn.contains(e.target)) {
        profileDrop.classList.remove("open");
      }
    });
  }
  document.getElementById("btnExportBackupJson")?.addEventListener("click", exportFullDatabaseJson);
  document.getElementById("btnImportBackupJson")?.addEventListener("click", () => {
    document.getElementById("restoreJsonFileInput")?.click();
  });
  document.getElementById("restoreJsonFileInput")?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (file) importFullDatabaseJson(file);
    e.target.value = "";
  });
  document.getElementById("btnQuickResetPassword")?.addEventListener("click", () => {
    document.getElementById("userProfileDropdown")?.classList.remove("open");
    resetUserPassword(activeUser.id);
  });

  // Forms
  document.getElementById("formRecRepeat")?.addEventListener("submit", handleRecRepeatSubmit);
  document.getElementById("formAddCandidate")?.addEventListener("submit", handleAddCandidateSubmit);
  document.getElementById("formAddMasterCompany")?.addEventListener("submit", handleAddMasterCompany);
  document.getElementById("formAddMasterPosition")?.addEventListener("submit", handleAddMasterPosition);
  document.getElementById("formAddUser")?.addEventListener("submit", handleAddUser);
}

function switchWorkspaceView(viewId, pushHistory = true) {
  if (viewId === "addCandidateModalTrigger") {
    openAddCandidateModal();
    return;
  }

  currentView = viewId;
  if (pushHistory && navigationHistory[navigationHistory.length - 1] !== viewId) {
    navigationHistory.push(viewId);
  }

  // Update nav active pill immediately for instant tactile response
  document.querySelectorAll(".submenu-item-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
  });
  document.querySelectorAll(".mobile-bottom-nav [data-view]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
  });

  const applyViewChange = () => {
    document.querySelectorAll(".workspace-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `panel-${viewId}`);
    });

    closeMobileSidebar();
    renderAllViews();
  };

  if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const transition = document.startViewTransition(() => applyViewChange());
    transition.finished.catch(() => {});
  } else {
    applyViewChange();
  }
}

function syncStageTabsUI() {
  document.querySelectorAll(".stage-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-stage") === currentStageFilter);
  });
}

function resetSearchFilters() {
  const ids = ["searchCandidateName", "searchKeyword", "advMinAge", "advMaxAge", "advMinService", "advMaxService", "advPosition", "advDateFrom", "advDateTo", "advNationality", "advLanguage", "advCompany"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const stateSelect = document.getElementById("searchStateSelect");
  const advGender = document.getElementById("advGender");
  const advEdu = document.getElementById("advEducation");
  const advOwner = document.getElementById("advOwner");
  const advArchive = document.getElementById("advArchiveMode");

  if (stateSelect) stateSelect.value = "all";
  if (advGender) advGender.value = "all";
  if (advEdu) advEdu.value = "all";
  if (advOwner) advOwner.value = "all";
  if (advArchive) advArchive.value = "active";

  currentStageFilter = "all";
  currentPage = 1;
  syncStageTabsUI();
  syncFiltersToUrl();
  renderResumeTable();
}

/**
 * 6. COLUMN SELECTOR & TABLE RENDERING (Simple & Full Presets, Granular Toggle & Direct Dismiss)
 */
function syncColumnPresetButtons() {
  const btnSimple = document.getElementById("btnPresetSimple");
  const btnAll = document.getElementById("btnPresetAll");
  if (!btnSimple || !btnAll) return;
  const isSimple = visibleColumns.length === SIMPLE_COLUMNS.length &&
    SIMPLE_COLUMNS.every(id => visibleColumns.includes(id));
  const isAll = visibleColumns.length === ALL_COLUMNS.length;
  btnSimple.classList.toggle("active", isSimple);
  btnAll.classList.toggle("active", isAll);
}

function applyColumnPreset(presetName) {
  if (presetName === "simple") {
    visibleColumns = [...SIMPLE_COLUMNS];
    showToast(t("msgPresetSimpleApplied"));
  } else if (presetName === "full") {
    visibleColumns = ALL_COLUMNS.map(c => c.id);
    showToast(t("msgPresetAllApplied"));
  }
  saveVisibleColumns(visibleColumns);
  syncColumnPresetButtons();
  renderColumnSelector();
  renderResumeTable();
}

function hideColumn(colId) {
  if (colId === "candidate") return; // Locked / mandatory column
  const colDef = ALL_COLUMNS.find(c => c.id === colId);
  visibleColumns = visibleColumns.filter(id => id !== colId);
  saveVisibleColumns(visibleColumns);
  syncColumnPresetButtons();
  renderColumnSelector();
  renderResumeTable();
  if (colDef) {
    showToast(t("msgColHidden").replace("{col}", t(colDef.key)));
  }
}

function renderColumnSelector() {
  const menu = document.getElementById("colDropdownMenu");
  const countTag = document.getElementById("colExtraCountTag");
  if (!menu) return;

  const extraCount = Math.max(0, visibleColumns.length - 1);
  if (countTag) countTag.textContent = `+ ${extraCount}`;

  syncColumnPresetButtons();

  menu.innerHTML = `
    <div class="col-dropdown-header">
      <div class="col-dropdown-title">${t("lblDisplayCols")}</div>
      <div class="col-dropdown-actions">
        <button type="button" class="col-dropdown-action-btn" id="colMenuBtnSimple">⚡ ${t("btnPresetSimple")}</button>
        <button type="button" class="col-dropdown-action-btn" id="colMenuBtnAll">📋 ${t("btnPresetAll")}</button>
      </div>
    </div>
    <div class="col-dropdown-list">
      ${ALL_COLUMNS.map(col => {
        const checked = visibleColumns.includes(col.id) ? "checked" : "";
        const disabled = col.locked ? "disabled" : "";
        const lockedClass = col.locked ? "locked" : "";
        return `
          <label class="col-check-item ${lockedClass}">
            <div class="col-check-left">
              <input type="checkbox" value="${col.id}" ${checked} ${disabled}>
              <span>${t(col.key)}</span>
            </div>
            ${col.locked ? `<span class="col-check-badge">${t("colLocked")}</span>` : ""}
          </label>
        `;
      }).join("")}
    </div>
    <div class="col-dropdown-footer">
      <span><strong>${visibleColumns.length}</strong> / ${ALL_COLUMNS.length} ${t("lblColsActive")}</span>
      <button type="button" class="col-dropdown-action-btn" id="colMenuBtnClose">✕</button>
    </div>
  `;

  menu.querySelector("#colMenuBtnSimple")?.addEventListener("click", e => {
    e.stopPropagation();
    applyColumnPreset("simple");
  });
  menu.querySelector("#colMenuBtnAll")?.addEventListener("click", e => {
    e.stopPropagation();
    applyColumnPreset("full");
  });
  menu.querySelector("#colMenuBtnClose")?.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.remove("open");
  });

  menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", () => {
      const colId = cb.value;
      if (cb.checked) {
        if (!visibleColumns.includes(colId)) visibleColumns.push(colId);
      } else {
        visibleColumns = visibleColumns.filter(id => id !== colId);
      }
      saveVisibleColumns(visibleColumns);
      syncColumnPresetButtons();
      renderColumnSelector();
      renderResumeTable();
    });
  });
}

function getFilteredCandidates() {
  const nameQ = (document.getElementById("searchCandidateName")?.value || "").toLowerCase().trim();
  const kwQ = (document.getElementById("searchKeyword")?.value || "").toLowerCase().trim();
  const natQ = (document.getElementById("advNationality")?.value || "").toLowerCase().trim();
  const genderQ = document.getElementById("advGender")?.value || "all";
  const minAge = parseInt(document.getElementById("advMinAge")?.value || "0", 10);
  const maxAge = parseInt(document.getElementById("advMaxAge")?.value || "999", 10);
  const eduQ = document.getElementById("advEducation")?.value || "all";
  const minService = parseFloat(document.getElementById("advMinService")?.value || "0");
  const maxServiceRaw = document.getElementById("advMaxService")?.value;
  const maxService = maxServiceRaw !== undefined && maxServiceRaw !== "" ? parseFloat(maxServiceRaw) : 999;
  const posQ = (document.getElementById("advPosition")?.value || "").toLowerCase().trim();
  const dateFrom = document.getElementById("advDateFrom")?.value || "";
  const dateTo = document.getElementById("advDateTo")?.value || "";
  const langQ = (document.getElementById("advLanguage")?.value || "").toLowerCase().trim();
  const compQ = (document.getElementById("advCompany")?.value || "").toLowerCase().trim();
  const ownerQ = document.getElementById("advOwner")?.value || "all";
  const archiveMode = document.getElementById("advArchiveMode")?.value || "active";

  return candidates.filter(c => {
    const isArchived = Boolean(c.isDeleted);
    if (archiveMode === "active" && isArchived) return false;
    if (archiveMode === "archived" && !isArchived) return false;

    const badgeCode = computeCandidateBadge(c);
    const candidateStageTab = getStageTabForCode(badgeCode);
    const calculatedAge = calculateAge(c.birthDate);

    const matchName = !nameQ || c.name.toLowerCase().includes(nameQ);
    const matchKw =
      !kwQ ||
      (c.recommendedPosition || "").toLowerCase().includes(kwQ) ||
      (c.recommendedCompany || "").toLowerCase().includes(kwQ) ||
      (c.language || "").toLowerCase().includes(kwQ) ||
      (c.education || "").toLowerCase().includes(kwQ) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(kwQ))) ||
      (c.tags && c.tags.some(tg => tg.toLowerCase().includes(kwQ))) ||
      (c.summary && c.summary.toLowerCase().includes(kwQ));

    const matchStage = currentStageFilter === "all" || candidateStageTab === currentStageFilter;
    const matchNat = !natQ || (c.nationality || "").toLowerCase().includes(natQ);
    const matchGender = genderQ === "all" || c.gender === genderQ;
    const matchAge = calculatedAge >= (isNaN(minAge) ? 0 : minAge) && calculatedAge <= (isNaN(maxAge) ? 999 : maxAge);
    const matchEdu = eduQ === "all" || c.education === eduQ;
    const matchService = c.yearsOfService >= (isNaN(minService) ? 0 : minService) && c.yearsOfService <= (isNaN(maxService) ? 999 : maxService);
    const matchPos =
      !posQ ||
      (c.recommendedPosition || "").toLowerCase().includes(posQ) ||
      (c.recommendations || []).some(r => (r.position || "").toLowerCase().includes(posQ));
    const entryDay = (c.entryTime || "").split(" ")[0];
    const matchDateFrom = !dateFrom || (entryDay && entryDay >= dateFrom);
    const matchDateTo = !dateTo || (entryDay && entryDay <= dateTo);
    const matchLang = !langQ || (c.language || "").toLowerCase().includes(langQ);
    const matchComp =
      !compQ ||
      (c.recommendedCompany || "").toLowerCase().includes(compQ) ||
      (c.recommendations || []).some(r => (r.company || "").toLowerCase().includes(compQ));
    const matchOwner = ownerQ === "all" || (c.ownerName || "Rina Wijaya") === ownerQ;

    // Client Portal: Only show candidates recommended to clientCompany
    let matchClient = true;
    if (activeUser.role === "client" && activeUser.clientCompany) {
      matchClient = (c.recommendations || []).some(r => r.company.toLowerCase() === activeUser.clientCompany.toLowerCase()) ||
                    (c.recommendedCompany || "").toLowerCase() === activeUser.clientCompany.toLowerCase();
    }

    return matchName && matchKw && matchStage && matchNat && matchGender && matchAge && matchEdu && matchService && matchPos && matchDateFrom && matchDateTo && matchLang && matchComp && matchOwner && matchClient;
  });
}

function renderResumeTable() {
  const theadRow = document.getElementById("resumeTableHeadRow");
  const tbody = document.getElementById("resumeTableBody");
  const footerCount = document.getElementById("tableFooterCount");
  const pageIndicator = document.getElementById("tablePageIndicator");
  const prevBtn = document.getElementById("btnPrevPage");
  const nextBtn = document.getElementById("btnNextPage");
  if (!theadRow || !tbody) return;

  const activeCols = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));

  const sortableCols = {
    candidate: "string",
    nationality: "string",
    status: "number",
    age: "number",
    education: "string",
    yearsOfService: "number",
    entryTime: "string"
  };

  theadRow.innerHTML = activeCols.map(col => {
    const sortType = sortableCols[col.id];
    const isSorted = sortState.columnId === col.id;
    const ariaSortAttr = isSorted ? ` aria-sort="${sortState.direction}"` : "";

    if (col.id === "candidate") {
      return `
        <th scope="col" data-col-id="${col.id}" data-type="${sortType}"${ariaSortAttr}>
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px; padding-inline-start: 6px;">
            <input type="checkbox" id="selectAllCandidatesCb" aria-label="Select all visible candidates" title="Select all visible candidates">
            <button type="button" class="sort-header-btn" data-sort-col="${col.id}">
              <span>${t(col.key)}</span>
              <span class="sort-icon-wrap" aria-hidden="true">
                <svg class="sort-icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path class="sort-svg-up" d="m7 9 5-5 5 5"/>
                  <path class="sort-svg-down" d="m7 15 5 5 5-5"/>
                </svg>
              </span>
            </button>
          </div>
        </th>
      `;
    }
    if (sortType) {
      return `
        <th scope="col" data-col-id="${col.id}" data-type="${sortType}"${ariaSortAttr} class="col-th-interactive">
          <div class="col-th-content">
            <button type="button" class="sort-header-btn" data-sort-col="${col.id}">
              <span>${t(col.key)}</span>
              <span class="sort-icon-wrap" aria-hidden="true">
                <svg class="sort-icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path class="sort-svg-up" d="m7 9 5-5 5 5"/>
                  <path class="sort-svg-down" d="m7 15 5 5 5-5"/>
                </svg>
              </span>
            </button>
            <button type="button" class="btn-hide-col" data-hide-col="${col.id}" title="${t('tipHideCol')}: ${t(col.key)}" aria-label="${t('tipHideCol')}: ${t(col.key)}">✕</button>
          </div>
        </th>
      `;
    }
    return `
      <th scope="col" data-col-id="${col.id}" class="col-th-interactive">
        <div class="col-th-content" style="padding: 8px 10px; font-weight: 700; font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">
          <span>${t(col.key)}</span>
          <button type="button" class="btn-hide-col" data-hide-col="${col.id}" title="${t('tipHideCol')}: ${t(col.key)}" aria-label="${t('tipHideCol')}: ${t(col.key)}">✕</button>
        </div>
      </th>
    `;
  }).join("");

  theadRow.querySelectorAll(".sort-header-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const colId = btn.getAttribute("data-sort-col");
      handleColumnSort(colId, btn);
    });
  });

  theadRow.querySelectorAll(".btn-hide-col").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const colId = btn.getAttribute("data-hide-col");
      if (colId) hideColumn(colId);
    });
  });

  const filtered = getFilteredCandidates();

  const factor = sortState.direction === "ascending" ? 1 : -1;
  const sortType = sortableCols[sortState.columnId] || "string";
  filtered.sort((a, b) => {
    const valA = getRawSortValue(a, sortState.columnId);
    const valB = getRawSortValue(b, sortState.columnId);
    return factor * (sortType === "number" ? valA - valB : collator.compare(String(valA), String(valB)));
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const pagedRecords = filtered.slice(startIndex, startIndex + pageSize);

  if (footerCount) {
    footerCount.textContent = `${t("lblShowing")} ${pagedRecords.length > 0 ? startIndex + 1 : 0} - ${startIndex + pagedRecords.length} ${t("lblOf")} ${totalRecords} ${t("lblRecords")}`;
  }
  if (pageIndicator) {
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
  }
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  if (pagedRecords.length === 0) {
    const isTotallyEmpty = (candidates || []).filter(c => !c.isDeleted).length === 0;
    tbody.innerHTML = `
      <tr>
        <td colspan="${activeCols.length}" style="padding: 56px 20px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 12px;">📁</div>
          <div style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
            ${isTotallyEmpty ? t("emptyDatabaseTitle") : t("emptyTable")}
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; max-width: 440px; margin-left: auto; margin-right: auto;">
            ${isTotallyEmpty ? t("emptyDatabaseDesc") : ""}
          </div>
          ${isTotallyEmpty ? `
            <div style="display: inline-flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn-solid" style="height: 34px; padding: 0 18px; font-size: 12px; font-weight: 700;" onclick="openAddCandidateModal()">${t("btnNewCandidate")}</button>
              <button type="button" class="btn-outlined" style="height: 34px; padding: 0 16px; font-size: 12px; font-weight: 700; background: var(--bg-surface);" onclick="document.getElementById('importCsvModal')?.showModal()">${t("btnImportCsv")}</button>
              <button type="button" class="btn-outlined" style="height: 34px; padding: 0 16px; font-size: 12px; font-weight: 700; background: var(--bg-surface);" onclick="loadDemoCandidates()">${t("btnLoadDemo")}</button>
            </div>
          ` : ""}
        </td>
      </tr>
    `;
    syncTableResponsiveLabels();
    if (resumeViewMode === "kanban") {
      renderKanbanBoard(filtered);
    }
    return;
  }

  tbody.innerHTML = pagedRecords.map(c => buildCandidateRowHtml(c, activeCols)).join("");
  bindTableRowActions(tbody);
  const selectAllCb = document.getElementById("selectAllCandidatesCb");
  if (selectAllCb) {
    selectAllCb.checked = pagedRecords.length > 0 && pagedRecords.every(c => selectedCandidateIds.has(c.id));
    selectAllCb.addEventListener("change", () => {
      pagedRecords.forEach(c => {
        if (selectAllCb.checked) selectedCandidateIds.add(c.id);
        else selectedCandidateIds.delete(c.id);
      });
      renderResumeTable();
      updateBatchToolbarUI();
    });
  }
  updateBatchToolbarUI();
  syncTableResponsiveLabels();
  if (resumeViewMode === "kanban") {
    renderKanbanBoard(filtered);
  }
}

function getRawSortValue(candidate, colId) {
  if (colId === "status") return computeCandidateBadge(candidate);
  if (colId === "age") return calculateAge(candidate.birthDate);
  if (colId === "yearsOfService") return candidate.yearsOfService;
  if (colId === "entryTime") return candidate.entryTime;
  return candidate[colId] || "";
}

function buildCandidateRowHtml(c, activeCols) {
  const badgeCode = computeCandidateBadge(c);
  const statusMeta = STATUS_CODES[badgeCode] || { isFailed: false };
  const calculatedAge = calculateAge(c.birthDate);
  const badgeStyle = statusMeta.isFailed
    ? "background-color: var(--danger-dot); color: #ffffff;"
    : "background-color: var(--brand-primary); color: #161922; font-weight: 800;";

  const cells = activeCols.map(col => {
    switch (col.id) {
      case "candidate":
        return `
          <th scope="row" data-value="${escapeHtml(c.name)}">
            <div class="candidate-select-wrap">
              <input type="checkbox" class="candidate-row-check" value="${c.id}" ${selectedCandidateIds.has(c.id) ? "checked" : ""} aria-label="Select ${escapeHtml(c.name)}">
              <button type="button" class="candidate-link" data-action="profile" data-id="${c.id}">
                ${escapeHtml(c.name).replace(" ", '<span class="name-break"> </span>')}
                ${c.isUnviewed ? `<span style="display:inline-block; width:6px; height:6px; background-color:var(--danger-dot); border-radius:50%; margin-left:3px;" title="Unviewed"></span>` : ""}
                ${c.isDeleted ? `<span style="font-size:10px; color:var(--danger-dot); font-weight:700;"> [Archived]</span>` : ""}
              </button>
            </div>
          </th>
        `;
      case "nationality":
        return `<td>${escapeHtml(c.nationality || "")}</td>`;
      case "status":
        return `
          <td data-value="${badgeCode}">
            <span class="status-count-badge" style="${badgeStyle}" title="${getStatusName(badgeCode)}">${badgeCode}</span>
          </td>
        `;
      case "gender":
        return `<td>${escapeHtml(c.gender || "")}</td>`;
      case "age":
        return `<td data-value="${calculatedAge}">${calculatedAge}</td>`;
      case "education":
        return `<td class="cell-wrap">${escapeHtml(c.education || "")}</td>`;
      case "language":
        return `<td class="cell-wrap">${escapeHtml(c.language || "")}</td>`;
      case "yearsOfService":
        return `<td data-value="${c.yearsOfService}">${c.yearsOfService}</td>`;
      case "recommendedPosition":
        return `<td class="cell-wrap">${escapeHtml(c.recommendedPosition || "")}</td>`;
      case "recommendedCompany":
        return `<td class="cell-wrap">${escapeHtml(c.recommendedCompany || "")}</td>`;
      case "entryTime":
        const parts = (c.entryTime || "").split(" ");
        return `<td data-value="${escapeHtml(c.entryTime)}">${parts[0] || ""}<br>${parts[1] || ""}</td>`;
      case "operation":
        if (activeUser.role === "client") {
          return `
            <td>
              <div class="op-btn-stack">
                <button type="button" class="op-btn" style="color: var(--success-color); font-weight: 600;" data-action="client-approve" data-id="${c.id}">Approve Interview</button>
                <button type="button" class="op-btn" style="color: var(--danger-dot);" data-action="client-reject" data-id="${c.id}">Reject CV</button>
                <button type="button" class="op-btn" data-action="download" data-id="${c.id}">${t("actDownloadResume")}</button>
              </div>
            </td>
          `;
        }
        return `
          <td>
            <div class="op-btn-stack">
              <button type="button" class="op-btn" data-action="download" data-id="${c.id}">${t("actDownloadResume")}</button>
              <button type="button" class="op-btn" data-action="repeat" data-id="${c.id}">${t("actRecRepeat")}</button>
              <button type="button" class="op-btn" data-action="list" data-id="${c.id}">${t("actRecList")}</button>
              <button type="button" class="op-btn" data-action="schedule" data-id="${c.id}" title="Schedule Interview">Interview</button>
              <button type="button" class="op-btn" data-action="offer" data-id="${c.id}" title="Generate Offer Letter">Offer</button>
              <button type="button" class="op-btn" data-action="outreach" data-id="${c.id}" title="WhatsApp / Email Outreach">Contact</button>
            </div>
          </td>
        `;
      default:
        return `<td></td>`;
    }
  });

  return `<tr data-candidate-id="${c.id}" class="${c.isDeleted ? 'archived-row' : ''}">${cells.join("")}</tr>`;
}

function handleColumnSort(colId, buttonEl) {
  const th = buttonEl.closest("th");
  const table = document.getElementById("resumeDataTable");
  const tbody = document.getElementById("resumeTableBody");
  const statusEl = document.getElementById("sortStatusRegion");
  if (!th || !table || !tbody) return;

  const nextDir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
  sortState = { columnId: colId, direction: nextDir };

  for (const header of table.tHead.rows[0].cells) {
    header.removeAttribute("aria-sort");
  }
  th.setAttribute("aria-sort", nextDir);

  renderResumeTable();

  if (statusEl) {
    statusEl.textContent = `Sorted by ${buttonEl.textContent.trim()}, ${nextDir}`;
  }
}

/**
 * 7. ROW OPERATIONS & FULL PROFILE MODAL (DK-01 s.d DK-06)
 */
function bindTableRowActions(container) {
  container.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (action === "profile") openCandidateProfileModal(id);
      if (action === "download") downloadCandidateResume(id);
      if (action === "repeat") openRecRepeatModal(id);
      if (action === "list") openRecListModal(id);
      if (action === "client-approve") clientApproveInterview(id);
      if (action === "client-reject") clientRejectResume(id);
      if (action === "schedule") openScheduleInterviewModal(id);
      if (action === "offer") openOfferLetterModal(id);
      if (action === "outreach") openOutreachModal(id);
    });
  });

  container.querySelectorAll(".candidate-row-check").forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) selectedCandidateIds.add(cb.value);
      else selectedCandidateIds.delete(cb.value);
      updateBatchToolbarUI();
    });
  });
}

function openCandidateProfileModal(candidateId, activeTab = "overview", selectedCvIdx = 0) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  c.isUnviewed = false;
  if (!Array.isArray(c.cvVersions) || c.cvVersions.length === 0) {
    c.cvVersions = [{
      version: "v1 (Original)",
      uploadedAt: c.entryTime,
      uploadedBy: c.ownerName || "Rina Wijaya",
      content: null
    }];
  }
  saveCandidates(candidates);

  const dialog = document.getElementById("profileModal");
  const body = document.getElementById("profileModalBody");
  if (!dialog || !body) return;

  try {
    const savedFs = localStorage.getItem("profile_modal_fullscreen") === "true";
    dialog.classList.toggle("is-fullscreen", savedFs);
    updateProfileFullscreenBtnState(savedFs);
  } catch (e) {}

  const currentBadge = computeCandidateBadge(c);
  const calculatedAge = calculateAge(c.birthDate);
  const safeCvIdx = Math.min(Math.max(0, selectedCvIdx), c.cvVersions.length - 1);
  const activeCvObj = c.cvVersions[safeCvIdx];
  const cvPreviewContent = activeCvObj.content || generateResumeText(c);

  body.innerHTML = `
    <!-- Candidate Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid var(--border-base); margin-bottom: 14px;">
      <div>
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">
          ${escapeHtml(c.name)}
          ${c.isDeleted ? `<span style="font-size: 11px; color: var(--danger-dot); margin-left: 6px;">[ARCHIVED]</span>` : ""}
        </h3>
        <p style="color: var(--text-secondary); margin-top: 2px;">
          ${escapeHtml(c.recommendedPosition || "-")} — <strong>${escapeHtml(c.recommendedCompany || "-")}</strong>
        </p>
        <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">
          ID: ${c.id} | ${escapeHtml(c.email || "-")} | ${escapeHtml(c.phone || "-")} | ${c.domicile || "Indonesia"}
        </p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
        <span class="status-count-badge" style="font-size: 13px; padding: 3px 9px;">
          ${currentBadge} - ${getStatusName(currentBadge)}
        </span>
        <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
          <button type="button" class="btn-outlined" id="btnProfileOutreach" style="height: 24px; font-size: 11px; padding: 0 8px;">Contact WA / Email</button>
          <button type="button" class="btn-outlined" id="btnProfileScheduleInt" style="height: 24px; font-size: 11px; padding: 0 8px;">Schedule Interview</button>
          <button type="button" class="btn-outlined" id="btnProfileGenOffer" style="height: 24px; font-size: 11px; padding: 0 8px;">Generate Offer</button>
          <button type="button" class="btn-outlined" id="btnToggleSoftDelete" style="height: 24px; font-size: 11px; padding: 0 8px; color: var(--warning-color);">
            ${c.isDeleted ? "Restore Archive" : "Archive (Soft Delete)"}
          </button>
          ${activeUser.role === "superadmin" ? `
            <button type="button" class="btn-outlined" id="btnHardDeleteCandidate" style="height: 24px; font-size: 11px; padding: 0 8px; color: var(--danger-dot); border-color: var(--danger-dot);">
              Permanent Delete
            </button>
          ` : ""}
        </div>
      </div>
    </div>

    <!-- Sub-tabs navigation -->
    <div class="profile-subtabs">
      <button type="button" class="profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-ptab="overview">${t("tabOverview")}</button>
      <button type="button" class="profile-tab-btn ${activeTab === 'workEdu' ? 'active' : ''}" data-ptab="workEdu">${t("tabWorkEdu")}</button>
      <button type="button" class="profile-tab-btn ${activeTab === 'cvViewer' ? 'active' : ''}" data-ptab="cvViewer">${t("tabCvViewer")}</button>
      <button type="button" class="profile-tab-btn ${activeTab === 'timeline' ? 'active' : ''}" data-ptab="timeline">${t("tabTimeline")}</button>
    </div>

    <!-- PANE 1: Overview & Contacts (DK-01) -->
    <div id="pane-overview" class="profile-tab-pane ${activeTab === 'overview' ? 'active' : ''}">
      <div class="form-grid" style="margin-bottom: 14px;">
        <div class="form-field">
          <label>${t("fldNationality")}</label>
          <div>${escapeHtml(c.nationality || "-")}</div>
        </div>
        <div class="form-field">
          <label>${t("fldGender")} / ${t("fldAge")}</label>
          <div>${escapeHtml(c.gender)} (${calculatedAge} Years, b. ${c.birthDate || "-"})</div>
        </div>
        <div class="form-field">
          <label>${t("fldEducation")}</label>
          <div>${escapeHtml(c.education || "-")}</div>
        </div>
        <div class="form-field">
          <label>${t("fldYearsService")}</label>
          <div>${c.yearsOfService} Years</div>
        </div>
        <div class="form-field">
          <label>${t("fldSalaryExpectation")}</label>
          <div style="font-weight: 600; color: var(--success-color);">${escapeHtml(c.salaryExpectation || "Negotiable")}</div>
        </div>
        <div class="form-field">
          <label>${t("fldCurrentSalary")}</label>
          <div>${escapeHtml(c.currentSalary || "-")}</div>
        </div>
        <div class="form-field">
          <label>${t("fldAvailability")}</label>
          <div>${escapeHtml(c.availability || "Immediate")}</div>
        </div>
        <div class="form-field">
          <label>${t("fldWhatsApp")}</label>
          <div>${escapeHtml(c.whatsapp || c.phone || "-")}</div>
        </div>
        <div class="form-field full">
          <label>${t("colLanguage")}</label>
          <div>${escapeHtml(c.language || "-")}</div>
        </div>
        <div class="form-field full">
          <label>${t("fldSummary")}</label>
          <p style="color: var(--text-secondary); line-height: 1.55;">${escapeHtml(c.summary || "-")}</p>
        </div>
        <div class="form-field full">
          <label>${t("fldTags")} (DK-06)</label>
          <div id="candidateTagsContainer" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px; margin-bottom: 6px;">
            ${(c.tags || ["Siap Relokasi", "Verified"]).map((tg, idx) => `
              <span class="col-tag">
                ${escapeHtml(tg)}
                <button type="button" class="tag-remove-btn" data-tag-idx="${idx}" style="border:none; background:transparent; cursor:pointer; font-size:11px; padding:0 2px; min-block-size:18px; min-inline-size:18px;" aria-label="Remove tag">×</button>
              </span>
            `).join("")}
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <input type="text" id="newCandidateTagInput" class="ctrl-input" placeholder="Add skill or attribute tag..." style="height: 28px; font-size: 12px; flex: 1;">
            <button type="button" id="btnAddCandidateTag" class="btn-outlined" style="height: 28px; font-size: 11.5px; padding: 0 10px;">+ Add Tag</button>
          </div>
        </div>

        <div class="form-field full">
          <label>Internal Consultant Notes (DK-06)</label>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
            ${(c.internalNotes || []).length === 0 ? `<small style="color: var(--text-muted);">No internal notes yet.</small>` : (c.internalNotes || []).map(note => `
              <div style="padding: 6px 10px; background: var(--bg-subtle); border-left: 2px solid var(--brand-primary); font-size: 12px; border-radius: 3px;">
                <div>${escapeHtml(note.text)}</div>
                <small style="color: var(--text-muted);">${escapeHtml(note.author)} • ${escapeHtml(note.timestamp)}</small>
              </div>
            `).join("")}
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <input type="text" id="newInternalNoteInput" class="ctrl-input" placeholder="Write private consultant evaluation note..." style="height: 28px; font-size: 12px; flex: 1;">
            <button type="button" id="btnAddInternalNote" class="btn-outlined" style="height: 28px; font-size: 11.5px; padding: 0 10px;">+ Add Note</button>
          </div>
        </div>
      </div>

      <!-- Recommendation Management with Valid Transitions (DK-04) -->
      <div style="margin-top: 14px;">
        <label style="font-weight: 600; font-size: 12px; margin-bottom: 6px; display: block;">Manage Recommendations & Pipeline Status (DK-04)</label>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(c.recommendations || []).map(r => `
            <div style="padding: 10px 12px; border: 1px solid var(--border-base); border-radius: 3px; background-color: var(--bg-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <strong>${escapeHtml(r.company)}</strong> — ${escapeHtml(r.position)}<br>
                <small style="color: var(--text-muted);">${r.timestamp} • Consultant: ${escapeHtml(r.consultantName || "Rina")}</small>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <select class="ctrl-select rec-stage-changer" data-candidate-id="${c.id}" data-rec-id="${r.id}" style="height: 28px; font-size: 12px;">
                  ${Object.values(STATUS_CODES).map(st => `
                    <option value="${st.code}" ${r.statusCode === st.code ? "selected" : ""}>
                      ${st.code} - ${getStatusName(st.code)}
                    </option>
                  `).join("")}
                </select>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- PANE 2: Experience & Education (DK-02) -->
    <div id="pane-workEdu" class="profile-tab-pane ${activeTab === 'workEdu' ? 'active' : ''}">
      <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Employment History</h4>
      <div class="table-wrapper" style="margin-bottom: 10px;">
        <table class="data-table data-table--compact">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Period</th>
              <th>Responsibilities</th>
            </tr>
          </thead>
          <tbody>
            ${(c.workHistory || [
              { role: c.recommendedPosition || "Professional", company: "Previous Tech Firm", period: "2020 - 2026", desc: "Handled key project deliverables." }
            ]).map(w => `
              <tr>
                <th scope="row"><strong>${escapeHtml(w.role)}</strong></th>
                <td>${escapeHtml(w.company)}</td>
                <td>${escapeHtml(w.period)}</td>
                <td style="text-align: left; font-size: 11.5px;">${escapeHtml(w.desc)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 6px; margin-bottom: 18px; padding: 10px; background: var(--bg-subtle); border: 1px solid var(--border-base); border-radius: var(--radius-sm);">
        <input type="text" id="workRoleInput" class="ctrl-input" placeholder="Role / Job Title" style="height: 28px; font-size: 12px;">
        <input type="text" id="workCompanyInput" class="ctrl-input" placeholder="Company Name" style="height: 28px; font-size: 12px;">
        <input type="text" id="workPeriodInput" class="ctrl-input" placeholder="Period (e.g. 2021 - 2025)" style="height: 28px; font-size: 12px;">
        <input type="text" id="workDescInput" class="ctrl-input" placeholder="Key Responsibilities" style="height: 28px; font-size: 12px;">
        <button type="button" id="btnAddWorkHistory" class="btn-outlined" style="height: 28px; font-size: 12px;">+ Add Work</button>
      </div>

      <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Education & Degrees</h4>
      <div class="table-wrapper" style="margin-bottom: 10px;">
        <table class="data-table data-table--compact">
          <thead>
            <tr>
              <th>Degree / Level</th>
              <th>Institution</th>
              <th>Graduation Year</th>
            </tr>
          </thead>
          <tbody>
            ${(c.educationHistory || [
              { degree: c.education || "Bachelor", institution: "Reputable University", year: "2019" }
            ]).map(e => `
              <tr>
                <th scope="row"><strong>${escapeHtml(e.degree)}</strong></th>
                <td>${escapeHtml(e.institution)}</td>
                <td>${escapeHtml(e.year)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 6px; padding: 10px; background: var(--bg-subtle); border: 1px solid var(--border-base); border-radius: var(--radius-sm);">
        <input type="text" id="eduDegreeInput" class="ctrl-input" placeholder="Degree (e.g. Bachelor S1)" style="height: 28px; font-size: 12px;">
        <input type="text" id="eduInstInput" class="ctrl-input" placeholder="University / Institution" style="height: 28px; font-size: 12px;">
        <input type="text" id="eduYearInput" class="ctrl-input" placeholder="Graduation Year (e.g. 2020)" style="height: 28px; font-size: 12px;">
        <button type="button" id="btnAddEduHistory" class="btn-outlined" style="height: 28px; font-size: 12px;">+ Add Education</button>
      </div>
    </div>

    <!-- PANE 3: Multi-Version CV Document Viewer (DK-03) -->
    <div id="pane-cvViewer" class="profile-tab-pane ${activeTab === 'cvViewer' ? 'active' : ''}">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <label for="cvVersionSelect" style="font-size: 12px; font-weight: 600;">CV Version:</label>
          <select id="cvVersionSelect" class="ctrl-select" style="height: 28px; font-size: 12px; min-width: 170px;">
            ${c.cvVersions.map((ver, idx) => `
              <option value="${idx}" ${idx === safeCvIdx ? "selected" : ""}>${escapeHtml(ver.version)} — ${escapeHtml(ver.uploadedAt)}</option>
            `).join("")}
          </select>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" id="btnAddCvVersion" class="btn-outlined" style="height: 28px; padding: 0 10px; font-size: 12px;">+ Upload New Version</button>
          <input type="file" id="cvVersionFileInput" accept=".txt,.pdf,.doc,.docx" style="display: none;">
          <button type="button" class="btn-solid" onclick="downloadCandidateResume('${c.id}', ${safeCvIdx})" style="height: 28px; padding: 0 10px; font-size: 12px;">
            Download This Version
          </button>
        </div>
      </div>
      <div class="cv-preview-paper">${escapeHtml(cvPreviewContent)}</div>
    </div>

    <!-- PANE 4: Activity Timeline (DK-05) -->
    <div id="pane-timeline" class="profile-tab-pane ${activeTab === 'timeline' ? 'active' : ''}">
      <div class="timeline-track">
        <div class="timeline-item">
          <div class="timeline-time">${c.entryTime}</div>
          <div class="timeline-title">Candidate Profile Created</div>
          <div class="timeline-desc">Initial registration into NextKerja Resume Lib by ${escapeHtml(c.ownerName || "Rina Wijaya")}.</div>
        </div>
        ${(c.recommendations || []).map(r => `
          <div class="timeline-item">
            <div class="timeline-time">${r.timestamp}</div>
            <div class="timeline-title">Recommended to ${escapeHtml(r.company)} (${escapeHtml(r.position)})</div>
            <div class="timeline-desc">Status: Code ${r.statusCode} (${getStatusName(r.statusCode)}) • PIC: ${escapeHtml(r.consultantName || "Rina Wijaya")}. ${r.reason ? `[Reason: ${escapeHtml(r.reason)}]` : ""} Note: ${escapeHtml(r.notes || "-")}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // Bind sub-tabs inside profile modal
  body.querySelectorAll(".profile-tab-btn").forEach(tBtn => {
    tBtn.addEventListener("click", () => {
      body.querySelectorAll(".profile-tab-btn").forEach(b => b.classList.remove("active"));
      body.querySelectorAll(".profile-tab-pane").forEach(p => p.classList.remove("active"));

      tBtn.classList.add("active");
      const targetPane = body.querySelector(`#pane-${tBtn.getAttribute("data-ptab")}`);
      if (targetPane) targetPane.classList.add("active");
      scrollTabIntoView(tBtn);
    });
  });

  // Bind DK-06 Tags & Internal Notes
  body.querySelector("#btnAddCandidateTag")?.addEventListener("click", () => {
    const tagVal = body.querySelector("#newCandidateTagInput")?.value.trim();
    if (!tagVal) return;
    if (!Array.isArray(c.tags)) c.tags = ["Siap Relokasi", "Verified"];
    if (!c.tags.includes(tagVal)) c.tags.push(tagVal);
    saveCandidates(candidates);
    addAuditLog("ADD_TAG", `Candidate ${c.name}`, `Added tag "${tagVal}"`);
    openCandidateProfileModal(c.id, "overview");
  });

  body.querySelectorAll(".tag-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-tag-idx"), 10);
      if (!Array.isArray(c.tags)) c.tags = ["Siap Relokasi", "Verified"];
      const removed = c.tags.splice(idx, 1)[0];
      saveCandidates(candidates);
      addAuditLog("REMOVE_TAG", `Candidate ${c.name}`, `Removed tag "${removed}"`);
      openCandidateProfileModal(c.id, "overview");
    });
  });

  body.querySelector("#btnAddInternalNote")?.addEventListener("click", () => {
    const noteText = body.querySelector("#newInternalNoteInput")?.value.trim();
    if (!noteText) return;
    if (!Array.isArray(c.internalNotes)) c.internalNotes = [];
    c.internalNotes.unshift({
      id: `NOTE-${Date.now()}`,
      text: noteText,
      author: activeUser.name,
      timestamp: formatTimestamp(new Date())
    });
    saveCandidates(candidates);
    addAuditLog("INTERNAL_NOTE", `Candidate ${c.name}`, `Added internal note`);
    openCandidateProfileModal(c.id, "overview");
  });

  // Bind DK-03 Multi-Version CV switcher & uploader
  body.querySelector("#cvVersionSelect")?.addEventListener("change", e => {
    const idx = parseInt(e.target.value, 10) || 0;
    openCandidateProfileModal(c.id, "cvViewer", idx);
  });

  body.querySelector("#btnAddCvVersion")?.addEventListener("click", () => {
    body.querySelector("#cvVersionFileInput")?.click();
  });

  body.querySelector("#cvVersionFileInput")?.addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const verLabel = `v${c.cvVersions.length + 1} (${file.name})`;
    const addVer = (contentText) => {
      c.cvVersions.unshift({
        version: verLabel,
        uploadedAt: formatTimestamp(new Date()),
        uploadedBy: activeUser.name,
        content: contentText
      });
      saveCandidates(candidates);
      addAuditLog("UPLOAD_CV_VERSION", `Candidate ${c.name}`, `Uploaded CV version ${verLabel}`);
      showToast(`Added CV version: ${verLabel}`);
      openCandidateProfileModal(c.id, "cvViewer", 0);
    };

    try {
      const extractedText = await extractTextFromCvFile(file);
      if (extractedText && extractedText.trim().length > 10) {
        addVer(`[Uploaded Document: ${file.name} | ${(file.size / 1024).toFixed(1)} KB | By: ${activeUser.name}]\n\n${extractedText.trim()}`);
      } else {
        addVer(`[Binary Document Uploaded]\nFile Name : ${file.name}\nFile Size : ${(file.size / 1024).toFixed(1)} KB\nUploaded By : ${activeUser.name}\n\n` + generateResumeText(c));
      }
    } catch (err) {
      addVer(`[Uploaded Document: ${file.name}]\nFile Size : ${(file.size / 1024).toFixed(1)} KB\nUploaded By : ${activeUser.name}\n\n` + generateResumeText(c));
    }
  });

  // Bind status transitions (DK-04) via shared helper
  body.querySelectorAll(".rec-stage-changer").forEach(sel => {
    sel.addEventListener("change", e => {
      const recId = sel.getAttribute("data-rec-id");
      const newCode = parseInt(e.target.value, 10);
      const ok = transitionCandidateStage(c.id, newCode, recId);
      if (!ok) {
        sel.value = String(c.recommendations?.find(r => r.id === recId)?.statusCode || 10);
      }
    });
  });

  body.querySelector("#btnProfileOutreach")?.addEventListener("click", () => {
    dialog.close();
    openOutreachModal(c.id);
  });

  body.querySelector("#btnAddWorkHistory")?.addEventListener("click", () => {
    const role = body.querySelector("#workRoleInput")?.value.trim();
    const company = body.querySelector("#workCompanyInput")?.value.trim();
    const period = body.querySelector("#workPeriodInput")?.value.trim() || "2023 - Present";
    const desc = body.querySelector("#workDescInput")?.value.trim() || "-";
    if (!role || !company) {
      showToast("Please fill Role and Company name.", "error");
      return;
    }
    if (!Array.isArray(c.workHistory)) {
      c.workHistory = [{ role: c.recommendedPosition || "Professional", company: "Previous Tech Firm", period: "2020 - 2026", desc: "Handled key project deliverables." }];
    }
    c.workHistory.unshift({ role, company, period, desc });
    saveCandidates(candidates);
    addAuditLog("ADD_WORK_HISTORY", `Candidate ${c.name}`, `Added employment ${role} at ${company}`);
    showToast(`Added employment history: ${role}`);
    openCandidateProfileModal(c.id, "workEdu");
  });

  body.querySelector("#btnAddEduHistory")?.addEventListener("click", () => {
    const degree = body.querySelector("#eduDegreeInput")?.value.trim();
    const institution = body.querySelector("#eduInstInput")?.value.trim();
    const year = body.querySelector("#eduYearInput")?.value.trim() || "2022";
    if (!degree || !institution) {
      showToast("Please fill Degree and Institution name.", "error");
      return;
    }
    if (!Array.isArray(c.educationHistory)) {
      c.educationHistory = [{ degree: c.education || "Bachelor", institution: "Reputable University", year: "2019" }];
    }
    c.educationHistory.unshift({ degree, institution, year });
    saveCandidates(candidates);
    addAuditLog("ADD_EDU_HISTORY", `Candidate ${c.name}`, `Added education ${degree} at ${institution}`);
    showToast(`Added education record: ${degree}`);
    openCandidateProfileModal(c.id, "workEdu");
  });

  body.querySelector("#btnProfileScheduleInt")?.addEventListener("click", () => {
    dialog.close();
    openScheduleInterviewModal(c.id);
  });

  body.querySelector("#btnProfileGenOffer")?.addEventListener("click", () => {
    dialog.close();
    openOfferLetterModal(c.id);
  });

  body.querySelector("#btnToggleSoftDelete")?.addEventListener("click", () => {
    toggleSoftDeleteCandidate(c.id);
    dialog.close();
  });

  body.querySelector("#btnHardDeleteCandidate")?.addEventListener("click", async () => {
    if (await hardDeleteCandidate(c.id)) {
      dialog.close();
    }
  });

  syncTableResponsiveLabels();
  if (!dialog.open) {
    dialog.showModal();
  }
}

function generateResumeText(c) {
  const currentBadge = computeCandidateBadge(c);
  return [
    "======================================================================",
    `                    CURRICULUM VITAE / RESUME                         `,
    "======================================================================",
    `Candidate ID         : ${c.id}`,
    `Full Name            : ${c.name}`,
    `Nationality          : ${c.nationality || "-"}`,
    `Gender / Age         : ${c.gender} / ${calculateAge(c.birthDate)} (b. ${c.birthDate || "-"})`,
    `Domicile             : ${c.domicile || "Indonesia"}`,
    `Education            : ${c.education || "-"}`,
    `Languages            : ${c.language || "-"}`,
    `Years of Service     : ${c.yearsOfService} Years`,
    `Expected Salary      : ${c.salaryExpectation || "Negotiable"} (Current: ${c.currentSalary || "-"})`,
    `Availability         : ${c.availability || "Immediate"}`,
    `Email / WhatsApp     : ${c.email || "-"} / ${c.whatsapp || c.phone || "-"}`,
    "----------------------------------------------------------------------",
    `LATEST STATUS & RECOMMENDATION`,
    `Current Status Badge : ${currentBadge} (${getStatusName(currentBadge)})`,
    `Position             : ${c.recommendedPosition || "-"}`,
    `Target Company       : ${c.recommendedCompany || "-"}`,
    `Entry Timestamp      : ${c.entryTime}`,
    "----------------------------------------------------------------------",
    `PROFESSIONAL SUMMARY`,
    `${c.summary || "-"}`,
    "----------------------------------------------------------------------",
    `EMPLOYMENT HISTORY`,
    ...(c.workHistory || []).map((w, i) => `${i+1}. ${w.role} @ ${w.company} (${w.period})\n   ${w.desc}`),
    "----------------------------------------------------------------------",
    `RECOMMENDATION HISTORY (${(c.recommendations || []).length} records)`,
    ...(c.recommendations || []).map(
      (r, idx) => `${idx + 1}. [${r.timestamp}] ${r.position} @ ${r.company} (Status: ${r.statusCode} - ${getStatusName(r.statusCode)})\n   Consultant: ${r.consultantName || "Rina"} | Note: ${r.notes || "-"} ${r.reason ? `| Reason: ${r.reason}` : ""}`
    ),
    "======================================================================"
  ].join("\n");
}

function downloadCandidateResume(candidateId, cvVersionIdx = 0) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const verObj = Array.isArray(c.cvVersions) && c.cvVersions[cvVersionIdx] ? c.cvVersions[cvVersionIdx] : null;
  const resumeContent = verObj && verObj.content ? verObj.content : generateResumeText(c);
  const blob = new Blob([resumeContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Resume_${c.name.replace(/\s+/g, "_")}_${c.id}${verObj ? "_v" + (cvVersionIdx + 1) : ""}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  addAuditLog("DOWNLOAD_RESUME", `Candidate ${c.name}`, `Downloaded CV file (${verObj ? verObj.version : "latest"})`);
  showToast(`${t("msgResumeDownloaded")} ${c.name}`);
}

/**
 * 8. RECOMMENDED REPEAT (6 Rules)
 */
function evaluateRecRepeatRules(candidate, targetCompany, targetPosition, currentConsultant = activeUser.name) {
  const currentBadge = computeCandidateBadge(candidate);

  // Condition 1: Blacklist 91
  if (currentBadge === 91) {
    return { blocked: true, message: "Action blocked: Candidate is Blacklisted (Code 91) and cannot be recommended.", requiresReason: false, requiresManager: false };
  }

  const recs = candidate.recommendations || [];
  const windowMonths = parseInt(systemSettings?.duplicateWindowMonths, 10) || 6;
  const cutoffDate = new Date("2026-11-16");
  cutoffDate.setMonth(cutoffDate.getMonth() - windowMonths);

  // Condition 2: Same company + same position, previous recommendation still active
  const activeSame = recs.find(r => 
    r.isActive !== false &&
    r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim() &&
    r.position.toLowerCase().trim() === targetPosition.toLowerCase().trim()
  );
  if (activeSame) {
    return {
      blocked: true,
      message: `Action blocked: Candidate already has an ongoing recommendation for this company and position (${activeSame.company} - ${activeSame.position}, Status: ${activeSame.statusCode}).`,
      requiresReason: false,
      requiresManager: false
    };
  }

  // Condition 3: Same company, by another consultant, within configured window
  const diffConsultantWithin6Mo = recs.find(r => {
    const rDate = new Date(r.timestamp.split(" ")[0]);
    const isWithin = rDate >= cutoffDate;
    const isSameComp = r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
    const isDiffCons = (r.consultantName || "").toLowerCase() !== currentConsultant.toLowerCase();
    return isSameComp && isWithin && isDiffCons;
  });
  if (diffConsultantWithin6Mo) {
    return {
      blocked: false,
      message: `Warning: Recommended to this company by another consultant (${diffConsultantWithin6Mo.consultantName}) in the last ${windowMonths} months. Manager approval and justification required.`,
      requiresReason: true,
      requiresManager: true
    };
  }

  // Condition 4: Same company within configured window
  const sameCompWithin6Mo = recs.find(r => {
    const rDate = new Date(r.timestamp.split(" ")[0]);
    return rDate >= cutoffDate && r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
  });
  if (sameCompWithin6Mo) {
    return {
      blocked: false,
      message: `Notice: Candidate was recommended to this company within the last ${windowMonths} months. Reason is mandatory.`,
      requiresReason: true,
      requiresManager: false
    };
  }

  // Condition 5: Candidate currently in code 31 or 40
  if (currentBadge === 31 || currentBadge === 40) {
    return {
      blocked: false,
      message: "Notice: Candidate already accepted an offer (31) or started work (40). Reason is required.",
      requiresReason: true,
      requiresManager: false
    };
  }

  // Condition 6: Otherwise -> Allowed
  return { blocked: false, message: "", requiresReason: false, requiresManager: false };
}

function openRecRepeatModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const dialog = document.getElementById("recRepeatModal");
  if (!dialog) return;

  const compInput = document.getElementById("recRepeatCompany");
  const posInput = document.getElementById("recRepeatPosition");

  if (compInput && compInput.tagName === "SELECT") {
    populateCompanyAndPositionSelects(compInput.id, posInput?.id);
  }

  document.getElementById("recRepeatCandidateId").value = c.id;
  document.getElementById("recRepeatCandidateName").value = c.name;
  if (posInput && !posInput.value) posInput.value = c.recommendedPosition || "";
  if (compInput && !compInput.value) compInput.value = c.recommendedCompany || "";
  document.getElementById("recRepeatReason").value = "";
  document.getElementById("recRepeatNotes").value = "";

  const warnBanner = document.getElementById("recRepeatWarningBanner");
  const reasonBox = document.getElementById("recRepeatReasonGroup");
  const mgrBox = document.getElementById("recRepeatManagerApprovalGroup");
  const submitBtn = document.getElementById("btnSubmitRecRepeat");

  if (warnBanner) { warnBanner.style.display = "none"; warnBanner.textContent = ""; }
  if (reasonBox) reasonBox.style.display = "none";
  if (mgrBox) mgrBox.style.display = "none";
  if (submitBtn) submitBtn.disabled = false;

  const verifyRulesLive = () => {
    const comp = document.getElementById("recRepeatCompany")?.value.trim();
    const pos = document.getElementById("recRepeatPosition")?.value.trim();
    if (!comp) return;

    const evalResult = evaluateRecRepeatRules(c, comp, pos, activeUser.name);
    if (evalResult.blocked) {
      if (warnBanner) {
        warnBanner.style.display = "block";
        warnBanner.style.borderColor = "var(--danger-dot)";
        warnBanner.style.color = "var(--danger-dot)";
        warnBanner.textContent = evalResult.message;
      }
      if (submitBtn) submitBtn.disabled = true;
    } else if (evalResult.message) {
      if (warnBanner) {
        warnBanner.style.display = "block";
        warnBanner.style.borderColor = "var(--warning-color)";
        warnBanner.style.color = "var(--warning-color)";
        warnBanner.textContent = evalResult.message;
      }
      if (submitBtn) submitBtn.disabled = false;
    } else {
      if (warnBanner) warnBanner.style.display = "none";
      if (submitBtn) submitBtn.disabled = false;
    }

    if (reasonBox) {
      reasonBox.style.display = evalResult.requiresReason ? "flex" : "none";
      const reasonInput = document.getElementById("recRepeatReason");
      if (reasonInput) reasonInput.required = evalResult.requiresReason;
    }

    if (mgrBox) {
      mgrBox.style.display = evalResult.requiresManager ? "flex" : "none";
      const mgrCheck = document.getElementById("recRepeatManagerCheck");
      if (mgrCheck) mgrCheck.required = evalResult.requiresManager;
    }
  };

  if (compInput) {
    compInput.oninput = verifyRulesLive;
    compInput.onchange = verifyRulesLive;
  }
  if (posInput) {
    posInput.oninput = verifyRulesLive;
    posInput.onchange = verifyRulesLive;
  }

  dialog.showModal();
}

function handleRecRepeatSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("recRepeatCandidateId")?.value;
  const pos = document.getElementById("recRepeatPosition")?.value.trim();
  const comp = document.getElementById("recRepeatCompany")?.value.trim();
  const statusCode = parseInt(document.getElementById("recRepeatStatusCode")?.value || "10", 10);
  const consultant = activeUser.name;
  const reason = document.getElementById("recRepeatReason")?.value.trim() || "";
  const notes = document.getElementById("recRepeatNotes")?.value.trim() || "Recommended via Resume Lib.";

  const c = candidates.find(item => item.id === id);
  if (!c || !pos || !comp) return;

  const ruleResult = evaluateRecRepeatRules(c, comp, pos, consultant);
  if (ruleResult.blocked) {
    showAlertDialog({
      title: t("alertRuleRejected"),
      message: ruleResult.message,
      type: "danger"
    });
    return;
  }
  if (ruleResult.requiresReason && !reason) {
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertReasonRequired"),
      type: "warning"
    });
    return;
  }
  if (ruleResult.requiresManager) {
    const mgrCheck = document.getElementById("recRepeatManagerCheck");
    if (!mgrCheck?.checked) {
      showAlertDialog({
        title: t("alertNotification"),
        message: t("alertManagerApprovalRequired"),
        type: "warning"
      });
      return;
    }
  }

  const nowStr = formatTimestamp(new Date());
  c.recommendedPosition = pos;
  c.recommendedCompany = comp;
  c.entryTime = nowStr;

  if (!Array.isArray(c.recommendations)) c.recommendations = [];
  c.recommendations.unshift({
    id: `REC-${Date.now().toString().slice(-4)}`,
    company: comp,
    position: pos,
    statusCode,
    consultantName: consultant,
    timestamp: nowStr,
    reason,
    notes,
    isActive: true
  });

  addAuditLog("RECOMMEND_REPEAT", `Candidate ${c.name}`, `Recommended to ${comp} as ${pos} (Code ${statusCode})`);
  saveCandidates(candidates);
  document.getElementById("recRepeatModal")?.close();
  renderAllViews();
  showToast(`${t("msgRecSuccess")} ${c.name} -> ${comp}`);
}

function openRecListModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const dialog = document.getElementById("recListModal");
  const body = document.getElementById("recListModalBody");
  if (!dialog || !body) return;

  const recs = c.recommendations || [];
  const badgeCode = computeCandidateBadge(c);

  body.innerHTML = `
    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="font-size: 14px; color: var(--text-primary); font-weight: 800;">${escapeHtml(c.name)}</strong>
        <span style="margin-left: 8px; color: var(--text-muted); font-size: 12px;">(Status: ${badgeCode} - ${getStatusName(badgeCode)})</span>
      </div>
      <button type="button" class="btn-solid" id="btnQuickRepeatFromList" style="height: 28px; padding: 0 12px; font-size: 12px;">
        + ${t("actRecRepeat")}
      </button>
    </div>
    <div class="table-wrapper" style="max-height: 360px;">
      <table class="data-table">
        <thead>
          <tr>
            <th>${t("colRecPosition")}</th>
            <th>${t("colRecCompany")}</th>
            <th>${t("fldStage")}</th>
            <th>${t("fldConsultant")}</th>
            <th>${t("fldDate")}</th>
            <th>${t("fldReason")} / ${t("fldNotes")}</th>
          </tr>
        </thead>
        <tbody>
          ${recs.map(r => `
            <tr>
              <th scope="row"><strong>${escapeHtml(r.position)}</strong></th>
              <td>${escapeHtml(r.company)}</td>
              <td>
                <span class="status-count-badge" style="${STATUS_CODES[r.statusCode]?.isFailed ? 'background-color: var(--danger-dot); color: #ffffff;' : 'background-color: var(--brand-primary); color: #161922; font-weight: 800;'}">
                  ${r.statusCode}
                </span>
                <small style="display:block; font-size: 10.5px; color: var(--text-muted);">${getStatusName(r.statusCode)}</small>
              </td>
              <td>${escapeHtml(r.consultantName || "Rina")}</td>
              <td>${escapeHtml(r.timestamp)}</td>
              <td style="text-align: left; max-width: 220px;">
                ${r.reason ? `<strong style="color: #b91c1c;">[Reason: ${escapeHtml(r.reason)}]</strong><br>` : ""}
                ${escapeHtml(r.notes || "-")}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  body.querySelector("#btnQuickRepeatFromList")?.addEventListener("click", () => {
    dialog.close();
    openRecRepeatModal(c.id);
  });

  syncTableResponsiveLabels();
  dialog.showModal();
}

/**
 * 9. ADD CANDIDATE WITH DUPLICATE CHECK (RL-20, RL-21)
 */
async function handleAddCandidateSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("addName")?.value.trim();
  const nationality = document.getElementById("addNationality")?.value.trim() || "Indonesia";
  const gender = document.getElementById("addGender")?.value || "Male";
  const birthDate = document.getElementById("addBirthDate")?.value || "1998-01-01";
  const education = document.getElementById("addEducation")?.value || "undergraduate";
  const language = document.getElementById("addLanguage")?.value.trim() || "Indonesian, English";
  const yearsOfService = parseFloat(document.getElementById("addYears")?.value || "3");
  const position = document.getElementById("addPositionSelect")?.value.trim();
  const company = document.getElementById("addCompanySelect")?.value.trim();
  const email = document.getElementById("addEmail")?.value.trim() || "";
  const phone = document.getElementById("addPhone")?.value.trim() || "";
  const summary = document.getElementById("addSummary")?.value.trim() || "";

  if (!name) return;

  const isDuplicate = candidates.find(item => 
    (item.name.toLowerCase() === name.toLowerCase() && item.birthDate === birthDate) ||
    (email && item.email && item.email.toLowerCase() === email.toLowerCase()) ||
    (phone && item.phone && item.phone === phone)
  );

  if (isDuplicate) {
    const proceed = await showConfirmDialog({
      title: t("confirmDuplicateTitle"),
      message: t("confirmDuplicateMsg").replace("{name}", isDuplicate.name).replace("{birthDate}", isDuplicate.birthDate || "-").replace("{contact}", isDuplicate.phone || isDuplicate.email || "-").replace("{id}", isDuplicate.id),
      confirmText: t("btnKeepSaving"),
      cancelText: t("btnCancel"),
      type: "warning"
    });
    if (!proceed) {
      return;
    }
  }

  const nowStr = formatTimestamp(new Date());
  const newRecs = [];
  if (company && position) {
    newRecs.push({
      id: `REC-${Date.now().toString().slice(-4)}`,
      company,
      position,
      statusCode: 10,
      consultantName: activeUser.name,
      timestamp: nowStr,
      notes: "Initial entry recommendation.",
      isActive: true
    });
  }

  const uploadedCv = pendingUploadedCvData && pendingUploadedCvData.mode === "add" ? pendingUploadedCvData : null;
  const parsedExtra = uploadedCv?.parsed || {};
  const mergedSkills = Array.isArray(parsedExtra.skills) && parsedExtra.skills.length > 0
    ? parsedExtra.skills
    : (position ? [position] : []);

  const newRecord = {
    id: `CND-${1000 + candidates.length + 1}`,
    name,
    nationality,
    gender,
    birthDate,
    education,
    language,
    yearsOfService,
    recommendedPosition: position || "",
    recommendedCompany: company || "",
    entryTime: nowStr,
    email,
    phone,
    whatsapp: phone,
    domicile: parsedExtra.domicile || "Indonesia",
    salaryExpectation: parsedExtra.salaryExpectation || "Negotiable",
    currentSalary: "-",
    availability: "Immediate",
    ownerId: activeUser.id,
    ownerName: activeUser.name,
    skills: mergedSkills,
    tags: ["New Entry", ...(uploadedCv ? ["CV Auto-Parsed"] : [])],
    summary,
    workHistory: Array.isArray(parsedExtra.workHistory) && parsedExtra.workHistory.length > 0 ? parsedExtra.workHistory : undefined,
    educationHistory: Array.isArray(parsedExtra.educationHistory) && parsedExtra.educationHistory.length > 0 ? parsedExtra.educationHistory : undefined,
    cvVersions: uploadedCv ? [{
      version: `v1 (${uploadedCv.fileName})`,
      uploadedAt: nowStr,
      uploadedBy: activeUser.name,
      content: `[Uploaded CV File: ${uploadedCv.fileName}]\n\n${uploadedCv.rawText}`
    }] : undefined,
    isUnviewed: true,
    recommendations: newRecs
  };

  candidates.unshift(newRecord);
  addAuditLog("CREATE_CANDIDATE", `Candidate ${name}`, `Added new candidate profile${uploadedCv ? ` via CV (${uploadedCv.fileName})` : ""}`);
  saveCandidates(candidates);
  e.target.reset();
  resetCvUploadUi("add");
  document.getElementById("addCandidateModal")?.close();
  currentPage = 1;
  renderAllViews();
  showToast(`${t("msgCandidateAdded")} ${name}`);
}

/**
 * 10. BULK CSV IMPORT & EXPORT (RL-22, RL-23)
 */
function exportFilteredCandidatesToCsv() {
  if (activeUser.role !== "manager" && activeUser.role !== "superadmin") {
    showAlertDialog({
      title: t("alertAccessDenied"),
      message: t("alertManagerExport"),
      type: "danger"
    });
    return;
  }

  const filtered = getFilteredCandidates();
  if (filtered.length === 0) {
    showAlertDialog({
      title: t("emptyTable"),
      message: t("alertEmptyExport"),
      type: "info"
    });
    return;
  }

  const headers = ["ID", "Candidate Name", "Nationality", "Status Code", "Gender", "Birth Date", "Age", "Education", "Language", "Years of Service", "Recommended Position", "Recommended Company", "Entry Time", "Email", "Phone"];
  const rows = filtered.map(c => [
    `"${c.id}"`,
    `"${c.name}"`,
    `"${c.nationality || ""}"`,
    `"${computeCandidateBadge(c)}"`,
    `"${c.gender || ""}"`,
    `"${c.birthDate || ""}"`,
    `"${calculateAge(c.birthDate)}"`,
    `"${c.education || ""}"`,
    `"${(c.language || "").replace(/"/g, '""')}"`,
    `"${c.yearsOfService || 0}"`,
    `"${(c.recommendedPosition || "").replace(/"/g, '""')}"`,
    `"${(c.recommendedCompany || "").replace(/"/g, '""')}"`,
    `"${c.entryTime || ""}"`,
    `"${c.email || ""}"`,
    `"${c.phone || ""}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Candidates_Export_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  addAuditLog("EXPORT_CSV", "Resume Lib", `Exported ${filtered.length} candidates to CSV`);
  showToast(`${t("msgExportSuccess")} (${filtered.length} records)`);
}

function downloadSampleCsvTemplate() {
  const sample = [
    "Candidate Name,Nationality,Gender,Birth Date,Education,Language,Years of Service,Recommended Position,Recommended Company,Email,Phone,Summary",
    "Bagus Setiawan,Indonesia,Male,1998-05-12,undergraduate,\"Indonesian, English\",5,Fullstack Engineer,Shopee Indonesia,bagus.s@example.id,+6281299887766,Experienced web developer in Node.js and React",
    "Dewi Lestari,Indonesia,Female,1999-10-04,master,\"Indonesian, English, Chinese\",4,Product Manager,ByteDance ID,dewi.l@example.id,+6281311223344,Bilingual PM in social entertainment"
  ].join("\n");

  const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "candidates_sample_template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function handleCsvImportSubmit(e) {
  e.preventDefault();
  const fileInput = document.getElementById("csvFileInput");
  const textInput = document.getElementById("csvPasteInput")?.value.trim();

  if (fileInput?.files?.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      processCsvData(evt.target.result);
    };
    reader.readAsText(file);
  } else if (textInput) {
    processCsvData(textInput);
  } else {
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertSelectCsv"),
      type: "warning"
    });
  }
}

function processCsvData(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertEmptyCsv"),
      type: "warning"
    });
    return;
  }

  let importedCount = 0;
  const failedRows = [];
  const nowStr = formatTimestamp(new Date());

  // Simple CSV line parser
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const name = cols[0];
    const nationality = cols[1] || "Indonesia";
    const gender = cols[2] || "Male";
    const birthDate = cols[3] || "1998-01-01";
    const education = cols[4] || "undergraduate";
    const language = cols[5] || "Indonesian, English";
    const yearsOfService = parseFloat(cols[6]) || 3;
    const position = cols[7] || "";
    const company = cols[8] || "";
    const email = cols[9] || "";
    const phone = cols[10] || "";
    const summary = cols[11] || "";

    if (!name) {
      failedRows.push(`Line ${i + 1}: Name is empty`);
      continue;
    }

    const newRecord = {
      id: `CND-${1000 + candidates.length + 1}`,
      name,
      nationality,
      gender,
      birthDate,
      education,
      language,
      yearsOfService,
      recommendedPosition: position,
      recommendedCompany: company,
      entryTime: nowStr,
      email,
      phone,
      whatsapp: phone,
      domicile: "Indonesia",
      salaryExpectation: "Negotiable",
      currentSalary: "-",
      availability: "Immediate",
      ownerId: activeUser.id,
      ownerName: activeUser.name,
      skills: position ? [position] : [],
      tags: ["Imported CSV"],
      summary,
      isUnviewed: true,
      recommendations: company && position ? [{
        id: `REC-${Date.now().toString().slice(-4)}`,
        company,
        position,
        statusCode: 10,
        consultantName: activeUser.name,
        timestamp: nowStr,
        notes: "Imported via CSV.",
        isActive: true
      }] : []
    };

    candidates.unshift(newRecord);
    importedCount++;
  }

  saveCandidates(candidates);
  addAuditLog("IMPORT_CSV", "Resume Lib", `Imported ${importedCount} candidates. Failed rows: ${failedRows.length}`);
  document.getElementById("importCsvModal")?.close();
  renderAllViews();

  if (failedRows.length > 0) {
    showAlertDialog({
      title: t("dialogImportResultTitle"),
      message: t("dialogImportResultError").replace("{count}", importedCount).replace("{errorCount}", failedRows.length).replace("{errors}", failedRows.slice(0, 5).join("\n")),
      type: "warning"
    });
  } else {
    showToast(`${t("msgImportSuccess")} ${importedCount} candidates.`);
  }
}

/**
 * 11. NOTIFICATIONS POPOVER (NT-01, NT-02)
 */
function renderNotifications() {
  const notifList = document.getElementById("notifListContainer");
  const badgeEl = document.getElementById("notifUnreadBadge");
  if (!notifList || !badgeEl) return;

  const unreadCount = notifications.filter(n => !n.read).length;
  badgeEl.textContent = unreadCount;
  badgeEl.style.display = unreadCount > 0 ? "flex" : "none";

  notifList.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
      <div class="notif-item-title">${escapeHtml(n.title)}</div>
      <div class="notif-item-desc">${escapeHtml(n.message)}</div>
      <div class="notif-item-time">${escapeHtml(n.time || n.timestamp || "")}</div>
    </div>
  `).join("");

  notifList.querySelectorAll(".notif-item").forEach(item => {
    item.addEventListener("click", () => {
      const nid = item.getAttribute("data-notif-id");
      const targetNotif = notifications.find(n => n.id === nid);
      if (targetNotif) {
        targetNotif.read = true;
        saveNotifications(notifications);
        renderNotifications();
        document.getElementById("notifDropdown")?.classList.remove("open");
        if (targetNotif.candidateId) {
          openCandidateProfileModal(targetNotif.candidateId);
        }
      }
    });
  });
}

/**
 * 12. SECONDARY WORKSPACE VIEWS & ADVANCED ATS MODULES
 */
function renderSecondaryViews() {
  renderNotifications();
  renderConsultantBusinessHub();
  renderWarrantyTracker();
  renderClientCompaniesView();
  renderAdvancedAnalytics();
  renderAuditLogsView();
  renderMasterDataLists();
  renderUserManagementList();
  renderCareerPortal();
  renderInterviewCalendar();
  syncSystemSettingsInputs();
  syncTableResponsiveLabels();
}

/**
 * 12A. CONSULTANT BUSINESS & LEADERBOARD (CB-01, CB-02, CB-03)
 */
function switchCbTab(tabKey) {
  const btnRecs = document.getElementById("tabBtnCbRecs");
  const btnLeader = document.getElementById("tabBtnCbLeaderboard");
  const btnWarranty = document.getElementById("tabBtnCbWarranty");
  const paneRecs = document.getElementById("paneCbRecs");
  const paneLeader = document.getElementById("paneCbLeaderboard");
  const paneWarranty = document.getElementById("paneCbWarranty");

  btnRecs?.classList.toggle("active", tabKey === "recs");
  btnLeader?.classList.toggle("active", tabKey === "leaderboard");
  btnWarranty?.classList.toggle("active", tabKey === "warranty");

  if (paneRecs) paneRecs.style.display = tabKey === "recs" ? "block" : "none";
  if (paneLeader) paneLeader.style.display = tabKey === "leaderboard" ? "block" : "none";
  if (paneWarranty) paneWarranty.style.display = tabKey === "warranty" ? "block" : "none";

  if (tabKey === "warranty") {
    renderWarrantyTracker();
  }
  syncTableResponsiveLabels();
}

function renderConsultantBusinessHub() {
  // Populate Company Filter
  const compFilter = document.getElementById("cbFilterCompany");
  if (compFilter && compFilter.children.length <= 1) {
    compFilter.innerHTML = `<option value="all">All Companies</option>` + masterCompanies.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }

  const selectedCons = document.getElementById("cbFilterConsultant")?.value || "all";
  const selectedComp = document.getElementById("cbFilterCompany")?.value || "all";
  const selectedStatus = document.getElementById("cbFilterStatus")?.value || "all";

  // Flatten all recommendations
  const allRecs = [];
  candidates.forEach(c => {
    (c.recommendations || []).forEach(r => {
      allRecs.push({ candidate: c, rec: r });
    });
  });

  // Calculate Monthly Targets & KPIs (CB-02)
  const targetUser = selectedCons === "all" ? (activeUser.name || "Rina Wijaya") : selectedCons;
  const userCandidates = candidates.filter(c => (c.ownerName || "Rina Wijaya").toLowerCase() === targetUser.toLowerCase());
  const userRecs = allRecs.filter(item => (item.rec.consultantName || "Rina").toLowerCase().includes(targetUser.toLowerCase().split(" ")[0].toLowerCase()));
  
  const countNewAdded = userCandidates.length;
  const countSubmitted = userRecs.length;
  const countInterviews = userRecs.filter(item => [20, 21, 22].includes(item.rec.statusCode)).length;
  const countEntryHires = userRecs.filter(item => [40, 41].includes(item.rec.statusCode)).length;

  const targetKpiBox = document.getElementById("consultantTargetKpis");
  if (targetKpiBox) {
    targetKpiBox.innerHTML = `
      <div class="kpi-card">
        <div>New Talents Added</div>
        <div class="kpi-num">${countNewAdded} <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">/ Target 10</span></div>
        <div class="dist-bar-track" style="margin-top:6px;"><div class="dist-bar-fill" style="width: ${Math.min(100, Math.round((countNewAdded / 10) * 100))}%;"></div></div>
      </div>
      <div class="kpi-card">
        <div>Client Submissions</div>
        <div class="kpi-num">${countSubmitted} <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">/ Target 12</span></div>
        <div class="dist-bar-track" style="margin-top:6px;"><div class="dist-bar-fill" style="width: ${Math.min(100, Math.round((countSubmitted / 12) * 100))}%;"></div></div>
      </div>
      <div class="kpi-card">
        <div>Interviews Arranged</div>
        <div class="kpi-num">${countInterviews} <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">/ Target 5</span></div>
        <div class="dist-bar-track" style="margin-top:6px;"><div class="dist-bar-fill" style="width: ${Math.min(100, Math.round((countInterviews / 5) * 100))}%;"></div></div>
      </div>
      <div class="kpi-card">
        <div>Placements / Entry</div>
        <div class="kpi-num" style="color: var(--success-color);">${countEntryHires} <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">/ Target 2</span></div>
        <div class="dist-bar-track" style="margin-top:6px;"><div class="dist-bar-fill" style="width: ${Math.min(100, Math.round((countEntryHires / 2) * 100))}%; background-color: var(--success-color);"></div></div>
      </div>
    `;
  }

  // Filter Recommendations Table
  const filteredRecs = allRecs.filter(item => {
    if (selectedCons !== "all" && !(item.rec.consultantName || "").toLowerCase().includes(selectedCons.toLowerCase().split(" ")[0].toLowerCase())) return false;
    if (selectedComp !== "all" && item.rec.company !== selectedComp) return false;
    if (selectedStatus === "failed") {
      if (!STATUS_CODES[item.rec.statusCode]?.isFailed) return false;
    } else if (selectedStatus !== "all" && String(item.rec.statusCode) !== selectedStatus) {
      return false;
    }
    return true;
  });

  const recTbody = document.getElementById("globalRecTableBody");
  if (recTbody) {
    if (filteredRecs.length === 0) {
      recTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--text-muted);">${t("emptyTable")}</td></tr>`;
    } else {
      recTbody.innerHTML = filteredRecs.map(item => `
        <tr>
          <th scope="row"><button type="button" class="candidate-link" onclick="openCandidateProfileModal('${item.candidate.id}')">${escapeHtml(item.candidate.name)}</button></th>
          <td>${escapeHtml(item.rec.position)}</td>
          <td><strong>${escapeHtml(item.rec.company)}</strong></td>
          <td>
            <span class="status-count-badge" style="${STATUS_CODES[item.rec.statusCode]?.isFailed ? 'background-color: var(--danger-dot);' : ''}">
              ${item.rec.statusCode}
            </span>
            <small style="display:block; font-size:10px; color:var(--text-muted);">${getStatusName(item.rec.statusCode)}</small>
          </td>
          <td>${escapeHtml(item.rec.consultantName || "Rina")}</td>
          <td>${escapeHtml(item.rec.timestamp)}</td>
          <td style="text-align: left;">
            ${item.rec.reason ? `<em>[${escapeHtml(item.rec.reason)}]</em> ` : ""}
            ${escapeHtml(item.rec.notes || "-")}
          </td>
        </tr>
      `).join("");
    }
  }

  // Render Team Leaderboard (CB-03)
  const leaderTbody = document.getElementById("teamLeaderboardTableBody");
  if (leaderTbody) {
    const activeStaff = USERS.filter(u => u.role === "consultant" || u.role === "manager");
    leaderTbody.innerHTML = activeStaff.map(staff => {
      const staffCandidates = candidates.filter(c => (c.ownerName || "").toLowerCase().includes(staff.name.toLowerCase().split(" ")[0].toLowerCase()));
      const staffRecs = allRecs.filter(item => (item.rec.consultantName || "").toLowerCase().includes(staff.name.toLowerCase().split(" ")[0].toLowerCase()));
      const staffInterviews = staffRecs.filter(item => [20, 21, 22].includes(item.rec.statusCode)).length;
      const staffHires = staffRecs.filter(item => [40, 41].includes(item.rec.statusCode)).length;
      const convRate = staffRecs.length > 0 ? Math.round((staffHires / staffRecs.length) * 100) : 0;
      const targetPercent = Math.min(120, Math.round(((staffHires * 1.5 + staffInterviews * 0.5) / 5) * 100));

      return `
        <tr>
          <th scope="row"><strong>${escapeHtml(staff.name)}</strong></th>
          <td>${escapeHtml(staff.roleName)}</td>
          <td><span class="status-count-badge">${staffCandidates.length}</span></td>
          <td>${staffRecs.length}</td>
          <td>${staffInterviews}</td>
          <td><strong style="color: var(--success-color);">${staffHires}</strong></td>
          <td>${convRate}%</td>
          <td>
            <span style="font-weight: 700; color: ${targetPercent >= 100 ? '#15803d' : 'var(--text-primary)'};">
              ${targetPercent}%
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }
}

/**
 * 12B. CLIENT COMPANIES DIRECTORY
 */
function renderClientCompaniesView() {
  const clientTbody = document.getElementById("clientCompaniesTableBody");
  if (!clientTbody) return;

  const companyMap = {};
  candidates.forEach(c => {
    (c.recommendations || []).forEach(r => {
      const comp = r.company || "Other";
      if (!companyMap[comp]) {
        companyMap[comp] = { name: comp, count: 0, roles: new Set(), latest: r.timestamp };
      }
      companyMap[comp].count += 1;
      companyMap[comp].roles.add(r.position);
    });
  });

  if (Object.keys(companyMap).length === 0) {
    clientTbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 36px 16px; color: var(--text-muted); font-size: 13px;">
          ${t("emptyClientList")}
        </td>
      </tr>
    `;
    return;
  }

  clientTbody.innerHTML = Object.values(companyMap).map(info => `
    <tr>
      <th scope="row"><strong>${escapeHtml(info.name)}</strong></th>
      <td><span class="status-count-badge">${info.count}</span></td>
      <td style="text-align: left;">${[...info.roles].map(r => escapeHtml(r)).join(" • ")}</td>
      <td>${escapeHtml(info.latest)}</td>
    </tr>
  `).join("");
}

/**
 * 12C. ADVANCED DATA ANALYSIS & DEMOGRAPHICS (DA-01 s.d DA-05)
 */
function getAnalyticsScopedCandidates() {
  const range = document.getElementById("analyticsDateRange")?.value || "all";
  const baseList = candidates.filter(c => !c.isDeleted);
  if (range === "all") return baseList;

  const refNow = new Date("2026-11-16T23:59:59");
  let cutoff = new Date("2026-01-01T00:00:00");
  if (range === "30d") {
    cutoff = new Date(refNow.getTime() - 30 * 86400000);
  } else if (range === "quarter") {
    cutoff = new Date(refNow.getTime() - 90 * 86400000);
  }

  return baseList.filter(c => {
    const datePart = String(c.entryTime || "").slice(0, 10);
    if (!datePart) return false;
    const d = new Date(`${datePart}T12:00:00`);
    return !isNaN(d.getTime()) && d >= cutoff;
  });
}

function getAnalyticsStageSummary(list) {
  return {
    totalRaw: list.length,
    totalDivisor: list.length || 1,
    countNew: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "new").length,
    countPending: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pending").length,
    countPass: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pass").length,
    countInterview: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "interview").length,
    countOffer: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "offer").length,
    countEntry: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "entry").length,
    countFailed: list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "failed").length
  };
}

function renderAdvancedAnalytics() {
  const funnelContainer = document.getElementById("funnelVisualContainer");
  const kpiContainer = document.getElementById("analyticsKpiContainer");

  const scopedCandidates = getAnalyticsScopedCandidates();
  const s = getAnalyticsStageSummary(scopedCandidates);
  const total = s.totalDivisor;

  if (funnelContainer) {
    const funnelSteps = [
      { name: "1. New (Code 0)", count: s.countNew, color: "var(--brand-primary)" },
      { name: "2. Pending Client (10, 11)", count: s.countPending, color: "#4f46e5" },
      { name: "3. Original Resume Pass (12)", count: s.countPass, color: "#06b6d4" },
      { name: "4. Interview Stages (20, 21, 22)", count: s.countInterview, color: "#0ea5e9" },
      { name: "5. Offer Issued / Accepted (30, 31)", count: s.countOffer, color: "#8b5cf6" },
      { name: "6. Onboarded / Entry (40, 41)", count: s.countEntry, color: "var(--success-color)" }
    ];

    funnelContainer.innerHTML = funnelSteps.map(step => {
      const pct = Math.round((step.count / total) * 100);
      return `
        <div class="funnel-row">
          <span><strong>${step.name}</strong></span>
          <div class="funnel-bar-track">
            <div class="funnel-bar-fill" style="width: ${Math.max(5, pct)}%; background-color: ${step.color};"></div>
          </div>
          <span style="font-weight: 600;">${step.count} (${pct}%)</span>
        </div>
      `;
    }).join("");
  }

  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="kpi-card"><div>Total Talent Bank</div><div class="kpi-num">${s.totalRaw}</div></div>
      <div class="kpi-card"><div>Active in Pipeline</div><div class="kpi-num">${s.countPending + s.countPass + s.countInterview + s.countOffer}</div></div>
      <div class="kpi-card"><div>Successful Placements</div><div class="kpi-num" style="color: #15803d;">${s.countEntry}</div></div>
      <div class="kpi-card"><div>Rejections / Failed</div><div class="kpi-num" style="color: #b91c1c;">${s.countFailed}</div></div>
    `;
  }

  // Monthly Talent Inflow Chart (DA-02)
  const inflowContainer = document.getElementById("monthlyInflowContainer");
  if (inflowContainer) {
    const monthLabels = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
    const monthCounts = {};
    monthLabels.forEach(m => { monthCounts[m] = 0; });

    scopedCandidates.forEach(c => {
      const ym = String(c.entryTime || "").slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) {
        monthCounts[ym] = (monthCounts[ym] || 0) + 1;
      }
    });

    const orderedMonths = Object.keys(monthCounts).sort().slice(-8);
    const maxMonthCount = Math.max(1, ...orderedMonths.map(m => monthCounts[m]));

    inflowContainer.innerHTML = orderedMonths.map(m => {
      const cnt = monthCounts[m] || 0;
      const heightPct = cnt > 0 ? Math.max(12, Math.round((cnt / maxMonthCount) * 100)) : 4;
      const shortMonth = m.slice(2);
      return `
        <div class="inflow-bar-col">
          <span style="font-weight: 800; color: var(--text-primary); font-size: 13px;">${cnt}</span>
          <div class="inflow-bar-track" title="${m}: ${cnt} candidates">
            <div class="inflow-bar-fill" style="height: ${heightPct}%; ${cnt === 0 ? "opacity: 0.2;" : ""}"></div>
          </div>
          <span style="color: var(--text-secondary);">${shortMonth}</span>
        </div>
      `;
    }).join("");
  }

  // Demographics Distribution (DA-03) + Failed & Consultant Breakdown (DA-01 / DA-04)
  const eduCounts = { undergraduate: 0, master: 0, diploma: 0 };
  const natCounts = {};
  const companyCounts = {};
  const failedCodes = [19, 29, 39, 49, 90, 91];
  const failedCounts = Object.fromEntries(failedCodes.map(code => [code, 0]));
  const consultantStats = {};

  scopedCandidates.forEach(c => {
    const edu = (c.education || "undergraduate").toLowerCase();
    if (eduCounts[edu] !== undefined) eduCounts[edu]++;
    else eduCounts.undergraduate++;

    const nat = c.nationality || "Indonesia";
    natCounts[nat] = (natCounts[nat] || 0) + 1;

    const owner = c.ownerName || "Unassigned";
    if (!consultantStats[owner]) consultantStats[owner] = { handled: 0, placed: 0 };
    consultantStats[owner].handled++;
    const badge = computeCandidateBadge(c);
    if (getStageTabForCode(badge) === "entry") {
      consultantStats[owner].placed++;
    }
    if (failedCounts[badge] !== undefined) {
      failedCounts[badge]++;
    }

    (c.recommendations || []).forEach(r => {
      const comp = r.company || "Other";
      companyCounts[comp] = (companyCounts[comp] || 0) + 1;
    });
  });

  const distEdu = document.getElementById("distEducationContainer");
  if (distEdu) {
    distEdu.innerHTML = Object.entries(eduCounts).map(([key, count]) => {
      const p = Math.round((count / total) * 100);
      return `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><span>${key}</span><span>${count} (${p}%)</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${p}%;"></div></div>
        </div>
      `;
    }).join("");
  }

  const distNat = document.getElementById("distNationalityContainer");
  if (distNat) {
    distNat.innerHTML = Object.entries(natCounts).map(([key, count]) => {
      const p = Math.round((count / total) * 100);
      return `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><span>${key}</span><span>${count} (${p}%)</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${p}%; background-color: #06b6d4;"></div></div>
        </div>
      `;
    }).join("");
  }

  const distComp = document.getElementById("distCompaniesContainer");
  if (distComp) {
    const topComps = Object.entries(companyCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    distComp.innerHTML = topComps.map(([key, count]) => {
      const p = Math.round((count / total) * 100);
      return `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><strong>${escapeHtml(key)}</strong><span>${count} recs</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${Math.min(100, p * 2)}%; background-color: var(--success-color);"></div></div>
        </div>
      `;
    }).join("");
  }

  const distFailedAndCons = document.getElementById("distFailedAndConsContainer");
  if (distFailedAndCons) {
    const failedRows = failedCodes
      .map(code => ({ code, label: getStatusName(code), count: failedCounts[code] || 0 }))
      .filter(item => item.count > 0);

    const failedHtml = (failedRows.length > 0 ? failedRows : [{ code: 0, label: "No failed/rejected candidates in range", count: 0 }])
      .map(item => `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><span>${item.code ? `Code ${item.code}: ` : ""}${escapeHtml(item.label)}</span><span>${item.count}</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${item.count ? Math.max(10, Math.round((item.count / total) * 100)) : 0}%; background-color: var(--danger-dot);"></div></div>
        </div>
      `).join("");

    const consHtml = Object.entries(consultantStats)
      .sort((a, b) => b[1].placed - a[1].placed || b[1].handled - a[1].handled)
      .slice(0, 4)
      .map(([name, st]) => `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><strong>${escapeHtml(name)}</strong><span>${st.placed} hired / ${st.handled} total</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${Math.max(6, Math.round((st.handled / total) * 100))}%; background-color: #8b5cf6;"></div></div>
        </div>
      `).join("");

    distFailedAndCons.innerHTML = `
      <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Failed Reasons (19/29/39/49/90/91)</div>
      ${failedHtml}
      <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 8px;">Consultant Placements</div>
      ${consHtml}
    `;
  }
}

function exportAnalyticsCsv() {
  const scoped = getAnalyticsScopedCandidates();
  const s = getAnalyticsStageSummary(scoped);
  const total = s.totalDivisor;

  const rows = [
    ["Metric / Stage", "Count", "Percentage"],
    ["Total Talent Bank", s.totalRaw, "100%"],
    ["New Candidates (Code 0)", s.countNew, `${Math.round((s.countNew/total)*100)}%`],
    ["Pending Review (10, 11)", s.countPending, `${Math.round((s.countPending/total)*100)}%`],
    ["Resume Pass (12)", s.countPass, `${Math.round((s.countPass/total)*100)}%`],
    ["Interviews (20-22)", s.countInterview, `${Math.round((s.countInterview/total)*100)}%`],
    ["Offers (30, 31)", s.countOffer, `${Math.round((s.countOffer/total)*100)}%`],
    ["Hired / Entry (40, 41)", s.countEntry, `${Math.round((s.countEntry/total)*100)}%`],
    ["Failed / Resigned (x9, 90)", s.countFailed, `${Math.round((s.countFailed/total)*100)}%`]
  ];

  const csvContent = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Analytics_Pipeline_Summary_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Exported Analytics Summary CSV.");
}

/**
 * 12D. AUDIT LOGS VIEW
 */
function renderAuditLogsView() {
  const auditTbody = document.getElementById("auditLogsTableBody");
  if (auditTbody) {
    const logs = getStoredAuditLogs();
    auditTbody.innerHTML = logs.map(l => `
      <tr>
        <th scope="row"><code>${escapeHtml(l.id)}</code></th>
        <td><strong>${escapeHtml(l.action)}</strong></td>
        <td>${escapeHtml(l.entity)}</td>
        <td style="text-align: left;">${escapeHtml(l.details)}</td>
        <td>${escapeHtml(l.user)}</td>
        <td>${escapeHtml(l.timestamp)}</td>
      </tr>
    `).join("");
  }
}

/**
 * 12E. USER MANAGEMENT & ROLE PERMISSIONS (PG-01)
 */
function renderUserManagementList() {
  USERS = getStoredUsers();
  const userTbody = document.getElementById("settingsUserListTableBody");
  if (!userTbody) return;

  userTbody.innerHTML = USERS.map((u, i) => `
    <tr>
      <th scope="row"><code>${escapeHtml(u.id)}</code></th>
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td><span class="status-count-badge" style="background-color: var(--brand-primary); color: #161922; font-weight: 800;">${escapeHtml(u.roleName)}</span></td>
      <td>${escapeHtml(u.email || "-")} ${u.clientCompany ? `<br><small style="color:var(--text-muted);">(Client: ${escapeHtml(u.clientCompany)})</small>` : ""}</td>
      <td>
        <span style="font-size: 11px; font-weight: 600; color: ${u.active !== false ? 'var(--success-color)' : 'var(--danger-dot)'};">
          ${u.active !== false ? '● Active' : '○ Inactive'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn-outlined" style="padding: 2px 6px; font-size: 11px;" onclick="toggleUserStatus('${u.id}')">
            ${u.active !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" class="btn-outlined" style="padding: 2px 6px; font-size: 11px;" onclick="resetUserPassword('${u.id}')">
            Reset Pwd
          </button>
          ${USERS.length > 1 ? `
            <button type="button" class="btn-outlined" style="padding: 2px 6px; font-size: 11px; color: var(--danger-dot);" onclick="deleteUser('${u.id}')">
              ✕
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");

  // Update role selector dropdown in header
  const roleSelect = document.getElementById("roleSelect");
  if (roleSelect) {
    roleSelect.innerHTML = USERS.map(u => `
      <option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>
    `).join("");
    roleSelect.value = activeUser.id;
  }
}

function handleAddUser(e) {
  e.preventDefault();
  const name = document.getElementById("newUserName")?.value.trim();
  const email = document.getElementById("newUserEmail")?.value.trim();
  const role = document.getElementById("newUserRole")?.value || "consultant";
  const clientCompany = document.getElementById("newUserClientCompany")?.value.trim();

  if (!name || !email) return;

  const roleNames = {
    consultant: "Consultant (Recruiter)",
    manager: "Team Manager",
    superadmin: "Super Admin (IT)",
    client: `Client HR (${clientCompany || 'External'})`
  };

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role,
    roleName: roleNames[role] || "Staff",
    avatar: name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    clientCompany: role === "client" ? clientCompany : undefined,
    active: true
  };

  USERS = getStoredUsers();
  USERS.push(newUser);
  saveUsers(USERS);
  addAuditLog("CREATE_USER", `User ${name}`, `Created user account with role ${role}`);
  e.target.reset();
  renderUserManagementList();
  showToast(`Created user: ${name} (${role})`);
}

function toggleUserStatus(userId) {
  USERS = getStoredUsers();
  const target = USERS.find(u => u.id === userId);
  if (target) {
    target.active = target.active === false ? true : false;
    saveUsers(USERS);
    addAuditLog("USER_STATUS_TOGGLE", `User ${target.name}`, `Set active status to ${target.active}`);
    renderUserManagementList();
    showToast(`User ${target.name} is now ${target.active ? 'Active' : 'Inactive'}`);
  }
}

async function resetUserPassword(userId) {
  USERS = getStoredUsers();
  const target = USERS.find(u => u.id === userId);
  if (target) {
    const ok = await showConfirmDialog({
      title: t("dialogResetPasswordTitle"),
      message: t("dialogResetPasswordMsg").replace("{name}", target.name).replace("{email}", target.email),
      confirmText: t("btnSave"),
      cancelText: t("btnCancel"),
      type: "warning"
    });
    if (ok) {
      addAuditLog("RESET_PASSWORD", `User ${target.name}`, `Temporary password generated`);
      showToast(t("msgPasswordResetSent").replace("{email}", target.email));
    }
  }
}

async function deleteUser(userId) {
  USERS = getStoredUsers();
  const index = USERS.findIndex(u => u.id === userId);
  if (index >= 0) {
    const userName = USERS[index].name;
    const ok = await showConfirmDialog({
      title: t("dialogDeleteUserTitle"),
      message: t("dialogDeleteUserMsg").replace("{name}", userName),
      confirmText: t("btnDeletePermanent"),
      cancelText: t("btnCancel"),
      type: "danger"
    });
    if (ok) {
      const removed = USERS.splice(index, 1)[0];
      saveUsers(USERS);
      addAuditLog("DELETE_USER", `User ${removed.name}`, `Deleted user account`);
      renderUserManagementList();
      showToast(t("msgUserRemoved").replace("{name}", removed.name));
    }
  }
}

/**
 * 12F. CLIENT PORTAL ACTIONS (Phase 2 Client Experience)
 */
function clientApproveInterview(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;
  const targetComp = activeUser.clientCompany || "alauda";
  const rec = (c.recommendations || []).find(r => r.company.toLowerCase() === targetComp.toLowerCase()) ||
              c.recommendations?.[0];
  if (rec) {
    rec.statusCode = 12; // Original resume pass
    rec.notes = `Approved for interview by Client HR ${activeUser.name} (${targetComp}).`;
    addAuditLog("CLIENT_APPROVE", `Candidate ${c.name}`, `Client ${activeUser.name} approved CV for interview (Code 12)`);
    notifications.unshift({
      id: `NT-${Date.now()}`,
      title: "Client Approved CV for Interview!",
      message: `${targetComp} approved ${c.name} for ${rec.position}. Ready for interview scheduling.`,
      time: formatTimestamp(new Date()),
      read: false,
      candidateId: c.id
    });
    saveNotifications(notifications);
    saveCandidates(candidates);
    renderAllViews();
    showToast(`Approved interview for ${c.name} (Code 12)`);
  }
}

function clientRejectResume(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;
  const reason = prompt(`Please provide client feedback reason for rejecting ${c.name}:`, "Experience profile does not match current project requirements.");
  if (!reason || !reason.trim()) return;

  const targetComp = activeUser.clientCompany || "alauda";
  const rec = (c.recommendations || []).find(r => r.company.toLowerCase() === targetComp.toLowerCase()) ||
              c.recommendations?.[0];
  if (rec) {
    rec.statusCode = 19; // Resume rejected
    rec.reason = reason.trim();
    rec.notes = `Rejected by Client ${activeUser.name}: ${reason.trim()}`;
    addAuditLog("CLIENT_REJECT", `Candidate ${c.name}`, `Client rejected CV. Reason: ${reason.trim()}`);
    notifications.unshift({
      id: `NT-${Date.now()}`,
      title: "Client Rejected CV",
      message: `${targetComp} rejected ${c.name}. Reason: ${reason.trim()}`,
      time: formatTimestamp(new Date()),
      read: false,
      candidateId: c.id
    });
    saveNotifications(notifications);
    saveCandidates(candidates);
    renderAllViews();
    showToast(`Marked ${c.name} as Resume Rejected (Code 19)`);
  }
}

/**
 * 12G. INTERACTIVE DEMO SCENARIOS RUNNER (7 Clickable Scenarios)
 */
function runDemoScenario(index) {
  document.getElementById("demoGuideModal")?.close();

  switch (index) {
    case 1: {
      // Scenario 1: Rule 1 - Duplicate Active Block (Andi Candera at alauda)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openRecRepeatModal("CND-1001");
        setTimeout(() => {
          const compInput = document.getElementById("recRepeatCompany");
          if (compInput) {
            compInput.value = "alauda";
            compInput.dispatchEvent(new Event("input"));
          }
        }, 150);
      }, 200);
      break;
    }
    case 2: {
      // Scenario 2: Rule 2 - Recent Entry Block (Clarissa Wijaya code 40 at ByteDance)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openRecRepeatModal("CND-1004");
      }, 200);
      break;
    }
    case 3: {
      // Scenario 3: Rule 3 - Re-apply after failure requires justification (Fajar Nugroho at Midea)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openRecRepeatModal("CND-1005");
        setTimeout(() => {
          const compInput = document.getElementById("recRepeatCompany");
          if (compInput) {
            compInput.value = "Midea";
            compInput.dispatchEvent(new Event("input"));
          }
        }, 150);
      }, 200);
      break;
    }
    case 4: {
      // Scenario 4: Rule 4 - Cross-Consultant Manager Approval
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        const cnd = candidates.find(c => c.id === "CND-1002");
        if (cnd) cnd.ownerName = "Budi Hartono";
        openRecRepeatModal("CND-1002");
      }, 200);
      break;
    }
    case 5: {
      // Scenario 5: Client Portal Experience (David Chen at alauda)
      switchActiveUser("USR-04");
      switchWorkspaceView("resumeLib");
      showToast("Switched to Client Portal mode (HR alauda). Reviewing submitted CVs.");
      break;
    }
    case 6: {
      // Scenario 6: Offer Accepted (31) Auto-Closing Parallel Pipelines
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openCandidateProfileModal("CND-1001");
        showToast("Select Code 31 (Offer Accepted) in Manage Recommendations to test auto-closing other pipelines.");
      }, 200);
      break;
    }
    case 7: {
      // Scenario 7: CSV Bulk Import & Duplicate Check
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        const modal = document.getElementById("importCsvModal");
        const pasteBox = document.getElementById("csvPasteInput");
        if (pasteBox) {
          pasteBox.value = [
            "Candidate Name,Nationality,Gender,Birth Date,Education,Language,Years of Service,Recommended Position,Recommended Company,Email,Phone,Summary",
            "Andi Candera,Indonesia,Male,2000-04-12,undergraduate,\"Indonesian, English\",9,Presales Lead,alauda,andi.c@example.id,+628123456701,Duplicate test record matching birthdate and name",
            "Siti Rahmawati,Indonesia,Female,1997-08-20,master,\"Indonesian, English\",6,Product Designer,Gojek,siti.r@example.id,+628198765432,New unique candidate for import test"
          ].join("\n");
        }
        modal?.showModal();
      }, 200);
      break;
    }
    case 8: {
      // Scenario 8: Public Career Portal & Candidate Self-Application (Fase 4A)
      switchWorkspaceView("careerPortal");
      setTimeout(() => {
        openApplyJobModal("JOB-01");
        setTimeout(() => {
          const nameInput = document.getElementById("applyFullName");
          const emailInput = document.getElementById("applyEmail");
          const phoneInput = document.getElementById("applyPhone");
          const yearsInput = document.getElementById("applyYears");
          const salaryInput = document.getElementById("applySalary");
          const coverInput = document.getElementById("applyCoverLetter");
          if (nameInput) nameInput.value = "Rian Pratama";
          if (emailInput) emailInput.value = "rian.pratama@cloudexpert.id";
          if (phoneInput) phoneInput.value = "+6281298765432";
          if (yearsInput) yearsInput.value = 8;
          if (salaryInput) salaryInput.value = "IDR 32,000,000";
          if (coverInput) coverInput.value = "8 years experience architecting Kubernetes clusters and multi-cloud solutions at tier-1 fintech.";
          showToast("Demo 8: Review application and click 'Submit Application' to ingest into Resume Lib!");
        }, 150);
      }, 200);
      break;
    }
    case 9: {
      // Scenario 9: Interview Calendar, Scheduler & .ICS Export (Fase 4B)
      switchWorkspaceView("interviewCalendar");
      setTimeout(() => {
        openScheduleInterviewModal("CND-1002");
        setTimeout(() => {
          const notesInput = document.getElementById("intNotes");
          if (notesInput) notesInput.value = "System design and distributed caching round with VP of Engineering.";
          showToast("Demo 9: Click 'Confirm & Download .ICS' to export calendar file and advance status to Code 20!");
        }, 150);
      }, 200);
      break;
    }
    case 10: {
      // Scenario 10: Official Employment Offer Letter & Code 30 Workflow (Fase 4C)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openOfferLetterModal("CND-1007");
        showToast("Demo 10: Formal employment offer generated! Test Print or click 'Issue Formal Offer' to advance to Code 30.");
      }, 200);
      break;
    }
    case 11: {
      // Scenario 11: Smart Heuristic CV Parser & Auto-Fill (Fase 4D)
      populateCompanyAndPositionSelects("addCompanySelect", "addPositionSelect");
      document.getElementById("addCandidateModal")?.showModal();
      setTimeout(() => {
        const rawBox = document.getElementById("rawCvParseText");
        if (rawBox) {
          rawBox.value = [
            "MAYA INDAH KUSUMA",
            "Email: maya.indah@fintech.co.id | Phone: +62 813-8899-7711",
            "Domicile: Jakarta Selatan | LinkedIn: linkedin.com/in/mayaindah",
            "",
            "PROFESSIONAL SUMMARY:",
            "Results-driven Senior Backend Engineer with 6 years of experience building high-throughput microservices using Go, Docker, Kubernetes, PostgreSQL, and Kafka. Graduated with undergraduate degree in Computer Science.",
            "",
            "CORE SKILLS:",
            "Golang, Docker, Kubernetes, PostgreSQL, Redis, Microservices, CI/CD, AWS",
            "",
            "EXPERIENCE:",
            "Senior Backend Engineer - FinTech Unicorn (2021 - Present)",
            "- Architected real-time transaction processing pipeline processing 5,000 TPS."
          ].join("\n");
          handleRunCvParser();
          showToast("Demo 11: CV automatically parsed! Notice how Name, Email, Phone, Exp, and Education auto-filled.");
        }
      }, 200);
      break;
    }
    case 12: {
      // Scenario 12: Visual Kanban Pipeline Drag & Drop (Fase 5A)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        switchResumeViewMode("kanban");
        showToast("Demo 12: Switched to Kanban Board! Drag cards across stages or use card dropdowns.");
      }, 150);
      break;
    }
    case 13: {
      // Scenario 13: Digital E-Signature & Official Offer Acceptance Code 31 (Fase 5B)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        openOfferLetterModal("CND-1007");
        setTimeout(() => {
          const signInput = document.getElementById("offerSignatureInput");
          if (signInput) signInput.value = "Gilang Ramadhan";
          showToast("Demo 13: Confirm Start Date and click 'Sign & Accept Offer (Code 31)' to complete E-Sign!");
        }, 150);
      }, 200);
      break;
    }
    case 14: {
      // Scenario 14: Placement Fee & 90-Day Probation Warranty Tracker (Fase 5C)
      switchWorkspaceView("recList");
      setTimeout(() => {
        switchCbTab("warranty");
        showToast("Demo 14: Viewing active placement fees (18%) & 90-day probation warranty expiration tracker.");
      }, 150);
      break;
    }
    case 15: {
      // Scenario 15: Post New Client Job Order to Career Portal (Fase 5D)
      switchWorkspaceView("careerPortal");
      setTimeout(() => {
        const modal = document.getElementById("postJobModal");
        const t = document.getElementById("postJobTitle");
        const c = document.getElementById("postJobCompany");
        const s = document.getElementById("postJobSalary");
        const tags = document.getElementById("postJobTags");
        const desc = document.getElementById("postJobDesc");
        if (t) t.value = "Principal Staff SRE Engineer";
        if (c) c.value = "alauda";
        if (s) s.value = "IDR 42M - 55M / month";
        if (tags) tags.value = "Kubernetes, Terraform, Prometheus, Go";
        if (desc) desc.value = "Lead platform reliability engineering and multi-region Kubernetes cluster automation across APAC enterprise clients.";
        modal?.showModal();
        showToast("Demo 15: Review job requisition details and click 'Publish to Career Portal'!");
      }, 200);
      break;
    }
    case 16: {
      // Scenario 16: Multi-Select Batch Operations Toolbar (Fase 6A)
      switchWorkspaceView("resumeLib");
      switchResumeViewMode("table");
      setTimeout(() => {
        selectedCandidateIds.clear();
        const checks = Array.from(document.querySelectorAll("#resumeTableBody .candidate-row-check")).slice(0, 2);
        checks.forEach(cb => {
          const cid = cb.value || cb.getAttribute("data-id");
          if (cid) {
            cb.checked = true;
            selectedCandidateIds.add(cid);
          }
        });
        updateBatchToolbarUI();
        showToast(`Demo 16: Selected ${selectedCandidateIds.size} candidates! Try Batch Recommend, Batch Tag, or Archive.`);
      }, 200);
      break;
    }
    case 17: {
      // Scenario 17: Candidate WhatsApp & Email Outreach Generator (Fase 6B)
      switchWorkspaceView("resumeLib");
      setTimeout(() => {
        const targetCand = candidates.find(c => c.id === "CND-1001" && !c.isDeleted) || candidates.find(c => !c.isDeleted);
        if (targetCand) {
          openOutreachModal(targetCand.id, "interview_invite");
          showToast(`Demo 17: Outreach draft ready for ${targetCand.name} (WhatsApp / Email).`);
        }
      }, 150);
      break;
    }
    case 18: {
      // Scenario 18: Monthly Talent Inflow & Failed/Consultant Analytics (Fase 6C)
      const rangeSel = document.getElementById("analyticsDateRange");
      if (rangeSel) rangeSel.value = "all";
      switchWorkspaceView("pipelineReport");
      setTimeout(() => {
        renderAdvancedAnalytics();
        document.getElementById("monthlyInflowContainer")?.scrollIntoView({ behavior: "smooth", block: "center" });
        showToast("Demo 18: Viewing Monthly Inflow Chart (DA-02), Failed Stage Reasons (DA-01) & Consultant Placements (DA-04).");
      }, 150);
      break;
    }
  }
}

async function resetAllDemoData() {
  const ok = await showConfirmDialog({
    title: t("confirmResetDbTitle"),
    message: t("confirmResetDbMsg"),
    confirmText: t("btnConfirm"),
    cancelText: t("btnCancel"),
    type: "danger"
  });
  if (ok) {
    localStorage.clear();
    candidates = getStoredCandidates();
    notifications = getStoredNotifications();
    masterCompanies = getStoredMasterCompanies();
    masterPositions = getStoredMasterPositions();
    masterLanguages = getStoredMasterLanguages();
    masterCountries = getStoredMasterCountries();
    selectedCandidateIds.clear();
    resumeViewMode = "table";
    USERS = getStoredUsers();
    activeUser = USERS[0];
    openJobs = getStoredOpenJobs();
    scheduledInterviews = getStoredInterviews();
    systemSettings = getStoredSystemSettings();
    document.getElementById("demoGuideModal")?.close();
    updateBatchToolbarUI();
    renderAllViews();
    applyRolePermissions();
    showToast("All data successfully restored to default demo state.");
  }
}

function renderMasterChipList(listEl, items, deleteFnName) {
  if (!listEl) return;
  listEl.innerHTML = items.map((item, i) => `
    <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid var(--border-table);">
      <span>${escapeHtml(item)}</span>
      <button type="button" class="btn-outlined" onclick="${deleteFnName}(${i})" style="padding: 2px 6px; font-size: 11px;">✕</button>
    </li>
  `).join("");
}

function renderMasterDataLists() {
  renderMasterChipList(document.getElementById("settingsCompanyList"), masterCompanies, "deleteMasterCompany");
  renderMasterChipList(document.getElementById("settingsPositionList"), masterPositions, "deleteMasterPosition");
  renderMasterChipList(document.getElementById("settingsLanguageList"), masterLanguages, "deleteMasterLanguage");
  renderMasterChipList(document.getElementById("settingsCountryList"), masterCountries, "deleteMasterCountry");

  const statusDictBody = document.getElementById("settingsStatusDictTableBody");
  if (statusDictBody) {
    const entries = Object.values(STATUS_CODES).sort((a, b) => a.code - b.code);
    statusDictBody.innerHTML = entries.map(st => {
      let ruleFlag = "Active Pipeline";
      let flagColor = "var(--brand-primary)";
      if (st.isFailed) {
        ruleFlag = "Terminal Failed";
        flagColor = "var(--danger-dot)";
      } else if (st.code >= 40) {
        ruleFlag = "Locked / Onboarded";
        flagColor = "var(--success-color)";
      } else if (st.code === 31) {
        ruleFlag = "Signed Offer (Auto-close 90)";
        flagColor = "#8b5cf6";
      }
      return `
        <tr>
          <th scope="row"><strong>${st.code}</strong></th>
          <td>${escapeHtml(st.nameEn)}</td>
          <td>${escapeHtml(st.nameId)}</td>
          <td><code>${escapeHtml(st.tab)}</code></td>
          <td><span style="font-size: 11px; font-weight: 600; color: ${flagColor};">${ruleFlag}</span></td>
        </tr>
      `;
    }).join("");
    syncTableResponsiveLabels();
  }
}

function populateCompanyAndPositionSelects(compId, posId) {
  const compSelect = document.getElementById(compId);
  const posSelect = document.getElementById(posId);

  if (compSelect) {
    compSelect.innerHTML = masterCompanies.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  }
  if (posSelect) {
    posSelect.innerHTML = masterPositions.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join("");
  }
}

function addMasterDictionaryItem(e, inputId, list, saveFn, label) {
  e.preventDefault();
  const input = document.getElementById(inputId);
  const val = input?.value.trim();
  if (!val) return;
  if (!list.includes(val)) {
    list.push(val);
    saveFn(list);
    input.value = "";
    renderMasterDataLists();
    showToast(`Added ${label}: ${val}`);
  } else {
    showToast(`${label} "${val}" already exists.`);
  }
}

async function deleteMasterDictionaryItem(list, index, saveFn, label) {
  if (index < 0 || index >= list.length) return;
  const itemVal = list[index];
  const ok = await showConfirmDialog({
    title: t("confirmDeleteMasterTitle"),
    message: t("confirmDeleteMasterMsg").replace("{label}", label).replace("{name}", itemVal),
    confirmText: t("btnDelete"),
    cancelText: t("btnCancel"),
    type: "danger"
  });
  if (ok) {
    list.splice(index, 1);
    saveFn(list);
    renderMasterDataLists();
  }
}

function handleAddMasterCompany(e) {
  addMasterDictionaryItem(e, "newMasterCompanyName", masterCompanies, saveMasterCompanies, "client company");
}

function deleteMasterCompany(index) {
  deleteMasterDictionaryItem(masterCompanies, index, saveMasterCompanies, "client company");
}

function handleAddMasterPosition(e) {
  addMasterDictionaryItem(e, "newMasterPositionName", masterPositions, saveMasterPositions, "position");
}

function deleteMasterPosition(index) {
  deleteMasterDictionaryItem(masterPositions, index, saveMasterPositions, "position");
}

function handleAddMasterLanguage(e) {
  addMasterDictionaryItem(e, "newMasterLanguageName", masterLanguages, saveMasterLanguages, "language");
}

function deleteMasterLanguage(index) {
  deleteMasterDictionaryItem(masterLanguages, index, saveMasterLanguages, "language");
}

function handleAddMasterCountry(e) {
  addMasterDictionaryItem(e, "newMasterCountryName", masterCountries, saveMasterCountries, "country");
}

function deleteMasterCountry(index) {
  deleteMasterDictionaryItem(masterCountries, index, saveMasterCountries, "country");
}

/**
 * 13. DIALOG LIGHT-DISMISS FALLBACK & HELPERS
 */
function updateProfileFullscreenBtnState(isFull) {
  const btn = document.getElementById("btnToggleProfileFullscreen");
  if (!btn) return;
  btn.title = isFull ? t("btnRestore") : t("btnMaximize");
}

function toggleProfileModalFullscreen(force) {
  const modal = document.getElementById("profileModal");
  if (!modal) return;
  const isCurrentlyFull = modal.classList.contains("is-fullscreen");
  const shouldBeFull = typeof force === "boolean" ? force : !isCurrentlyFull;
  modal.classList.toggle("is-fullscreen", shouldBeFull);
  try {
    localStorage.setItem("profile_modal_fullscreen", shouldBeFull ? "true" : "false");
  } catch (e) {}
  updateProfileFullscreenBtnState(shouldBeFull);
}

function setupDialogLightDismiss() {
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", e => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener("pointerup", e => { if (pressedOutside && outside(e, dialog)) closeDialogSmooth(dialog); });
    }
  }

  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = btn.closest("dialog");
      if (d) closeDialogSmooth(d);
    });
  });

  // Profile Modal Fullscreen toggle & titlebar dblclick
  const btnFs = document.getElementById("btnToggleProfileFullscreen");
  const profileDialog = document.getElementById("profileModal");
  if (btnFs && profileDialog) {
    btnFs.addEventListener("click", () => {
      toggleProfileModalFullscreen();
    });
  }

  const profileHeader = profileDialog?.querySelector(".modal-header");
  if (profileHeader) {
    profileHeader.addEventListener("dblclick", (e) => {
      if (e.target.closest("button")) return;
      toggleProfileModalFullscreen();
    });
  }

  // Smooth exit on Esc key cancel event
  document.querySelectorAll("dialog").forEach(dialog => {
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialogSmooth(dialog);
    });
  });
}

function renderAllViews() {
  renderColumnSelector();
  renderResumeTable();
  renderSecondaryViews();
}

function formatTimestamp(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const item = document.createElement("div");
  item.className = "toast-msg";
  item.textContent = msg;
  stack.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}

/**
 * ====================================================================
 * 14. PHASE 4: ADVANCED ENTERPRISE ATS MODULES
 * ====================================================================
 */

/**
 * 14A. PUBLIC CAREER PORTAL / JOB BOARD (Fase 4A)
 */
function renderCareerPortal() {
  const container = document.getElementById("jobBoardContainer");
  const filterComp = document.getElementById("careerFilterCompany");
  const searchInput = document.getElementById("careerSearchQuery");
  if (!container) return;

  // Populate company filter if not populated yet
  if (filterComp && filterComp.options.length <= 1) {
    const companies = [...new Set(openJobs.map(j => j.company))].sort();
    companies.forEach(comp => {
      const opt = document.createElement("option");
      opt.value = comp;
      opt.textContent = comp;
      filterComp.appendChild(opt);
    });
  }

  const selectedComp = filterComp ? filterComp.value : "all";
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = openJobs.filter(job => {
    if (selectedComp !== "all" && job.company !== selectedComp) return false;
    if (query) {
      const matchText = `${job.title} ${job.company} ${job.location} ${job.type} ${(job.tags || []).join(" ")} ${job.description || ""}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-base); border-radius: 6px;">
        <p style="font-size: 14px; font-weight: 500;">No open positions found matching your criteria.</p>
        <p style="font-size: 12px; margin-top: 4px;">Try clearing filters or search query.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(job => `
    <div class="job-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div>
          <span class="job-company-badge">${escapeHtml(job.company)}</span>
          <h3 class="job-title" style="margin-top: 6px;">${escapeHtml(job.title)}</h3>
          <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 3px;">
            ${escapeHtml(job.department || "Engineering")} • ${escapeHtml(job.location)} • ${escapeHtml(job.type || "Full-time")}
          </p>
        </div>
        <span class="job-salary-tag">${escapeHtml(job.salaryRange || "Competitive")}</span>
      </div>

      <p style="font-size: 12.5px; color: var(--text-base); margin-top: 10px; line-height: 1.45;">
        ${escapeHtml(job.description || "")}
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">
        ${(job.tags || []).map(tag => `<span class="parse-extracted-badge">${escapeHtml(tag)}</span>`).join("")}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-base); font-size: 11.5px; color: var(--text-muted);">
        <span>Posted: ${escapeHtml(job.postedDate || "Recent")} • Exp: ${escapeHtml(job.experienceReq || job.experienceRequired || "3+ yrs")}</span>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button type="button" class="btn-outlined" onclick="openEditJobModal('${job.id}')" style="height: 26px; font-size: 11px; padding: 0 9px; display: inline-flex; align-items: center; gap: 4px;" title="Edit Lowongan">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
          <button type="button" class="btn-solid" onclick="openApplyJobModal('${job.id}')" style="height: 26px; font-size: 11.5px; padding: 0 10px;">
            ${t("btnApplyJob")}
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function openApplyJobModal(jobId) {
  const job = openJobs.find(j => j.id === jobId) || openJobs[0];
  if (!job) return;

  const modal = document.getElementById("applyJobModal");
  const banner = document.getElementById("applyJobSummaryBanner");
  const idInput = document.getElementById("applyJobId");

  if (idInput) idInput.value = job.id;
  if (banner) {
    banner.innerHTML = `
      <div style="color: var(--text-primary); font-size: 13.5px; font-weight: 700;">Applying for: <strong>${escapeHtml(job.title)}</strong> at <strong>${escapeHtml(job.company)}</strong></div>
      <div style="font-size: 11.5px; color: var(--text-secondary); font-weight: normal; margin-top: 2px;">
        Location: ${escapeHtml(job.location)} | Salary: ${escapeHtml(job.salaryRange)}
      </div>
    `;
  }

  // Reset form inputs
  const form = document.getElementById("formApplyJob");
  if (form) form.reset();
  if (idInput) idInput.value = job.id;
  resetCvUploadUi("apply");

  modal?.showModal();
}

function handleApplyJobSubmit(e) {
  e.preventDefault();
  const jobId = document.getElementById("applyJobId")?.value;
  const fullName = document.getElementById("applyFullName")?.value.trim();
  const email = document.getElementById("applyEmail")?.value.trim();
  const phone = document.getElementById("applyPhone")?.value.trim();
  const years = parseInt(document.getElementById("applyYears")?.value, 10) || 0;
  const education = document.getElementById("applyEducation")?.value || "undergraduate";
  const salary = document.getElementById("applySalary")?.value.trim() || "Negotiable";
  const coverLetter = document.getElementById("applyCoverLetter")?.value.trim();

  if (!fullName || !email) {
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertFillRequired"),
      type: "warning",
      okText: t("btnUnderstood")
    });
    return;
  }

  const job = openJobs.find(j => j.id === jobId);
  const candidateId = `CND-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const nowFormatted = formatTimestamp(now);
  const uploadedCv = pendingUploadedCvData && pendingUploadedCvData.mode === "apply" ? pendingUploadedCvData : null;
  const parsedExtra = uploadedCv?.parsed || {};

  const newCand = {
    id: candidateId,
    name: fullName,
    nationality: parsedExtra.nationality || "Indonesia",
    gender: parsedExtra.gender || "Male",
    birthDate: parsedExtra.birthDate || "1996-01-01",
    education: education,
    language: parsedExtra.language || "Indonesian, English",
    yearsOfService: years,
    email: email,
    phone: phone,
    whatsapp: phone,
    domicile: parsedExtra.domicile || (job ? job.location.split(",")[0] : "Jakarta"),
    salaryExpectation: salary,
    currentSalary: "-",
    availability: "1 month notice",
    recommendedPosition: job ? job.title : (parsedExtra.position || "Candidate"),
    recommendedCompany: job ? job.company : "General",
    skills: Array.isArray(parsedExtra.skills) && parsedExtra.skills.length > 0 ? parsedExtra.skills : undefined,
    summary: parsedExtra.summary || coverLetter || "",
    workHistory: Array.isArray(parsedExtra.workHistory) && parsedExtra.workHistory.length > 0 ? parsedExtra.workHistory : undefined,
    educationHistory: Array.isArray(parsedExtra.educationHistory) && parsedExtra.educationHistory.length > 0 ? parsedExtra.educationHistory : undefined,
    cvVersions: uploadedCv ? [{
      version: `v1 (${uploadedCv.fileName})`,
      uploadedAt: nowFormatted,
      uploadedBy: fullName,
      content: `[Uploaded CV File: ${uploadedCv.fileName}]\n\n${uploadedCv.rawText}`
    }] : undefined,
    ownerName: activeUser.name,
    entryTime: nowFormatted,
    isUnviewed: true,
    recommendations: [
      {
        id: `REC-${Date.now()}`,
        candidateId: candidateId,
        company: job ? job.company : "General",
        position: job ? job.title : "Candidate",
        statusCode: 0,
        statusText: "New",
        timestamp: nowFormatted,
        consultantName: activeUser.name,
        notes: `Application via Public Career Portal for ${job ? job.title : "Position"}. Cover note: ${coverLetter || "N/A"}`,
        isActive: true
      }
    ]
  };

  candidates.unshift(newCand);
  saveCandidates(candidates);
  resetCvUploadUi("apply");

  addAuditLog(
    "CAREER_PORTAL_APPLY",
    `Candidate ${fullName}`,
    `Submitted application for ${job ? job.title : "role"} at ${job ? job.company : "company"} (${candidateId})`
  );

  notifications.unshift({
    id: `NT-${Date.now()}`,
    title: `New Career Portal Application: ${fullName}`,
    message: `${fullName} submitted an application for ${job ? job.title : "Open Role"} at ${job ? job.company : "Client"}.`,
    timestamp: nowFormatted,
    read: false,
    type: "candidate"
  });
  saveNotifications(notifications);

  document.getElementById("applyJobModal")?.close();
  showToast(`Application submitted! ${fullName} added to Resume Lib with Code 0 (New).`);

  switchWorkspaceView("resumeLib");
  renderAllViews();
}

/**
 * 14B. INTERVIEW CALENDAR & .ICS SCHEDULER (Fase 4B)
 */
function renderInterviewCalendar() {
  const container = document.getElementById("interviewAgendaContainer");
  if (!container) return;

  if (scheduledInterviews.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-surface); border: 1px dashed var(--border-base); border-radius: 6px;">
        <p style="font-size: 14px; font-weight: 500;">No scheduled interviews yet.</p>
        <p style="font-size: 12px; margin-top: 4px;">Click "+ Schedule Interview" to set up a candidate interview round.</p>
      </div>
    `;
    return;
  }

  // Sort by dateTime ascending
  const sorted = [...scheduledInterviews].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  container.innerHTML = sorted.map(item => {
    const d = new Date(item.dateTime);
    const dateStr = !isNaN(d) ? d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : item.dateTime;
    const timeStr = !isNaN(d) ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : "";
    const isCompleted = item.status === "Completed";

    return `
      <div class="interview-card" style="${isCompleted ? 'opacity: 0.75; border-left: 3px solid var(--border-base);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <span class="interview-time-pill">${dateStr} • ${timeStr}</span>
          <span class="status-count-badge" style="font-size: 10.5px; ${isCompleted ? 'background: var(--bg-subtle); color: var(--text-muted);' : ''}">
            ${escapeHtml(item.status || "Scheduled")}
          </span>
        </div>

        <div style="margin-top: 10px;">
          <h4 style="font-size: 14px; font-weight: 700; color: var(--text-base);">
            <a href="javascript:void(0)" onclick="openCandidateProfileModal('${item.candidateId}')" style="color: var(--text-primary); font-weight: 700; text-decoration: underline;">
              ${escapeHtml(item.candidateName)}
            </a>
          </h4>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
            ${escapeHtml(item.round || "Round 1")} • <strong>${escapeHtml(item.position)}</strong> at <strong>${escapeHtml(item.company)}</strong>
          </p>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Interviewers: ${escapeHtml(item.interviewers || "-")}
          </p>
          ${item.notes ? `<p style="font-size: 11.5px; background: var(--bg-subtle); padding: 6px 8px; border-radius: 3px; margin-top: 6px;">${escapeHtml(item.notes)}</p>` : ""}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-base); gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn-outlined" onclick="downloadIcsCalendar('${item.id}')" style="height: 24px; font-size: 11px; padding: 0 8px;">
            Export .ICS
          </button>
          <div style="display: flex; gap: 6px;">
            ${item.meetingLink ? `
              <a href="${escapeHtml(item.meetingLink)}" target="_blank" rel="noopener noreferrer" class="interview-join-btn">
                Join ${escapeHtml(item.platform || "Meet")}
              </a>
            ` : ""}
            ${!isCompleted ? `
              <button type="button" class="btn-solid" onclick="markInterviewComplete('${item.id}')" style="height: 24px; font-size: 11px; padding: 0 8px;">
                Complete Round
              </button>
            ` : `
              <button type="button" class="btn-outlined" onclick="openOfferLetterModal('${item.candidateId}')" style="height: 24px; font-size: 11px; padding: 0 8px;">
                Generate Offer
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openScheduleInterviewModal(candidateId = null) {
  const dialog = document.getElementById("scheduleInterviewModal");
  const candSelect = document.getElementById("intCandidateSelect");
  const compInput = document.getElementById("intCompany");
  const posInput = document.getElementById("intPosition");
  const dtInput = document.getElementById("intDateTime");
  const meetInput = document.getElementById("intMeetingLink");
  if (!dialog || !candSelect) return;

  // Populate candidate select
  candSelect.innerHTML = candidates.map(c => `
    <option value="${c.id}" ${candidateId && c.id === candidateId ? "selected" : ""}>
      ${escapeHtml(c.name)} (${c.id}) — ${escapeHtml(c.recommendedCompany || "No Comp")}
    </option>
  `).join("");

  // Select target candidate
  const selectedId = candidateId || candSelect.value;
  candSelect.value = selectedId;

  const targetCand = candidates.find(c => c.id === selectedId) || candidates[0];
  if (targetCand) {
    if (compInput) compInput.value = targetCand.recommendedCompany || "alauda";
    if (posInput) posInput.value = targetCand.recommendedPosition || "Software Engineer";
  }

  // Set default interview time to tomorrow at 14:00
  if (dtInput) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(14, 0, 0, 0);
    const pad = n => String(n).padStart(2, "0");
    dtInput.value = `${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())}T${pad(tmrw.getHours())}:${pad(tmrw.getMinutes())}`;
  }

  if (meetInput && (!meetInput.value || meetInput.value.includes("tt-meet-rec"))) {
    meetInput.value = `https://meet.google.com/tt-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  }

  dialog.showModal();
}

function handleIntCandidateChange(e) {
  const candId = e.target.value;
  const targetCand = candidates.find(c => c.id === candId);
  if (!targetCand) return;
  const compInput = document.getElementById("intCompany");
  const posInput = document.getElementById("intPosition");
  if (compInput) compInput.value = targetCand.recommendedCompany || "alauda";
  if (posInput) posInput.value = targetCand.recommendedPosition || "Software Engineer";
}

function handleScheduleInterviewSubmit(e) {
  e.preventDefault();
  const candSelect = document.getElementById("intCandidateSelect");
  const candId = candSelect?.value;
  const targetCand = candidates.find(c => c.id === candId);
  if (!targetCand) return;

  const company = document.getElementById("intCompany")?.value.trim() || targetCand.recommendedCompany;
  const position = document.getElementById("intPosition")?.value.trim() || targetCand.recommendedPosition;
  const round = document.getElementById("intRound")?.value || "Round 1 - Technical Interview";
  const dateTime = document.getElementById("intDateTime")?.value;
  const platform = document.getElementById("intPlatform")?.value || "Google Meet";
  const interviewers = document.getElementById("intInterviewers")?.value.trim() || activeUser.name;
  const meetingLink = document.getElementById("intMeetingLink")?.value.trim() || "https://meet.google.com/tt-meet";
  const notes = document.getElementById("intNotes")?.value.trim() || "";

  const newIntId = `INT-${Math.floor(1000 + Math.random() * 9000)}`;
  const interviewRecord = {
    id: newIntId,
    candidateId: targetCand.id,
    candidateName: targetCand.name,
    company: company,
    position: position,
    round: round,
    dateTime: dateTime,
    platform: platform,
    interviewers: interviewers,
    meetingLink: meetingLink,
    notes: notes,
    status: "Scheduled"
  };

  scheduledInterviews.unshift(interviewRecord);
  saveInterviews(scheduledInterviews);

  // Update candidate status to 20 (Interview Scheduled)
  const nowFormatted = formatTimestamp(new Date());
  let targetRec = targetCand.recommendations?.find(r => r.company.toLowerCase() === company.toLowerCase());
  if (!targetRec && targetCand.recommendations?.length > 0) {
    targetRec = targetCand.recommendations[0];
  }
  if (targetRec) {
    targetRec.statusCode = 20;
    targetRec.timestamp = nowFormatted;
    targetRec.notes = `${round} scheduled for ${dateTime}. Meeting: ${meetingLink}`;
  } else {
    targetCand.recommendations.push({
      id: `REC-${Date.now()}`,
      candidateId: targetCand.id,
      company: company,
      position: position,
      statusCode: 20,
      timestamp: nowFormatted,
      consultantName: activeUser.name,
      notes: `${round} scheduled for ${dateTime}.`,
      isActive: true
    });
  }
  saveCandidates(candidates);

  addAuditLog(
    "INTERVIEW_SCHEDULED",
    `Candidate ${targetCand.name}`,
    `Scheduled ${round} at ${company} for ${dateTime} (${newIntId})`
  );

  notifications.unshift({
    id: `NT-${Date.now()}`,
    title: `Interview Scheduled: ${targetCand.name}`,
    message: `${round} with ${targetCand.name} for ${company} scheduled at ${dateTime}.`,
    timestamp: nowFormatted,
    read: false,
    type: "interview"
  });
  saveNotifications(notifications);

  document.getElementById("scheduleInterviewModal")?.close();
  showToast(`Interview scheduled! Exporting .ICS calendar file...`);

  // Download .ICS calendar event file
  downloadIcsCalendar(newIntId);

  renderAllViews();
}

function markInterviewComplete(interviewId) {
  const item = scheduledInterviews.find(i => i.id === interviewId);
  if (!item) return;

  item.status = "Completed";
  saveInterviews(scheduledInterviews);

  // Update candidate status to 21 (Interview Passed)
  const cand = candidates.find(c => c.id === item.candidateId);
  if (cand) {
    const rec = cand.recommendations?.find(r => r.company.toLowerCase() === item.company.toLowerCase()) || cand.recommendations?.[0];
    if (rec) {
      rec.statusCode = 21;
      rec.timestamp = formatTimestamp(new Date());
      rec.notes = `${item.round} marked as Passed/Completed. Candidate ready for next stage or Offer proposal.`;
      saveCandidates(candidates);
    }
  }

  showToast(`Round marked as Completed! Candidate advanced to Code 21 (Interview Passed).`);
  renderInterviewCalendar();
  renderResumeTable();
}

function downloadIcsCalendar(interviewId) {
  const item = scheduledInterviews.find(i => i.id === interviewId);
  if (!item) return;

  const dt = new Date(item.dateTime);
  const startDt = !isNaN(dt) ? dt : new Date();
  const endDt = new Date(startDt.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatIcsTime = d => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NextKerja ATS//Interview Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:nk-int-${item.id}-${Date.now()}@nextkerja.local`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDt)}`,
    `DTEND:${formatIcsTime(endDt)}`,
    `SUMMARY:Interview: ${item.candidateName} - ${item.position} (${item.company})`,
    `DESCRIPTION:Candidate: ${item.candidateName}\\nPosition: ${item.position}\\nCompany: ${item.company}\\nRound: ${item.round}\\nInterviewers: ${item.interviewers}\\nMeeting Link: ${item.meetingLink}\\nNotes: ${item.notes || "-"}`,
    `LOCATION:${item.meetingLink || item.platform}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Interview_${item.candidateName.replace(/\s+/g, "_")}_${item.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 14C. OFFICIAL OFFER LETTER GENERATOR (Fase 4C)
 */
function openOfferLetterModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const modal = document.getElementById("offerLetterModal");
  const paper = document.getElementById("offerLetterPaper");
  const sendBtn = document.getElementById("btnSendOfferCandidate");
  const acceptBtn = document.getElementById("btnAcceptOfferEsign");
  const startInput = document.getElementById("offerStartDateInput");
  const sigInput = document.getElementById("offerSignatureInput");
  if (!modal || !paper) return;

  if (sendBtn) sendBtn.setAttribute("data-candidate-id", c.id);
  if (acceptBtn) acceptBtn.setAttribute("data-candidate-id", c.id);

  const defaultStartIso = c.startDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (startInput) startInput.value = defaultStartIso;
  if (sigInput) sigInput.value = c.digitalSignature || "";

  const rec = c.recommendations?.[0] || { company: c.recommendedCompany || "alauda", position: c.recommendedPosition || "Software Engineer" };
  const companyName = rec.company || "Client Enterprise Partner";
  const positionName = rec.position || "Senior Professional";
  const salaryExp = c.salaryExpectation || "IDR 25,000,000 / month";
  const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const startDateStr = new Date(defaultStartIso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  paper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--border-base); padding-bottom: 14px; margin-bottom: 16px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(companyName)}</h2>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">In Partnership with NextKerja Executive Talent Search</p>
        <p style="font-size: 11px; color: var(--text-muted);">Equity Tower Level 22, SCBD, Senayan, Jakarta Selatan</p>
      </div>
      <div style="text-align: right; font-size: 11.5px; color: var(--text-secondary);">
        <div><strong>Ref:</strong> TT-OFFER/${new Date().getFullYear()}/${c.id}</div>
        <div style="margin-top: 3px;"><strong>Date:</strong> ${todayStr}</div>
        <div style="margin-top: 3px;"><span class="status-count-badge" style="background: ${c.digitalSignature ? '#15803d' : 'var(--brand-primary)'}; color: ${c.digitalSignature ? '#ffffff' : '#161922'}; font-weight: 800;">${c.digitalSignature ? 'SIGNED & ACCEPTED' : 'OFFICIAL OFFER'}</span></div>
      </div>
    </div>

    <div style="margin-bottom: 16px; font-size: 12.5px; line-height: 1.5;">
      <div><strong>To:</strong> ${escapeHtml(c.name)}</div>
      <div><strong>Email:</strong> ${escapeHtml(c.email || "-")} | <strong>Phone:</strong> ${escapeHtml(c.phone || "-")}</div>
      <div><strong>Address / Domicile:</strong> ${escapeHtml(c.domicile || "Indonesia")}</div>
    </div>

    <div style="font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
      <p style="margin-bottom: 10px;">
        Dear <strong>${escapeHtml(c.name)}</strong>,
      </p>
      <p style="margin-bottom: 10px;">
        On behalf of <strong>${escapeHtml(companyName)}</strong>, we are delighted to formally offer you the position of <strong>${escapeHtml(positionName)}</strong>. Following your comprehensive interview performance and professional qualifications, our leadership team is confident in your ability to make significant contributions to our organization.
      </p>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px;">Key Employment Terms & Remuneration</h4>
      <table class="offer-comp-table">
        <tbody>
          <tr>
            <td style="width: 32%; font-weight: 600;">Position Title</td>
            <td>${escapeHtml(positionName)}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Employing Entity</td>
            <td>${escapeHtml(companyName)}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Target Commencement Date</td>
            <td><strong>${startDateStr}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Working Arrangement</td>
            <td>Full-time, Hybrid (3 days onsite, 2 days remote)</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Base Remuneration (Monthly)</td>
            <td style="font-size: 14px; font-weight: 700; color: var(--success-color);">${escapeHtml(salaryExp)} (gross, subject to PPh 21)</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Performance Bonus</td>
            <td>Annual Performance Bonus target of 1.5 - 3.0 months base salary, evaluated annually</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Health & Social Security</td>
            <td>BPJS Ketenagakerjaan (JKK, JKM, JHT, JP), BPJS Kesehatan + Private Inpatient & Outpatient Coverage</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Annual Leave</td>
            <td>15 business days paid annual leave + public holidays</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
      <p>
        This offer is contingent upon successful verification of your educational credentials and reference checks. Please confirm your acceptance by signing this letter and returning it within <strong>7 business days</strong>.
      </p>
    </div>

    <div class="offer-sig-grid">
      <div>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 40px;">Sincerely,<br><strong>Authorized Signatory</strong><br>${escapeHtml(companyName)}</p>
        <div style="border-top: 1px solid var(--text-base); width: 200px; font-size: 11px; padding-top: 4px;">
          HR Director / Hiring Manager
        </div>
      </div>
      <div>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: ${c.digitalSignature ? '12px' : '40px'};">Accepted and Agreed:<br><strong>Candidate Acceptance</strong></p>
        ${c.digitalSignature ? `<div class="esign-script" style="margin-bottom: 6px;">/s/ ${escapeHtml(c.digitalSignature)}</div><div style="font-size: 10px; color: var(--success-color); margin-bottom: 6px;">Digitally Signed • Start Date: ${escapeHtml(defaultStartIso)}</div>` : ""}
        <div style="border-top: 1px solid var(--text-base); width: 200px; font-size: 11px; padding-top: 4px;">
          ${escapeHtml(c.name)}<br>
          <span style="font-size: 10px; color: var(--text-muted);">Signature & Date</span>
        </div>
      </div>
    </div>
  `;

  if (!modal.open) {
    modal.showModal();
  }
}

function handleSendOfferClick() {
  const sendBtn = document.getElementById("btnSendOfferCandidate");
  const candId = sendBtn?.getAttribute("data-candidate-id");
  if (!candId) return;

  const c = candidates.find(item => item.id === candId);
  if (!c) return;

  const rec = c.recommendations?.[0];
  const nowFormatted = formatTimestamp(new Date());

  if (rec) {
    rec.statusCode = 30; // Offer Proposed
    rec.timestamp = nowFormatted;
    rec.notes = `Official Employment Offer Letter generated and dispatched to candidate (Code 30 - Offer Proposed).`;
  } else {
    c.recommendations.push({
      id: `REC-${Date.now()}`,
      candidateId: c.id,
      company: c.recommendedCompany || "alauda",
      position: c.recommendedPosition || "Software Engineer",
      statusCode: 30,
      timestamp: nowFormatted,
      consultantName: activeUser.name,
      notes: `Official Employment Offer Letter generated and dispatched (Code 30).`,
      isActive: true
    });
  }

  saveCandidates(candidates);

  addAuditLog(
    "OFFER_ISSUED",
    `Candidate ${c.name}`,
    `Issued formal offer letter (Code 30 - Offer Proposed) for ${rec ? rec.position : "Role"} at ${rec ? rec.company : "Company"}`
  );

  notifications.unshift({
    id: `NT-${Date.now()}`,
    title: `Offer Proposed: ${c.name}`,
    message: `Official employment offer letter dispatched to ${c.name} (Code 30 - Offer Proposed).`,
    timestamp: nowFormatted,
    read: false,
    type: "candidate"
  });
  saveNotifications(notifications);

  document.getElementById("offerLetterModal")?.close();
  showToast(`Offer letter issued! ${c.name} advanced to Code 30 (Offer Proposed).`);

  renderAllViews();
}

/**
 * 14D. CLIENT-SIDE MULTI-FORMAT CV UPLOAD (PDF/DOCX/TXT) & FULL AUTO-FILL
 */
let pendingUploadedCvData = null;

function resetCvUploadUi(mode = "add") {
  if (pendingUploadedCvData && pendingUploadedCvData.mode === mode) {
    pendingUploadedCvData = null;
  }
  if (mode === "add") {
    const fileInput = document.getElementById("cvUploadFileInput");
    const chip = document.getElementById("cvUploadedFileChip");
    const pillsBox = document.getElementById("cvParseExtractedPills");
    const rawBox = document.getElementById("rawCvParseText");
    if (fileInput) fileInput.value = "";
    if (chip) chip.style.display = "none";
    if (pillsBox) {
      pillsBox.innerHTML = "";
      pillsBox.style.display = "none";
    }
    if (rawBox) rawBox.value = "";
  } else if (mode === "apply") {
    const fileInput = document.getElementById("applyCvFileInput");
    const statusText = document.getElementById("applyCvStatusText");
    if (fileInput) fileInput.value = "";
    if (statusText) {
      statusText.textContent = "Unggah file CV Anda agar formulir di bawah terisi otomatis";
      statusText.style.color = "var(--text-muted)";
    }
  }
}

function flashInputHighlight(el) {
  if (!el) return;
  el.classList.remove("autofill-flash");
  void el.offsetWidth;
  el.classList.add("autofill-flash");
  setTimeout(() => el.classList.remove("autofill-flash"), 1700);
}

function setSelectOrAppendOption(selectEl, targetValue) {
  if (!selectEl || !targetValue) return false;
  const normalizedTarget = targetValue.trim().toLowerCase();
  for (const opt of selectEl.options) {
    if (opt.value.toLowerCase() === normalizedTarget || opt.value.toLowerCase().includes(normalizedTarget)) {
      selectEl.value = opt.value;
      return true;
    }
  }
  const newOpt = document.createElement("option");
  newOpt.value = targetValue.trim();
  newOpt.textContent = targetValue.trim();
  selectEl.appendChild(newOpt);
  selectEl.value = newOpt.value;
  return true;
}

/** Decode XML entities inside extracted DOCX XML */
function decodeXmlEntities(str) {
  return String(str || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/** Browser-native fallback to read word/document.xml from DOCX ZIP buffer */
async function extractDocxXmlFallback(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset + 30 < bytes.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      offset++;
      continue;
    }
    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const dataStart = offset + 30 + nameLen + extraLen;
    const fileName = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLen));

    if (fileName === "word/document.xml" && compSize > 0 && dataStart + compSize <= bytes.length) {
      const compSlice = bytes.subarray(dataStart, dataStart + compSize);
      let xmlBytes;
      if (method === 0) {
        xmlBytes = compSlice;
      } else if (method === 8 && typeof DecompressionStream === "function") {
        const ds = new DecompressionStream("deflate-raw");
        const writer = ds.writable.getWriter();
        writer.write(compSlice);
        writer.close();
        xmlBytes = new Uint8Array(await new Response(ds.readable).arrayBuffer());
      }
      if (xmlBytes) {
        const xmlStr = new TextDecoder("utf-8").decode(xmlBytes);
        const textWithBreaks = xmlStr
          .replace(/<w:tab\b[^>]*\/?>/gi, " | ")
          .replace(/<w:br\b[^>]*\/?>/gi, "\n")
          .replace(/<\/w:p>/gi, "\n")
          .replace(/<\/w:tr>/gi, "\n")
          .replace(/<\/w:tc>/gi, " | ")
          .replace(/<[^>]+>/g, "");
        return decodeXmlEntities(textWithBreaks).replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      }
    }
    offset = compSize > 0 ? dataStart + compSize : offset + 1;
  }
  return "";
}

/** Browser-native fallback for reading FlateDecode PDF streams offline */
async function extractPdfTextFallback(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const latin1 = new TextDecoder("latin1").decode(bytes);
  const chunks = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\n?endstream/g;
  let match;

  while ((match = streamRegex.exec(latin1)) !== null) {
    const startIdx = match.index + match[0].indexOf("\n") + 1;
    let endIdx = match.index + match[0].lastIndexOf("endstream");
    while (endIdx > startIdx && (bytes[endIdx - 1] === 10 || bytes[endIdx - 1] === 13)) {
      endIdx--;
    }
    const rawSlice = bytes.subarray(startIdx, endIdx);
    let contentText = "";

    try {
      const slicePreview = new TextDecoder("latin1").decode(rawSlice.subarray(0, Math.min(200, rawSlice.length)));
      if (!/\bBT\b|\bTj\b|\bTJ\b/.test(slicePreview) && typeof DecompressionStream === "function" && rawSlice.length > 2) {
        try {
          const ds = new DecompressionStream("deflate");
          const writer = ds.writable.getWriter();
          writer.write(rawSlice).catch(() => {});
          writer.close().catch(() => {});
          const out = await new Response(ds.readable).arrayBuffer();
          contentText = new TextDecoder("latin1").decode(out);
        } catch (_) {
          contentText = new TextDecoder("latin1").decode(rawSlice);
        }
      } else {
        contentText = new TextDecoder("latin1").decode(rawSlice);
      }
    } catch (_) {
      continue;
    }

    if (!contentText.includes("Tj") && !contentText.includes("TJ") && !contentText.includes("BT")) continue;
    const textMatches = contentText.match(/\((?:\\.|[^\\)])*\)\s*(?:Tj|'|")|\[(?:[\s\S]*?)\]\s*TJ/g);
    if (textMatches) {
      const lineParts = [];
      for (const op of textMatches) {
        const innerRegex = /\(([^\\)]*(?:\\.[^\\)]*)*)\)/g;
        let partMatch;
        let segment = "";
        while ((partMatch = innerRegex.exec(op)) !== null) {
          let decoded = partMatch[1]
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, " ")
            .replace(/\\t/g, " ")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\\\/g, "\\");
          segment += decoded;
        }
        if (segment.trim()) lineParts.push(segment.trim());
      }
      if (lineParts.length > 0) chunks.push(lineParts.join("\n"));
    }
  }

  return chunks.join("\n").replace(/\s{2,}/g, " ").replace(/ \n/g, "\n").trim();
}

/** Extract clean readable text from .pdf, .docx, .rtf, or .txt/.md files */
async function extractTextFromCvFile(file) {
  const lowerName = (file.name || "").toLowerCase();
  const isText = file.type.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".csv");

  if (isText) {
    return await file.text();
  }

  if (lowerName.endsWith(".rtf")) {
    const rawRtf = await file.text();
    return rawRtf
      .replace(/\\par[d]?/g, "\n")
      .replace(/\{\*?\\[^{}]+\}|\\[a-z]+-?\d*\s?/gi, "")
      .replace(/[{}]/g, "")
      .trim();
  }

  const arrayBuffer = await file.arrayBuffer();

  if (lowerName.endsWith(".docx")) {
    if (window.mammoth && typeof window.mammoth.extractRawText === "function") {
      try {
        const res = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) });
        if (res && res.value && res.value.trim()) return res.value.trim();
      } catch (err) {
        console.warn("Mammoth extraction fallback triggered:", err);
      }
    }
    return await extractDocxXmlFallback(arrayBuffer);
  }

  if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
    if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === "function") {
      try {
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const withTimeout = (promise, ms) => Promise.race([
          promise,
          new Promise((_, rej) => setTimeout(() => rej(new Error("PDF.js timeout")), ms))
        ]);
        let pdfDoc;
        try {
          pdfDoc = await withTimeout(
            window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise,
            4000
          );
        } catch (_) {
          pdfDoc = await withTimeout(
            window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0), disableWorker: true }).promise,
            4000
          );
        }
        const pageTexts = [];
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const page = await pdfDoc.getPage(p);
          const content = await page.getTextContent();
          const lineMap = new Map();
          for (const item of content.items) {
            if (!item.str) continue;
            const y = Math.round((item.transform?.[5] || 0) / 4) * 4;
            if (!lineMap.has(y)) lineMap.set(y, []);
            lineMap.get(y).push({ x: item.transform?.[4] || 0, str: item.str });
          }
          const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
          const pageLines = sortedYs.map(y =>
            lineMap.get(y).sort((a, b) => a.x - b.x).map(i => i.str).join(" ").replace(/\s{2,}/g, " ").trim()
          ).filter(Boolean);
          pageTexts.push(pageLines.join("\n"));
        }
        const combined = pageTexts.join("\n\n").trim();
        if (combined) return combined;
      } catch (err) {
        console.warn("PDF.js extraction fallback triggered:", err);
      }
    }
    return await extractPdfTextFallback(arrayBuffer);
  }

  // Legacy .doc binary fallback: collect printable text runs
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(new Uint8Array(arrayBuffer));
  const printableRuns = raw.match(/[A-Za-z0-9@.,:;+\-/()\n ]{6,}/g) || [];
  return printableRuns.join("\n").trim();
}

/** Normalize Indonesian / English date strings to YYYY-MM-DD */
function parseFlexibleBirthDate(rawStr) {
  if (!rawStr) return "";
  const cleaned = rawStr.trim();

  const isoMatch = cleaned.match(/\b(19[5-9]\d|200[0-8])[-\/](0?[1-9]|1[0-2])[-\/](0?[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  const dmyMatch = cleaned.match(/\b(0?[1-9]|[12]\d|3[01])[-\/.](0?[1-9]|1[0-2])[-\/.](19[5-9]\d|200[0-8])\b/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }

  const monthMap = {
    januari: "01", january: "01", jan: "01",
    februari: "02", february: "02", feb: "02",
    maret: "03", march: "03", mar: "03",
    april: "04", apr: "04",
    mei: "05", may: "05",
    juni: "06", june: "06", jun: "06",
    juli: "07", july: "07", jul: "07",
    agustus: "08", august: "08", aug: "08", agu: "08", agst: "08",
    september: "09", sep: "09", sept: "09",
    oktober: "10", october: "10", oct: "10", okt: "10",
    november: "11", nov: "11", nop: "11",
    desember: "12", december: "12", dec: "12", des: "12"
  };

  const textDateMatch = cleaned.match(/\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]+),?\s+(19[5-9]\d|200[0-8])\b/i);
  if (textDateMatch && monthMap[textDateMatch[2].toLowerCase()]) {
    return `${textDateMatch[3]}-${monthMap[textDateMatch[2].toLowerCase()]}-${textDateMatch[1].padStart(2, "0")}`;
  }

  const monthFirstMatch = cleaned.match(/\b([A-Za-z]+)\s+(0?[1-9]|[12]\d|3[01]),?\s+(19[5-9]\d|200[0-8])\b/i);
  if (monthFirstMatch && monthMap[monthFirstMatch[1].toLowerCase()]) {
    return `${monthFirstMatch[3]}-${monthMap[monthFirstMatch[1].toLowerCase()]}-${monthFirstMatch[2].padStart(2, "0")}`;
  }

  return "";
}

/** Smart Multi-Field CV Parser Engine supporting Indonesian, English & Mandarin patterns */
function parseCvTextToStructuredData(rawText, fileName = "") {
  const normalized = String(rawText || "").replace(/\r\n/g, "\n").trim();
  const extracted = {
    name: "",
    nationality: "",
    gender: "",
    birthDate: "",
    education: "",
    years: undefined,
    language: "",
    position: "",
    company: "",
    email: "",
    phone: "",
    summary: "",
    skills: [],
    domicile: "",
    salaryExpectation: "",
    workHistory: [],
    educationHistory: []
  };

  // 1. Email
  const emailMatch = normalized.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) extracted.email = emailMatch[0].trim();

  // 2. Phone / WhatsApp
  const phoneLabelMatch = normalized.match(/(?:WhatsApp|WA|Phone|No\.?\s*HP|Handphone|Telepon|Telp|Mobile|Kontak|Contact)\s*[:\-]\s*([+\d][\d\s.\-()]{7,18})/i);
  const phoneFallbackMatch = normalized.match(/(?:\+?62|08)[0-9\s.\-()]{8,16}/);
  const rawPhone = phoneLabelMatch ? phoneLabelMatch[1] : (phoneFallbackMatch ? phoneFallbackMatch[0] : "");
  if (rawPhone) {
    extracted.phone = rawPhone.split(/[\n\r|]/)[0].replace(/\s{2,}/g, " ").trim();
  }

  // 3. Name
  const namePrefixMatch = normalized.match(/(?:Nama\s*Lengkap|Full\s*Name|Candidate\s*Name|Nama|Name)\s*[:\-]\s*([^\n\r|•]+)/i);
  if (namePrefixMatch) {
    extracted.name = namePrefixMatch[1].replace(/\s{2,}/g, " ").trim();
  } else {
    const skipHeaderPattern = /^(curriculum vitae|resume|cv|daftar riwayat hidup|biodata|profile|profil)$/i;
    const lines = normalized.split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 2 && l.length < 65 && !l.includes("@") && !/http|linkedin|github/i.test(l) && !/^\+?\d[\d\s\-()]{6,}$/.test(l) && !skipHeaderPattern.test(l));
    if (lines.length > 0) {
      const candidateLine = lines[0].replace(/^(curriculum vitae|resume|cv)\s*[-:]?\s*/i, "").split(/\s*[|•]\s*/)[0].trim();
      if (candidateLine && !/\d{4}/.test(candidateLine)) {
        extracted.name = candidateLine;
      }
    }
  }
  if (!extracted.name && fileName) {
    const cleanBase = fileName.replace(/\.[^.]+$/, "").replace(/\b(cv|resume|lamaran|updated|latest|final)\b/gi, "").replace(/[_\-]+/g, " ").trim();
    if (cleanBase.length >= 3) {
      extracted.name = cleanBase.replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  // 4. Gender
  const genderMatch = normalized.match(/(?:Jenis\s*Kelamin|Gender|Kelamin|Sex|性别)\s*[:\-]?\s*(Perempuan|Wanita|Female|Woman|女|Laki-laki|Laki|Pria|Male|Man|男)/i)
    || normalized.match(/\b(Perempuan|Wanita|Female|Laki-laki|Pria|Male)\b/i);
  if (genderMatch) {
    const gToken = genderMatch[1].toLowerCase();
    extracted.gender = /^(perempuan|wanita|female|woman|女)$/.test(gToken) ? "Female" : "Male";
  }

  // 5. Birth Date / Age
  const dobLabelMatch = normalized.match(/(?:Tanggal\s*Lahir|Tgl\.?\s*Lahir|Tempat\s*[\/,&]?\s*Tanggal\s*Lahir|TTL|Date\s*of\s*Birth|DOB|Birth\s*Date|Born|出生日期)\s*[:\-]?\s*([^\n\r|]+)/i);
  if (dobLabelMatch) {
    extracted.birthDate = parseFlexibleBirthDate(dobLabelMatch[1]);
  }
  if (!extracted.birthDate) {
    extracted.birthDate = parseFlexibleBirthDate(normalized);
  }
  if (!extracted.birthDate) {
    const ageMatch = normalized.match(/(?:Usia|Umur|Age)\s*[:\-]?\s*(\d{2})\s*(?:tahun|thn|years|yrs)?/i)
      || normalized.match(/\b(\d{2})\s*(?:tahun|years\s*old)\b/i);
    if (ageMatch) {
      const ageNum = parseInt(ageMatch[1], 10);
      if (ageNum >= 18 && ageNum <= 65) {
        extracted.birthDate = `${new Date().getFullYear() - ageNum}-06-15`;
      }
    }
  }

  // 6. Nationality & Domicile
  const natMatch = normalized.match(/(?:Kewarganegaraan|Warga\s*Negara|Nationality|Citizenship|国籍)\s*[:\-]\s*([^\n\r|,•]+)/i);
  if (natMatch) {
    const rawNat = natMatch[1].trim();
    if (/^(wni|indonesia|indonesian)$/i.test(rawNat)) extracted.nationality = "Indonesia";
    else if (/^(china|chinese|tiongkok|prc|中国)$/i.test(rawNat)) extracted.nationality = "China";
    else extracted.nationality = rawNat;
  } else if (/\b(?:Jakarta|Bandung|Surabaya|Tangerang|Bekasi|Depok|Bogor|Semarang|Yogyakarta|Medan|Cikarang|Karawang|Indonesia)\b/i.test(normalized) || /(?:\+62|08)/.test(normalized)) {
    extracted.nationality = "Indonesia";
  }

  const domMatch = normalized.match(/(?:Domisili|Domicile|Alamat|Address|Location|Lokasi|Kota)\s*[:\-]\s*([^\n\r|]+)/i);
  if (domMatch) {
    extracted.domicile = domMatch[1].trim();
  } else {
    const cityMatch = normalized.match(/\b(Jakarta(?:\s+(?:Selatan|Pusat|Barat|Timur|Utara))?|Bandung|Surabaya|Tangerang(?:\s+Selatan)?|Bekasi|Depok|Bogor|Semarang|Yogyakarta|Medan|Bali|Cikarang|Karawang)\b/i);
    if (cityMatch) extracted.domicile = cityMatch[1];
  }

  // 7. Education Level & History
  if (/\b(?:master|magister|s2|s-2|m\.kom|m\.sc|m\.t|m\.m|mba|m\.eng|pascasarjana)\b/i.test(normalized)) {
    extracted.education = "master";
  } else if (/\b(?:diploma|d3|d-3|d4|d-4|ahli\s*madya|a\.md|associate|politeknik)\b/i.test(normalized)) {
    extracted.education = "diploma";
  } else if (/\b(?:undergraduate|bachelor|sarjana|s1|s-1|s\.kom|s\.t|s\.e|s\.h|s\.psi|s\.sos|b\.sc|b\.eng|b\.a|universitas|institut)\b/i.test(normalized)) {
    extracted.education = "undergraduate";
  }

  // 8. Years of Service / Experience
  const expMatch = normalized.match(/(\d+(?:\.\d+)?)\+?\s*(?:tahun|thn|years?|yrs?)\s*(?:of\s*)?(?:pengalaman|kerja|experience|exp)\b/i)
    || normalized.match(/(?:berpengalaman|pengalaman(?:\s+kerja)?|masa\s+kerja|total\s+experience|work\s+experience|experience)\s*(?:lebih\s+dari|selama|minimal|sekitar|kurang\s+lebih|over|more\s+than|at\s+least|>|:|-)?\s*(\d+(?:\.\d+)?)\+?\s*(?:tahun|thn|years?|yrs?)/i);
  if (expMatch) {
    extracted.years = Math.min(40, Math.round(parseFloat(expMatch[1])));
  } else {
    const currentYear = new Date().getFullYear();
    const nonEduText = normalized.split("\n").filter(l => !/\b(?:pend\.|pendidikan|education|universitas|institut|politeknik|university|college|bachelor|sarjana|master|magister|s1|s2|d3|d4|sma|smk)\b/i.test(l)).join("\n");
    const yearRanges = Array.from(nonEduText.matchAll(/(20[0-2]\d|199\d)\s*(?:-|–|—|to|s\/d|sampai|hingga)\s*(20[0-2]\d|Present|Sekarang|Now|Current|Saat\s*ini)/gi));
    if (yearRanges.length > 0) {
      let minStart = currentYear;
      let maxEnd = 0;
      for (const yr of yearRanges) {
        const sY = parseInt(yr[1], 10);
        const eY = /^\d{4}$/.test(yr[2]) ? parseInt(yr[2], 10) : currentYear;
        if (sY < minStart) minStart = sY;
        if (eY > maxEnd) maxEnd = eY;
      }
      if (maxEnd >= minStart) {
        extracted.years = Math.max(0, Math.min(40, maxEnd - minStart));
      }
    }
  }

  // 9. Languages
  const detectedLangs = [];
  if (/\b(?:Indonesian|Bahasa\s*Indonesia|Indonesia)\b/i.test(normalized)) detectedLangs.push("Indonesian");
  if (/\b(?:English|Inggris|TOEFL|IELTS|TOEIC)\b/i.test(normalized)) detectedLangs.push("English");
  if (/\b(?:Mandarin|Chinese|Tionghoa|HSK)\b|中文|普通话/i.test(normalized)) detectedLangs.push("Mandarin");
  if (/\b(?:Japanese|Jepang|JLPT)\b|日本語/i.test(normalized)) detectedLangs.push("Japanese");
  if (/\b(?:Korean|Korea|TOPIK)\b/i.test(normalized)) detectedLangs.push("Korean");
  if (/\b(?:Arabic|Arab)\b/i.test(normalized)) detectedLangs.push("Arabic");
  if (/\b(?:German|Jerman)\b/i.test(normalized)) detectedLangs.push("German");
  if (detectedLangs.length > 0) {
    extracted.language = detectedLangs.join(", ");
  }

  // 10. Skills
  const knownSkills = [
    "Kubernetes", "Docker", "Golang", "Go", "Java", "Spring Boot", "Python", "FastAPI", "Django",
    "React", "Next.js", "Vue", "Angular", "Node.js", "TypeScript", "JavaScript", "PHP", "Laravel",
    "Flutter", "Kotlin", "Swift", "AWS", "GCP", "Azure", "PostgreSQL", "MySQL", "MongoDB", "Kafka",
    "Redis", "Figma", "UI/UX", "Scrum", "Agile", "Product Management", "Microservices", "CI/CD",
    "Terraform", "DevOps", "SAP", "ERP", "CEISA", "Import/Export", "Customs", "Supply Chain",
    "Logistics", "Accounting", "Brevet A/B", "Tax", "Financial Modeling", "Recruitment", "HRIS",
    "Digital Marketing", "SEO", "SEM", "Mandarin Translation", "Presales", "B2B Sales", "SQL", "Excel"
  ];
  extracted.skills = knownSkills.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(normalized);
  });

  // 11. Target / Recommended Position
  const explicitPosMatch = normalized.match(/(?:Posisi\s*yang\s*Dilamar|Posisi\s*Tujuan|Applied\s*Position|Target\s*Position|Current\s*Role|Job\s*Title|Posisi|Jabatan|Role)\s*[:\-]\s*([^\n\r|]+)/i);
  if (explicitPosMatch) {
    extracted.position = explicitPosMatch[1].trim();
  } else {
    for (const pos of masterPositions) {
      if (new RegExp(pos.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(normalized)) {
        extracted.position = pos;
        break;
      }
    }
    if (!extracted.position) {
      const textNoContact = normalized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, " ").replace(/https?:\/\/\S+/g, " ");
      if (/\b(?:customs|ceisa|import|export|ekspor|impor|ppjk)\b/i.test(textNoContact)) extracted.position = "Customs Documentation Specialist";
      else if (/\b(?:cloud|devops|infrastructure|kubernetes|terraform)\b/i.test(textNoContact)) extracted.position = "Lead Cloud Architect";
      else if (/\b(?:fullstack|react|next\.js|node\.js)\b/i.test(textNoContact)) extracted.position = "Fullstack Engineer (React & Node.js)";
      else if (/\b(?:backend|go|golang|spring boot|microservice)\b/i.test(textNoContact)) extracted.position = "Senior Backend Engineer";
      else if (/\b(?:product manager|product owner|roadmap)\b/i.test(textNoContact)) extracted.position = "Technical Product Manager";
      else if (/\b(?:interpreter|translator|penerjemah|mandarin)\b/i.test(textNoContact)) extracted.position = "Mandarin Interpreter";
      else if (/\b(?:ui\/ux|figma|product designer)\b/i.test(textNoContact)) extracted.position = "UI/UX Designer";
      else if (/\b(?:finance|accounting|akuntansi|pajak|tax|brevet)\b/i.test(textNoContact)) extracted.position = "Finance & Tax Specialist";
      else if (/\b(?:hr|human resources|rekruiter|recruitment|talent acquisition)\b/i.test(textNoContact)) extracted.position = "HR & Talent Specialist";
      else if (/\b(?:presales|solution architect)\b/i.test(textNoContact)) extracted.position = "Presales Lead";
    }
  }

  // 12. Target Company (if explicitly mentioned)
  const explicitCompanyMatch = normalized.match(/(?:Target\s*Company|Perusahaan\s*Tujuan|Melamar\s*ke|Apply\s*to)\s*[:\-]\s*([^\n\r|]+)/i);
  if (explicitCompanyMatch) {
    extracted.company = explicitCompanyMatch[1].trim();
  }

  // 13. Salary Expectation
  const salaryMatch = normalized.match(/(?:Expected\s*Salary|Ekspektasi\s*Gaji|Gaji\s*Diharapkan|Salary\s*Expectation)\s*[:\-]\s*([^\n\r|]+)/i);
  if (salaryMatch) {
    extracted.salaryExpectation = salaryMatch[1].trim();
  }

  // 14. Structured Work & Education History
  const workLineMatches = Array.from(normalized.matchAll(/^([A-Za-z0-9 &\/,.()-]{4,60}?)\s*(?:-|@|at|di|–)\s*([A-Za-z0-9 &\/,.()-]{2,50}?)\s*\(([^)]*\d{4}[^)]*)\)/gm));
  for (const wm of workLineMatches.slice(0, 5)) {
    extracted.workHistory.push({
      role: wm[1].trim(),
      company: wm[2].trim(),
      period: wm[3].trim(),
      desc: "Extracted automatically from uploaded CV document."
    });
  }
  const uniMatch = normalized.match(/((?:Universitas|Institut|Politeknik|University|Institute|College)\s+[A-Za-z0-9 &.'-]{3,55})/i);
  if (uniMatch || extracted.education) {
    extracted.educationHistory.push({
      degree: extracted.education === "master" ? "Master (S2)" : extracted.education === "diploma" ? "Diploma (D3/D4)" : "Bachelor (S1)",
      institution: uniMatch ? uniMatch[1].trim() : "University / Higher Education",
      year: (normalized.match(/\b(200\d|201\d|202\d)\b/) || [])[1] || "Graduated"
    });
  }

  // 15. Professional Summary (Combine summary section + skills/highlights)
  const summarySectionMatch = normalized.match(/(?:PROFESSIONAL\s*SUMMARY|EXECUTIVE\s*SUMMARY|RINGKASAN\s*PROFESIONAL|TENTANG\s*SAYA|PROFIL\s*SINGKAT|PROFILE|SUMMARY|ABOUT\s*ME|OBJECTIVE)\s*[:\-]?\s*\n+([\s\S]{15,500}?)(?=\n\s*\n|\n(?:CORE\s*SKILLS|SKILLS|KEAHLIAN|EXPERIENCE|PENGALAMAN|EDUCATION|PENDIDIKAN|LANGUAGES|BAHASA)\b|$)/i);
  let summaryParts = [];
  if (summarySectionMatch) {
    summaryParts.push(summarySectionMatch[1].replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim());
  } else {
    const introParts = [];
    if (extracted.position) introParts.push(extracted.position);
    if (extracted.years !== undefined) introParts.push(`${extracted.years} tahun pengalaman`);
    if (extracted.domicile) introParts.push(`berdomisili di ${extracted.domicile}`);
    if (introParts.length > 0) summaryParts.push(`Kandidat profesional: ${introParts.join(" • ")}.`);
  }
  if (extracted.skills.length > 0) {
    const skillsLine = `Keahlian Utama: ${extracted.skills.slice(0, 10).join(", ")}.`;
    if (!summaryParts[0] || !summaryParts[0].toLowerCase().includes(extracted.skills[0].toLowerCase())) {
      summaryParts.push(skillsLine);
    }
  }
  extracted.summary = summaryParts.join("\n").trim();

  return extracted;
}

/** Auto-fill ALL 12 fields inside #formAddCandidate and render extracted badges */
function autoFillAddCandidateForm(extracted, sourceLabel = "CV") {
  let filledCount = 0;
  const fillField = (id, val, isSelect = false) => {
    if (val === undefined || val === null || val === "") return;
    const el = document.getElementById(id);
    if (!el) return;
    if (isSelect) {
      setSelectOrAppendOption(el, String(val));
    } else {
      el.value = String(val);
    }
    flashInputHighlight(el);
    filledCount++;
  };

  fillField("addName", extracted.name);
  fillField("addNationality", extracted.nationality || "Indonesia");
  fillField("addGender", extracted.gender);
  fillField("addBirthDate", extracted.birthDate);
  fillField("addEducation", extracted.education);
  if (extracted.years !== undefined) fillField("addYears", extracted.years);
  fillField("addLanguage", extracted.language);
  if (extracted.position) fillField("addPositionSelect", extracted.position, true);
  if (extracted.company) fillField("addCompanySelect", extracted.company, true);
  fillField("addEmail", extracted.email);
  fillField("addPhone", extracted.phone);
  fillField("addSummary", extracted.summary);

  const pillsBox = document.getElementById("cvParseExtractedPills");
  if (pillsBox) {
    pillsBox.style.display = "flex";
    const badges = [
      `<span class="parse-extracted-badge" style="background: rgba(163, 230, 53, 0.25); color: var(--text-primary); border: 1px solid #84cc16;">✓ ${filledCount} Kolom Auto-Fill (${escapeHtml(sourceLabel)})</span>`
    ];
    if (extracted.name) badges.push(`<span class="parse-extracted-badge">Nama: ${escapeHtml(extracted.name)}</span>`);
    if (extracted.email) badges.push(`<span class="parse-extracted-badge">Email: ${escapeHtml(extracted.email)}</span>`);
    if (extracted.phone) badges.push(`<span class="parse-extracted-badge">HP: ${escapeHtml(extracted.phone)}</span>`);
    if (extracted.gender) badges.push(`<span class="parse-extracted-badge">Gender: ${escapeHtml(extracted.gender)}</span>`);
    if (extracted.birthDate) badges.push(`<span class="parse-extracted-badge">Lahir: ${escapeHtml(extracted.birthDate)}</span>`);
    if (extracted.education) badges.push(`<span class="parse-extracted-badge">Pendidikan: ${escapeHtml(extracted.education)}</span>`);
    if (extracted.years !== undefined) badges.push(`<span class="parse-extracted-badge">Exp: ${extracted.years} thn</span>`);
    if (extracted.language) badges.push(`<span class="parse-extracted-badge">Bahasa: ${escapeHtml(extracted.language)}</span>`);
    if (extracted.position) badges.push(`<span class="parse-extracted-badge">Posisi: ${escapeHtml(extracted.position)}</span>`);
    if (extracted.skills?.length) badges.push(`<span class="parse-extracted-badge">Skills: ${escapeHtml(extracted.skills.slice(0, 4).join(", "))}</span>`);
    pillsBox.innerHTML = badges.join("");
  }

  return filledCount;
}

/** Auto-fill fields inside #formApplyJob */
function autoFillApplyJobForm(extracted, sourceLabel = "CV") {
  let filledCount = 0;
  const fillApply = (id, val) => {
    if (val === undefined || val === null || val === "") return;
    const el = document.getElementById(id);
    if (!el) return;
    el.value = String(val);
    flashInputHighlight(el);
    filledCount++;
  };

  fillApply("applyFullName", extracted.name);
  fillApply("applyEmail", extracted.email);
  fillApply("applyPhone", extracted.phone);
  if (extracted.years !== undefined) fillApply("applyYears", extracted.years);
  fillApply("applyEducation", extracted.education);
  fillApply("applySalary", extracted.salaryExpectation);
  fillApply("applyCoverLetter", extracted.summary);

  const statusText = document.getElementById("applyCvStatusText");
  if (statusText) {
    statusText.textContent = `✓ Berhasil mengisi ${filledCount} kolom dari ${sourceLabel}`;
    statusText.style.color = "var(--success-color)";
  }
  return filledCount;
}

/** Handle file upload event for Add Candidate or Apply Job modals */
async function handleCvFileSelected(file, mode = "add") {
  if (!file) return;
  const sizeKb = (file.size / 1024).toFixed(1);

  if (mode === "add") {
    const mainLabel = document.getElementById("cvDropzoneMainLabel");
    if (mainLabel) mainLabel.textContent = `Sedang membaca & mengekstrak "${file.name}"...`;
  } else {
    const statusText = document.getElementById("applyCvStatusText");
    if (statusText) statusText.textContent = `Sedang membaca & mengekstrak "${file.name}"...`;
  }

  try {
    const rawText = await extractTextFromCvFile(file);
    if (!rawText || rawText.trim().length < 5) {
      if (mode === "add") {
        const mainLabel = document.getElementById("cvDropzoneMainLabel");
        if (mainLabel) mainLabel.textContent = t("lblCvDropzoneSub");
      }
      showAlertDialog({
        title: t("alertCvNoTextTitle"),
        message: t("alertCvNoTextMsg").replace("{filename}", file.name),
        type: "warning",
        okText: t("btnUnderstood")
      });
      return;
    }

    const parsed = parseCvTextToStructuredData(rawText, file.name);
    pendingUploadedCvData = {
      mode,
      fileName: file.name,
      fileSize: file.size,
      rawText,
      parsed
    };

    if (mode === "add") {
      const mainLabel = document.getElementById("cvDropzoneMainLabel");
      if (mainLabel) mainLabel.textContent = t("lblCvDropzoneSub");

      const chip = document.getElementById("cvUploadedFileChip");
      const chipName = document.getElementById("cvUploadedFileName");
      if (chip && chipName) {
        chipName.textContent = `📄 ${file.name} (${sizeKb} KB) — ${t("cvAutoExtracted")}`;
        chip.style.display = "flex";
      }

      const rawBox = document.getElementById("rawCvParseText");
      if (rawBox) rawBox.value = rawText;

      const count = autoFillAddCandidateForm(parsed, file.name);
      showToast(t("msgCvProcessed").replace("{fileName}", file.name).replace("{count}", count));
    } else {
      const count = autoFillApplyJobForm(parsed, file.name);
      showToast(`CV "${file.name}" diproses! ${count} kolom lamaran terisi otomatis.`);
    }
  } catch (err) {
    console.error("CV upload extraction error:", err);
    if (mode === "add") {
      const mainLabel = document.getElementById("cvDropzoneMainLabel");
      if (mainLabel) mainLabel.textContent = t("lblCvDropzoneSub");
    }
    showAlertDialog({
      title: t("alertCvReadFailedTitle"),
      message: t("alertCvReadFailedMsg").replace("{filename}", file.name),
      type: "warning",
      okText: t("btnUnderstood")
    });
  }
}

function initCvUploadAndParserHandlers() {
  const dropzone = document.getElementById("cvUploadDropzone");
  const fileInput = document.getElementById("cvUploadFileInput");
  const btnSelectFile = document.getElementById("btnSelectCvFile");
  const btnClearFile = document.getElementById("btnClearUploadedCv");
  const btnToggleRaw = document.getElementById("btnToggleRawCvText");
  const rawWrap = document.getElementById("rawCvParseWrap");
  const btnSample = document.getElementById("btnLoadSampleCv");

  const triggerPicker = (e) => {
    if (e) e.stopPropagation();
    fileInput?.click();
  };

  btnSelectFile?.addEventListener("click", triggerPicker);
  dropzone?.addEventListener("click", e => {
    if (e.target.closest("#btnSelectCvFile")) return;
    fileInput?.click();
  });
  dropzone?.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput?.click();
    }
  });

  if (dropzone) {
    ["dragenter", "dragover"].forEach(evtName => {
      dropzone.addEventListener(evtName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach(evtName => {
      dropzone.addEventListener(evtName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("drag-over");
      });
    });
    dropzone.addEventListener("drop", e => {
      const file = e.dataTransfer?.files?.[0];
      if (file) handleCvFileSelected(file, "add");
    });
  }

  fileInput?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (file) handleCvFileSelected(file, "add");
  });

  btnClearFile?.addEventListener("click", () => {
    resetCvUploadUi("add");
    showToast(t("msgCvCleared"));
  });

  btnToggleRaw?.addEventListener("click", () => {
    if (!rawWrap) return;
    const isHidden = rawWrap.style.display === "none" || !rawWrap.style.display;
    rawWrap.style.display = isHidden ? "block" : "none";
    if (isHidden) document.getElementById("rawCvParseText")?.focus();
  });

  btnSample?.addEventListener("click", () => {
    const sampleText = [
      "CURRICULUM VITAE",
      "Nama Lengkap: Maya Indah Kusuma",
      "Jenis Kelamin: Perempuan",
      "Tanggal Lahir: 14 Agustus 1998",
      "Kewarganegaraan: Indonesia",
      "Domisili: Jakarta Selatan",
      "Email: maya.indah@fintech.co.id",
      "No. HP / WhatsApp: +62 813-8899-7711",
      "Posisi Tujuan: Senior Backend Engineer",
      "Perusahaan Tujuan: Shopee Indonesia",
      "Bahasa: Indonesian, English, Mandarin (HSK 4)",
      "Pendidikan: S1 Teknik Informatika - Institut Teknologi Bandung (2016 - 2020)",
      "Ekspektasi Gaji: IDR 25,000,000",
      "",
      "RINGKASAN PROFESIONAL:",
      "Senior Backend Engineer berpengalaman lebih dari 6 tahun membangun arsitektur microservices berkecepatan tinggi menggunakan Golang, Docker, Kubernetes, PostgreSQL, dan Apache Kafka.",
      "",
      "CORE SKILLS:",
      "Golang, Docker, Kubernetes, PostgreSQL, Redis, Kafka, Microservices, CI/CD, AWS",
      "",
      "PENGALAMAN KERJA:",
      "Senior Backend Engineer - FinTech Unicorn Jakarta (2021 - Present)",
      "Backend Developer - Digital Payment Solutions (2020 - 2021)"
    ].join("\n");

    const rawBox = document.getElementById("rawCvParseText");
    if (rawBox) rawBox.value = sampleText;
    const parsed = parseCvTextToStructuredData(sampleText, "CV_Maya_Indah_Kusuma.pdf");
    pendingUploadedCvData = {
      mode: "add",
      fileName: "CV_Maya_Indah_Kusuma.pdf",
      fileSize: sampleText.length,
      rawText: sampleText,
      parsed
    };
    const chip = document.getElementById("cvUploadedFileChip");
    const chipName = document.getElementById("cvUploadedFileName");
    if (chip && chipName) {
      chipName.textContent = "📄 CV_Maya_Indah_Kusuma.pdf (Contoh Demo)";
      chip.style.display = "flex";
    }
    const count = autoFillAddCandidateForm(parsed, "Contoh CV Demo");
    showToast(t("msgCvSampleProcessed").replace("{count}", count));
  });

  // Apply Job Modal CV Upload bindings
  const applyFileInput = document.getElementById("applyCvFileInput");
  document.getElementById("btnSelectApplyCvFile")?.addEventListener("click", () => {
    applyFileInput?.click();
  });
  applyFileInput?.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if (file) handleCvFileSelected(file, "apply");
  });
}

function handleRunCvParser() {
  const rawBox = document.getElementById("rawCvParseText");
  const rawWrap = document.getElementById("rawCvParseWrap");
  const rawText = rawBox ? rawBox.value.trim() : "";

  if (!rawText) {
    if (rawWrap) rawWrap.style.display = "block";
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertEmptyCv"),
      type: "warning",
      okText: t("btnUnderstood")
    });
    return;
  }

  const parsed = parseCvTextToStructuredData(rawText);
  if (!pendingUploadedCvData || pendingUploadedCvData.mode !== "add") {
    pendingUploadedCvData = {
      mode: "add",
      fileName: "Pasted_Resume_Text.txt",
      fileSize: rawText.length,
      rawText,
      parsed
    };
  } else {
    pendingUploadedCvData.rawText = rawText;
    pendingUploadedCvData.parsed = parsed;
  }

  const count = autoFillAddCandidateForm(parsed, "Teks CV");
  showToast(t("msgCvTextProcessed").replace("{count}", count));
}

/**
 * ====================================================================
 * 15. FASE 5 (P4): KANBAN PIPELINE, WARRANTY TRACKER, E-SIGN, SOFT-DELETE & BACKUP
 * ====================================================================
 */

/**
 * 15A. SHARED STAGE TRANSITION ENGINE (DK-04, Kanban & Warranty)
 */
function transitionCandidateStage(candidateId, newCode, targetRecId = null) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return false;

  // Check Blacklist permission: only Manager/SuperAdmin can set 91
  if (newCode === 91 && activeUser.role !== "manager" && activeUser.role !== "superadmin") {
    alert("Permission denied: Only Team Managers or Super Admins can set status to 91 (Blacklist).");
    return false;
  }

  // Check mandatory reason for failure codes (19, 29, 39, 49, 90, 91)
  const failedCodes = [19, 29, 39, 49, 90, 91];
  let reasonInput = "";
  if (failedCodes.includes(newCode)) {
    reasonInput = prompt(`Reason is mandatory for setting status code ${newCode} (${getStatusName(newCode)}):`);
    if (!reasonInput || !reasonInput.trim()) {
      alert("Action cancelled: Reason is mandatory.");
      return false;
    }
  }

  // Mandatory start date when advancing to Offer Accepted (Code 31) per PRD
  let startDateVal = c.startDate || "";
  if (newCode === 31 && !startDateVal) {
    const defaultDt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const promptedDate = prompt(`Start Date is required for Code 31 (${getStatusName(31)}). Enter YYYY-MM-DD:`, defaultDt);
    if (!promptedDate || !promptedDate.trim()) {
      alert("Action cancelled: Confirmed Start Date is required for Offer Acceptance (Code 31).");
      return false;
    }
    startDateVal = promptedDate.trim();
    c.startDate = startDateVal;
  }

  if (!Array.isArray(c.recommendations) || c.recommendations.length === 0) {
    c.recommendations = [{
      id: `REC-${Date.now().toString().slice(-4)}`,
      company: c.recommendedCompany || "alauda",
      position: c.recommendedPosition || "General Position",
      statusCode: 0,
      consultantName: activeUser.name,
      timestamp: formatTimestamp(new Date()),
      notes: "Pipeline stage initialized",
      isActive: true
    }];
  }

  const targetRec = targetRecId
    ? c.recommendations.find(r => r.id === targetRecId)
    : c.recommendations[0];

  if (!targetRec) return false;

  const oldCode = targetRec.statusCode;
  targetRec.statusCode = newCode;
  targetRec.timestamp = formatTimestamp(new Date());
  if (reasonInput) targetRec.reason = reasonInput.trim();
  if (STATUS_CODES[newCode]?.isFailed || newCode === 41) {
    targetRec.isActive = false;
  } else {
    targetRec.isActive = true;
  }

  if (newCode === 40 && !c.startDate) {
    c.startDate = new Date().toISOString().slice(0, 10);
  }

  // Rule: Accepting Offer (31) auto-closes competing active recommendations on other companies
  if (newCode === 31) {
    c.recommendations.forEach(otherR => {
      if (otherR.id !== targetRec.id && otherR.isActive) {
        otherR.statusCode = 90;
        otherR.isActive = false;
        otherR.notes = `${otherR.notes || ""} (Closed automatically as candidate accepted offer elsewhere)`.trim();
      }
    });
  }

  addAuditLog(
    "STATUS_CHANGE",
    `Candidate ${c.name}`,
    `Changed code from ${oldCode} to ${newCode}. ${reasonInput ? `Reason: ${reasonInput.trim()}` : ""}`
  );
  saveCandidates(candidates);
  renderAllViews();
  showToast(`${t("msgStatusChanged")} ${c.name} -> Code ${newCode}`);
  return true;
}

/**
 * 15B. VISUAL KANBAN PIPELINE BOARD (Fase 5A)
 */
function switchResumeViewMode(mode) {
  resumeViewMode = mode === "kanban" ? "kanban" : "table";
  const tableWrapper = document.getElementById("resumeTableWrapper");
  const kanbanBox = document.getElementById("resumeKanbanContainer");
  const tableFooter = document.querySelector("#panel-resumeLib .table-footer");
  const btnTable = document.getElementById("btnViewTable");
  const btnKanban = document.getElementById("btnViewKanban");

  btnTable?.classList.toggle("active-view-btn", resumeViewMode === "table");
  btnKanban?.classList.toggle("active-view-btn", resumeViewMode === "kanban");

  if (tableWrapper) tableWrapper.style.display = resumeViewMode === "table" ? "block" : "none";
  if (tableFooter) tableFooter.style.display = resumeViewMode === "table" ? "flex" : "none";
  if (kanbanBox) kanbanBox.style.display = resumeViewMode === "kanban" ? "flex" : "none";

  if (resumeViewMode === "kanban") {
    renderKanbanBoard(getFilteredCandidates());
  } else {
    renderResumeTable();
  }
}

function renderKanbanBoard(filteredCandidates) {
  const container = document.getElementById("resumeKanbanContainer");
  if (!container) return;

  const list = Array.isArray(filteredCandidates) ? filteredCandidates : getFilteredCandidates();

  const kanbanCols = [
    { stageKey: "new", title: t("kanbanNew"), dropCode: 0, color: "var(--brand-primary)" },
    { stageKey: "pending", title: t("kanbanPending"), dropCode: 10, color: "#4f46e5" },
    { stageKey: "pass", title: t("kanbanPass"), dropCode: 12, color: "#06b6d4" },
    { stageKey: "interview", title: t("kanbanInterview"), dropCode: 20, color: "#0ea5e9" },
    { stageKey: "offer", title: t("kanbanOffer"), dropCode: 30, color: "#8b5cf6" },
    { stageKey: "entry", title: t("kanbanEntry"), dropCode: 40, color: "var(--success-color)" },
    { stageKey: "failed", title: t("kanbanFailed"), dropCode: 19, color: "var(--danger-dot)" }
  ];

  container.innerHTML = kanbanCols.map(col => {
    const colItems = list.filter(c => getStageTabForCode(computeCandidateBadge(c)) === col.stageKey);
    return `
      <div class="kanban-column" data-stage-key="${col.stageKey}" data-drop-code="${col.dropCode}">
        <div class="kanban-col-header" style="border-top: 3px solid ${col.color};">
          <span>${col.title}</span>
          <span class="status-count-badge" style="background-color: var(--brand-dark); color: #ffffff; font-weight: 800;">${colItems.length}</span>
        </div>
        <div class="kanban-col-body">
          ${colItems.length === 0 ? `<div style="font-size: 11.5px; color: var(--text-muted); text-align: center; padding: 18px 8px;">${currentLang === "id" ? "Tarik kartu kandidat ke sini" : "Drop candidate card here"}</div>` : colItems.map(c => {
            const code = computeCandidateBadge(c);
            return `
              <article class="kanban-card" draggable="true" data-candidate-id="${c.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                  <button type="button" class="candidate-link" style="text-align: left; font-weight: 700; font-size: 13px;" onclick="openCandidateProfileModal('${c.id}')">
                    ${escapeHtml(c.name)}
                  </button>
                  <span class="status-count-badge" style="font-size: 11px; ${STATUS_CODES[code]?.isFailed ? 'background-color: var(--danger-dot); color: #ffffff;' : 'background-color: var(--brand-primary); color: #161922; font-weight: 800;'}">${code}</span>
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary);">
                  <strong>${escapeHtml(c.recommendedCompany || "-")}</strong> • ${escapeHtml(c.recommendedPosition || "-")}
                </div>
                <div style="font-size: 11px; color: var(--text-muted);">
                  ${c.yearsOfService} yrs exp • ${escapeHtml(c.education || "-")}
                </div>
                <div class="card-quick-actions">
                  <select class="ctrl-select kanban-stage-select" data-candidate-id="${c.id}" aria-label="Move stage for ${escapeHtml(c.name)}" style="min-width: 0; height: 24px; font-size: 11px; padding: 0 6px; flex: 1;">
                    <option value="">Move to stage...</option>
                    <option value="10">10 - Recommended</option>
                    <option value="12">12 - CV Pass</option>
                    <option value="20">20 - Interview</option>
                    <option value="30">30 - Offer Proposed</option>
                    <option value="31">31 - Offer Accepted</option>
                    <option value="40">40 - Started Work</option>
                    <option value="19">19 - Failed</option>
                  </select>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");

  // Bind HTML5 Drag-and-Drop
  let draggedCandidateId = null;
  container.querySelectorAll(".kanban-card").forEach(card => {
    card.addEventListener("dragstart", e => {
      draggedCandidateId = card.getAttribute("data-candidate-id");
      card.classList.add("dragging");
      if (e.dataTransfer) e.dataTransfer.setData("text/plain", draggedCandidateId || "");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCandidateId = null;
    });
  });

  container.querySelectorAll(".kanban-column").forEach(colEl => {
    colEl.addEventListener("dragover", e => {
      e.preventDefault();
      colEl.classList.add("drag-over");
    });
    colEl.addEventListener("dragleave", () => {
      colEl.classList.remove("drag-over");
    });
    colEl.addEventListener("drop", e => {
      e.preventDefault();
      colEl.classList.remove("drag-over");
      const cid = draggedCandidateId || e.dataTransfer?.getData("text/plain");
      const targetCode = parseInt(colEl.getAttribute("data-drop-code"), 10);
      if (cid && !isNaN(targetCode)) {
        transitionCandidateStage(cid, targetCode);
      }
    });
  });

  // Bind Keyboard-accessible move dropdown
  container.querySelectorAll(".kanban-stage-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const cid = sel.getAttribute("data-candidate-id");
      const code = parseInt(sel.value, 10);
      if (cid && !isNaN(code)) {
        transitionCandidateStage(cid, code);
      }
    });
  });
}

/**
 * 15C. PLACEMENT FEE & 90-DAY PROBATION WARRANTY TRACKER (Fase 5C)
 */
function parseMonthlySalaryIDR(salStr) {
  if (!salStr) return 25000000;
  const cleaned = String(salStr).replace(/\./g, "").replace(/,/g, "");
  const mMatch = cleaned.match(/(\d+)\s*M/i);
  if (mMatch) return parseInt(mMatch[1], 10) * 1000000;
  const numMatch = cleaned.match(/(\d{7,})/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return 25000000;
}

function renderWarrantyTracker() {
  const tbody = document.getElementById("warrantyTrackerTableBody");
  if (!tbody) return;

  const feeRate = parseFloat(systemSettings?.agencyFeePercent) || 18;
  const warrantyDays = parseInt(systemSettings?.warrantyDays, 10) || 90;

  const placementItems = [];
  candidates.forEach(c => {
    if (c.isDeleted) return;
    (c.recommendations || []).forEach(r => {
      if ([30, 31, 40, 41, 49].includes(r.statusCode)) {
        placementItems.push({ candidate: c, rec: r });
      }
    });
  });

  if (placementItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No candidates currently in Offer or Probation Warranty stages (Codes 30, 31, 40, 41, 49).</td></tr>`;
    return;
  }

  tbody.innerHTML = placementItems.map(({ candidate: c, rec: r }) => {
    const startDtStr = c.startDate || r.timestamp.split(" ")[0];
    const startDt = new Date(startDtStr);
    const warrantyEndDt = !isNaN(startDt) ? new Date(startDt.getTime() + warrantyDays * 24 * 60 * 60 * 1000) : null;
    const warrantyEndStr = warrantyEndDt ? warrantyEndDt.toISOString().slice(0, 10) : "-";

    const monthlySal = parseMonthlySalaryIDR(c.salaryExpectation);
    const annualComp = monthlySal * 12;
    const estFee = Math.round(annualComp * (feeRate / 100));
    const formattedFee = "IDR " + estFee.toLocaleString("id-ID");

    const invStatus = r.invoiceStatus || (r.statusCode === 41 ? "Paid" : (r.statusCode === 40 ? "Invoiced" : "Draft"));
    const invColor = invStatus === "Paid" ? "#15803d" : (invStatus === "Invoiced" ? "#b45309" : "var(--text-muted)");

    return `
      <tr>
        <th scope="row">
          <button type="button" class="candidate-link" onclick="openCandidateProfileModal('${c.id}')">${escapeHtml(c.name)}</button>
        </th>
        <td><strong>${escapeHtml(r.company)}</strong><br><small style="color:var(--text-muted);">${escapeHtml(r.position)}</small></td>
        <td>
          <span class="status-count-badge" style="${STATUS_CODES[r.statusCode]?.isFailed ? 'background-color: var(--danger-dot); color: #ffffff;' : 'background-color: var(--brand-primary); color: #161922; font-weight: 800;'}">${r.statusCode}</span>
          <small style="display:block; font-size:10px; color:var(--text-muted);">${getStatusName(r.statusCode)}</small>
        </td>
        <td>
          Start: <strong>${escapeHtml(startDtStr)}</strong><br>
          <small style="color:var(--text-secondary);">Ends: ${warrantyEndStr}</small>
        </td>
        <td><strong>${formattedFee}</strong><br><small style="color:var(--text-muted);">${feeRate}% of 12mo</small></td>
        <td><span style="font-weight: 700; color: ${invColor};">${escapeHtml(invStatus)}</span></td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">
            ${r.statusCode === 40 ? `<button type="button" class="btn-outlined" style="height:24px; font-size:10.5px; padding:0 6px; color:var(--success-color);" onclick="updateWarrantyAction('${c.id}', '${r.id}', 'pass41')">Pass (41)</button>` : ""}
            ${r.statusCode === 40 ? `<button type="button" class="btn-outlined" style="height:24px; font-size:10.5px; padding:0 6px; color:var(--danger-dot);" onclick="updateWarrantyAction('${c.id}', '${r.id}', 'fail49')">Resign (49)</button>` : ""}
            ${invStatus !== "Paid" && ![49].includes(r.statusCode) ? `<button type="button" class="btn-solid" style="height:24px; font-size:10.5px; padding:0 8px;" onclick="updateWarrantyAction('${c.id}', '${r.id}', 'markPaid')">Mark Paid</button>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function updateWarrantyAction(candidateId, recId, actionType) {
  const c = candidates.find(item => item.id === candidateId);
  const r = c?.recommendations?.find(rec => rec.id === recId);
  if (!c || !r) return;

  if (actionType === "pass41") {
    transitionCandidateStage(c.id, 41, r.id);
    r.invoiceStatus = "Paid";
    saveCandidates(candidates);
  } else if (actionType === "fail49") {
    if (transitionCandidateStage(c.id, 49, r.id)) {
      r.invoiceStatus = "Warranty Replacement Required";
      saveCandidates(candidates);
    }
  } else if (actionType === "markPaid") {
    r.invoiceStatus = "Paid";
    addAuditLog("INVOICE_PAID", `Candidate ${c.name}`, `Marked placement fee invoice as Paid for ${r.company}`);
    saveCandidates(candidates);
    showToast(`Placement invoice marked Paid for ${c.name}.`);
  }

  renderWarrantyTracker();
  syncTableResponsiveLabels();
}

/**
 * 15D. DIGITAL E-SIGNATURE OFFER ACCEPTANCE (Fase 5B / Code 31)
 */
function handleAcceptOfferEsign() {
  const acceptBtn = document.getElementById("btnAcceptOfferEsign");
  const candId = acceptBtn?.getAttribute("data-candidate-id");
  const startDate = document.getElementById("offerStartDateInput")?.value;
  const sigName = document.getElementById("offerSignatureInput")?.value.trim();

  if (!candId) return;
  if (!startDate) {
    alert("Confirmed Joining / Start Date is required before accepting offer (Code 31).");
    return;
  }
  if (!sigName) {
    alert("Please type the candidate's full name as Digital E-Signature.");
    return;
  }

  const c = candidates.find(item => item.id === candId);
  if (!c) return;

  c.startDate = startDate;
  c.digitalSignature = sigName;

  const rec = c.recommendations?.[0];
  const nowFormatted = formatTimestamp(new Date());

  if (rec) {
    rec.statusCode = 31; // Offer Accepted
    rec.timestamp = nowFormatted;
    rec.isActive = true;
    rec.notes = `Offer signed digitally by "${sigName}". Confirmed start date: ${startDate} (Code 31 - Offer Accepted).`;
    c.recommendations.forEach(otherR => {
      if (otherR.id !== rec.id && otherR.isActive) {
        otherR.statusCode = 90;
        otherR.isActive = false;
        otherR.notes = `${otherR.notes || ""} (Closed automatically after E-Signed Offer Acceptance)`.trim();
      }
    });
  } else {
    c.recommendations.push({
      id: `REC-${Date.now()}`,
      company: c.recommendedCompany || "alauda",
      position: c.recommendedPosition || "Software Engineer",
      statusCode: 31,
      timestamp: nowFormatted,
      consultantName: activeUser.name,
      notes: `Offer signed digitally by "${sigName}". Start Date: ${startDate}.`,
      isActive: true
    });
  }

  saveCandidates(candidates);
  addAuditLog("OFFER_ESIGNED", `Candidate ${c.name}`, `Offer Accepted (Code 31) via E-Signature "${sigName}", Start Date: ${startDate}`);

  notifications.unshift({
    id: `NT-${Date.now()}`,
    title: `Offer Accepted (E-Signed): ${c.name}`,
    message: `${c.name} signed offer letter with start date ${startDate}. Competing active pipelines closed automatically.`,
    time: nowFormatted,
    timestamp: nowFormatted,
    read: false,
    candidateId: c.id
  });
  saveNotifications(notifications);

  openOfferLetterModal(c.id);
  renderAllViews();
  showToast(`E-Signature captured! ${c.name} advanced to Code 31 (Offer Accepted).`);
}

/**
 * 15E. LIVE JOB REQUISITION POSTING (Fase 5D)
 */

/**
 * 15B. EDIT & DELETE OPEN JOB REQUISITIONS
 */
function openEditJobModal(jobId) {
  const job = openJobs.find(j => j.id === jobId);
  if (!job) {
    showToast("Lowongan tidak ditemukan.");
    return;
  }

  const modal = document.getElementById("editJobModal");
  if (!modal) return;

  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setValue("editJobId", job.id);
  setValue("editJobTitle", job.title);
  setValue("editJobCompany", job.company);
  setValue("editJobDepartment", job.department || "Engineering");
  setValue("editJobLocation", job.location || "Jakarta");
  setValue("editJobType", job.type || "Full-time");
  setValue("editJobSalary", job.salaryRange || "");
  setValue("editJobExp", job.experienceReq || job.experienceRequired || "3+ yrs");
  setValue("editJobTags", (job.tags || []).join(", "));
  setValue("editJobDesc", job.description || "");

  modal.showModal();
}

function handleEditJobSubmit(e) {
  e.preventDefault();
  const jobId = document.getElementById("editJobId")?.value;
  const title = document.getElementById("editJobTitle")?.value.trim();
  const company = document.getElementById("editJobCompany")?.value.trim();
  const department = document.getElementById("editJobDepartment")?.value.trim() || "Engineering";
  const location = document.getElementById("editJobLocation")?.value.trim() || "Jakarta";
  const type = document.getElementById("editJobType")?.value || "Full-time";
  const salaryRange = document.getElementById("editJobSalary")?.value.trim() || "Competitive";
  const exp = document.getElementById("editJobExp")?.value.trim() || "3+ yrs";
  const tagsRaw = document.getElementById("editJobTags")?.value.trim() || "";
  const description = document.getElementById("editJobDesc")?.value.trim();

  if (!jobId || !title || !company || !description) {
    showAlertDialog({
      title: t("alertNotification"),
      message: t("alertFillJobRequired"),
      type: "warning"
    });
    return;
  }

  const idx = openJobs.findIndex(j => j.id === jobId);
  if (idx < 0) {
    alert("Lowongan tidak ditemukan.");
    return;
  }

  openJobs[idx] = {
    ...openJobs[idx],
    title,
    company,
    department,
    location,
    type,
    salaryRange,
    experienceReq: exp,
    experienceRequired: exp,
    tags: tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [department],
    description
  };

  saveOpenJobs(openJobs);

  if (!masterCompanies.includes(company)) {
    masterCompanies.push(company);
    saveMasterCompanies(masterCompanies);
  }
  if (!masterPositions.includes(title)) {
    masterPositions.push(title);
    saveMasterPositions(masterPositions);
  }

  addAuditLog("UPDATE_JOB_ORDER", `Job ${title}`, `Updated requisition details at ${company}`);
  document.getElementById("editJobModal")?.close();
  renderCareerPortal();
  showToast(`Lowongan "${title}" berhasil diperbarui!`);
}

async function handleDeleteJob() {
  const jobId = document.getElementById("editJobId")?.value;
  const job = openJobs.find(j => j.id === jobId);
  if (!job) return;

  const ok = await showConfirmDialog({
    title: t("confirmDeleteJobTitle"),
    message: t("confirmDeleteJobMsg").replace("{job}", job.title).replace("{company}", job.company),
    confirmText: t("btnDelete"),
    cancelText: t("btnCancel"),
    type: "danger"
  });

  if (!ok) {
    return;
  }

  openJobs = openJobs.filter(j => j.id !== jobId);
  saveOpenJobs(openJobs);

  addAuditLog("DELETE_JOB_ORDER", `Job ${job.title}`, `Removed requisition at ${job.company}`);
  document.getElementById("editJobModal")?.close();
  renderCareerPortal();
  showToast(`Lowongan "${job.title}" telah dihapus.`);
}

function handlePostJobSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("postJobTitle")?.value.trim();
  const company = document.getElementById("postJobCompany")?.value.trim();
  const department = document.getElementById("postJobDepartment")?.value.trim() || "Engineering";
  const location = document.getElementById("postJobLocation")?.value.trim() || "Jakarta";
  const type = document.getElementById("postJobType")?.value || "Full-time";
  const salaryRange = document.getElementById("postJobSalary")?.value.trim() || "Competitive";
  const exp = document.getElementById("postJobExp")?.value.trim() || "3+ Years";
  const tagsRaw = document.getElementById("postJobTags")?.value.trim() || "";
  const description = document.getElementById("postJobDesc")?.value.trim();

  if (!title || !company || !description) return;

  const newJob = {
    id: `JOB-${Math.floor(10 + Math.random() * 90)}`,
    title,
    company,
    department,
    location,
    type,
    salaryRange,
    experienceRequired: exp,
    postedDate: new Date().toISOString().slice(0, 10),
    tags: tagsRaw ? tagsRaw.split(",").map(s => s.trim()).filter(Boolean) : [department],
    description
  };

  openJobs.unshift(newJob);
  saveOpenJobs(openJobs);

  if (!masterCompanies.includes(company)) {
    masterCompanies.push(company);
    saveMasterCompanies(masterCompanies);
  }
  if (!masterPositions.includes(title)) {
    masterPositions.push(title);
    saveMasterPositions(masterPositions);
  }

  addAuditLog("POST_JOB_ORDER", `Job ${title}`, `Published new open requisition at ${company}`);
  e.target.reset();
  document.getElementById("postJobModal")?.close();

  const filterComp = document.getElementById("careerFilterCompany");
  if (filterComp) {
    filterComp.innerHTML = `<option value="all">All Companies</option>`;
  }

  renderAllViews();
  showToast(`Published job order "${title}" to Public Career Portal!`);
}

/**
 * 15F. SOFT DELETE, PERMANENT DELETE, SYSTEM SETTINGS & JSON BACKUP
 */
function toggleSoftDeleteCandidate(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;
  c.isDeleted = !c.isDeleted;
  saveCandidates(candidates);
  addAuditLog(
    c.isDeleted ? "SOFT_DELETE" : "RESTORE_CANDIDATE",
    `Candidate ${c.name}`,
    c.isDeleted ? "Moved candidate to archive" : "Restored candidate from archive"
  );
  renderAllViews();
  showToast(c.isDeleted ? `${c.name} archived (Soft Delete).` : `${c.name} restored to active library.`);
}

async function hardDeleteCandidate(candidateId) {
  if (activeUser.role !== "superadmin") {
    showAlertDialog({
      title: t("alertAccessDenied"),
      message: t("alertSuperAdminDeleteOnly"),
      type: "danger"
    });
    return false;
  }
  const idx = candidates.findIndex(item => item.id === candidateId);
  if (idx < 0) return false;

  const candidate = candidates[idx];
  const ok = await showConfirmDialog({
    title: t("confirmDeleteCandidateTitle"),
    message: t("confirmDeleteCandidateMsg").replace("{name}", candidate.name).replace("{id}", candidate.id),
    confirmText: t("btnDelete"),
    cancelText: t("btnCancel"),
    type: "danger"
  });
  if (!ok) {
    return false;
  }

  const removed = candidates.splice(idx, 1)[0];
  saveCandidates(candidates);
  addAuditLog("HARD_DELETE", `Candidate ${removed.name}`, `Permanently removed record ${removed.id}`);
  renderAllViews();
  showToast(t("msgCandidateDeleted").replace("{name}", removed.name));
  return true;
}

function syncSystemSettingsInputs() {
  const dupInput = document.getElementById("settingDupMonthsInput");
  const feeInput = document.getElementById("settingFeePercentInput");
  if (dupInput) dupInput.value = systemSettings.duplicateWindowMonths ?? 6;
  if (feeInput) feeInput.value = systemSettings.agencyFeePercent ?? 18;
}

function handleSaveSystemSettings() {
  const months = Math.min(24, Math.max(1, parseInt(document.getElementById("settingDupMonthsInput")?.value, 10) || 6));
  const fee = Math.min(35, Math.max(5, parseFloat(document.getElementById("settingFeePercentInput")?.value) || 18));

  systemSettings = { ...systemSettings, duplicateWindowMonths: months, agencyFeePercent: fee };
  saveSystemSettings(systemSettings);
  addAuditLog("UPDATE_POLICY", "System Governance", `Set duplicate check window=${months}mo, agency fee=${fee}%`);
  renderWarrantyTracker();
  showToast(t("msgPolicySaved").replace("{months}", months).replace("{fee}", fee));
}

function exportFullDatabaseJson() {
  const bundle = {
    app: "NextKerja ATS",
    version: "Phase 5 (P4)",
    exportedAt: new Date().toISOString(),
    exportedBy: activeUser.name,
    candidates,
    openJobs,
    scheduledInterviews,
    notifications,
    masterCompanies,
    masterPositions,
    users: USERS,
    systemSettings,
    auditLogs: getStoredAuditLogs()
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NextKerja_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  document.getElementById("userProfileDropdown")?.classList.remove("open");
  addAuditLog("JSON_BACKUP_EXPORT", "Full Database", `Exported ${candidates.length} candidates & system config`);
  showToast("Full JSON backup downloaded.");
}

function importFullDatabaseJson(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(String(ev.target?.result || "{}"));
      if (!Array.isArray(parsed.candidates)) {
        alert("Invalid backup file: missing candidates array.");
        return;
      }
      candidates = parsed.candidates;
      saveCandidates(candidates);
      if (Array.isArray(parsed.openJobs)) { openJobs = parsed.openJobs; saveOpenJobs(openJobs); }
      if (Array.isArray(parsed.scheduledInterviews)) { scheduledInterviews = parsed.scheduledInterviews; saveInterviews(scheduledInterviews); }
      if (Array.isArray(parsed.notifications)) { notifications = parsed.notifications; saveNotifications(notifications); }
      if (Array.isArray(parsed.masterCompanies)) { masterCompanies = parsed.masterCompanies; saveMasterCompanies(masterCompanies); }
      if (Array.isArray(parsed.masterPositions)) { masterPositions = parsed.masterPositions; saveMasterPositions(masterPositions); }
      if (Array.isArray(parsed.users)) { USERS = parsed.users; saveUsers(USERS); }
      if (parsed.systemSettings) { systemSettings = parsed.systemSettings; saveSystemSettings(systemSettings); }

      document.getElementById("userProfileDropdown")?.classList.remove("open");
      addAuditLog("JSON_BACKUP_RESTORE", "Full Database", `Restored ${candidates.length} candidates from ${file.name}`);
      renderAllViews();
      showToast(`Restored database backup (${candidates.length} candidates)!`);
    } catch (err) {
      alert(`Failed to parse JSON backup: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

// Expose handlers globally for HTML event attributes
window.openApplyJobModal = openApplyJobModal;
window.openEditJobModal = openEditJobModal;
window.openCandidateProfileModal = openCandidateProfileModal;
window.openScheduleInterviewModal = openScheduleInterviewModal;
window.downloadIcsCalendar = downloadIcsCalendar;
window.markInterviewComplete = markInterviewComplete;
window.openOfferLetterModal = openOfferLetterModal;
window.runDemoScenario = runDemoScenario;
window.resetAllDemoData = resetAllDemoData;
window.switchWorkspaceView = switchWorkspaceView;
window.switchResumeViewMode = switchResumeViewMode;
window.updateWarrantyAction = updateWarrantyAction;
window.toggleSoftDeleteCandidate = toggleSoftDeleteCandidate;
window.hardDeleteCandidate = hardDeleteCandidate;

/**
 * 16. FASE 6: MULTI-SELECT BATCH OPERATIONS & CANDIDATE OUTREACH HUB
 */
function updateBatchToolbarUI() {
  const toolbar = document.getElementById("batchActionToolbar");
  const countEl = document.getElementById("batchSelectedCount");
  const selectAllCb = document.getElementById("selectAllCandidatesCb");

  if (toolbar) {
    toolbar.style.display = selectedCandidateIds.size > 0 ? "flex" : "none";
  }
  if (countEl) {
    countEl.textContent = `${selectedCandidateIds.size} ${t("lblBatchSelected") || "selected"}`;
  }
  if (selectAllCb) {
    const visibleChecks = Array.from(document.querySelectorAll("#resumeTableBody .candidate-row-check"));
    if (visibleChecks.length === 0) {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = false;
    } else {
      const checkedCount = visibleChecks.filter(cb => selectedCandidateIds.has(cb.value)).length;
      selectAllCb.checked = checkedCount === visibleChecks.length;
      selectAllCb.indeterminate = checkedCount > 0 && checkedCount < visibleChecks.length;
    }
  }
}

function clearBatchSelection() {
  selectedCandidateIds.clear();
  document.querySelectorAll("#resumeTableBody .candidate-row-check").forEach(cb => {
    cb.checked = false;
  });
  const selectAllCb = document.getElementById("selectAllCandidatesCb");
  if (selectAllCb) {
    selectAllCb.checked = false;
    selectAllCb.indeterminate = false;
  }
  updateBatchToolbarUI();
}

function handleBatchTag() {
  if (selectedCandidateIds.size === 0) return;
  const tag = prompt("Enter tag to add to selected candidates (e.g. Fast Track, Mandarin Fluent):")?.trim();
  if (!tag) return;

  let updatedCount = 0;
  candidates.forEach(c => {
    if (!selectedCandidateIds.has(c.id)) return;
    if (!Array.isArray(c.tags)) c.tags = ["Siap Relokasi", "Verified"];
    if (!c.tags.includes(tag)) c.tags.push(tag);
    updatedCount++;
  });

  saveCandidates(candidates);
  addAuditLog("BATCH_TAG", `${updatedCount} Candidates`, `Applied tag "${tag}" in bulk`);
  clearBatchSelection();
  renderAllViews();
  showToast(`Added tag "${tag}" to ${updatedCount} candidate(s).`);
}

async function handleBatchArchive() {
  if (selectedCandidateIds.size === 0) return;
  const count = selectedCandidateIds.size;
  const ok = await showConfirmDialog({
    title: t("confirmBatchArchiveTitle"),
    message: t("confirmBatchArchiveMsg").replace("{count}", count),
    confirmText: t("btnConfirm"),
    cancelText: t("btnCancel"),
    type: "warning"
  });
  if (!ok) {
    return;
  }

  let archivedCount = 0;
  let lockedSkipped = 0;
  candidates.forEach(c => {
    if (!selectedCandidateIds.has(c.id)) return;
    if (computeCandidateBadge(c) >= 40) {
      lockedSkipped++;
      return;
    }
    c.isDeleted = true;
    archivedCount++;
  });

  saveCandidates(candidates);
  addAuditLog("BATCH_ARCHIVE", `${archivedCount} Candidates`, `Archived ${archivedCount}, skipped ${lockedSkipped} locked`);
  clearBatchSelection();
  renderAllViews();
  showToast(`Archived ${archivedCount} candidate(s)${lockedSkipped ? ` (${lockedSkipped} locked onboarded records skipped)` : ""}.`);
}

function handleBatchRecommend() {
  if (selectedCandidateIds.size === 0) return;
  const company = prompt("Enter Target Client Company:", masterCompanies[0] || "alauda")?.trim();
  if (!company) return;

  const customPos = prompt("Enter Target Position (leave empty to use each candidate's current position):", "");
  if (customPos === null) return;

  const nowStr = formatTimestamp(new Date());
  let passedCount = 0;
  const blockedList = [];

  candidates.forEach(c => {
    if (!selectedCandidateIds.has(c.id)) return;
    const targetPos = customPos.trim() || c.recommendedPosition || masterPositions[0] || "Senior Engineer";
    const evalResult = evaluateRecRepeatRules(c, company, targetPos, activeUser.name);

    if (evalResult.blocked || (evalResult.requiresManager && activeUser.role === "consultant")) {
      blockedList.push(c.name);
      return;
    }

    c.recommendedCompany = company;
    c.recommendedPosition = targetPos;
    c.entryTime = nowStr;
    if (!Array.isArray(c.recommendations)) c.recommendations = [];
    c.recommendations.unshift({
      id: `REC-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 90 + 10)}`,
      company,
      position: targetPos,
      statusCode: 10,
      consultantName: activeUser.name,
      timestamp: nowStr,
      reason: evalResult.requiresReason ? "Batch campaign submission" : "",
      notes: "Batch recommended via Resume Lib.",
      isActive: true
    });
    passedCount++;
  });

  if (passedCount > 0) {
    saveCandidates(candidates);
    addAuditLog("BATCH_RECOMMEND", `${passedCount} Candidates`, `Batch recommended to ${company} (blocked: ${blockedList.length})`);
  }

  clearBatchSelection();
  renderAllViews();
  showToast(`Recommended ${passedCount} candidate(s) to ${company}${blockedList.length ? ` (${blockedList.length} blocked by 6-rule check: ${blockedList.join(", ")})` : ""}.`);
}

function openOutreachModal(candidateId, defaultTemplate = "interview_invite") {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const modal = document.getElementById("outreachModal");
  const idInput = document.getElementById("outreachCandidateId");
  const infoBox = document.getElementById("outreachRecipientInfo");
  const tmplSelect = document.getElementById("outreachTemplateSelect");
  if (!modal || !idInput || !infoBox || !tmplSelect) return;

  idInput.value = c.id;
  infoBox.innerHTML = `
    <strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.id)}) —
    ${escapeHtml(c.recommendedPosition || "-")} at <strong>${escapeHtml(c.recommendedCompany || "-")}</strong><br>
    <span style="color: var(--text-secondary);">Email: ${escapeHtml(c.email || "-")} | WhatsApp: ${escapeHtml(c.whatsapp || c.phone || "-")}</span>
  `;

  tmplSelect.value = defaultTemplate;
  refreshOutreachMessageDraft();
  if (!modal.open) {
    modal.showModal();
  }
}

function refreshOutreachMessageDraft() {
  const cid = document.getElementById("outreachCandidateId")?.value;
  const tmpl = document.getElementById("outreachTemplateSelect")?.value || "interview_invite";
  const textArea = document.getElementById("outreachMessageText");
  const c = candidates.find(item => item.id === cid);
  if (!textArea || !c) return;

  const pos = c.recommendedPosition || "Senior Role";
  const comp = c.recommendedCompany || "our partner client";
  const sender = activeUser?.name || "NextKerja Recruitment Team";

  const templates = {
    interview_invite:
      `Halo ${c.name},\n\nSaya ${sender} dari NextKerja. Klien kami (${comp}) sangat tertarik dengan profil Anda untuk posisi ${pos}.\n\nApakah Anda bersedia untuk jadwal interview online dalam 2 hari ke depan? Mohon info slot waktu yang paling nyaman untuk Anda.\n\nTerima kasih,\n${sender}`,
    offer_followup:
      `Halo ${c.name},\n\nSelamat! Surat penawaran resmi (Offer Letter) untuk posisi ${pos} di ${comp} telah kami terbitkan.\n\nSilakan tinjau detail kompensasi dan lengkapi tanda tangan digital Anda agar proses onboarding dapat segera dijadwalkan.\n\nSalam hangat,\n${sender}`,
    headhunter_intro:
      `Hi ${c.name},\n\nI'm ${sender} at NextKerja Executive Search. Given your background, we have an exciting ${pos} mandate with ${comp} offering competitive compensation and career growth.\n\nWould you be open to a brief 15-minute confidential chat this week?\n\nBest regards,\n${sender}`,
    probation_checkin:
      `Halo ${c.name},\n\nSemoga masa onboarding dan probation Anda sebagai ${pos} di ${comp} berjalan lancar! Sebagai bentuk layanan garansi 90 hari NextKerja, kami ingin memastikan adaptasi tim dan target berjalan optimal.\n\nKabari jika ada hal yang perlu kami bantu koordinasikan.\n\nTerima kasih,\n${sender}`
  };

  textArea.value = templates[tmpl] || templates.interview_invite;
  syncOutreachLinks();
}

function syncOutreachLinks() {
  const cid = document.getElementById("outreachCandidateId")?.value;
  const c = candidates.find(item => item.id === cid);
  const msg = document.getElementById("outreachMessageText")?.value || "";
  const waBtn = document.getElementById("btnOpenWhatsApp");
  const mailBtn = document.getElementById("btnOpenMailto");

  const rawPhone = String(c?.whatsapp || c?.phone || "6281200000000").replace(/[^\d]/g, "");
  const cleanPhone = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;

  if (waBtn) {
    waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  }
  if (mailBtn) {
    const subject = `NextKerja Opportunity: ${c?.recommendedPosition || "Recruitment Update"} - ${c?.recommendedCompany || ""}`;
    mailBtn.href = `mailto:${encodeURIComponent(c?.email || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
  }
}

function copyOutreachDraft() {
  const text = document.getElementById("outreachMessageText")?.value || "";
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Outreach message copied to clipboard."))
      .catch(() => showToast("Select and copy message manually from text box."));
  } else {
    const area = document.getElementById("outreachMessageText");
    area?.select();
    showToast("Message highlighted — press Ctrl+C / Cmd+C to copy.");
  }
}

window.openOutreachModal = openOutreachModal;
window.openAddCandidateModal = openAddCandidateModal;
window.applyColumnPreset = applyColumnPreset;
window.hideColumn = hideColumn;
window.deleteMasterCompany = deleteMasterCompany;
window.deleteMasterPosition = deleteMasterPosition;
window.deleteMasterLanguage = deleteMasterLanguage;
window.deleteMasterCountry = deleteMasterCountry;
