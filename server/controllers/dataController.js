const { readDB, writeDB } = require("../database/db");

// ---------- GET ----------
exports.getClass = (req, res) => res.json(readDB().class);
exports.getStructure = (req, res) => res.json(readDB().structure);
exports.getSchedule = (req, res) => res.json(readDB().schedule);
exports.getPiket = (req, res) => res.json(readDB().piket);
exports.getGallery = (req, res) => res.json(readDB().gallery);
exports.getSocial = (req, res) => res.json(readDB().social);
exports.getAnnouncements = (req, res) => res.json(readDB().announcements || []);

exports.getAll = (req, res) => res.json(readDB());

// ---------- PUT / POST (admin only, guarded by requireAuth middleware) ----------
exports.updateStructure = (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Payload harus berupa array struktur kelas." });
  }
  const db = readDB();
  db.structure = body;
  writeDB(db);
  res.json({ ok: true, structure: db.structure });
};

exports.updatePiket = (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: "Payload harus berupa array piket." });
  }
  const db = readDB();
  db.piket = body;
  writeDB(db);
  res.json({ ok: true, piket: db.piket });
};

exports.updateSocial = (req, res) => {
  const db = readDB();
  db.social = { ...db.social, ...req.body };
  writeDB(db);
  res.json({ ok: true, social: db.social });
};

exports.updateSchedule = (req, res) => {
  const db = readDB();
  db.schedule = { ...db.schedule, ...req.body };
  writeDB(db);
  res.json({ ok: true, schedule: db.schedule });
};

exports.addAnnouncement = (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Teks pengumuman tidak boleh kosong." });
  }
  const db = readDB();
  db.announcements = db.announcements || [];
  db.announcements.unshift({ id: Date.now(), text: text.trim(), createdAt: new Date().toISOString() });
  writeDB(db);
  res.json({ ok: true, announcements: db.announcements });
};

exports.deleteAnnouncement = (req, res) => {
  const id = Number(req.params.id);
  const db = readDB();
  db.announcements = (db.announcements || []).filter(a => a.id !== id);
  writeDB(db);
  res.json({ ok: true, announcements: db.announcements });
};
