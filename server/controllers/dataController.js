const { readDB, writeDB, githubConfigured } = require("../database/db");

// ---------- GET ----------
exports.getClass = (req, res) => res.json(readDB().class);
exports.getStructure = (req, res) => res.json(readDB().structure);
exports.getSchedule = (req, res) => res.json(readDB().schedule);
exports.getPiket = (req, res) => res.json(readDB().piket);
exports.getGallery = (req, res) => res.json(readDB().gallery);
exports.getSocial = (req, res) => res.json(readDB().social);
exports.getAnnouncements = (req, res) => res.json(readDB().announcements || []);

exports.getAll = (req, res) => res.json(readDB());

exports.getPersistenceStatus = (req, res) => {
  res.json({ permanent: githubConfigured() });
};

// ---------- PUT / POST (admin only, guarded by requireAuth middleware) ----------
exports.updateStructure = async (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Payload harus berupa array struktur kelas." });
  }
  try {
    const db = readDB();
    db.structure = body;
    await writeDB(db);
    res.json({ ok: true, structure: db.structure, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};

exports.updatePiket = async (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Payload harus berupa array piket." });
  }
  try {
    const db = readDB();
    db.piket = body;
    await writeDB(db);
    res.json({ ok: true, piket: db.piket, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};

exports.updateSocial = async (req, res) => {
  try {
    const db = readDB();
    db.social = { ...db.social, ...req.body };
    await writeDB(db);
    res.json({ ok: true, social: db.social, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const db = readDB();
    db.schedule = { ...db.schedule, ...req.body };
    await writeDB(db);
    res.json({ ok: true, schedule: db.schedule, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};

exports.addAnnouncement = async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Teks pengumuman tidak boleh kosong." });
  }
  try {
    const db = readDB();
    db.announcements = db.announcements || [];
    db.announcements.unshift({ id: Date.now(), text: text.trim(), createdAt: new Date().toISOString() });
    await writeDB(db);
    res.json({ ok: true, announcements: db.announcements, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const db = readDB();
    db.announcements = (db.announcements || []).filter((a) => a.id !== id);
    await writeDB(db);
    res.json({ ok: true, announcements: db.announcements, permanent: githubConfigured() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Gagal menyimpan." });
  }
};
