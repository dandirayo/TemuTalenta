/**
 * TemuTalenta Enterprise ATS & Resume Library Controller
 * Mengimplementasikan seluruh spesifikasi PRD.md (Nov 16, 2026):
 * - Tri-lingual I18N (Chinese / English / Indonesian)
 * - 8 Tab Status (All, New, Pending, Original resume pass, Interview, Offer, Failed, Entry)
 * - Badge kode status 2 digit otomatis (0, 10, 11, 12, 19, 20, 21, 22, 29, 30, 31, 39, 40, 41, 49, 90, 91)
 * - Validasi 6 Aturan Rekomendasi Ganda (Recommended Repeat)
 * - Paginasi 10/20/50 baris per halaman
 * - Audit Trail / Log Aktivitas
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

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

document.addEventListener("DOMContentLoaded", () => {
  initThemeState();
  currentLang = getStoredLang();
  candidates = getStoredCandidates();
  visibleColumns = getStoredVisibleColumns();

  bindGlobalEvents();
  setupDialogLightDismiss();
  applyTranslations();
  renderAllViews();
});

/**
 * 1. THEME MANAGEMENT (Light / Dark Mode per modern-web-guidance)
 */
function initThemeState() {
  const meta = document.querySelector('meta[name="color-scheme"]');
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEYS.COLOR_SCHEME);
  } catch (e) {}

  const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = stored === "dark" || stored === "light" ? stored : (sysDark ? "dark" : "light");

  if (meta) {
    meta.content = stored ?? "light dark";
  }
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
  if (btn) {
    btn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }
}

/**
 * 2. TRI-LINGUAL I18N (English, Chinese, Indonesian)
 */
function t(key) {
  const langDict = I18N[currentLang] || I18N.en;
  return langDict[key] || I18N.en[key] || key;
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

  // Translate text nodes
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Translate input placeholders
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    el.placeholder = t(key);
  });

  // Header language switch buttons
  const switchBtn = document.getElementById("langSwitchBtn");
  const lblZh = document.getElementById("langLabelZh");
  const lblEn = document.getElementById("langLabelEn");
  const selLang = document.getElementById("langSelectorDropdown");

  if (switchBtn) {
    switchBtn.setAttribute("aria-checked", currentLang === "en" ? "true" : "false");
  }
  if (lblZh) lblZh.classList.toggle("active", currentLang === "zh");
  if (lblEn) lblEn.classList.toggle("active", currentLang === "en");
  if (selLang) selLang.value = currentLang;

  // Advanced search button label
  const advBox = document.getElementById("advSearchBox");
  const advBtn = document.getElementById("btnToggleAdvSearch");
  if (advBtn && advBox) {
    advBtn.textContent = advBox.classList.contains("open") ? t("btnHideAdvSearch") : t("btnAdvSearch");
  }
}

/**
 * 3. GLOBAL EVENT LISTENERS
 */
function bindGlobalEvents() {
  // Sidebar Toggle
  document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.toggle("collapsed");
  });

  // Sidebar Submenus
  document.querySelectorAll(".menu-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".menu-group")?.classList.toggle("open");
    });
  });

  // Sidebar View Navigation
  document.querySelectorAll(".submenu-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchWorkspaceView(view);
    });
  });

  // Header Language Switcher (Chinese <-> English toggle)
  document.getElementById("langSwitchBtn")?.addEventListener("click", () => {
    setLanguage(currentLang === "zh" ? "en" : "zh");
  });
  document.getElementById("langLabelZh")?.addEventListener("click", () => setLanguage("zh"));
  document.getElementById("langLabelEn")?.addEventListener("click", () => setLanguage("en"));
  document.getElementById("langSelectorDropdown")?.addEventListener("change", (e) => {
    setLanguage(e.target.value);
  });

  // Header Theme Switcher
  document.getElementById("themeSwitchBtn")?.addEventListener("click", toggleThemeScheme);

  // Subnav Navigation (<, Refresh, Home)
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

  // Search & Filter Inputs
  document.getElementById("btnSearch")?.addEventListener("click", () => {
    currentPage = 1;
    renderResumeTable();
  });
  document.getElementById("btnSearchAll")?.addEventListener("click", resetSearchFilters);

  document.getElementById("searchCandidateName")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      currentPage = 1;
      renderResumeTable();
    }
  });
  document.getElementById("searchKeyword")?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      currentPage = 1;
      renderResumeTable();
    }
  });
  document.getElementById("searchStateSelect")?.addEventListener("change", e => {
    currentStageFilter = e.target.value;
    currentPage = 1;
    syncStageTabsUI();
    renderResumeTable();
  });

  // Advanced Search Toggle & Inputs
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

  // Reset Default Data
  document.getElementById("btnResetDatabase")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    candidates = getStoredCandidates();
    currentPage = 1;
    renderAllViews();
    showToast(t("msgResetDone"));
  });

  // Open Add Candidate Modal
  document.getElementById("btnOpenAddModal")?.addEventListener("click", () => {
    document.getElementById("addCandidateModal")?.showModal();
  });

  // 8 Stage Tabs (All, New, Pending, Original resume pass, Interview, Offer, Failed, Entry)
  document.querySelectorAll(".stage-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentStageFilter = tab.getAttribute("data-stage") || "all";
      currentPage = 1;
      const stateSelect = document.getElementById("searchStateSelect");
      if (stateSelect) stateSelect.value = currentStageFilter;
      syncStageTabsUI();
      renderResumeTable();
    });
  });

  // Columns Dropdown
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

  // Page Size Selector & Pagination
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
}

function switchWorkspaceView(viewId, pushHistory = true) {
  if (viewId === "addCandidateModalTrigger") {
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
  renderResumeTable();
}

/**
 * 4. COLUMN SELECTOR & TABLE RENDERING
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
      (c.skills && c.skills.some(s => s.toLowerCase().includes(kwQ)));

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

  // Render Table Headers
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

  // Sort
  const factor = sortState.direction === "ascending" ? 1 : -1;
  const sortType = sortableCols[sortState.columnId] || "string";
  filtered.sort((a, b) => {
    const valA = getRawSortValue(a, sortState.columnId);
    const valB = getRawSortValue(b, sortState.columnId);
    return factor * (sortType === "number" ? valA - valB : collator.compare(String(valA), String(valB)));
  });

  // Pagination calculation
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

/**
 * Reorder rows on sort (Compliant with sortable-table guidance)
 */
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
 * 5. ROW OPERATIONS (Profile Modal, Download Resume, Recommended Repeat, Recommended List)
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

  const dialog = document.getElementById("profileModal");
  const body = document.getElementById("profileModalBody");
  if (!dialog || !body) return;

  const currentBadge = computeCandidateBadge(c);

  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-base); margin-bottom: 14px;">
      <div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--brand-primary);">${escapeHtml(c.name)}</h3>
        <p style="color: var(--text-secondary); margin-top: 2px;">
          ${escapeHtml(c.recommendedPosition || "-")} — <strong>${escapeHtml(c.recommendedCompany || "-")}</strong>
        </p>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          ID: ${c.id} | ${escapeHtml(c.email || "-")} | ${escapeHtml(c.phone || "-")}
        </p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
        <span class="status-count-badge" style="font-size: 14px; padding: 3px 10px;">
          ${currentBadge} - ${getStatusName(currentBadge)}
        </span>
      </div>
    </div>

    <div class="form-grid" style="margin-bottom: 16px;">
      <div class="form-field">
        <label>${t("fldNationality")}</label>
        <div>${escapeHtml(c.nationality || "-")}</div>
      </div>
      <div class="form-field">
        <label>${t("fldGender")} / ${t("fldAge")}</label>
        <div>${escapeHtml(c.gender)} (${calculateAge(c.birthDate)})</div>
      </div>
      <div class="form-field">
        <label>${t("fldEducation")}</label>
        <div>${escapeHtml(c.education || "-")}</div>
      </div>
      <div class="form-field">
        <label>${t("fldYearsService")}</label>
        <div>${c.yearsOfService} Years</div>
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
        <label>Active Recommendations (${(c.recommendations || []).length})</label>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          ${(c.recommendations || []).map(r => `
            <div style="padding: 8px 12px; border: 1px solid var(--border-base); border-radius: 3px; background-color: var(--bg-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${escapeHtml(r.company)}</strong> - ${escapeHtml(r.position)}<br>
                <small style="color: var(--text-muted);">${r.timestamp} • Consultant: ${escapeHtml(r.consultantName || "Rina")}</small>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <select class="ctrl-select rec-stage-changer" data-candidate-id="${c.id}" data-rec-id="${r.id}" style="height: 28px;">
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
  `;

  // Bind inline status code changer
  body.querySelectorAll(".rec-stage-changer").forEach(sel => {
    sel.addEventListener("change", e => {
      const candId = sel.getAttribute("data-candidate-id");
      const recId = sel.getAttribute("data-rec-id");
      const newCode = parseInt(e.target.value, 10);

      const targetCand = candidates.find(item => item.id === candId);
      const targetRec = targetCand?.recommendations?.find(r => r.id === recId);
      if (targetRec) {
        const oldCode = targetRec.statusCode;
        targetRec.statusCode = newCode;
        if (newCode === 31) {
          // Rule 5: Offer accepted -> ask to close other running recommendations with code 90
          targetCand.recommendations.forEach(otherR => {
            if (otherR.id !== recId && otherR.isActive) {
              otherR.statusCode = 90;
              otherR.isActive = false;
              otherR.notes += " (Closed automatically as candidate accepted offer elsewhere)";
            }
          });
        }
        addAuditLog("STATUS_CHANGE", `Candidate ${targetCand.name}`, `Changed code from ${oldCode} to ${newCode}`);
        saveCandidates(candidates);
        renderAllViews();
        showToast(`${t("msgStatusChanged")} ${targetCand.name} -> Code ${newCode}`);
      }
    });
  });

  dialog.showModal();
}

function downloadCandidateResume(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const currentBadge = computeCandidateBadge(c);
  const resumeContent = [
    "======================================================================",
    `                    CURRICULUM VITAE / RESUME                         `,
    "======================================================================",
    `Candidate ID         : ${c.id}`,
    `Full Name            : ${c.name}`,
    `Nationality          : ${c.nationality}`,
    `Gender / Age         : ${c.gender} / ${calculateAge(c.birthDate)}`,
    `Education            : ${c.education || "-"}`,
    `Languages            : ${c.language}`,
    `Years of Service     : ${c.yearsOfService} Years`,
    `Email                : ${c.email || "-"}`,
    `Phone                : ${c.phone || "-"}`,
    "----------------------------------------------------------------------",
    `LATEST STATUS & RECOMMENDATION`,
    `Current Status Badge : ${currentBadge} (${getStatusName(currentBadge)})`,
    `Position             : ${c.recommendedPosition}`,
    `Target Company       : ${c.recommendedCompany}`,
    `Entry Timestamp      : ${c.entryTime}`,
    "----------------------------------------------------------------------",
    `PROFESSIONAL SUMMARY`,
    `${c.summary || "-"}`,
    "----------------------------------------------------------------------",
    `RECOMMENDATION HISTORY (${(c.recommendations || []).length} records)`,
    ...(c.recommendations || []).map(
      (r, idx) => `${idx + 1}. [${r.timestamp}] ${r.position} @ ${r.company} (Status Code: ${r.statusCode} - ${getStatusName(r.statusCode)})\n   Consultant: ${r.consultantName || "Rina Wijaya"} | Note: ${r.notes || "-"}`
    ),
    "======================================================================"
  ].join("\n");

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
 * Recommended Repeat: Evaluates 6 Rules from PRD.md lines 209-222
 */
function evaluateRecRepeatRules(candidate, targetCompany, targetPosition, currentConsultant = "Rina Wijaya") {
  const currentBadge = computeCandidateBadge(candidate);

  // Condition 1: Candidate is Code 91 Blacklist -> Blocked for all companies
  if (currentBadge === 91) {
    return { blocked: true, message: t("warnBlacklist"), requiresReason: false, requiresManager: false };
  }

  const recs = candidate.recommendations || [];
  const now = new Date("2026-11-16");
  const sixMonthsAgo = new Date("2026-05-16");

  // Condition 2: Same company + same position, previous recommendation still active -> Blocked
  const activeSame = recs.find(r => 
    r.isActive !== false &&
    r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim() &&
    r.position.toLowerCase().trim() === targetPosition.toLowerCase().trim()
  );
  if (activeSame) {
    return {
      blocked: true,
      message: `${t("warnActiveSame")} (${activeSame.company} - ${activeSame.position}, Status: ${activeSame.statusCode})`,
      requiresReason: false,
      requiresManager: false
    };
  }

  // Condition 3: Same company, by another consultant, in last 6 months -> Warning, Manager approval + reason
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
      message: `${t("warnDiffConsultant6Mo")} (Previous Consultant: ${diffConsultantWithin6Mo.consultantName})`,
      requiresReason: true,
      requiresManager: true
    };
  }

  // Condition 4: Same company (any position) in last 6 months -> Warning, reason mandatory
  const sameCompWithin6Mo = recs.find(r => {
    const rDate = new Date(r.timestamp.split(" ")[0]);
    return rDate >= sixMonthsAgo && r.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
  });
  if (sameCompWithin6Mo) {
    return {
      blocked: false,
      message: t("warnSameCompany6Mo"),
      requiresReason: true,
      requiresManager: false
    };
  }

  // Condition 5: Candidate currently in code 31 or 40 -> Warning + reason mandatory
  if (currentBadge === 31 || currentBadge === 40) {
    return {
      blocked: false,
      message: t("warnAlreadyHired"),
      requiresReason: true,
      requiresManager: false
    };
  }

  // Condition 6: Otherwise -> Allowed freely
  return { blocked: false, message: "", requiresReason: false, requiresManager: false };
}

function openRecRepeatModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const dialog = document.getElementById("recRepeatModal");
  if (!dialog) return;

  document.getElementById("recRepeatCandidateId").value = c.id;
  document.getElementById("recRepeatCandidateName").value = c.name;
  document.getElementById("recRepeatPosition").value = c.recommendedPosition || "";
  document.getElementById("recRepeatCompany").value = "";
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

  // Real-time verification on typing company or position
  const verifyRulesLive = () => {
    const comp = document.getElementById("recRepeatCompany")?.value.trim();
    const pos = document.getElementById("recRepeatPosition")?.value.trim();
    if (!comp) return;

    const evalResult = evaluateRecRepeatRules(c, comp, pos);
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

  document.getElementById("recRepeatCompany").oninput = verifyRulesLive;
  document.getElementById("recRepeatPosition").oninput = verifyRulesLive;

  dialog.showModal();
}

function handleRecRepeatSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("recRepeatCandidateId")?.value;
  const pos = document.getElementById("recRepeatPosition")?.value.trim();
  const comp = document.getElementById("recRepeatCompany")?.value.trim();
  const statusCode = parseInt(document.getElementById("recRepeatStatusCode")?.value || "10", 10);
  const consultant = document.getElementById("recRepeatConsultant")?.value.trim() || "Rina Wijaya";
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

function handleAddCandidateSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("addName")?.value.trim();
  const nationality = document.getElementById("addNationality")?.value.trim() || "Indonesia";
  const gender = document.getElementById("addGender")?.value || "Male";
  const birthDate = document.getElementById("addBirthDate")?.value || "1998-01-01";
  const education = document.getElementById("addEducation")?.value || "undergraduate";
  const language = document.getElementById("addLanguage")?.value.trim() || "Indonesian, English";
  const yearsOfService = parseFloat(document.getElementById("addYears")?.value || "3");
  const position = document.getElementById("addPosition")?.value.trim();
  const company = document.getElementById("addCompany")?.value.trim();
  const email = document.getElementById("addEmail")?.value.trim() || "";
  const phone = document.getElementById("addPhone")?.value.trim() || "";
  const summary = document.getElementById("addSummary")?.value.trim() || "";

  if (!name) return;

  // Duplicate check (PRD RL-21: name + birthDate or email or phone)
  const isDuplicate = candidates.find(item => 
    (item.name.toLowerCase() === name.toLowerCase() && item.birthDate === birthDate) ||
    (email && item.email && item.email.toLowerCase() === email.toLowerCase()) ||
    (phone && item.phone && item.phone === phone)
  );

  if (isDuplicate) {
    if (!confirm(`Warning: Candidate "${isDuplicate.name}" with matching birth date or contact already exists in database. Save anyway?`)) {
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
      consultantName: "Rina Wijaya",
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
    skills: position ? [position] : [],
    summary,
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
 * 6. SECONDARY WORKSPACE VIEWS
 */
function renderSecondaryViews() {
  // Global Recommendations Table
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

  // Client Companies Table
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

  // Pipeline KPIs (New -> Pending -> Original resume pass -> Interview -> Offer -> Entry, Failed)
  const kpiContainer = document.getElementById("analyticsKpiContainer");
  if (kpiContainer) {
    const counts = {
      all: candidates.length,
      new: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "new").length,
      pending: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pending").length,
      pass: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "pass").length,
      interview: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "interview").length,
      offer: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "offer").length,
      entry: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "entry").length,
      failed: candidates.filter(c => getStageTabForCode(computeCandidateBadge(c)) === "failed").length
    };
    kpiContainer.innerHTML = `
      <div class="kpi-card"><div>${t("stageAll")}</div><div class="kpi-num">${counts.all}</div></div>
      <div class="kpi-card"><div>${t("stageNew")} (0)</div><div class="kpi-num">${counts.new}</div></div>
      <div class="kpi-card"><div>${t("stagePending")} (10, 11)</div><div class="kpi-num">${counts.pending}</div></div>
      <div class="kpi-card"><div>${t("stagePass")} (12)</div><div class="kpi-num">${counts.pass}</div></div>
      <div class="kpi-card"><div>${t("stageInterview")} (20, 21, 22)</div><div class="kpi-num">${counts.interview}</div></div>
      <div class="kpi-card"><div>${t("stageOffer")} (30, 31)</div><div class="kpi-num" style="color: var(--brand-primary);">${counts.offer}</div></div>
      <div class="kpi-card"><div>${t("stageEntry")} (40, 41)</div><div class="kpi-num" style="color: var(--success-color);">${counts.entry}</div></div>
      <div class="kpi-card"><div>${t("stageFailed")} (19, 29, 39, 49, 90, 91)</div><div class="kpi-num" style="color: var(--danger-dot);">${counts.failed}</div></div>
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
}

/**
 * 7. DIALOG LIGHT-DISMISS FALLBACK & HELPERS
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
