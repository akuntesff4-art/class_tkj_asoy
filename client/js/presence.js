/* =====================================================================
   presence.js — kirim heartbeat & update badge "X online sekarang"
===================================================================== */
(function () {
  function genId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "sess-" + Math.random().toString(36).slice(2) + Date.now();
  }

  let sessionId;
  try {
    sessionId = sessionStorage.getItem("cq-session-id");
    if (!sessionId) {
      sessionId = genId();
      sessionStorage.setItem("cq-session-id", sessionId);
    }
  } catch (e) {
    sessionId = genId();
  }

  const HEARTBEAT_MS = 20000;
  let countEl, timer;

  function updateBadge(count) {
    if (countEl) countEl.textContent = count;
  }

  async function sendHeartbeat() {
    try {
      const res = await fetch("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      updateBadge(data.online);
    } catch (e) {
      /* diamkan — kalau offline/gagal, badge cukup tetap nampilin angka terakhir */
    }
  }

  function startLoop() {
    clearInterval(timer);
    timer = setInterval(sendHeartbeat, HEARTBEAT_MS);
  }

  document.addEventListener("DOMContentLoaded", () => {
    countEl = document.getElementById("onlineCount");
    if (!countEl) return;
    sendHeartbeat();
    startLoop();

    // pas tab balik aktif, langsung kirim ulang biar cepat update
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) sendHeartbeat();
    });
  });
})();
