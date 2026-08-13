// Vercel serverless entry point.
// Semua request ke /api/* dari vercel.json dirutekan ke sini.
// Static files di client/ disajikan langsung oleh Vercel (lihat vercel.json),
// jadi function ini murni menangani REST API — ringan & cepat.
module.exports = require("../server/server.js");
