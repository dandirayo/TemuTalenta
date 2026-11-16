/**
 * TemuTalenta - Enterprise ATS Controller (Comprehensive & Multi-Phase Implementation)
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

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

document.addEventListener("DOMContentLoaded", () => {
  initThemeState();
  currentLang = getStoredLang();
  candidates = getStoredCandidates();
  visibleColumns = getStoredVisibleColumns();
  activeUser = getStoredActiveUser();
  notifications = getStoredNotifications();
  masterCompanies = getStoredMasterCompanies();
  masterPositions = getStoredMasterPositions();
  openJobs = getStoredOpenJobs();
  scheduledInterviews = getStoredInterviews();

  bindGlobalEvents();
  setupDialogLightDismiss();
  restoreFiltersFromUrl();
  applyTranslations();
  applyRolePermissions();
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
  if (currentLang === "zh") return meta.nameZh;
  if (currentLang === "id") return meta.nameId;
  return meta.nameEn;
}

function setLanguage(lang) {
  if (!I18N[lang]) return;
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

  const switchBtn = document.getElementById("langSwitchBtn");
  const lblZh = document.getElementById("langLabelZh");
  const lblEn = document.getElementById("langLabelEn");
  const selLang = document.getElementById("langSelectorDropdown");

  if (switchBtn) switchBtn.setAttribute("aria-checked", currentLang === "en" ? "true" : "false");
  if (lblZh) lblZh.classList.toggle("active", currentLang === "zh");
  if (lblEn) lblEn.classList.toggle("active", currentLang === "en");
  if (selLang) selLang.value = currentLang;

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
        <button type="button" class="btn-outlined" style="color: white; border-color: rgba(255,255,255,0.4); font-size: 11px; padding: 3px 8px;" onclick="switchActiveUser('USR-01')">Exit Client Portal</button>
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
        const span = btn.querySelector("span[data-i18n], span:not(.sort-icons)");
        labelText = (span ? span.textContent : btn.textContent).trim();
      } else {
        labelText = th.textContent.trim();
      }
      labelText = labelText.replace(/[▲▼]/g, "").trim();
      table.style.setProperty(`--label-${idx + 1}`, JSON.stringify(labelText || `Col ${idx + 1}`));
    });
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

  document.getElementById("langSwitchBtn")?.addEventListener("click", () => {
    setLanguage(currentLang === "zh" ? "en" : "zh");
  });
  document.getElementById("langLabelZh")?.addEventListener("click", () => setLanguage("zh"));
  document.getElementById("langLabelEn")?.addEventListener("click", () => setLanguage("en"));
  document.getElementById("langSelectorDropdown")?.addEventListener("change", (e) => {
    setLanguage(e.target.value);
  });

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

  ["advNationality", "advGender", "advMinAge", "advMaxAge", "advEducation", "advMinService"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      currentPage = 1;
      renderResumeTable();
    });
  });

  document.getElementById("btnResetDatabase")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    candidates = getStoredCandidates();
    currentPage = 1;
    renderAllViews();
    showToast(t("msgResetDone"));
  });

  // Add Candidate
  document.getElementById("btnOpenAddModal")?.addEventListener("click", () => {
    populateCompanyAndPositionSelects("addCompanySelect", "addPositionSelect");
    document.getElementById("addCandidateModal")?.showModal();
  });

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
  document.getElementById("cbFilterConsultant")?.addEventListener("change", renderConsultantBusinessHub);
  document.getElementById("cbFilterCompany")?.addEventListener("change", renderConsultantBusinessHub);
  document.getElementById("cbFilterStatus")?.addEventListener("change", renderConsultantBusinessHub);

  // Analytics Date Filter & Export (DA-01, DA-05)
  document.getElementById("analyticsDateRange")?.addEventListener("change", renderAdvancedAnalytics);
  document.getElementById("btnExportAnalytics")?.addEventListener("click", exportAnalyticsCsv);

  // Fase 4: Career Portal, Interview Scheduler, Offer Letter & CV Parser
  document.getElementById("btnRunCvParser")?.addEventListener("click", handleRunCvParser);
  document.getElementById("careerFilterCompany")?.addEventListener("change", renderCareerPortal);
  document.getElementById("careerSearchQuery")?.addEventListener("input", renderCareerPortal);
  document.getElementById("btnOpenScheduleModal")?.addEventListener("click", () => openScheduleInterviewModal());
  document.getElementById("formScheduleInterview")?.addEventListener("submit", handleScheduleInterviewSubmit);
  document.getElementById("formApplyJob")?.addEventListener("submit", handleApplyJobSubmit);
  document.getElementById("intCandidateSelect")?.addEventListener("change", handleIntCandidateChange);
  document.getElementById("btnSendOfferCandidate")?.addEventListener("click", handleSendOfferClick);

  // Forms
  document.getElementById("formRecRepeat")?.addEventListener("submit", handleRecRepeatSubmit);
  document.getElementById("formAddCandidate")?.addEventListener("submit", handleAddCandidateSubmit);
  document.getElementById("formAddMasterCompany")?.addEventListener("submit", handleAddMasterCompany);
  document.getElementById("formAddMasterPosition")?.addEventListener("submit", handleAddMasterPosition);
  document.getElementById("formAddUser")?.addEventListener("submit", handleAddUser);
}

function switchWorkspaceView(viewId, pushHistory = true) {
  if (viewId === "addCandidateModalTrigger") {
    populateCompanyAndPositionSelects("addCompanySelect", "addPositionSelect");
    document.getElementById("addCandidateModal")?.showModal();
    return;
  }

  currentView = viewId;
  if (pushHistory && navigationHistory[navigationHistory.length - 1] !== viewId) {
    navigationHistory.push(viewId);
  }

  document.querySelectorAll(".submenu-item-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
  });

  document.querySelectorAll(".mobile-bottom-nav [data-view]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
  });

  document.querySelectorAll(".workspace-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${viewId}`);
  });

  closeMobileSidebar();
  renderAllViews();
}

function syncStageTabsUI() {
  document.querySelectorAll(".stage-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-stage") === currentStageFilter);
  });
}

function resetSearchFilters() {
  const ids = ["searchCandidateName", "searchKeyword", "advMinAge", "advMaxAge", "advMinService", "advNationality"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const stateSelect = document.getElementById("searchStateSelect");
  const advGender = document.getElementById("advGender");
  const advEdu = document.getElementById("advEducation");

  if (stateSelect) stateSelect.value = "all";
  if (advGender) advGender.value = "all";
  if (advEdu) advEdu.value = "all";

  currentStageFilter = "all";
  currentPage = 1;
  syncStageTabsUI();
  syncFiltersToUrl();
  renderResumeTable();
}

/**
 * 6. COLUMN SELECTOR & TABLE RENDERING
 */
function renderColumnSelector() {
  const menu = document.getElementById("colDropdownMenu");
  const countTag = document.getElementById("colExtraCountTag");
  if (!menu) return;

  const extraCount = Math.max(0, visibleColumns.length - 1);
  if (countTag) countTag.textContent = `+ ${extraCount}`;

  menu.innerHTML = ALL_COLUMNS.map(col => {
    const checked = visibleColumns.includes(col.id) ? "checked" : "";
    const disabled = col.locked ? "disabled" : "";
    return `
      <label class="col-check-item">
        <input type="checkbox" value="${col.id}" ${checked} ${disabled}>
        <span>${t(col.key)}</span>
      </label>
    `;
  }).join("");

  menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", () => {
      const colId = cb.value;
      if (cb.checked) {
        if (!visibleColumns.includes(colId)) visibleColumns.push(colId);
      } else {
        visibleColumns = visibleColumns.filter(id => id !== colId);
      }
      saveVisibleColumns(visibleColumns);
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

  return candidates.filter(c => {
    const badgeCode = computeCandidateBadge(c);
    const candidateStageTab = getStageTabForCode(badgeCode);
    const calculatedAge = calculateAge(c.birthDate);

    const matchName = !nameQ || c.name.toLowerCase().includes(nameQ);
    const matchKw =
      !kwQ ||
      c.recommendedPosition.toLowerCase().includes(kwQ) ||
      c.recommendedCompany.toLowerCase().includes(kwQ) ||
      c.language.toLowerCase().includes(kwQ) ||
      c.education.toLowerCase().includes(kwQ) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(kwQ))) ||
      (c.summary && c.summary.toLowerCase().includes(kwQ));

    const matchStage = currentStageFilter === "all" || candidateStageTab === currentStageFilter;
    const matchNat = !natQ || c.nationality.toLowerCase().includes(natQ);
    const matchGender = genderQ === "all" || c.gender === genderQ;
    const matchAge = calculatedAge >= (isNaN(minAge) ? 0 : minAge) && calculatedAge <= (isNaN(maxAge) ? 999 : maxAge);
    const matchEdu = eduQ === "all" || c.education === eduQ;
    const matchService = c.yearsOfService >= (isNaN(minService) ? 0 : minService);

    // Client Portal: Only show candidates recommended to clientCompany
    let matchClient = true;
    if (activeUser.role === "client" && activeUser.clientCompany) {
      matchClient = (c.recommendations || []).some(r => r.company.toLowerCase() === activeUser.clientCompany.toLowerCase()) ||
                    (c.recommendedCompany || "").toLowerCase() === activeUser.clientCompany.toLowerCase();
    }

    return matchName && matchKw && matchStage && matchNat && matchGender && matchAge && matchEdu && matchService && matchClient;
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

    if (sortType) {
      return `
        <th scope="col" data-col-id="${col.id}" data-type="${sortType}"${ariaSortAttr}>
          <button type="button" class="sort-header-btn" data-sort-col="${col.id}">
            <span>${t(col.key)}</span>
            <span class="sort-icons" aria-hidden="true">
              <span class="sort-up">▲</span>
              <span class="sort-down">▼</span>
            </span>
          </button>
        </th>
      `;
    }
    return `<th scope="col" data-col-id="${col.id}">${t(col.key)}</th>`;
  }).join("");

  theadRow.querySelectorAll(".sort-header-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const colId = btn.getAttribute("data-sort-col");
      handleColumnSort(colId, btn);
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
    tbody.innerHTML = `
      <tr>
        <td colspan="${activeCols.length}" style="padding: 36px; color: var(--text-muted);">
          ${t("emptyTable")}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pagedRecords.map(c => buildCandidateRowHtml(c, activeCols)).join("");
  bindTableRowActions(tbody);
  syncTableResponsiveLabels();
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
  const badgeBg = statusMeta.isFailed ? "background-color: var(--danger-dot);" : "background-color: var(--brand-primary);";

  const cells = activeCols.map(col => {
    switch (col.id) {
      case "candidate":
        return `
          <th scope="row" data-value="${escapeHtml(c.name)}">
            <button type="button" class="candidate-link" data-action="profile" data-id="${c.id}">
              ${escapeHtml(c.name).replace(" ", '<span class="name-break"> </span>')}
              ${c.isUnviewed ? `<span style="display:inline-block; width:6px; height:6px; background-color:var(--danger-dot); border-radius:50%; margin-left:3px;" title="Unviewed"></span>` : ""}
            </button>
          </th>
        `;
      case "nationality":
        return `<td>${escapeHtml(c.nationality || "")}</td>`;
      case "status":
        return `
          <td data-value="${badgeCode}">
            <span class="status-count-badge" style="${badgeBg}" title="${getStatusName(badgeCode)}">${badgeCode}</span>
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
            </div>
          </td>
        `;
      default:
        return `<td></td>`;
    }
  });

  return `<tr data-candidate-id="${c.id}">${cells.join("")}</tr>`;
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
    });
  });
}

function openCandidateProfileModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  c.isUnviewed = false;
  saveCandidates(candidates);

  const dialog = document.getElementById("profileModal");
  const body = document.getElementById("profileModalBody");
  if (!dialog || !body) return;

  const currentBadge = computeCandidateBadge(c);
  const calculatedAge = calculateAge(c.birthDate);

  body.innerHTML = `
    <!-- Candidate Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid var(--border-base); margin-bottom: 14px;">
      <div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--brand-primary);">${escapeHtml(c.name)}</h3>
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
          <button type="button" class="btn-outlined" id="btnProfileScheduleInt" style="height: 24px; font-size: 11px; padding: 0 8px;">Schedule Interview</button>
          <button type="button" class="btn-outlined" id="btnProfileGenOffer" style="height: 24px; font-size: 11px; padding: 0 8px;">Generate Offer</button>
        </div>
      </div>
    </div>

    <!-- Sub-tabs navigation -->
    <div class="profile-subtabs">
      <button type="button" class="profile-tab-btn active" data-ptab="overview">${t("tabOverview")}</button>
      <button type="button" class="profile-tab-btn" data-ptab="workEdu">${t("tabWorkEdu")}</button>
      <button type="button" class="profile-tab-btn" data-ptab="cvViewer">${t("tabCvViewer")}</button>
      <button type="button" class="profile-tab-btn" data-ptab="timeline">${t("tabTimeline")}</button>
    </div>

    <!-- PANE 1: Overview & Contacts (DK-01) -->
    <div id="pane-overview" class="profile-tab-pane active">
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
          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 3px;">
            ${(c.tags || ["Siap Relokasi", "Verified"]).map(tg => `<span class="col-tag">${escapeHtml(tg)}</span>`).join("")}
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
    <div id="pane-workEdu" class="profile-tab-pane">
      <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Employment History</h4>
      <div class="table-wrapper" style="margin-bottom: 16px;">
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

      <h4 style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Education & Degrees</h4>
      <div class="table-wrapper">
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
    </div>

    <!-- PANE 3: CV Document Viewer (DK-03) -->
    <div id="pane-cvViewer" class="profile-tab-pane">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
        <span style="font-size: 12px; color: var(--text-muted);">Standard Candidate CV Document (Pre-formatted Preview)</span>
        <button type="button" class="btn-solid" onclick="downloadCandidateResume('${c.id}')" style="height: 28px; padding: 0 10px; font-size: 12px;">
          Download Resume File
        </button>
      </div>
      <div class="cv-preview-paper">${escapeHtml(generateResumeText(c))}</div>
    </div>

    <!-- PANE 4: Activity Timeline (DK-05) -->
    <div id="pane-timeline" class="profile-tab-pane">
      <div class="timeline-track">
        <div class="timeline-item">
          <div class="timeline-time">${c.entryTime}</div>
          <div class="timeline-title">Candidate Profile Created</div>
          <div class="timeline-desc">Initial registration into TemuTalenta Resume Lib by ${escapeHtml(c.ownerName || "Rina Wijaya")}.</div>
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

  // Bind status transitions with reason requirement on failure (DK-04)
  body.querySelectorAll(".rec-stage-changer").forEach(sel => {
    sel.addEventListener("change", e => {
      const candId = sel.getAttribute("data-candidate-id");
      const recId = sel.getAttribute("data-rec-id");
      const newCode = parseInt(e.target.value, 10);

      // Check Blacklist permission: only Manager/SuperAdmin can set 91
      if (newCode === 91 && activeUser.role !== "manager" && activeUser.role !== "superadmin") {
        alert("Permission denied: Only Team Managers or Super Admins can set status to 91 (Blacklist).");
        sel.value = String(c.recommendations?.find(r => r.id === recId)?.statusCode || 10);
        return;
      }

      // Check mandatory reason for failure codes (19, 29, 39, 49, 90)
      const failedCodes = [19, 29, 39, 49, 90, 91];
      let reasonInput = "";
      if (failedCodes.includes(newCode)) {
        reasonInput = prompt(`Reason is mandatory for setting status code ${newCode} (${getStatusName(newCode)}):`);
        if (!reasonInput || !reasonInput.trim()) {
          alert("Action cancelled: Reason is mandatory.");
          sel.value = String(c.recommendations?.find(r => r.id === recId)?.statusCode || 10);
          return;
        }
      }

      const targetRec = c.recommendations?.find(r => r.id === recId);
      if (targetRec) {
        const oldCode = targetRec.statusCode;
        targetRec.statusCode = newCode;
        if (reasonInput) targetRec.reason = reasonInput.trim();

        if (newCode === 31) {
          c.recommendations.forEach(otherR => {
            if (otherR.id !== recId && otherR.isActive) {
              otherR.statusCode = 90;
              otherR.isActive = false;
              otherR.notes += " (Closed automatically as candidate accepted offer elsewhere)";
            }
          });
        }

        addAuditLog("STATUS_CHANGE", `Candidate ${c.name}`, `Changed code from ${oldCode} to ${newCode}. ${reasonInput ? `Reason: ${reasonInput}` : ""}`);
        saveCandidates(candidates);
        renderAllViews();
        showToast(`${t("msgStatusChanged")} ${c.name} -> Code ${newCode}`);
      }
    });
  });

  body.querySelector("#btnProfileScheduleInt")?.addEventListener("click", () => {
    dialog.close();
    openScheduleInterviewModal(c.id);
  });

  body.querySelector("#btnProfileGenOffer")?.addEventListener("click", () => {
    dialog.close();
    openOfferLetterModal(c.id);
  });

  syncTableResponsiveLabels();
  dialog.showModal();
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

function downloadCandidateResume(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const resumeContent = generateResumeText(c);
  const blob = new Blob([resumeContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Resume_${c.name.replace(/\s+/g, "_")}_${c.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  addAuditLog("DOWNLOAD_RESUME", `Candidate ${c.name}`, `Downloaded CV file`);
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
  const sixMonthsAgo = new Date("2026-05-16");

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

  // Condition 3: Same company, by another consultant, in last 6 months
  const diffConsultantWithin6Mo = recs.find(r => {
    const rDate = new Date(r.timestamp.split(" ")[0]);
    const isWithin = rDate >= sixMonthsAgo;
    const isSameComp = r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
    const isDiffCons = (r.consultantName || "").toLowerCase() !== currentConsultant.toLowerCase();
    return isSameComp && isWithin && isDiffCons;
  });
  if (diffConsultantWithin6Mo) {
    return {
      blocked: false,
      message: `Warning: Recommended to this company by another consultant (${diffConsultantWithin6Mo.consultantName}) in the last 6 months. Manager approval and justification required.`,
      requiresReason: true,
      requiresManager: true
    };
  }

  // Condition 4: Same company in last 6 months
  const sameCompWithin6Mo = recs.find(r => {
    const rDate = new Date(r.timestamp.split(" ")[0]);
    return rDate >= sixMonthsAgo && r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
  });
  if (sameCompWithin6Mo) {
    return {
      blocked: false,
      message: "Notice: Candidate was recommended to this company within the last 6 months. Reason is mandatory.",
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
    alert(ruleResult.message);
    return;
  }
  if (ruleResult.requiresReason && !reason) {
    alert("Reason is mandatory for this recommendation.");
    return;
  }
  if (ruleResult.requiresManager) {
    const mgrCheck = document.getElementById("recRepeatManagerCheck");
    if (!mgrCheck?.checked) {
      alert("Manager approval checkbox is required.");
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
        <strong style="font-size: 14px; color: var(--brand-primary);">${escapeHtml(c.name)}</strong>
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
                <span class="status-count-badge" style="${STATUS_CODES[r.statusCode]?.isFailed ? 'background-color: var(--danger-dot);' : ''}">
                  ${r.statusCode}
                </span>
                <small style="display:block; font-size: 10.5px; color: var(--text-muted);">${getStatusName(r.statusCode)}</small>
              </td>
              <td>${escapeHtml(r.consultantName || "Rina")}</td>
              <td>${escapeHtml(r.timestamp)}</td>
              <td style="text-align: left; max-width: 220px;">
                ${r.reason ? `<strong style="color: var(--brand-primary);">[Reason: ${escapeHtml(r.reason)}]</strong><br>` : ""}
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
function handleAddCandidateSubmit(e) {
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
    if (!confirm(`Warning (Duplicate Check RL-21): Candidate "${isDuplicate.name}" with matching birth date or contact already exists in database. Save anyway?`)) {
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
    domicile: "Indonesia",
    salaryExpectation: "Negotiable",
    currentSalary: "-",
    availability: "Immediate",
    ownerId: activeUser.id,
    ownerName: activeUser.name,
    skills: position ? [position] : [],
    tags: ["New Entry"],
    summary,
    isUnviewed: true,
    recommendations: newRecs
  };

  candidates.unshift(newRecord);
  addAuditLog("CREATE_CANDIDATE", `Candidate ${name}`, `Added new candidate profile`);
  saveCandidates(candidates);
  e.target.reset();
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
    alert("Permission denied: Only Managers and Super Admins can export candidate data.");
    return;
  }

  const filtered = getFilteredCandidates();
  if (filtered.length === 0) {
    alert("No candidates to export.");
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
    alert("Please choose a CSV file or paste CSV text.");
  }
}

function processCsvData(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    alert("CSV is empty or contains only header.");
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
    alert(`Import finished: ${importedCount} succeeded. Errors in ${failedRows.length} rows:\n${failedRows.slice(0, 5).join("\n")}`);
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
      <div class="notif-item-time">${escapeHtml(n.time)}</div>
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
  renderClientCompaniesView();
  renderAdvancedAnalytics();
  renderAuditLogsView();
  renderMasterDataLists();
  renderUserManagementList();
  renderCareerPortal();
  renderInterviewCalendar();
  syncTableResponsiveLabels();
}

/**
 * 12A. CONSULTANT BUSINESS & LEADERBOARD (CB-01, CB-02, CB-03)
 */
function switchCbTab(tabKey) {
  const btnRecs = document.getElementById("tabBtnCbRecs");
  const btnLeader = document.getElementById("tabBtnCbLeaderboard");
  const paneRecs = document.getElementById("paneCbRecs");
  const paneLeader = document.getElementById("paneCbLeaderboard");

  if (tabKey === "recs") {
    btnRecs?.classList.add("active");
    btnLeader?.classList.remove("active");
    if (paneRecs) paneRecs.style.display = "block";
    if (paneLeader) paneLeader.style.display = "none";
  } else {
    btnRecs?.classList.remove("active");
    btnLeader?.classList.add("active");
    if (paneRecs) paneRecs.style.display = "none";
    if (paneLeader) paneLeader.style.display = "block";
  }
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
            <span style="font-weight: 600; color: ${targetPercent >= 100 ? 'var(--success-color)' : 'var(--brand-primary)'};">
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
function renderAdvancedAnalytics() {
  const funnelContainer = document.getElementById("funnelVisualContainer");
  const kpiContainer = document.getElementById("analyticsKpiContainer");

  const total = candidates.length || 1;
  const countNew = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "new").length;
  const countPending = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pending").length;
  const countPass = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pass").length;
  const countInterview = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "interview").length;
  const countOffer = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "offer").length;
  const countEntry = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "entry").length;
  const countFailed = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "failed").length;

  if (funnelContainer) {
    const funnelSteps = [
      { name: "1. New (Code 0)", count: countNew, color: "var(--brand-primary)" },
      { name: "2. Pending Client (10, 11)", count: countPending, color: "#4f46e5" },
      { name: "3. Original Resume Pass (12)", count: countPass, color: "#06b6d4" },
      { name: "4. Interview Stages (20, 21, 22)", count: countInterview, color: "#0ea5e9" },
      { name: "5. Offer Issued / Accepted (30, 31)", count: countOffer, color: "#8b5cf6" },
      { name: "6. Onboarded / Entry (40, 41)", count: countEntry, color: "var(--success-color)" }
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
      <div class="kpi-card"><div>Total Talent Bank</div><div class="kpi-num">${candidates.length}</div></div>
      <div class="kpi-card"><div>Active in Pipeline</div><div class="kpi-num">${countPending + countPass + countInterview + countOffer}</div></div>
      <div class="kpi-card"><div>Successful Placements</div><div class="kpi-num" style="color: var(--success-color);">${countEntry}</div></div>
      <div class="kpi-card"><div>Rejections / Failed</div><div class="kpi-num" style="color: var(--danger-dot);">${countFailed}</div></div>
    `;
  }

  // Demographics Distribution (DA-03)
  const eduCounts = { undergraduate: 0, master: 0, diploma: 0 };
  const natCounts = {};
  const companyCounts = {};

  candidates.forEach(c => {
    const edu = (c.education || "undergraduate").toLowerCase();
    if (eduCounts[edu] !== undefined) eduCounts[edu]++;
    else eduCounts.undergraduate++;

    const nat = c.nationality || "Indonesia";
    natCounts[nat] = (natCounts[nat] || 0) + 1;

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
    const topComps = Object.entries(companyCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);
    distComp.innerHTML = topComps.map(([key, count]) => {
      const p = Math.round((count / total) * 100);
      return `
        <div class="dist-bar-item">
          <div class="dist-bar-meta"><strong>${key}</strong><span>${count} recs</span></div>
          <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${Math.min(100, p * 2)}%; background-color: var(--success-color);"></div></div>
        </div>
      `;
    }).join("");
  }
}

function exportAnalyticsCsv() {
  const total = candidates.length || 1;
  const countNew = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "new").length;
  const countPending = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pending").length;
  const countPass = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pass").length;
  const countInterview = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "interview").length;
  const countOffer = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "offer").length;
  const countEntry = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "entry").length;
  const countFailed = candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "failed").length;

  const rows = [
    ["Metric / Stage", "Count", "Percentage"],
    ["Total Talent Bank", total, "100%"],
    ["New Candidates (Code 0)", countNew, `${Math.round((countNew/total)*100)}%`],
    ["Pending Review (10, 11)", countPending, `${Math.round((countPending/total)*100)}%`],
    ["Resume Pass (12)", countPass, `${Math.round((countPass/total)*100)}%`],
    ["Interviews (20-22)", countInterview, `${Math.round((countInterview/total)*100)}%`],
    ["Offers (30, 31)", countOffer, `${Math.round((countOffer/total)*100)}%`],
    ["Hired / Entry (40, 41)", countEntry, `${Math.round((countEntry/total)*100)}%`],
    ["Failed / Resigned (x9, 90)", countFailed, `${Math.round((countFailed/total)*100)}%`]
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
      <td><span class="status-count-badge" style="background-color: var(--brand-primary);">${escapeHtml(u.roleName)}</span></td>
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

function resetUserPassword(userId) {
  USERS = getStoredUsers();
  const target = USERS.find(u => u.id === userId);
  if (target) {
    if (confirm(`Reset password for ${target.name} (${target.email})? A secure temporary password link will be issued.`)) {
      addAuditLog("RESET_PASSWORD", `User ${target.name}`, `Temporary password generated`);
      showToast(`Temporary password reset email sent to ${target.email}`);
    }
  }
}

function deleteUser(userId) {
  USERS = getStoredUsers();
  const index = USERS.findIndex(u => u.id === userId);
  if (index >= 0) {
    if (confirm(`Delete user account "${USERS[index].name}"?`)) {
      const removed = USERS.splice(index, 1)[0];
      saveUsers(USERS);
      addAuditLog("DELETE_USER", `User ${removed.name}`, `Deleted user account`);
      renderUserManagementList();
      showToast(`User ${removed.name} removed.`);
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
  }
}

function resetAllDemoData() {
  if (confirm("Reset database to clean initial sample state?")) {
    localStorage.clear();
    candidates = getStoredCandidates();
    notifications = getStoredNotifications();
    masterCompanies = getStoredMasterCompanies();
    masterPositions = getStoredMasterPositions();
    USERS = getStoredUsers();
    activeUser = USERS[0];
    openJobs = getStoredOpenJobs();
    scheduledInterviews = getStoredInterviews();
    document.getElementById("demoGuideModal")?.close();
    renderAllViews();
    applyRolePermissions();
    showToast("All data successfully restored to default demo state.");
  }
}

function renderMasterDataLists() {
  const compList = document.getElementById("settingsCompanyList");
  const posList = document.getElementById("settingsPositionList");

  if (compList) {
    compList.innerHTML = masterCompanies.map((c, i) => `
      <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid var(--border-table);">
        <span>${escapeHtml(c)}</span>
        <button type="button" class="btn-outlined" onclick="deleteMasterCompany(${i})" style="padding: 2px 6px; font-size: 11px;">✕</button>
      </li>
    `).join("");
  }

  if (posList) {
    posList.innerHTML = masterPositions.map((p, i) => `
      <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid var(--border-table);">
        <span>${escapeHtml(p)}</span>
        <button type="button" class="btn-outlined" onclick="deleteMasterPosition(${i})" style="padding: 2px 6px; font-size: 11px;">✕</button>
      </li>
    `).join("");
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

function handleAddMasterCompany(e) {
  e.preventDefault();
  const input = document.getElementById("newMasterCompanyName");
  const val = input?.value.trim();
  if (!val) return;
  if (!masterCompanies.includes(val)) {
    masterCompanies.push(val);
    saveMasterCompanies(masterCompanies);
    input.value = "";
    renderMasterDataLists();
    showToast(`Added client company: ${val}`);
  }
}

function deleteMasterCompany(index) {
  if (confirm(`Delete client company "${masterCompanies[index]}"?`)) {
    masterCompanies.splice(index, 1);
    saveMasterCompanies(masterCompanies);
    renderMasterDataLists();
  }
}

function handleAddMasterPosition(e) {
  e.preventDefault();
  const input = document.getElementById("newMasterPositionName");
  const val = input?.value.trim();
  if (!val) return;
  if (!masterPositions.includes(val)) {
    masterPositions.push(val);
    saveMasterPositions(masterPositions);
    input.value = "";
    renderMasterDataLists();
    showToast(`Added position: ${val}`);
  }
}

function deleteMasterPosition(index) {
  if (confirm(`Delete position "${masterPositions[index]}"?`)) {
    masterPositions.splice(index, 1);
    saveMasterPositions(masterPositions);
    renderMasterDataLists();
  }
}

/**
 * 13. DIALOG LIGHT-DISMISS FALLBACK & HELPERS
 */
function setupDialogLightDismiss() {
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener("pointerdown", e => { pressedOutside = outside(e, dialog); });
      dialog.addEventListener("pointerup", e => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
    }
  }

  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest("dialog")?.close();
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
        <span>Posted: ${escapeHtml(job.postedDate || "Recent")} • Exp: ${escapeHtml(job.experienceRequired || "3+ yrs")}</span>
        <button type="button" class="btn-solid" onclick="openApplyJobModal('${job.id}')" style="height: 26px; font-size: 11.5px; padding: 0 10px;">
          ${t("btnApplyJob")}
        </button>
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
      <div style="color: var(--brand-primary); font-size: 13px;">Applying for: <strong>${escapeHtml(job.title)}</strong> at <strong>${escapeHtml(job.company)}</strong></div>
      <div style="font-size: 11.5px; color: var(--text-secondary); font-weight: normal; margin-top: 2px;">
        Location: ${escapeHtml(job.location)} | Salary: ${escapeHtml(job.salaryRange)}
      </div>
    `;
  }

  // Reset form inputs
  const form = document.getElementById("formApplyJob");
  if (form) form.reset();
  if (idInput) idInput.value = job.id;

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
    alert("Please provide full name and email.");
    return;
  }

  const job = openJobs.find(j => j.id === jobId);
  const candidateId = `CND-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const nowFormatted = formatTimestamp(now);

  const newCand = {
    id: candidateId,
    name: fullName,
    nationality: "Indonesia",
    gender: "Unknown",
    birthDate: "1996-01-01",
    education: education,
    language: "Indonesian, English",
    yearsOfService: years,
    email: email,
    phone: phone,
    whatsapp: phone,
    domicile: job ? job.location.split(",")[0] : "Jakarta",
    salaryExpectation: salary,
    currentSalary: "-",
    availability: "1 month notice",
    recommendedPosition: job ? job.title : "Candidate",
    recommendedCompany: job ? job.company : "General",
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
            <a href="javascript:void(0)" onclick="openCandidateProfileModal('${item.candidateId}')" style="color: var(--brand-primary); text-decoration: underline;">
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
    "PRODID:-//TemuTalenta ATS//Interview Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:tt-int-${item.id}-${Date.now()}@temutalenta.local`,
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
  if (!modal || !paper) return;

  if (sendBtn) {
    sendBtn.setAttribute("data-candidate-id", c.id);
  }

  const rec = c.recommendations?.[0] || { company: c.recommendedCompany || "alauda", position: c.recommendedPosition || "Software Engineer" };
  const companyName = rec.company || "Client Enterprise Partner";
  const positionName = rec.position || "Senior Professional";
  const salaryExp = c.salaryExpectation || "IDR 25,000,000 / month";
  const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const startDateStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  paper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--border-base); padding-bottom: 14px; margin-bottom: 16px;">
      <div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--brand-primary); text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(companyName)}</h2>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">In Partnership with TemuTalenta Executive Talent Search</p>
        <p style="font-size: 11px; color: var(--text-muted);">Equity Tower Level 22, SCBD, Senayan, Jakarta Selatan</p>
      </div>
      <div style="text-align: right; font-size: 11.5px; color: var(--text-secondary);">
        <div><strong>Ref:</strong> TT-OFFER/${new Date().getFullYear()}/${c.id}</div>
        <div style="margin-top: 3px;"><strong>Date:</strong> ${todayStr}</div>
        <div style="margin-top: 3px;"><span class="status-count-badge" style="background: var(--brand-primary); color: #fff;">OFFICIAL OFFER</span></div>
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
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 40px;">Accepted and Agreed:<br><strong>Candidate Acceptance</strong></p>
        <div style="border-top: 1px solid var(--text-base); width: 200px; font-size: 11px; padding-top: 4px;">
          ${escapeHtml(c.name)}<br>
          <span style="font-size: 10px; color: var(--text-muted);">Signature & Date</span>
        </div>
      </div>
    </div>
  `;

  modal.showModal();
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
 * 14D. HEURISTIC SMART CV PARSER & AUTO-FILL (Fase 4D)
 */
function handleRunCvParser() {
  const rawBox = document.getElementById("rawCvParseText");
  const rawText = rawBox ? rawBox.value.trim() : "";
  const pillsBox = document.getElementById("cvParseExtractedPills");

  if (!rawText) {
    alert("Please paste resume/CV text into the parser area first.");
    return;
  }

  const extracted = {};

  // 1. Email extraction
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) extracted.email = emailMatch[0];

  // 2. Phone extraction (Indonesian phone patterns e.g. +62, 0812, etc.)
  const phoneMatch = rawText.match(/(?:\+62|62|08)[0-9\s-]{8,15}/);
  if (phoneMatch) extracted.phone = phoneMatch[0].replace(/\s+/g, " ").trim();

  // 3. Years of Experience extraction
  const expMatch = rawText.match(/(\d+)\+?\s*(?:years|thn|tahun|yrs)\s*(?:of\s*)?(?:experience|exp|pengalaman)?/i);
  if (expMatch) extracted.years = parseInt(expMatch[1], 10);

  // 4. Education level extraction
  if (/master|magister|s2|m\.sc|mba/i.test(rawText)) {
    extracted.education = "master";
  } else if (/undergraduate|bachelor|sarjana|s1|s\.kom|s\.t|b\.sc/i.test(rawText)) {
    extracted.education = "undergraduate";
  } else if (/diploma|d3|associate/i.test(rawText)) {
    extracted.education = "diploma";
  } else {
    extracted.education = "undergraduate";
  }

  // 5. Name extraction (heuristic: look for "Name:" or "Nama:" or take top line that is not an email/phone)
  const namePrefixMatch = rawText.match(/(?:Name|Nama|Full Name)\s*[:\-]\s*([A-Za-z\s'’.]+)/i);
  if (namePrefixMatch) {
    extracted.name = namePrefixMatch[1].trim().split("\n")[0];
  } else {
    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 2 && !l.includes("@") && !l.startsWith("http"));
    if (lines.length > 0) {
      extracted.name = lines[0].replace(/^(curriculum vitae|resume|cv)\s*[-:]?\s*/i, "").trim();
    }
  }

  // 6. Keywords / Skills extraction
  const knownSkills = [
    "Kubernetes", "Docker", "Golang", "Go", "Java", "Spring Boot", "Python", "FastAPI", "React", "Next.js",
    "Node.js", "TypeScript", "AWS", "GCP", "PostgreSQL", "Kafka", "Redis", "Figma", "UI/UX", "Scrum",
    "Product Management", "Microservices", "CI/CD", "Terraform", "DevOps"
  ];
  const matchedSkills = knownSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i");
    return regex.test(rawText);
  });
  extracted.skills = matchedSkills;

  // 7. Target Position matching
  let matchedPos = "";
  for (const pos of masterPositions) {
    if (new RegExp(pos.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(rawText)) {
      matchedPos = pos;
      break;
    }
  }
  if (!matchedPos) {
    if (/cloud|devops|infrastructure/i.test(rawText)) matchedPos = "Lead Cloud Architect";
    else if (/backend|go|golang|microservice/i.test(rawText)) matchedPos = "Senior Backend Engineer";
    else if (/product manager|pm/i.test(rawText)) matchedPos = "Technical Product Manager";
    else if (/presales|solution/i.test(rawText)) matchedPos = "Presales Lead";
  }
  if (matchedPos) extracted.position = matchedPos;

  // Auto-fill form fields
  if (extracted.name) {
    const nameInput = document.getElementById("addName");
    if (nameInput) nameInput.value = extracted.name;
  }
  if (extracted.email) {
    const emailInput = document.getElementById("addEmail");
    if (emailInput) emailInput.value = extracted.email;
  }
  if (extracted.phone) {
    const phoneInput = document.getElementById("addPhone");
    if (phoneInput) phoneInput.value = extracted.phone;
  }
  if (extracted.years !== undefined) {
    const yearsInput = document.getElementById("addYears");
    if (yearsInput) yearsInput.value = extracted.years;
  }
  if (extracted.education) {
    const eduSelect = document.getElementById("addEducation");
    if (eduSelect) eduSelect.value = extracted.education;
  }
  if (extracted.position) {
    const posSelect = document.getElementById("addPositionSelect");
    if (posSelect) {
      let found = false;
      for (const opt of posSelect.options) {
        if (opt.value.toLowerCase() === extracted.position.toLowerCase()) {
          posSelect.value = opt.value;
          found = true;
          break;
        }
      }
      if (!found) {
        const newOpt = document.createElement("option");
        newOpt.value = extracted.position;
        newOpt.textContent = extracted.position;
        posSelect.appendChild(newOpt);
        posSelect.value = extracted.position;
      }
    }
  }

  // Display extracted badge indicators
  if (pillsBox) {
    pillsBox.innerHTML = `
      <span class="parse-extracted-badge">Name: ${escapeHtml(extracted.name || "N/A")}</span>
      <span class="parse-extracted-badge">Email: ${escapeHtml(extracted.email || "N/A")}</span>
      <span class="parse-extracted-badge">Phone: ${escapeHtml(extracted.phone || "N/A")}</span>
      <span class="parse-extracted-badge">Exp: ${extracted.years !== undefined ? `${extracted.years} yrs` : "N/A"}</span>
      <span class="parse-extracted-badge">Edu: ${escapeHtml(extracted.education || "N/A")}</span>
      ${extracted.skills && extracted.skills.length > 0 ? `<span class="parse-extracted-badge">Skills: ${escapeHtml(extracted.skills.slice(0, 4).join(", "))}</span>` : ""}
    `;
  }

  showToast("CV parsed! Form fields auto-populated.");
}

// Expose handlers globally for HTML event attributes
window.openApplyJobModal = openApplyJobModal;
window.openCandidateProfileModal = openCandidateProfileModal;
window.openScheduleInterviewModal = openScheduleInterviewModal;
window.downloadIcsCalendar = downloadIcsCalendar;
window.markInterviewComplete = markInterviewComplete;
window.openOfferLetterModal = openOfferLetterModal;
window.runDemoScenario = runDemoScenario;
window.resetAllDemoData = resetAllDemoData;
window.switchWorkspaceView = switchWorkspaceView;
