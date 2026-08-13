const crypto = require("crypto");

// In-memory session store: token -> expiry timestamp.
// Simple and fine for a small class-site admin panel (single process, no need for a real session DB).
const sessions = new Map();
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isValidToken(token) {
  if (!token) return false;
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    sessions.delete(token);
    return false;
  }
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
