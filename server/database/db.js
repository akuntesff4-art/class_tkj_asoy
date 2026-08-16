const fs = require("fs");
const path = require("path");

const BUNDLED_PATH = path.join(__dirname, "db.json");

// Di Vercel, filesystem project bersifat read-only saat runtime (kecuali /tmp).
// Jadi kalau berjalan di Vercel, kita tulis ke /tmp/db.json (writable, tapi
// TIDAK persisten permanen — bisa reset saat cold start / deploy baru).
// Di local/self-hosted (npm start biasa), tetap menulis langsung ke db.json
// seperti biasa dan datanya beneran persisten.
const IS_SERVERLESS = !!process.env.VERCEL;
const RUNTIME_PATH = IS_SERVERLESS ? "/tmp/db.json" : BUNDLED_PATH;

function ensureRuntimeFile() {
  if (IS_SERVERLESS && !fs.existsSync(RUNTIME_PATH)) {
    fs.copyFileSync(BUNDLED_PATH, RUNTIME_PATH);
  }
}

function readDB() {
  ensureRuntimeFile();
  const raw = fs.readFileSync(RUNTIME_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeLocal(data) {
  ensureRuntimeFile();
  fs.writeFileSync(RUNTIME_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------------------------------------------------------------
// PERSISTENSI PERMANEN LEWAT GITHUB (opsional, tapi SANGAT disarankan
// kalau website ini di-deploy ke Vercel).
//
// Kenapa perlu ini: tanpa ini, perubahan dari admin panel di Vercel cuma
// ditulis ke /tmp — folder sementara yang bisa "dibersihkan" Vercel kapan
// saja (misalnya pas cold start baru). Hasilnya kelihatan "Tersimpan ✓"
// tapi datanya bisa hilang lagi. Dengan GitHub, perubahan langsung
// di-commit ke db.json di repo asli — jadi permanen beneran, dan Vercel
// otomatis redeploy dengan data terbaru.
//
// Aktifkan dengan set environment variable di Vercel:
//   GITHUB_TOKEN  = personal access token (scope: repo / contents read-write)
//   GITHUB_REPO   = "username/nama-repo", contoh: "akuntesff4-art/class_tkj_asoy"
//   GITHUB_BRANCH = "main" (opsional, default "main")
// ---------------------------------------------------------------------
const GITHUB_DB_PATH = "server/database/db.json";

function githubConfigured() {
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

async function writeToGithub(data) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const apiBase = `https://api.github.com/repos/${repo}/contents/${GITHUB_DB_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "class-questers-admin",
  };

  // Wajib ambil "sha" file saat ini dulu sebelum bisa update file yang sudah ada di GitHub
  const getRes = await fetch(`${apiBase}?ref=${branch}`, { headers });
  if (!getRes.ok) {
    throw new Error(`Gagal mengambil file dari GitHub (status ${getRes.status}). Cek GITHUB_TOKEN & GITHUB_REPO.`);
  }
  const getData = await getRes.json();

  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64");

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "chore: update data kelas via admin panel",
      content,
      sha: getData.sha,
      branch,
    }),
  });
  if (!putRes.ok) {
    const errBody = await putRes.text().catch(() => "");
    throw new Error(`Gagal menyimpan ke GitHub (status ${putRes.status}). ${errBody}`);
  }
}

async function writeDB(data) {
  // Selalu tulis lokal dulu, biar instance yang sedang aktif langsung
  // melihat perubahan tanpa nunggu redeploy.
  writeLocal(data);

  // Kalau GitHub dikonfigurasi, commit juga ke repo -> PERMANEN.
  if (githubConfigured()) {
    await writeToGithub(data);
  }
}

module.exports = { readDB, writeDB, IS_SERVERLESS, githubConfigured };
