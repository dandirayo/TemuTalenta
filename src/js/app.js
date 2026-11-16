/**
 * TemuTalenta - Enterprise Recruitment & Resume Library Controller
 * Mendukung dwibahasa (ID/EN), tema (Light/Dark), filter pipeline, sort tabel,
 * visibilitas kolom, serta aksi Download Resume, Recommended Repeat, & Recommended List.
 */

let candidates = [];
let currentLang = "en";
let currentStageFilter = "all";
let currentView = "resumeLib";
let visibleColumns = [];
let sortState = { columnId: "entryTime", direction: "descending" };
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
 * 1. THEME MANAGEMENT (Light / Dark Mode compliant with modern-web-guidance)
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
 * 2. BILINGUAL I18N ENGINE (Indonesia <-> English)
 */
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function setLanguage(lang) {
  if (lang !== "id" && lang !== "en") return;
  currentLang = lang;
  saveLang(lang);
  applyTranslations();
  renderAllViews();
}

function toggleLanguage() {
  setLanguage(currentLang === "en" ? "id" : "en");
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  // Update text elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Update input placeholders
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    el.placeholder = t(key);
  });

  // Update Language Switcher UI state
  const switchBtn = document.getElementById("langSwitchBtn");
  const lblId = document.getElementById("langLabelId");
  const lblEn = document.getElementById("langLabelEn");

  if (switchBtn) {
    switchBtn.setAttribute("aria-checked", currentLang === "en" ? "true" : "false");
  }
  if (lblId) lblId.classList.toggle("active", currentLang === "id");
  if (lblEn) lblEn.classList.toggle("active", currentLang === "en");

  // Update Advanced Search button text
  const advBox = document.getElementById("advSearchBox");
  const advBtn = document.getElementById("btnToggleAdvSearch");
  if (advBtn && advBox) {
    advBtn.textContent = advBox.classList.contains("open") ? t("btnHideAdvSearch") : t("btnAdvSearch");
  }
}

/**
 * 3. EVENT LISTENERS & NAVIGATION
 */
function bindGlobalEvents() {
  // Sidebar Hamburger Collapse
  document.getElementById("sidebarToggleBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.toggle("collapsed");
  });

  // Sidebar Menu Group Accordions
  document.querySelectorAll(".menu-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".menu-group");
      if (group) group.classList.toggle("open");
    });
  });

  // Sidebar View Navigation
  document.querySelectorAll(".submenu-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (view) switchWorkspaceView(view);
    });
  });

  // Language Switcher
  document.getElementById("langSwitchBtn")?.addEventListener("click", toggleLanguage);
  document.getElementById("langLabelId")?.addEventListener("click", () => setLanguage("id"));
  document.getElementById("langLabelEn")?.addEventListener("click", () => setLanguage("en"));

  // Theme Switcher
  document.getElementById("themeSwitchBtn")?.addEventListener("click", toggleThemeScheme);

  // Sub-header Navigation (<, Refresh, Home)
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

  // Search & Filter Controls
  document.getElementById("btnSearch")?.addEventListener("click", () => renderResumeTable());
  document.getElementById("btnSearchAll")?.addEventListener("click", resetSearchFilters);

  document.getElementById("searchCandidateName")?.addEventListener("keydown", e => {
    if (e.key === "Enter") renderResumeTable();
  });
  document.getElementById("searchKeyword")?.addEventListener("keydown", e => {
    if (e.key === "Enter") renderResumeTable();
  });
  document.getElementById("searchStateSelect")?.addEventListener("change", e => {
    currentStageFilter = e.target.value;
    syncStageTabsUI();
    renderResumeTable();
  });

  // Advanced Search Drawer Toggle
  document.getElementById("btnToggleAdvSearch")?.addEventListener("click", () => {
    const box = document.getElementById("advSearchBox");
    if (box) {
      box.classList.toggle("open");
      applyTranslations();
    }
  });

  // Advanced Filter Live Change
  ["advGender", "advMinAge", "advMaxAge", "advEducation", "advMinService"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => renderResumeTable());
  });

  // Reset Default Data
  document.getElementById("btnResetDatabase")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    candidates = getStoredCandidates();
    renderAllViews();
    showToast(t("msgResetDone"));
  });

  // Open Add Candidate Modal
  document.getElementById("btnOpenAddModal")?.addEventListener("click", () => {
    const dialog = document.getElementById("addCandidateModal");
    if (dialog) dialog.showModal();
  });

  // Stage Tabs Click
  document.querySelectorAll(".stage-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      currentStageFilter = tab.getAttribute("data-stage") || "all";
      const stateSelect = document.getElementById("searchStateSelect");
      if (stateSelect) stateSelect.value = currentStageFilter;
      syncStageTabsUI();
      renderResumeTable();
    });
  });

  // Column Visibility Dropdown Toggle
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

  // Forms Submission
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
  const nameInput = document.getElementById("searchCandidateName");
  const kwInput = document.getElementById("searchKeyword");
  const stateSelect = document.getElementById("searchStateSelect");
  const advGender = document.getElementById("advGender");
  const advMinAge = document.getElementById("advMinAge");
  const advMaxAge = document.getElementById("advMaxAge");
  const advEdu = document.getElementById("advEducation");
  const advMinService = document.getElementById("advMinService");

  if (nameInput) nameInput.value = "";
  if (kwInput) kwInput.value = "";
  if (stateSelect) stateSelect.value = "all";
  if (advGender) advGender.value = "all";
  if (advMinAge) advMinAge.value = "";
  if (advMaxAge) advMaxAge.value = "";
  if (advEdu) advEdu.value = "all";
  if (advMinService) advMinService.value = "";

  currentStageFilter = "all";
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
  const genderQ = document.getElementById("advGender")?.value || "all";
  const minAge = parseInt(document.getElementById("advMinAge")?.value || "0", 10);
  const maxAge = parseInt(document.getElementById("advMaxAge")?.value || "999", 10);
  const eduQ = document.getElementById("advEducation")?.value || "all";
  const minService = parseFloat(document.getElementById("advMinService")?.value || "0");

  return candidates.filter(c => {
    const matchName = !nameQ || c.name.toLowerCase().includes(nameQ);
    const matchKw =
      !kwQ ||
      c.recommendedPosition.toLowerCase().includes(kwQ) ||
      c.recommendedCompany.toLowerCase().includes(kwQ) ||
      c.language.toLowerCase().includes(kwQ) ||
      c.education.toLowerCase().includes(kwQ) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(kwQ)));

    const matchStage = currentStageFilter === "all" || c.stage === currentStageFilter;
    const matchGender = genderQ === "all" || c.gender === genderQ;
    const matchAge = c.age >= (isNaN(minAge) ? 0 : minAge) && c.age <= (isNaN(maxAge) ? 999 : maxAge);
    const matchEdu = eduQ === "all" || c.education === eduQ;
    const matchService = c.yearsOfService >= (isNaN(minService) ? 0 : minService);

    return matchName && matchKw && matchStage && matchGender && matchAge && matchEdu && matchService;
  });
}

function renderResumeTable() {
  const theadRow = document.getElementById("resumeTableHeadRow");
  const tbody = document.getElementById("resumeTableBody");
  const footerCount = document.getElementById("tableFooterCount");
  if (!theadRow || !tbody) return;

  const activeCols = ALL_COLUMNS.filter(c => visibleColumns.includes(c.id));

  // Render Table Headers (with Sortable Button on Entry Time, Status, Age, Year of service)
  const sortableCols = {
    status: "number",
    age: "number",
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

  // Bind sort header clicks
  theadRow.querySelectorAll(".sort-header-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const colId = btn.getAttribute("data-sort-col");
      handleColumnSort(colId, btn);
    });
  });

  const filtered = getFilteredCandidates();

  // Initial sort order
  const factor = sortState.direction === "ascending" ? 1 : -1;
  const sortType = sortableCols[sortState.columnId] || "string";
  filtered.sort((a, b) => {
    const valA = getRawSortValue(a, sortState.columnId);
    const valB = getRawSortValue(b, sortState.columnId);
    return factor * (sortType === "number" ? valA - valB : collator.compare(String(valA), String(valB)));
  });

  if (footerCount) {
    footerCount.textContent = `${t("lblShowing")} ${filtered.length} ${t("lblOf")} ${candidates.length} ${t("lblRecords")}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${activeCols.length}" style="padding: 36px; color: var(--text-muted);">
          ${t("emptyTable")}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => buildCandidateRowHtml(c, activeCols)).join("");
  bindTableRowActions(tbody);
}

function getRawSortValue(candidate, colId) {
  if (colId === "status") return candidate.statusCount;
  if (colId === "age") return candidate.age;
  if (colId === "yearsOfService") return candidate.yearsOfService;
  if (colId === "entryTime") return candidate.entryTime;
  return candidate[colId] || "";
}

function buildCandidateRowHtml(c, activeCols) {
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
        return `<td>${escapeHtml(c.nationality)}</td>`;
      case "status":
        return `
          <td data-value="${c.statusCount}">
            <span class="status-count-badge" title="Stage: ${c.stage.toUpperCase()}">${c.statusCount}</span>
          </td>
        `;
      case "gender":
        return `<td>${escapeHtml(c.gender)}</td>`;
      case "age":
        return `<td data-value="${c.age}">${c.age}</td>`;
      case "education":
        return `<td style="max-width: 95px; word-break: break-word;">${escapeHtml(c.education || "-")}</td>`;
      case "language":
        return `<td style="max-width: 115px;">${escapeHtml(c.language)}</td>`;
      case "yearsOfService":
        return `<td data-value="${c.yearsOfService}">${c.yearsOfService}</td>`;
      case "recommendedPosition":
        return `<td style="max-width: 130px;">${escapeHtml(c.recommendedPosition)}</td>`;
      case "recommendedCompany":
        return `<td style="max-width: 110px;">${escapeHtml(c.recommendedCompany)}</td>`;
      case "entryTime":
        const parts = c.entryTime.split(" ");
        return `<td data-value="${escapeHtml(c.entryTime)}">${parts[0]}<br>${parts[1] || ""}</td>`;
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
        return `<td>-</td>`;
    }
  });

  return `<tr data-candidate-id="${c.id}">${cells.join("")}</tr>`;
}

/**
 * Reorder existing DOM rows on sort (Compliant with sortable-table guidance)
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

  const cellIndex = th.cellIndex;
  const type = th.dataset.type || "string";
  const rows = [...tbody.rows];
  if (rows.length <= 1 && !rows[0]?.hasAttribute("data-candidate-id")) return;

  const factor = nextDir === "ascending" ? 1 : -1;
  const readVal = row => row.cells[cellIndex]?.dataset.value ?? row.cells[cellIndex]?.textContent.trim() ?? "";

  rows.sort((a, b) => {
    const va = readVal(a);
    const vb = readVal(b);
    return factor * (type === "number" ? Number(va) - Number(vb) : collator.compare(va, vb));
  });

  // Move existing <tr> nodes without innerHTML rebuild to preserve focus & identity
  for (const row of rows) {
    if (typeof tbody.moveBefore === "function") {
      tbody.moveBefore(row, null);
    } else {
      tbody.appendChild(row);
    }
  }

  if (statusEl) {
    statusEl.textContent = `Sorted by ${buttonEl.textContent.trim()}, ${nextDir}, ${rows.length} rows`;
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

  const stageOptions = [
    { val: "new", label: t("stageNew") },
    { val: "pending", label: t("stagePending") },
    { val: "pass", label: t("stagePass") },
    { val: "interview", label: t("stageInterview") },
    { val: "failed", label: t("stageFailed") },
    { val: "entry", label: t("stageEntry") }
  ];

  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-base); margin-bottom: 14px;">
      <div>
        <h3 style="font-size: 17px; font-weight: 700; color: var(--brand-primary);">${escapeHtml(c.name)}</h3>
        <p style="color: var(--text-secondary); margin-top: 2px;">
          ${escapeHtml(c.recommendedPosition)} — <strong>${escapeHtml(c.recommendedCompany)}</strong>
        </p>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          ID: ${c.id} | ${escapeHtml(c.email || "-")} | ${escapeHtml(c.phone || "-")}
        </p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
        <label style="font-size: 11px; color: var(--text-muted);">${t("fldStage")}:</label>
        <select id="profileStageSelect" class="ctrl-select" style="min-width: 165px; height: 28px;" data-id="${c.id}">
          ${stageOptions.map(o => `<option value="${o.val}" ${c.stage === o.val ? "selected" : ""}>${o.label}</option>`).join("")}
        </select>
      </div>
    </div>

    <div class="form-grid" style="margin-bottom: 16px;">
      <div class="form-field">
        <label>${t("fldNationality")}</label>
        <div>${escapeHtml(c.nationality)}</div>
      </div>
      <div class="form-field">
        <label>${t("fldGender")} / ${t("fldAge")}</label>
        <div>${escapeHtml(c.gender)} (${c.age})</div>
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
        <div>${escapeHtml(c.language)}</div>
      </div>
      <div class="form-field full">
        <label>${t("fldSummary")}</label>
        <p style="color: var(--text-secondary); line-height: 1.55;">${escapeHtml(c.summary || "-")}</p>
      </div>
      <div class="form-field full">
        <label>${t("fldSkills")}</label>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px;">
          ${(c.skills || []).map(s => `<span class="col-tag" style="padding: 3px 8px;">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  body.querySelector("#profileStageSelect")?.addEventListener("change", e => {
    const newStage = e.target.value;
    c.stage = newStage;
    saveCandidates(candidates);
    renderAllViews();
    showToast(`${t("msgStageUpdated")}: ${newStage.toUpperCase()}`);
  });

  dialog.showModal();
}

function downloadCandidateResume(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const resumeContent = [
    "======================================================================",
    `                    CURRICULUM VITAE / RESUME                         `,
    "======================================================================",
    `Candidate ID         : ${c.id}`,
    `Full Name            : ${c.name}`,
    `Nationality          : ${c.nationality}`,
    `Gender / Age         : ${c.gender} / ${c.age}`,
    `Education            : ${c.education || "-"}`,
    `Languages            : ${c.language}`,
    `Years of Service     : ${c.yearsOfService} Years`,
    `Email                : ${c.email || "-"}`,
    `Phone                : ${c.phone || "-"}`,
    "----------------------------------------------------------------------",
    `LATEST RECOMMENDATION`,
    `Position             : ${c.recommendedPosition}`,
    `Target Company       : ${c.recommendedCompany}`,
    `Current Pipeline     : ${c.stage.toUpperCase()} (Score Count: ${c.statusCount})`,
    `Entry Timestamp      : ${c.entryTime}`,
    "----------------------------------------------------------------------",
    `PROFESSIONAL SUMMARY`,
    `${c.summary || "-"}`,
    "----------------------------------------------------------------------",
    `CORE COMPETENCIES`,
    `${(c.skills || []).join(", ")}`,
    "----------------------------------------------------------------------",
    `RECOMMENDATION HISTORY (${(c.recommendations || []).length} records)`,
    ...(c.recommendations || []).map(
      (r, idx) => `${idx + 1}. [${r.timestamp}] ${r.position} @ ${r.company} (${r.stage}) - PIC: ${r.consultant}\n   Note: ${r.notes}`
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

  showToast(`${t("msgResumeDownloaded")} ${c.name}`);
}

function openRecRepeatModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const dialog = document.getElementById("recRepeatModal");
  if (!dialog) return;

  document.getElementById("recRepeatCandidateId").value = c.id;
  document.getElementById("recRepeatCandidateName").value = c.name;
  document.getElementById("recRepeatPosition").value = c.recommendedPosition;
  document.getElementById("recRepeatCompany").value = "";
  document.getElementById("recRepeatNotes").value = "";

  dialog.showModal();
}

function handleRecRepeatSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("recRepeatCandidateId")?.value;
  const pos = document.getElementById("recRepeatPosition")?.value.trim();
  const comp = document.getElementById("recRepeatCompany")?.value.trim();
  const stage = document.getElementById("recRepeatStage")?.value || "pending";
  const consultant = document.getElementById("recRepeatConsultant")?.value.trim() || "Rina Wijaya";
  const notes = document.getElementById("recRepeatNotes")?.value.trim() || "Recommended via Resume Lib.";

  const c = candidates.find(item => item.id === id);
  if (!c || !pos || !comp) return;

  const nowStr = formatTimestamp(new Date());
  c.statusCount = (c.statusCount || 1) + 1;
  c.recommendedPosition = pos;
  c.recommendedCompany = comp;
  c.stage = stage;
  c.entryTime = nowStr;

  if (!Array.isArray(c.recommendations)) c.recommendations = [];
  c.recommendations.unshift({
    id: `REC-${Date.now().toString().slice(-4)}`,
    position: pos,
    company: comp,
    stage,
    consultant,
    timestamp: nowStr,
    notes
  });

  saveCandidates(candidates);
  document.getElementById("recRepeatModal")?.close();
  renderAllViews();
  showToast(`${t("msgRecAdded")} ${c.name} -> ${comp}`);
}

function openRecListModal(candidateId) {
  const c = candidates.find(item => item.id === candidateId);
  if (!c) return;

  const dialog = document.getElementById("recListModal");
  const body = document.getElementById("recListModalBody");
  if (!dialog || !body) return;

  const recs = c.recommendations || [];
  body.innerHTML = `
    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="font-size: 14px; color: var(--brand-primary);">${escapeHtml(c.name)}</strong>
        <span style="margin-left: 8px; color: var(--text-muted); font-size: 12px;">(${t("colStatus")}: ${c.statusCount})</span>
      </div>
      <button type="button" class="btn-solid" id="btnQuickRepeatFromList" style="height: 28px; padding: 0 12px; font-size: 12px;">
        + ${t("actRecRepeat")}
      </button>
    </div>
    <div class="table-wrapper" style="max-height: 360px;">
      <table class="data-table" style="min-inline-size: 560px;">
        <thead>
          <tr>
            <th>${t("colRecPosition")}</th>
            <th>${t("colRecCompany")}</th>
            <th>${t("fldStage")}</th>
            <th>${t("fldConsultant")}</th>
            <th>${t("fldDate")}</th>
            <th>${t("fldNotes")}</th>
          </tr>
        </thead>
        <tbody>
          ${recs.map(r => `
            <tr>
              <td><strong>${escapeHtml(r.position)}</strong></td>
              <td>${escapeHtml(r.company)}</td>
              <td><span class="col-tag">${escapeHtml(r.stage.toUpperCase())}</span></td>
              <td>${escapeHtml(r.consultant || "-")}</td>
              <td>${escapeHtml(r.timestamp)}</td>
              <td style="text-align: left; max-width: 200px;">${escapeHtml(r.notes || "-")}</td>
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
  const age = parseInt(document.getElementById("addAge")?.value || "25", 10);
  const education = document.getElementById("addEducation")?.value || "undergraduate";
  const language = document.getElementById("addLanguage")?.value.trim() || "Indonesian, English";
  const yearsOfService = parseFloat(document.getElementById("addYears")?.value || "3");
  const recommendedPosition = document.getElementById("addPosition")?.value.trim();
  const recommendedCompany = document.getElementById("addCompany")?.value.trim();
  const stage = document.getElementById("addStage")?.value || "new";
  const email = document.getElementById("addEmail")?.value.trim() || "";
  const phone = document.getElementById("addPhone")?.value.trim() || "";
  const summary = document.getElementById("addSummary")?.value.trim() || "";

  if (!name || !recommendedPosition || !recommendedCompany) return;

  const nowStr = formatTimestamp(new Date());
  const newRecord = {
    id: `CND-${1000 + candidates.length + 1}`,
    name,
    nationality,
    statusCount: 1,
    stage,
    gender,
    age,
    education,
    language,
    yearsOfService,
    recommendedPosition,
    recommendedCompany,
    entryTime: nowStr,
    email,
    phone,
    skills: [recommendedPosition, language.split(",")[0]],
    summary,
    recommendations: [
      {
        id: `REC-${Date.now().toString().slice(-4)}`,
        position: recommendedPosition,
        company: recommendedCompany,
        stage,
        consultant: "Rina Wijaya",
        timestamp: nowStr,
        notes: "Initial entry into Resume Lib."
      }
    ]
  };

  candidates.unshift(newRecord);
  saveCandidates(candidates);
  e.target.reset();
  document.getElementById("addCandidateModal")?.close();
  renderAllViews();
  showToast(`${t("msgCandidateAdded")} ${name}`);
}

/**
 * 6. SECONDARY WORKSPACE VIEWS (Consultant Business & Data Analysis)
 */
function renderSecondaryViews() {
  // Consultant Business -> All Recommendations Table
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
        <td><span class="status-count-badge">${escapeHtml(item.rec.stage.toUpperCase())}</span></td>
        <td>${escapeHtml(item.rec.consultant || "-")}</td>
        <td>${escapeHtml(item.rec.timestamp)}</td>
        <td style="text-align: left;">${escapeHtml(item.rec.notes || "-")}</td>
      </tr>
    `).join("");
  }

  // Consultant Business -> Client Companies Summary
  const clientTbody = document.getElementById("clientCompaniesTableBody");
  if (clientTbody) {
    const companyMap = {};
    candidates.forEach(c => {
      const comp = c.recommendedCompany || "Other";
      if (!companyMap[comp]) {
        companyMap[comp] = { name: comp, count: 0, roles: new Set(), latest: c.entryTime };
      }
      companyMap[comp].count += 1;
      companyMap[comp].roles.add(c.recommendedPosition);
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

  // Data Analysis -> Pipeline KPIs
  const kpiContainer = document.getElementById("analyticsKpiContainer");
  if (kpiContainer) {
    const counts = {
      all: candidates.length,
      new: candidates.filter(c => c.stage === "new").length,
      pending: candidates.filter(c => c.stage === "pending").length,
      pass: candidates.filter(c => c.stage === "pass").length,
      interview: candidates.filter(c => c.stage === "interview").length,
      entry: candidates.filter(c => c.stage === "entry").length,
      failed: candidates.filter(c => c.stage === "failed").length
    };
    kpiContainer.innerHTML = `
      <div class="kpi-card"><div>${t("stageAll")}</div><div class="kpi-num">${counts.all}</div></div>
      <div class="kpi-card"><div>${t("stageNew")}</div><div class="kpi-num">${counts.new}</div></div>
      <div class="kpi-card"><div>${t("stagePending")}</div><div class="kpi-num">${counts.pending}</div></div>
      <div class="kpi-card"><div>${t("stagePass")}</div><div class="kpi-num">${counts.pass}</div></div>
      <div class="kpi-card"><div>${t("stageInterview")}</div><div class="kpi-num">${counts.interview}</div></div>
      <div class="kpi-card"><div>${t("stageEntry")}</div><div class="kpi-num" style="color: var(--success-color);">${counts.entry}</div></div>
      <div class="kpi-card"><div>${t("stageFailed")}</div><div class="kpi-num" style="color: var(--danger-dot);">${counts.failed}</div></div>
    `;
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
