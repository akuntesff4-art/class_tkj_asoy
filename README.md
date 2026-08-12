# CLASS QUESTERS TKJ A 👑⚡

Website kelas full-stack — Express.js + JSON database. Dark futuristic, glassmorphism, neon green + fire accents.

## 🚀 Menjalankan Project

```bash
npm install
npm start
```

Lalu buka **http://localhost:3000**

Untuk development dengan auto-reload:
```bash
npm run dev
```

## 📁 Struktur Folder

```
class-questers/
├── client/                 → semua file frontend (disajikan sebagai static files)
│   ├── index.html          → Beranda
│   ├── struktur.html       → Struktur Kelas
│   ├── mapel.html          → Jadwal Mapel
│   ├── piket.html          → Jadwal Piket
│   ├── gallery.html        → Gallery Video
│   ├── social.html         → Social Media
│   ├── admin.html          → Dashboard admin
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js          → loading screen, page transition, render data
│   │   ├── particles.js    → engine partikel + ember/fire
│   │   ├── sound.js        → SFX (Web Audio API, tanpa file eksternal)
│   │   ├── animations.js   → reveal, counter, tilt, magnetic, ripple, cursor glow
│   │   ├── music.js        → music player
│   │   └── admin.js        → logic dashboard admin
│   ├── assets/
│   │   ├── logo.jpg        → ⚠️ WAJIB kamu tambahkan sendiri
│   │   └── videos/
│   │       └── video-1.mp4 ... video-14.mp4   → ⚠️ WAJIB kamu tambahkan sendiri
│   └── lagu.mp3             → ⚠️ opsional, tambahkan sendiri untuk music player
│
├── server/
│   ├── server.js            → entry point Express
│   ├── routes/api.js        → semua route REST API
│   ├── controllers/dataController.js
│   ├── middleware/auth.js   → auth token sederhana untuk admin
│   └── database/db.json     → "database" JSON (mudah diedit manual juga)
│
├── package.json
└── README.md
```

## ⚠️ File yang HARUS kamu tambahkan sendiri

File-file ini **tidak disertakan** dalam paket ini (bukan hasil generate AI, harus dari kamu):

1. `client/assets/logo.jpg` — logo kelas, akan otomatis muncul bulat (circular)
2. `client/assets/videos/video-1.mp4` sampai `video-14.mp4` — 14 video gallery
3. `client/lagu.mp3` — lagu untuk Class Music Player (opsional; kalau belum ada, tombol player tetap muncul dengan status "Music belum tersedia", website tidak akan error)

## 🔌 REST API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/class` | Info kelas (nama, bio, jumlah siswa, jurusan) |
| GET | `/api/structure` | Struktur kelas |
| GET | `/api/schedule` | Jadwal mapel mingguan |
| GET | `/api/piket` | Jadwal piket |
| GET | `/api/gallery` | Metadata 14 video |
| GET | `/api/social` | Link social media |
| GET | `/api/announcements` | Daftar pengumuman |
| POST | `/api/admin/login` | Login admin → `{ password }` → `{ token }` |
| PUT | `/api/structure` | (admin) update struktur |
| PUT | `/api/piket` | (admin) update piket |
| PUT | `/api/social` | (admin) update social |
| PUT | `/api/schedule` | (admin) update jadwal |
| POST | `/api/announcements` | (admin) tambah pengumuman |
| DELETE | `/api/announcements/:id` | (admin) hapus pengumuman |

## 🔐 Admin Panel

Buka **`/admin.html`**.

Password default: `classquesters2026`

**Ganti password ini!** Caranya, set environment variable sebelum `npm start`:

```bash
ADMIN_PASSWORD=passwordbaru npm start
```

Password admin **tidak pernah** ditulis di kode frontend — hanya dicek di server lewat endpoint `/api/admin/login`, lalu server memberi token sesi sementara (2 jam) yang dipakai untuk request PUT/POST/DELETE berikutnya.

## ✏️ Edit Data Manual (tanpa admin panel)

Semua data (struktur, piket, jadwal, social, dll) ada di satu file:
`server/database/db.json`

Edit langsung file itu dengan text editor, simpan, lalu refresh browser — tidak perlu restart server.

## 🎨 Fitur

- Loading screen animasi coded (logo pulse + progress bar easing + partikel), bukan video
- Page transition fade + blur antar halaman
- Particle engine ringan (hijau, putih, ember api) — pause otomatis saat tab tidak aktif
- Sound effect sintesis (Web Audio API) dengan tombol ON/OFF, preference tersimpan di localStorage
- Music player floating dengan visualizer equalizer sederhana, shortcut keyboard (Space/M)
- Struktur kelas bergaya organizational chart
- Jadwal mapel mingguan dengan penanda "hari ini"
- Gallery video cinematic dengan modal player + lazy loading (video tidak diputar sekaligus)
- Social media card dengan icon asli (gradient Instagram, cyan-pink TikTok, hijau Spotify)
- Scroll reveal, animated counter, tilt card, magnetic button, ripple click, cursor glow
- Responsive mobile-first, menghormati `prefers-reduced-motion`
- Dashboard admin sederhana untuk edit struktur/piket/social/pengumuman tanpa sentuh kode

## ✅ Checklist Fitur Lama (tidak dihapus)

- [x] Logo `logo.jpg` (circular)
- [x] CLASS QUESTERS TKJ A 👑⚡
- [x] Bio kelas
- [x] 27 siswa/i
- [x] Jurusan TKJ
- [x] Struktur kelas (9 role, data kosong → "Belum diisi")
- [x] Jadwal mapel (data asli dipertahankan persis)
- [x] Jadwal piket kosong ("Belum diisi", tidak ada nama karangan)
- [x] 14 video (`video-1.mp4` – `video-14.mp4`)
- [x] Instagram `@class_tekajee_aaahay`
- [x] TikTok `@classquesterstkja`
- [x] Spotify (link mudah diedit lewat admin atau `db.json`)
- [x] Sound effect + toggle ON/OFF (localStorage)
- [x] Particle + fire ember effect
- [x] Semua data mudah diedit (lewat admin panel atau `db.json` langsung)
