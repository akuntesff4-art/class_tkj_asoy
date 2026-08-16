const crypto = require("crypto");

// ---------------------------------------------------------------------
// STATELESS SIGNED TOKEN (bukan in-memory Map).
//
// Kenapa diganti dari Map biasa: di Vercel (serverless), tiap request BISA
// kena instance/proses yang berbeda-beda — jadi kalau session disimpan di
// memory (Map), request login dan request "Simpan" berikutnya bisa saja
// "tidak saling kenal" dan admin panel gagal menyimpan padahal password
// benar. Solusinya: token yang membawa buktinya sendiri (ditandatangani
// pakai HMAC), jadi verifikasinya tidak butuh memori yang sama sekali.
// ---------------------------------------------------------------------
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam

function getSecret() {
  // Pakai SESSION_SECRET kalau di-set, atau turunan dari ADMIN_PASSWORD,
  // atau fallback terakhir. Tidak pernah dikirim ke frontend.
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "cq-fallback-secret-change-me";
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createSession() {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = String(expiry);
  const signature = sign(payload);
  // format token: <expiry>.<signature>
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function isValidToken(token) {
  if (!token) return false;
  let decoded;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf-8");
  } catch (e) {
    return false;
  }
  const [payload, signature] = decoded.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false; // tanda tangan tidak cocok -> token palsu/rusak
  }

  const expiry = Number(payload);
  if (!expiry || Date.now() > expiry) return false; // sudah kedaluwarsa

  return true;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!isValidToken(token)) {
    return res.status(401).json({ error: "Unauthorized. Silakan login admin dulu." });
  }
  next();
}

module.exports = { createSession, isValidToken, requireAuth };
