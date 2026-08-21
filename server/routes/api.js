const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dataController");
const { requireAuth, createSession, isValidToken } = require("../middleware/auth");
const presence = require("../state/presence");

/* ============ PUBLIC READ ENDPOINTS ============ */
router.get("/class", ctrl.getClass);
router.get("/structure", ctrl.getStructure);
router.get("/schedule", ctrl.getSchedule);
router.get("/piket", ctrl.getPiket);
router.get("/gallery", ctrl.getGallery);
router.get("/social", ctrl.getSocial);
router.get("/announcements", ctrl.getAnnouncements);
router.get("/all", ctrl.getAll);
router.get("/persistence-status", ctrl.getPersistenceStatus);

/* ============ PRESENCE (siapa lagi online) ============ */
router.post("/presence/heartbeat", (req, res) => {
  const { sessionId } = req.body || {};
  presence.heartbeat(sessionId);
  res.json({ ok: true, online: presence.getOnlineCount() });
});
router.get("/presence/count", (req, res) => {
  res.json({ online: presence.getOnlineCount() });
});

/* ============ ADMIN AUTH ============ */
// Password diambil dari environment variable, TIDAK pernah dikirim/di-hardcode di frontend.
router.post("/admin/login", (req, res) => {
  const { password } = req.body || {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "classquesters2026";
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Password salah." });
  }
  const token = createSession();
  res.json({ ok: true, token });
});

router.get("/admin/check", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  res.json({ valid: isValidToken(token) });
});

/* ============ ADMIN WRITE ENDPOINTS (protected) ============ */
router.put("/structure", requireAuth, ctrl.updateStructure);
router.put("/piket", requireAuth, ctrl.updatePiket);
router.put("/social", requireAuth, ctrl.updateSocial);
router.put("/schedule", requireAuth, ctrl.updateSchedule);
router.post("/announcements", requireAuth, ctrl.addAnnouncement);
router.delete("/announcements/:id", requireAuth, ctrl.deleteAnnouncement);

module.exports = router;
            
