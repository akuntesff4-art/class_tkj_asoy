const express = require("express");
const path = require("path");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Static frontend
const CLIENT_DIR = path.join(__dirname, "..", "client");
app.use(express.static(CLIENT_DIR));

// REST API
app.use("/api", apiRoutes);

// Fallback: setiap route non-API yang tidak ketemu file statis, arahkan ke halaman itu sendiri
// (multi-page biasa, bukan SPA, jadi cukup 404 sederhana untuk path yang benar-benar tidak ada)
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint tidak ditemukan." });
  }
  res.status(404).sendFile(path.join(CLIENT_DIR, "index.html"));
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  CLASS QUESTERS TKJ A server jalan di http://localhost:${PORT}\n`);
  });
}

module.exports = app;
