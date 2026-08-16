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

function writeDB(data) {
  ensureRuntimeFile();
  fs.writeFileSync(RUNTIME_PATH, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readDB, writeDB, IS_SERVERLESS };
