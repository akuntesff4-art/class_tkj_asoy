/* =====================================================================
   admin.js — dashboard admin sederhana (struktur, piket, social, pengumuman)
===================================================================== */
const API = "/api";

function getToken() {
  try { return sessionStorage.getItem("cq-admin-token"); } catch (e) { return null; }
}
function setToken(t) {
  try { sessionStorage.setItem("cq-admin-token", t); } catch (e) {}
}

async function apiGet(path) {
  const res = await fetch(API + path);
  return res.json();
}
async function apiWrite(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: res.ok, data: await res.json() };
}

/* ---------- LOGIN ---------- */
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("loginPassword").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

async function login() {
  const pass = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");
  msg.textContent = "Mengecek...";
  try {
    const res = await fetch(API + "/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    const data = await res.json();
    if (!res.ok) { msg.textContent = data.error || "Login gagal."; window.ClassSound && ClassSound.play("close"); return; }
    setToken(data.token);
    msg.textContent = "";
    window.ClassSound && ClassSound.play("success");
    enterDashboard();
  } catch (e) {
    msg.textContent = "Server tidak bisa dihubungi.";
  }
}

async function checkExistingSession() {
  const token = getToken();
  if (!token) return;
  const res = await fetch(API + "/admin/check", { headers: { Authorization: "Bearer " + token } });
  const data = await res.json();
  if (data.valid) enterDashboard();
}

function enterDashboard() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminBox").style.display = "block";
  loadStructure();
  loadPiket();
  loadSocial();
  loadAnnouncements();
}

function logout() {
  try { sessionStorage.removeItem("cq-admin-token"); } catch (e) {}
  document.getElementById("adminBox").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginMsg").textContent = "";
  window.ClassSound && ClassSound.play("close");
}
document.getElementById("logoutBtn").addEventListener("click", logout);

/* ---------- STRUKTUR ---------- */
async function loadStructure() {
  const data = await apiGet("/structure");
  const wrap = document.getElementById("structureForm");
  wrap.innerHTML = data
    .map(
      (r, i) => `
    <div class="admin-row">
      <input type="text" value="${r.role}" disabled style="opacity:.6">
      <input type="text" value="${r.name || ""}" placeholder="Nama (kosongkan jika belum ada)" data-role="${r.role}">
    </div>`
    )
    .join("");
}
document.getElementById("saveStructure").addEventListener("click", async () => {
  const rows = document.querySelectorAll("#structureForm .admin-row");
  const payload = Array.from(rows).map((row) => {
    const nameInput = row.querySelector("input[data-role]");
    return { role: nameInput.dataset.role, name: nameInput.value.trim() };
  });
  const { ok } = await apiWrite("PUT", "/structure", payload);
  document.getElementById("structureMsg").textContent = ok ? "Tersimpan ✓" : "Gagal menyimpan.";
  window.ClassSound && ClassSound.play(ok ? "success" : "close");
});

/* ---------- PIKET ---------- */
async function loadPiket() {
  const data = await apiGet("/piket");
  const wrap = document.getElementById("piketForm");
  wrap.innerHTML = data
    .map(
      (p, i) => `
    <div class="admin-row">
      <input type="text" value="${p.day}" disabled style="opacity:.6;max-width:110px">
      <input type="text" value="${(p.members || []).join(", ")}" placeholder="Nama, pisahkan koma" data-day="${p.day}">
    </div>`
    )
    .join("");
}
document.getElementById("savePiket").addEventListener("click", async () => {
  const rows = document.querySelectorAll("#piketForm .admin-row");
  const payload = Array.from(rows).map((row) => {
    const input = row.querySelector("input[data-day]");
    const members = input.value.split(",").map((s) => s.trim()).filter(Boolean);
    return { day: input.dataset.day, members };
  });
  const { ok } = await apiWrite("PUT", "/piket", payload);
  document.getElementById("piketMsg").textContent = ok ? "Tersimpan ✓" : "Gagal menyimpan.";
  window.ClassSound && ClassSound.play(ok ? "success" : "close");
});

/* ---------- SOCIAL ---------- */
async function loadSocial() {
  const data = await apiGet("/social");
  const wrap = document.getElementById("socialForm");
  wrap.innerHTML = `
    <div class="admin-row"><input type="text" value="${data.instagram.handle}" data-k="instagram.handle" placeholder="Instagram handle"></div>
    <div class="admin-row"><input type="text" value="${data.instagram.url}" data-k="instagram.url" placeholder="Instagram URL"></div>
    <div class="admin-row"><input type="text" value="${data.tiktok.handle}" data-k="tiktok.handle" placeholder="TikTok handle"></div>
    <div class="admin-row"><input type="text" value="${data.tiktok.url}" data-k="tiktok.url" placeholder="TikTok URL"></div>
    <div class="admin-row"><input type="text" value="${data.spotify.label}" data-k="spotify.label" placeholder="Label Spotify"></div>
    <div class="admin-row"><input type="text" value="${data.spotify.url}" data-k="spotify.url" placeholder="Link Playlist Spotify"></div>
  `;
}
document.getElementById("saveSocial").addEventListener("click", async () => {
  const inputs = document.querySelectorAll("#socialForm input[data-k]");
  const payload = { instagram: {}, tiktok: {}, spotify: {} };
  inputs.forEach((inp) => {
    const [group, field] = inp.dataset.k.split(".");
    payload[group][field] = inp.value.trim();
  });
  const { ok } = await apiWrite("PUT", "/social", payload);
  document.getElementById("socialMsg").textContent = ok ? "Tersimpan ✓" : "Gagal menyimpan.";
  window.ClassSound && ClassSound.play(ok ? "success" : "close");
});

/* ---------- PENGUMUMAN ---------- */
async function loadAnnouncements() {
  const data = await apiGet("/announcements");
  const wrap = document.getElementById("announceList");
  wrap.innerHTML = data.length
    ? data.map((a) => `
      <div class="admin-row">
        <input type="text" value="${a.text}" disabled>
        <button class="music-btn ripple-btn" data-del="${a.id}" aria-label="Hapus">🗑️</button>
      </div>`).join("")
    : '<p style="color:var(--muted);font-size:13px">Belum ada pengumuman.</p>';

  wrap.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await apiWrite("DELETE", "/announcements/" + btn.dataset.del);
      window.ClassSound && ClassSound.play("close");
      loadAnnouncements();
    });
  });
}
document.getElementById("addAnnounce").addEventListener("click", async () => {
  const input = document.getElementById("announceInput");
  if (!input.value.trim()) return;
  const { ok } = await apiWrite("POST", "/announcements", { text: input.value.trim() });
  if (ok) { input.value = ""; window.ClassSound && ClassSound.play("success"); loadAnnouncements(); }
});

checkExistingSession();
