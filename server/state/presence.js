/* =====================================================================
   presence.js — pelacak "siapa lagi online" berbasis heartbeat
   Browser ngirim sinyal tiap ~20 detik; kalau sinyal berhenti > 45 detik,
   dianggap sudah offline.

   Catatan jujur: ini in-memory (bukan database eksternal), jadi di Vercel
   (serverless) hitungannya BEST-EFFORT — kalau request kena instance
   server yang berbeda-beda, hitungan bisa sedikit meleset. Untuk website
   kelas dengan traffic kecil, ini biasanya cukup akurat di praktiknya.
===================================================================== */

const ACTIVE_WINDOW_MS = 45 * 1000; // dianggap online kalau heartbeat < 45 detik lalu
const sessions = new Map(); // sessionId -> lastSeen (timestamp ms)

function heartbeat(sessionId) {
  if (!sessionId || typeof sessionId !== "string") return;
  sessions.set(sessionId.slice(0, 100), Date.now()); // slice buat jaga-jaga input aneh
}

function prune() {
  const now = Date.now();
  for (const [id, lastSeen] of sessions) {
    if (now - lastSeen > ACTIVE_WINDOW_MS) sessions.delete(id);
  }
}

function getOnlineCount() {
  prune();
  return sessions.size;
}

module.exports = { heartbeat, getOnlineCount };
    
