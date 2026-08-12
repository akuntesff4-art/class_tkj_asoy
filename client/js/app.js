/* =====================================================================
   app.js — bootstrap halaman: loading screen, page transition, data render
===================================================================== */
const API = "/api";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   1. LOADING SCREEN (coded — bukan video, smooth easing)
============================================================ */
(function loadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (!screen) return;
  const bar = document.getElementById("loadBar");
  const pctEl = document.getElementById("loadPercent");
  const canvas = document.getElementById("loadParticles");

  if (canvas && window.ClassParticles && !reduceMotion) {
    ClassParticles.createEngine(canvas, { density: 9000, maxParticles: 55, emberRatio: 0.22 });
  }

  let shown = 0; // nilai yang ditampilkan (di-lerp menuju target)
  let target = 12;
  let finished = false;
  const startedAt = performance.now();
  const MIN_MS = 900;
  const MAX_MS = 4200;

  document.documentElement.style.overflow = "hidden";

  window.addEventListener("DOMContentLoaded", () => (target = Math.max(target, 65)));
  window.addEventListener("load", () => (target = 100));

  function finish() {
    if (finished) return;
    finished = true;
    screen.classList.add("hide");
    document.documentElement.style.overflow = "";
    setTimeout(() => screen.remove(), 900);
  }

  function tick(now) {
    const elapsed = now - startedAt;
    shown += (target - shown) * 0.09; // easing organik, bukan linear kaku
    if (target - shown < 0.15) shown = target;
    const display = Math.min(100, Math.round(shown));
    if (bar) bar.style.width = display + "%";
    if (pctEl) pctEl.textContent = display + "%";

    const doneEnough = shown >= 99.4 && elapsed >= MIN_MS;
    if (doneEnough || elapsed >= MAX_MS) {
      if (bar) bar.style.width = "100%";
      if (pctEl) pctEl.textContent = "100%";
      setTimeout(finish, 260);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ============================================================
   2. PAGE TRANSITION (fade + blur antar halaman)
============================================================ */
(function pageTransition() {
  requestAnimationFrame(() => document.body.classList.add("loaded"));
  document.querySelectorAll('a[href$=".html"], a[href="/"]').forEach((link) => {
    if (link.target === "_blank" || link.hasAttribute("data-no-transition")) return;
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (reduceMotion) { window.location.href = href; return; }
      document.body.classList.add("page-out");
      setTimeout(() => (window.location.href = href), 320);
    });
  });
})();

/* ============================================================
   3. SOUND TOGGLE BUTTON
============================================================ */
(function soundToggle() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  function render() {
    const on = window.ClassSound ? ClassSound.isEnabled() : true;
    btn.textContent = on ? "🔊" : "🔇";
    btn.setAttribute("aria-label", on ? "Matikan suara" : "Nyalakan suara");
  }
  btn.addEventListener("click", () => {
    const next = !(window.ClassSound && ClassSound.isEnabled());
    window.ClassSound && ClassSound.setEnabled(next);
    render();
  });
  document.addEventListener("cq-sound-toggle", render);
  render();
})();

/* ============================================================
   4. DATA FETCH HELPERS
============================================================ */
async function fetchJSON(path) {
  try {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error("Request gagal: " + path);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function announceRendered(root) {
  document.dispatchEvent(new CustomEvent("cq-content-rendered", { detail: { root } }));
}

/* ============================================================
   5. RENDER: HOME (class info + dashboard)
============================================================ */
async function renderHome() {
  const el = document.getElementById("homeClassInfo");
  if (!el) return;
  const data = await fetchJSON("/class");
  if (!data) return;
  document.querySelectorAll("[data-class-name]").forEach((n) => (n.textContent = data.name));
  document.querySelectorAll("[data-class-emoji]").forEach((n) => (n.textContent = data.emoji));
  document.querySelectorAll("[data-class-bio]").forEach((n) => (n.textContent = data.bio));
  document.querySelectorAll("[data-class-logo]").forEach((n) => (n.src = data.logo));
  const totalEl = document.querySelector("[data-total-students]");
  if (totalEl) totalEl.dataset.count = data.totalStudents;
  const majorShort = document.querySelector("[data-major-short]");
  if (majorShort) majorShort.textContent = data.major.short;
  const majorLong = document.querySelector("[data-major-long]");
  if (majorLong) majorLong.textContent = data.major.long;
  announceRendered(document);
}

/* ============================================================
   6. RENDER: STRUKTUR (org chart)
============================================================ */
async function renderStructure() {
  const wrap = document.getElementById("structureChart");
  if (!wrap) return;
  const data = await fetchJSON("/structure");
  if (!data) return;
  wrap.innerHTML = data
    .map(
      (r, i) => `
    <div class="org-card tilt reveal" style="animation-delay:${i * 0.04}s">
      <div class="org-role">${r.role}</div>
      <div class="org-name">${r.name && r.name.trim() ? r.name : "Belum diisi"}</div>
    </div>`
    )
    .join("");
  announceRendered(wrap);
}

/* ============================================================
   7. RENDER: MAPEL (weekly schedule)
============================================================ */
async function renderSchedule() {
  const wrap = document.getElementById("scheduleGrid");
  if (!wrap) return;
  const data = await fetchJSON("/schedule");
  if (!data) return;
  const todayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const today = todayNames[new Date().getDay()];
  wrap.innerHTML = Object.entries(data)
    .map(
      ([day, subjects], i) => `
    <div class="day-card tilt reveal ${day === today ? "today" : ""}" style="animation-delay:${i * 0.05}s">
      <div class="day-head">
        <span class="day-name">${day}</span>
        ${day === today ? '<span class="day-badge">HARI INI</span>' : ""}
      </div>
      <ul class="subject-list">
        ${subjects.map((s) => `<li>${s}</li>`).join("")}
      </ul>
    </div>`
    )
    .join("");
  announceRendered(wrap);
}

/* ============================================================
   8. RENDER: PIKET
============================================================ */
async function renderPiket() {
  const wrap = document.getElementById("piketGrid");
  if (!wrap) return;
  const data = await fetchJSON("/piket");
  if (!data) return;
  wrap.innerHTML = data
    .map(
      (p, i) => `
    <div class="day-card tilt reveal" style="animation-delay:${i * 0.05}s">
      <div class="day-head"><span class="day-name">${p.day}</span></div>
      <div class="piket-members">
        ${p.members && p.members.length ? p.members.map((m) => `<span class="piket-chip">${m}</span>`).join("") : '<span class="piket-empty">Belum diisi</span>'}
      </div>
    </div>`
    )
    .join("");
  announceRendered(wrap);
}

/* ============================================================
   9. RENDER: GALLERY (lazy load + modal)
============================================================ */
async function renderGallery() {
  const wrap = document.getElementById("galleryGrid");
  if (!wrap) return;
  const data = await fetchJSON("/gallery");
  if (!data) return;

  wrap.innerHTML = data
    .map(
      (v, i) => `
    <button class="video-card tilt reveal ripple-btn" style="animation-delay:${i * 0.03}s" data-sound="click" data-video="assets/videos/${v.file}" data-title="${v.title}">
      <span class="video-play">▶</span>
      <span class="video-label">${v.title}</span>
    </button>`
    )
    .join("");
  announceRendered(wrap);

  // Lazy: video hanya dimuat/diputar saat modal dibuka, bukan sekaligus di grid
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const modalTitle = document.getElementById("modalTitle");
  const modalClose = document.getElementById("modalClose");
  const modalLoading = document.getElementById("modalLoading");

  function openModal(src, title) {
    modal.classList.add("open");
    modalTitle.textContent = title;
    modalLoading.style.display = "flex";
    modalVideo.src = src;
    modalVideo.load();
    document.documentElement.style.overflow = "hidden";
    window.ClassSound && ClassSound.play("open");
  }
  function closeModal() {
    modal.classList.remove("open");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    document.documentElement.style.overflow = "";
    window.ClassSound && ClassSound.play("close");
  }

  modalVideo.addEventListener("canplay", () => (modalLoading.style.display = "none"));
  modalVideo.addEventListener("error", () => {
    modalLoading.textContent = "Video tidak ditemukan";
  });

  wrap.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.video, card.dataset.title));
  });
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

/* ============================================================
   10. RENDER: SOCIAL
============================================================ */
async function renderSocial() {
  const wrap = document.getElementById("socialGrid");
  if (!wrap) return;
  const data = await fetchJSON("/social");
  if (!data) return;
  const ig = data.instagram, tt = data.tiktok, sp = data.spotify;
  wrap.innerHTML = `
    <a href="${ig.url}" target="_blank" rel="noopener" class="social-card tilt reveal ripple-btn" data-sound="open">
      <span class="social-icon ig-icon">${IG_SVG}</span>
      <span class="social-text"><strong>Instagram</strong><small>${ig.handle}</small></span>
    </a>
    <a href="${tt.url}" target="_blank" rel="noopener" class="social-card tilt reveal ripple-btn" data-sound="open" style="animation-delay:.06s">
      <span class="social-icon tt-icon">${TT_SVG}</span>
      <span class="social-text"><strong>TikTok</strong><small>${tt.handle}</small></span>
    </a>
    <a href="${sp.url}" target="_blank" rel="noopener" class="social-card tilt reveal ripple-btn spotify" data-sound="open" style="animation-delay:.12s">
      <span class="social-icon sp-icon">${SP_SVG}</span>
      <span class="social-text"><strong>Spotify</strong><small>${sp.label}</small></span>
    </a>`;
  announceRendered(wrap);
}

const IG_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.79.22-2.43.47-.66.26-1.22.6-1.77 1.16-.56.55-.9 1.11-1.16 1.77-.25.64-.42 1.37-.47 2.43C2 8.94 2 9.28 2 12s.01 3.06.06 4.12c.05 1.06.22 1.79.47 2.43.26.66.6 1.22 1.16 1.77.55.56 1.11.9 1.77 1.16.64.25 1.37.42 2.43.47C8.94 22 9.28 22 12 22s3.06-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47.66-.26 1.22-.6 1.77-1.16.56-.55.9-1.11 1.16-1.77.25-.64.42-1.37.47-2.43.05-1.06.06-1.4.06-4.12s-.01-3.06-.06-4.12c-.05-1.06-.22-1.79-.47-2.43-.26-.66-.6-1.22-1.16-1.77-.55-.56-1.11-.9-1.77-1.16-.64-.25-1.37-.42-2.43-.47C15.06 2.01 14.72 2 12 2zm0 1.8c2.67 0 2.99.01 4.04.06.98.04 1.51.21 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.13.35.3.88.34 1.86.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.98-.21 1.51-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.35.13-.88.3-1.86.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.98-.04-1.51-.21-1.86-.34-.47-.18-.8-.4-1.15-.75-.35-.35-.57-.68-.75-1.15-.13-.35-.3-.88-.34-1.86C3.81 14.99 3.8 14.67 3.8 12s.01-2.99.06-4.04c.04-.98.21-1.51.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.35-.13.88-.3 1.86-.34C9.01 3.81 9.33 3.8 12 3.8zm0 3.06A5.14 5.14 0 1 0 12 17.06 5.14 5.14 0 0 0 12 6.86zm0 8.48a3.34 3.34 0 1 1 0-6.68 3.34 3.34 0 0 1 0 6.68zm5.34-8.68a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/></svg>`;
const TT_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82c-.9-.8-1.44-1.94-1.5-3.32h-3.13v13.3c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1-2.77-2.77 2.77 2.77 0 0 1 2.77-2.77c.28 0 .55.04.8.12v-3.19a6.05 6.05 0 0 0-.8-.05A5.95 5.95 0 0 0 3.24 15.7 5.95 5.95 0 0 0 9.19 21.65a5.95 5.95 0 0 0 5.95-5.95V9.02a8.31 8.31 0 0 0 4.87 1.56V7.44c-1.19 0-2.3-.36-3.41-1.62z"/></svg>`;
const SP_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.4a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.63.63 0 1 1-.28-1.22c3.81-.87 7.09-.5 9.72 1.11.3.19.39.58.21.86zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.98-1.16a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.57 11.24 1.32.37.23.48.72.26 1.07zm.1-2.83c-3.23-1.92-8.55-2.09-11.63-1.16a.94.94 0 1 1-.54-1.8c3.53-1.07 9.41-.86 13.13 1.34a.94.94 0 0 1-.96 1.62z"/></svg>`;

/* ============================================================
   11. INIT: jalankan render sesuai elemen yang ada di halaman
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderStructure();
  renderSchedule();
  renderPiket();
  renderGallery();
  renderSocial();
});
