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

> **Update:** website ini sekarang **single-page app (SPA)**. Beranda, Struktur, Mapel,
> Piket, Gallery, Social, dan About semuanya jadi satu `index.html` — pindah menu
> tidak reload dokumen sama sekali (makanya music player nggak pernah kepotong lagi).
> Cuma `admin.html` yang tetap halaman terpisah.

```
class-questers/
├── api/
│   └── index.js             → entry point serverless untuk Vercel (wrap Express app)
├── vercel.json               → konfigurasi routing Vercel (static + API)
├── client/                 → semua file frontend (disajikan sebagai static files)
│   ├── index.html          → SPA — semua "halaman" (Beranda/Struktur/Mapel/Piket/Gallery/Social/About)
│   ├── admin.html          → Dashboard admin (halaman terpisah)
│   ├── css/style.css
│   ├── js/
│   │   ├── app.js          → intro sinematik, router SPA (ganti panel via hash), render data
│   │   ├── particles.js    → engine partikel + ember/fire
│   │   ├── sound.js        → SFX (Web Audio API, tanpa file eksternal)
│   │   ├── animations.js   → reveal, counter, tilt, magnetic, ripple, cursor glow
│   │   ├── music.js        → music player (persisten selama SPA aktif)
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

## ☁️ Deploy ke Vercel via GitHub

**1. Push project ke GitHub**
```bash
cd class-questers
git init
git add .
git commit -m "Initial commit - CLASS QUESTERS TKJ A"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

**2. Import ke Vercel**
- Buka [vercel.com](https://vercel.com) → **Add New Project**
- Pilih repo GitHub yang baru saja kamu push
- Framework Preset: pilih **Other** (project ini sudah punya `vercel.json` sendiri, jadi Vercel otomatis ikut konfigurasi itu)
- Klik **Deploy**

**3. Set Environment Variable (wajib untuk admin panel)**
- Di dashboard project Vercel → **Settings → Environment Variables**
- Tambahkan: `ADMIN_PASSWORD` = password admin pilihan kamu
- Redeploy setelah menambahkan env var (Vercel → Deployments → tombol "Redeploy")

### 🩹 Kalau muncul error `404: NOT_FOUND`

Cek satu-satu:

1. **Root Directory di Vercel harus kosong/default** (bukan diisi `client`). Cek di
   **Settings → General → Root Directory** — harus kosong, karena `vercel.json`
   sudah mengatur sendiri lewat `outputDirectory`. Kalau ke-isi `client`, kosongkan lalu redeploy.
2. **Pastikan `vercel.json` beneran ke-push ke GitHub** — buka repo kamu di github.com,
   cek apakah file `vercel.json` ada di root repo (sejajar dengan folder `client/`, `server/`, `api/`).
   Kalau nggak ada, berarti belum ke-commit — jalankan `git add . && git commit -m "fix vercel config" && git push`.
3. **Redeploy ulang** setelah perubahan apapun di `vercel.json` — Vercel → tab **Deployments** →
   titik tiga di deployment terakhir → **Redeploy**.
4. Cek **Build Logs** di deployment yang gagal (klik deployment-nya di dashboard) — kalau ada
   pesan error di situ, itu petunjuk paling akurat soal apa yang salah.

**4. Selesai** — website live di `https://nama-project-kamu.vercel.app`

### ⚠️ Penting soal database di Vercel

Vercel itu **serverless** — filesystem project bersifat *read-only* saat runtime. Project ini sudah disesuaikan supaya tidak error:

- Saat jalan **lokal** (`npm start`), perubahan dari admin panel tersimpan **permanen** ke `server/database/db.json`.
- Saat jalan di **Vercel**, perubahan dari admin panel ditulis ke folder sementara (`/tmp`) — **berfungsi normal**, tapi **bisa reset** kapan saja (saat cold start baru atau setelah deploy ulang), karena `/tmp` di serverless tidak permanen.

Jadi untuk edit struktur/piket/social yang **sifatnya tetap** (misalnya sekali diisi di awal semester), cara paling aman:
1. Edit langsung `server/database/db.json` di komputer kamu
2. `git commit` & `git push`
3. Vercel otomatis redeploy dengan data baru

Kalau ke depannya butuh admin panel yang datanya beneran permanen di Vercel, upgrade `server/database/db.js` untuk pakai database eksternal seperti **Vercel KV**, **Vercel Postgres**, atau **Supabase** — struktur kode sekarang (semua akses data lewat `readDB()`/`writeDB()`) sudah dirancang supaya gampang diganti nanti tanpa ubah controller/route lain.

### 📹 Soal video besar di Vercel

Static file (termasuk 14 video gallery) disajikan langsung lewat CDN Vercel — **bukan** lewat serverless function — jadi streaming video tetap cepat dan tidak kena limit ukuran response function. Cukup pastikan total ukuran repo tidak melebihi batas Vercel untuk paket kamu (cek di dashboard Vercel kalau video-nya besar-besar).

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
