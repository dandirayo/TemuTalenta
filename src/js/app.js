/**
 * TemuTalenta - Application Logic & State Engine (Offline-First)
 * Mendukung pencarian, filter, modal detail <dialog>, simulasi matchmaking, dan penyimpanan lokal.
 */

// State Aplikasi
let currentTalents = [];
let bookmarks = [];
let activeTab = "discovery";

// Inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initData();
  setupEventListeners();
  setupDialogLightDismiss();
  renderAll();
});

/**
 * Inisialisasi Tema (Dark / Light Mode)
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  updateThemeIcon();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEYS.THEME, next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = isDark ? "☀️" : "🌙";
    btn.title = isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap";
  }
}

/**
 * Muat Data Awal
 */
function initData() {
  currentTalents = getStoredTalents();
  bookmarks = getStoredBookmarks();
}

/**
 * Menyiapkan Event Listener Navigasi & Filter
 */
function setupEventListeners() {
  // Tab Navigasi
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Theme Toggle Button
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
  }

  // Filter & Search Talenta
  const searchInput = document.getElementById("talentSearchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const workPrefFilter = document.getElementById("workPrefFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");

  if (searchInput) searchInput.addEventListener("input", renderTalents);
  if (categoryFilter) categoryFilter.addEventListener("change", renderTalents);
  if (workPrefFilter) workPrefFilter.addEventListener("change", renderTalents);
  if (availabilityFilter) availabilityFilter.addEventListener("change", renderTalents);

  // Form Matchmaker
  const matchmakerForm = document.getElementById("matchmakerForm");
  if (matchmakerForm) {
    matchmakerForm.addEventListener("submit", handleMatchmaking);
  }

  // Form Tambah Talenta
  const addTalentForm = document.getElementById("addTalentForm");
  if (addTalentForm) {
    addTalentForm.addEventListener("submit", handleAddTalent);
  }

  // Ekspor & Reset Data
  const exportBtn = document.getElementById("exportJsonBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportTalentsJson);
  }

  const resetBtn = document.getElementById("resetDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetToDefaultData);
  }
}

/**
 * Ganti Tab Tampilan
 */
function switchTab(tabId) {
  activeTab = tabId;

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  document.querySelectorAll(".tab-view").forEach(view => {
    view.classList.toggle("active", view.id === `${tabId}View`);
  });

  if (tabId === "bookmarks") {
    renderBookmarks();
  } else if (tabId === "discovery") {
    renderTalents();
  }
}

/**
 * Format Angka Rupiah
 */
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

/**
 * Render Kartu Talenta pada Halaman Eksplorasi
 */
function renderTalents() {
  const container = document.getElementById("talentGrid");
  if (!container) return;

  const searchQuery = (document.getElementById("talentSearchInput")?.value || "").toLowerCase().trim();
  const catFilter = document.getElementById("categoryFilter")?.value || "ALL";
  const workFilter = document.getElementById("workPrefFilter")?.value || "ALL";
  const availFilter = document.getElementById("availabilityFilter")?.value || "ALL";

  const filtered = currentTalents.filter(talent => {
    const matchesSearch =
      talent.fullName.toLowerCase().includes(searchQuery) ||
      talent.title.toLowerCase().includes(searchQuery) ||
      talent.bio.toLowerCase().includes(searchQuery) ||
      talent.location.toLowerCase().includes(searchQuery) ||
      talent.skills.some(s => s.toLowerCase().includes(searchQuery));

    const matchesCat = catFilter === "ALL" || talent.category === catFilter;
    const matchesWork = workFilter === "ALL" || talent.workPreference === workFilter;
    const matchesAvail = availFilter === "ALL" || talent.availability === availFilter;

    return matchesSearch && matchesCat && matchesWork && matchesAvail;
  });

  // Update counter
  const countEl = document.getElementById("talentCountBadge");
  if (countEl) countEl.textContent = `${filtered.length} talenta ditemukan`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>Tidak ada talenta yang cocok</h3>
        <p>Coba sesuaikan kata kunci pencarian atau reset filter di atas.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => createTalentCardHtml(t)).join("");
  bindCardButtons(container);
}

/**
 * Generate Template HTML untuk Kartu Talenta
 */
function createTalentCardHtml(talent, extraBadge = "") {
  const isBookmarked = bookmarks.includes(talent.id);
  const initials = talent.fullName.split(" ").map(n => n[0]).slice(0, 2).join("");
  const availClass = talent.availability === "Available Now" ? "badge-avail-now" : "badge-open-offer";

  return `
    <article class="talent-card" data-id="${talent.id}">
      <div>
        <div class="card-header">
          <div class="avatar-circle">${initials}</div>
          <div class="card-title-group">
            <h3 class="talent-name">${talent.fullName}</h3>
            <p class="talent-role">${talent.title}</p>
            <div class="talent-badge-row">
              <span class="badge ${availClass}">● ${talent.availability}</span>
              <span class="badge badge-primary">${talent.location} (${talent.workPreference.toUpperCase()})</span>
              ${extraBadge}
            </div>
          </div>
        </div>

        <div class="card-body">
          <p class="talent-bio">${talent.bio}</p>

          <div class="meta-stats-row">
            <div class="meta-col">
              <span class="meta-label">Pengalaman</span>
              <span class="meta-value">${talent.experienceYears} Tahun</span>
            </div>
            <div class="meta-col">
              <span class="meta-label">Rate Standar</span>
              <span class="meta-value">${formatRupiah(talent.expectedRate.amount)}/bln</span>
            </div>
            <div class="meta-col">
              <span class="meta-label">Rating</span>
              <span class="meta-value">⭐ ${talent.rating} (${talent.completedProjects} Proyek)</span>
            </div>
          </div>

          <div class="skills-wrapper">
            ${talent.skills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button type="button" class="btn btn-primary view-detail-btn" style="flex: 1;" data-id="${talent.id}">
          Lihat Profil Lengkap
        </button>
        <button type="button" class="btn btn-outline btn-bookmark ${isBookmarked ? 'active' : ''}" data-id="${talent.id}" title="${isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}">
          ${isBookmarked ? '★' : '☆'}
        </button>
      </div>
    </article>
  `;
}

/**
 * Bind Action Buttons pada Kartu Talenta
 */
function bindCardButtons(container) {
  container.querySelectorAll(".view-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openTalentModal(id);
    });
  });

  container.querySelectorAll(".btn-bookmark").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      bookmarks = toggleBookmarkStorage(id);
      renderAll();
      showToast(bookmarks.includes(id) ? "Kandidat disimpan ke bookmark" : "Kandidat dihapus dari bookmark");
    });
  });
}

/**
 * Buka Native <dialog> Modal Detail Talenta
 * Mematuhi Modern Web Guidance (showModal(), native backdrop, overscroll-behavior)
 */
function openTalentModal(talentId) {
  const talent = currentTalents.find(t => t.id === talentId);
  if (!talent) return;

  const dialog = document.getElementById("talentDetailModal");
  if (!dialog) return;

  // Hitung estimasi PPh 21 (Bukan Pegawai / Tenaga Ahli Lepas) berdasarkan docs/core.md
  // DPP = 50% * Bruto. PPh 21 tarif pasal 17 lapisan 1 (5% up to 60jt)
  const monthlyRate = talent.expectedRate.amount;
  const dpp = monthlyRate * 0.5;
  const estPph21 = dpp * 0.05; // Asumsi tarif layer 1 (5%)
  const netTakeHome = monthlyRate - estPph21;

  const modalBody = document.getElementById("modalBodyContent");
  const modalTitle = document.getElementById("modalTalentTitle");

  if (modalTitle) {
    modalTitle.textContent = `${talent.fullName} - ${talent.title}`;
  }

  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display: flex; gap: 1.25rem; align-items: flex-start; margin-bottom: 1.5rem;">
        <div class="avatar-circle" style="width: 64px; height: 64px; font-size: 1.4rem;">
          ${talent.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800;">${talent.fullName}</h2>
          <p style="color: var(--text-muted); font-weight: 500;">${talent.title} • ${talent.categoryName}</p>
          <p style="font-size: 0.85rem; color: var(--text-subtle); margin-top: 0.2rem;">
            📍 ${talent.location} | Preferensi: <strong>${talent.workPreference.toUpperCase()}</strong> | Status: <strong>${talent.availability}</strong>
          </p>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Tentang & Ringkasan Pengalaman</h4>
        <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.6;">${talent.bio}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Keahlian & Teknologi Terverifikasi</h4>
        <div class="skills-wrapper">
          ${talent.skills.map(s => `<span class="skill-tag" style="padding: 0.3rem 0.65rem; font-size: 0.82rem;">${s}</span>`).join("")}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Portofolio & Rekam Jejak Proyek</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${talent.portfolios.map(p => `
            <div style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background-color: var(--bg-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <strong style="font-size: 0.92rem; color: var(--text-main);">${p.title}</strong>
                <span style="font-size: 0.75rem; color: var(--text-subtle);">${p.year} • ${p.clientOrOrg}</span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${p.description}</p>
              <div class="skills-wrapper">
                ${p.technologies.map(t => `<span class="skill-tag" style="font-size: 0.7rem;">${t}</span>`).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Simulasi Pajak & Kompensasi Indonesia (docs/core.md) -->
      <div style="padding: 1rem; border-radius: var(--radius-md); background: linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(37, 99, 235, 0.08)); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.4rem;">
          💼 Estimasi Kompensasi & Pajak (PPh 21 Lepas)
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
          <div>Rate Bruto: <strong>${formatRupiah(monthlyRate)}/bln</strong></div>
          <div>Dasar Pajak (DPP 50%): <strong>${formatRupiah(dpp)}</strong></div>
          <div>Estimasi Potongan PPh 21 (5%): <strong>${formatRupiah(estPph21)}</strong></div>
          <div>Estimasi Net Take-Home: <strong style="color: var(--success);">${formatRupiah(netTakeHome)}</strong></div>
        </div>
        <p style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 0.4rem;">
          *Perhitungan simulasi berdasarkan pedoman PPh 21 Tenaga Ahli (docs/core.md) tanpa status PTKP pegawai tetap.
        </p>
      </div>

      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Kontak & Tautan Profesional</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted);">
          ✉️ Email: <a href="mailto:${talent.contact.email}">${talent.contact.email}</a><br>
          🐙 GitHub: <a href="${talent.contact.github}" target="_blank" rel="noopener">${talent.contact.github}</a><br>
          💼 LinkedIn: <a href="${talent.contact.linkedin}" target="_blank" rel="noopener">${talent.contact.linkedin}</a>
        </p>
      </div>
    `;
  }

  // Open native modal
  dialog.showModal();
}

/**
 * Setup Light-Dismiss Fallback untuk Modal <dialog>
 * Sesuai rekomendasi modern-web-guidance
 */
function setupDialogLightDismiss() {
  const dialog = document.getElementById("talentDetailModal");
  if (!dialog) return;

  if (!("closedBy" in HTMLDialogElement.prototype)) {
    const outside = (e, d) => {
      const r = d.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    dialog.addEventListener("pointerdown", (e) => {
      pressedOutside = outside(e, dialog);
    });
    dialog.addEventListener("pointerup", (e) => {
      if (pressedOutside && outside(e, dialog)) {
        dialog.close();
      }
    });
  }

  // Close button inside dialog
  const closeBtn = document.getElementById("modalCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog.close());
  }
}

/**
 * Algoritma Matchmaking Matematika Berdasarkan docs/core.md
 * Total Score = (0.45 * Skill) + (0.25 * Experience) + (0.20 * Budget) + (0.10 * Availability)
 */
function handleMatchmaking(e) {
  e.preventDefault();

  const reqSkillsRaw = document.getElementById("reqSkills")?.value || "";
  const targetCategory = document.getElementById("targetCategory")?.value || "ALL";
  const minExp = parseFloat(document.getElementById("minExp")?.value) || 0;
  const maxBudget = parseFloat(document.getElementById("maxBudget")?.value) || 0;
  const workPref = document.getElementById("reqWorkPref")?.value || "ALL";

  const reqSkillsList = reqSkillsRaw
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);

  const results = currentTalents.map(talent => {
    // 1. Skill Score (45%)
    let skillScore = 0;
    if (reqSkillsList.length === 0) {
      skillScore = 100;
    } else {
      const talentSkillsLower = talent.skills.map(s => s.toLowerCase());
      const matched = reqSkillsList.filter(req => 
        talentSkillsLower.some(ts => ts.includes(req) || req.includes(ts))
      );
      skillScore = (matched.length / reqSkillsList.length) * 100;
    }

    // 2. Experience Score (25%)
    let expScore = 100;
    if (minExp > 0) {
      if (talent.experienceYears >= minExp) {
        expScore = 100;
      } else {
        expScore = Math.max(0, (talent.experienceYears / minExp) * 100);
      }
    }

    // 3. Budget / Rate Score (20%)
    let budgetScore = 100;
    if (maxBudget > 0) {
      const talentRate = talent.expectedRate.amount;
      if (talentRate <= maxBudget) {
        budgetScore = 100;
      } else {
        const excess = (talentRate - maxBudget) / maxBudget;
        if (excess <= 0.20) {
          budgetScore = (1 - excess) * 100;
        } else {
          budgetScore = 20; // Penalti jika melebihi margin 20%
        }
      }
    }

    // 4. Availability Score (10%)
    let availScore = 100;
    if (talent.availability === "Available Now") {
      availScore = 100;
    } else if (talent.availability === "Open to Offers") {
      availScore = 75;
    } else {
      availScore = 20;
    }

    // Filter Kategori & Work Preference bila spesifik
    let categoryMultiplier = 1;
    if (targetCategory !== "ALL" && talent.category !== targetCategory) {
      categoryMultiplier = 0.5; // Penalti ketidakcocokan kategori
    }

    let workPrefMultiplier = 1;
    if (workPref !== "ALL" && talent.workPreference !== workPref) {
      workPrefMultiplier = 0.8;
    }

    const rawTotal = (0.45 * skillScore) + (0.25 * expScore) + (0.20 * budgetScore) + (0.10 * availScore);
    const finalScore = Math.round(Math.min(100, rawTotal * categoryMultiplier * workPrefMultiplier));

    return {
      talent,
      finalScore,
      breakdown: {
        skillScore: Math.round(skillScore),
        expScore: Math.round(expScore),
        budgetScore: Math.round(budgetScore),
        availScore: Math.round(availScore)
      }
    };
  });

  // Urutkan dari skor tertinggi
  results.sort((a, b) => b.finalScore - a.finalScore);

  renderMatchResults(results);
}

/**
 * Tampilkan Hasil Matchmaking
 */
function renderMatchResults(results) {
  const container = document.getElementById("matchResultsContainer");
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `<p class="empty-state">Tidak ada kandidat untuk dievaluasi.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.2rem; font-weight: 700;">Hasil Peringkat Kesesuaian (Match Score)</h3>
      <span class="badge badge-primary">${results.length} Kandidat Terkalkulasi</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      ${results.map(r => {
        let scoreClass = "score-low";
        if (r.finalScore >= 80) scoreClass = "score-high";
        else if (r.finalScore >= 60) scoreClass = "score-medium";

        const badgeHtml = `<span class="match-score-badge ${scoreClass}">🎯 ${r.finalScore}% Match</span>`;
        return `
          <div style="position: relative;">
            <div style="padding: 0.6rem 1rem; background-color: var(--bg-subtle); border: 1px solid var(--border-color); border-bottom: none; border-radius: var(--radius-lg) var(--radius-lg) 0 0; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted);">
              <span>Breakdown: Skill (${r.breakdown.skillScore}%) • Pengalaman (${r.breakdown.expScore}%) • Budget (${r.breakdown.budgetScore}%) • Siap (${r.breakdown.availScore}%)</span>
              <strong style="color: var(--text-main);">Rank Match Score</strong>
            </div>
            ${createTalentCardHtml(r.talent, badgeHtml)}
          </div>
        `;
      }).join("")}
    </div>
  `;

  bindCardButtons(container);
}

/**
 * Handle Tambah Talenta Baru (Offline Local Storage)
 */
function handleAddTalent(e) {
  e.preventDefault();

  const fullName = document.getElementById("newFullName")?.value.trim();
  const title = document.getElementById("newTitle")?.value.trim();
  const category = document.getElementById("newCategory")?.value;
  const location = document.getElementById("newLocation")?.value.trim() || "Indonesia";
  const workPref = document.getElementById("newWorkPref")?.value || "remote";
  const expYears = parseFloat(document.getElementById("newExpYears")?.value) || 1;
  const rate = parseFloat(document.getElementById("newRate")?.value) || 10000000;
  const availability = document.getElementById("newAvailability")?.value || "Available Now";
  const skillsRaw = document.getElementById("newSkills")?.value || "";
  const bio = document.getElementById("newBio")?.value.trim();
  const email = document.getElementById("newEmail")?.value.trim() || "talent@example.com";

  if (!fullName || !title || !bio) {
    alert("Harap lengkapi nama, spesialisasi, dan deskripsi bio.");
    return;
  }

  const categoryNames = {
    "TECH-ENG": "Software Engineering",
    "DATA-AI": "Data & AI",
    "PROD-DES": "Product & Design",
    "CYBER-SEC": "Cybersecurity & Infra"
  };

  const newTalent = {
    id: `TLT-${String(currentTalents.length + 1).padStart(3, "0")}`,
    fullName,
    title,
    category,
    categoryName: categoryNames[category] || "Professional",
    bio,
    location,
    workPreference: workPref,
    experienceYears: expYears,
    expectedRate: {
      amount: rate,
      period: "monthly",
      currency: "IDR"
    },
    availability,
    skills: skillsRaw.split(",").map(s => s.trim()).filter(s => s.length > 0),
    portfolios: [
      {
        title: "Proyek Mandiri & Profesional",
        clientOrOrg: "Portofolio Lokal",
        year: "2024",
        description: "Pengembangan sistem profesional sesuai spesifikasi keahlian.",
        technologies: skillsRaw.split(",").slice(0, 3).map(s => s.trim()),
        url: "#"
      }
    ],
    contact: {
      email,
      github: "https://github.com/",
      linkedin: "https://linkedin.com/"
    },
    rating: 5.0,
    completedProjects: 1
  };

  currentTalents.unshift(newTalent);
  saveTalents(currentTalents);

  e.target.reset();
  showToast(`Talenta ${newTalent.fullName} berhasil ditambahkan secara offline!`);
  switchTab("discovery");
}

/**
 * Render Daftar Talenta Tersimpan (Bookmarks)
 */
function renderBookmarks() {
  const container = document.getElementById("bookmarksGrid");
  if (!container) return;

  const bookmarkedTalents = currentTalents.filter(t => bookmarks.includes(t.id));

  if (bookmarkedTalents.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⭐</div>
        <h3>Belum ada kandidat tersimpan</h3>
        <p>Gunakan tombol bintang pada kartu talenta untuk menyimpan kandidat favorit Anda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookmarkedTalents.map(t => createTalentCardHtml(t)).join("");
  bindCardButtons(container);
}

/**
 * Ekspor Data Talenta ke JSON (Offline Data Portability)
 */
function exportTalentsJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTalents, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `temutalenta_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("File JSON berhasil diunduh!");
}

/**
 * Reset Data ke Dataset Bawaan
 */
function resetToDefaultData() {
  if (confirm("Kembalikan data ke daftar talenta default bawaan?")) {
    localStorage.removeItem(STORAGE_KEYS.TALENTS);
    currentTalents = [...INITIAL_TALENTS];
    saveTalents(currentTalents);
    renderAll();
    showToast("Data talenta berhasil direset ke default.");
  }
}

/**
 * Notifikasi Toast Ringan
 */
function showToast(message) {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>✓</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Render Semua Tampilan
 */
function renderAll() {
  renderTalents();
  renderBookmarks();
  updateHeroStats();
}

/**
 * Update Angka Ringkasan di Hero Banner
 */
function updateHeroStats() {
  const totalTalentsEl = document.getElementById("statTotalTalents");
  const availTalentsEl = document.getElementById("statAvailTalents");
  const avgRatingEl = document.getElementById("statAvgRating");

  if (totalTalentsEl) totalTalentsEl.textContent = currentTalents.length;
  if (availTalentsEl) {
    const availCount = currentTalents.filter(t => t.availability === "Available Now").length;
    availTalentsEl.textContent = availCount;
  }
  if (avgRatingEl && currentTalents.length > 0) {
    const avg = (currentTalents.reduce((acc, t) => acc + (t.rating || 5.0), 0) / currentTalents.length).toFixed(1);
    avgRatingEl.textContent = `⭐ ${avg}`;
  }
}
