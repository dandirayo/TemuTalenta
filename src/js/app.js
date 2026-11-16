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
function bindGlobalEvents() {
  document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.toggle("collapsed");
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

  // Forms
  document.getElementById("formRecRepeat")?.addEventListener("submit", handleRecRepeatSubmit);
  document.getElementById("formAddCandidate")?.addEventListener("submit", handleAddCandidateSubmit);
  document.getElementById("formAddMasterCompany")?.addEventListener("submit", handleAddMasterCompany);
  document.getElementById("formAddMasterPosition")?.addEventListener("submit", handleAddMasterPosition);
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

  document.querySelectorAll(".workspace-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${viewId}`);
  });

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

    return matchName && matchKw && matchStage && matchNat && matchGender && matchAge && matchEdu && matchService;
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
              ${escapeHtml(c.name).replace(" ", "<br>")}
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
        return `<td style="max-width: 95px; word-break: break-word;">${escapeHtml(c.education || "")}</td>`;
      case "language":
        return `<td style="max-width: 115px;">${escapeHtml(c.language || "")}</td>`;
      case "yearsOfService":
        return `<td data-value="${c.yearsOfService}">${c.yearsOfService}</td>`;
      case "recommendedPosition":
        return `<td style="max-width: 130px;">${escapeHtml(c.recommendedPosition || "")}</td>`;
      case "recommendedCompany":
        return `<td style="max-width: 110px;">${escapeHtml(c.recommendedCompany || "")}</td>`;
      case "entryTime":
        const parts = (c.entryTime || "").split(" ");
        return `<td data-value="${escapeHtml(c.entryTime)}">${parts[0] || ""}<br>${parts[1] || ""}</td>`;
      case "operation":
        return `
          <td>
            <div class="op-btn-stack">
              <button type="button" class="op-btn" data-action="download" data-id="${c.id}">${t("actDownloadResume")}</button>
              <button type="button" class="op-btn" data-action="repeat" data-id="${c.id}">${t("actRecRepeat")}</button>
              <button type="button" class="op-btn" data-action="list" data-id="${c.id}">${t("actRecList")}</button>
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
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-base); margin-bottom: 14px;">
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
        <table class="data-table" style="min-inline-size: 500px;">
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
                <td><strong>${escapeHtml(w.role)}</strong></td>
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
        <table class="data-table" style="min-inline-size: 500px;">
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
                <td><strong>${escapeHtml(e.degree)}</strong></td>
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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
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

  populateCompanyAndPositionSelects("recRepeatCompanySelect", "recRepeatPositionSelect");

  document.getElementById("recRepeatCandidateId").value = c.id;
  document.getElementById("recRepeatCandidateName").value = c.name;
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
    const comp = document.getElementById("recRepeatCompanySelect")?.value.trim();
    const pos = document.getElementById("recRepeatPositionSelect")?.value.trim();
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

  document.getElementById("recRepeatCompanySelect").onchange = verifyRulesLive;
  document.getElementById("recRepeatPositionSelect").onchange = verifyRulesLive;

  dialog.showModal();
}

function handleRecRepeatSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("recRepeatCandidateId")?.value;
  const pos = document.getElementById("recRepeatPositionSelect")?.value.trim();
  const comp = document.getElementById("recRepeatCompanySelect")?.value.trim();
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
      <table class="data-table" style="min-inline-size: 640px;">
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
              <td><strong>${escapeHtml(r.position)}</strong></td>
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
 * 12. SECONDARY WORKSPACE VIEWS
 */
function renderSecondaryViews() {
  renderNotifications();

  // Global Recommendations
  const recTbody = document.getElementById("globalRecTableBody");
  if (recTbody) {
    const allRecs = [];
    candidates.forEach(c => {
      (c.recommendations || []).forEach(r => {
        allRecs.push({ candidate: c, rec: r });
      });
    });
    recTbody.innerHTML = allRecs.map(item => `
      <tr>
        <td><button type="button" class="candidate-link" onclick="openCandidateProfileModal('${item.candidate.id}')">${escapeHtml(item.candidate.name)}</button></td>
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

  // Client Companies
  const clientTbody = document.getElementById("clientCompaniesTableBody");
  if (clientTbody) {
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
        <td><strong>${escapeHtml(info.name)}</strong></td>
        <td><span class="status-count-badge">${info.count}</span></td>
        <td style="text-align: left;">${[...info.roles].map(r => escapeHtml(r)).join(" • ")}</td>
        <td>${escapeHtml(info.latest)}</td>
      </tr>
    `).join("");
  }

  // Visual Funnel & Data Analysis (DA-01 s.d DA-05)
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
      { name: "1. New (0)", count: countNew, color: "var(--brand-primary)" },
      { name: "2. Pending (10, 11)", count: countPending, color: "#4f46e5" },
      { name: "3. Resume Pass (12)", count: countPass, color: "#06b6d4" },
      { name: "4. Interview (20-22)", count: countInterview, color: "#0ea5e9" },
      { name: "5. Offer (30, 31)", count: countOffer, color: "#8b5cf6" },
      { name: "6. Entry / Hired (40, 41)", count: countEntry, color: "var(--success-color)" }
    ];

    funnelContainer.innerHTML = funnelSteps.map(step => {
      const pct = Math.round((step.count / total) * 100);
      return `
        <div class="funnel-row">
          <span><strong>${step.name}</strong></span>
          <div class="funnel-bar-track">
            <div class="funnel-bar-fill" style="width: ${Math.max(5, pct)}%; background-color: ${step.color};"></div>
          </div>
          <span>${step.count} (${pct}%)</span>
        </div>
      `;
    }).join("");
  }

  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="kpi-card"><div>Total Candidates</div><div class="kpi-num">${candidates.length}</div></div>
      <div class="kpi-card"><div>In Pipeline</div><div class="kpi-num">${countPending + countPass + countInterview + countOffer}</div></div>
      <div class="kpi-card"><div>Hired (Entry)</div><div class="kpi-num" style="color: var(--success-color);">${countEntry}</div></div>
      <div class="kpi-card"><div>Failed / Resigned</div><div class="kpi-num" style="color: var(--danger-dot);">${countFailed}</div></div>
    `;
  }

  // Audit Logs Table
  const auditTbody = document.getElementById("auditLogsTableBody");
  if (auditTbody) {
    const logs = getStoredAuditLogs();
    auditTbody.innerHTML = logs.map(l => `
      <tr>
        <td><code>${escapeHtml(l.id)}</code></td>
        <td><strong>${escapeHtml(l.action)}</strong></td>
        <td>${escapeHtml(l.entity)}</td>
        <td style="text-align: left;">${escapeHtml(l.details)}</td>
        <td>${escapeHtml(l.user)}</td>
        <td>${escapeHtml(l.timestamp)}</td>
      </tr>
    `).join("");
  }

  // Settings Panel (Master Data PG-01, PG-02)
  renderMasterDataLists();
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
