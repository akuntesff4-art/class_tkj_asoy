/* =====================================================================
   music.js — Class Music Player (HTML5 Audio API)
   - Tidak autoplay paksa (browser mobile biasanya blokir)
   - Fallback rapi kalau lagu.mp3 belum ada
   - Shortcut: Space = play/pause, M = mute (skip kalau fokus di form)
   - Posisi & status main/tidak disimpan supaya lanjut pas pindah halaman
     (situs ini multi-page biasa, jadi <audio> memang reset tiap load —
     ini "menyambung lagi" posisinya, bukan audio yang benar-benar sama)
===================================================================== */
(function () {
  document.addEventListener("DOMContentLoaded", init);

  const STATE_KEY = "cq-music-state";

  function saveState(state) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || "null"); } catch (e) { return null; }
  }

  function init() {
    const audio = document.getElementById("classMusic");
    const fab = document.getElementById("musicToggle");
    const panel = document.getElementById("musicPanel");
    const closeBtn = document.getElementById("musicClose");
    const playBtn = document.getElementById("musicPlayBtn");
    const muteBtn = document.getElementById("musicMuteBtn");
    const volume = document.getElementById("musicVolume");
    const seek = document.getElementById("musicSeek");
    const curEl = document.getElementById("musicCurrent");
    const durEl = document.getElementById("musicDuration");
    const status = document.getElementById("musicStatus");
    const eq = document.getElementById("musicEq");
    if (!audio || !fab || !panel) return;

    let available = true;
    let seeking = false;
    const prevState = loadState();

    // ---------- restore preferences ----------
    let savedVolume = 0.6, savedMuted = false;
    try {
      const v = localStorage.getItem("cq-music-volume");
      const m = localStorage.getItem("cq-music-muted");
      if (v !== null) savedVolume = parseFloat(v);
      if (m !== null) savedMuted = m === "1";
    } catch (e) {}
    audio.volume = savedVolume;
    audio.muted = savedMuted;
    volume.value = savedVolume;
    updateMuteIcon();

    if (prevState && prevState.panelOpen) panel.classList.add("open");

    function fmtTime(s) {
      if (!isFinite(s) || isNaN(s)) return "0:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, "0");
      return `${m}:${sec}`;
    }

    function updateMuteIcon() {
      muteBtn.textContent = audio.muted || audio.volume === 0 ? "🔇" : "🔊";
    }

    function setStatus(text) {
      status.textContent = text;
    }

    function persistNow(extra) {
      saveState(Object.assign({
        time: audio.currentTime || 0,
        playing: !audio.paused,
        panelOpen: panel.classList.contains("open"),
      }, extra || {}));
    }

    // ---------- panel open/close ----------
    fab.addEventListener("click", () => {
      panel.classList.toggle("open");
      persistNow();
    });
    closeBtn.addEventListener("click", () => { panel.classList.remove("open"); persistNow(); });

    // ---------- availability check ----------
    audio.addEventListener("error", () => {
      available = false;
      setStatus("Music belum tersedia");
      playBtn.disabled = true;
      playBtn.textContent = "—";
    });
    audio.addEventListener("loadedmetadata", () => {
      if (!available) return;
      durEl.textContent = fmtTime(audio.duration);
      setStatus("Lagu Kelas");

      // ---------- lanjutkan posisi & status dari halaman sebelumnya ----------
      if (prevState && prevState.time) {
        try { audio.currentTime = prevState.time; } catch (e) {}
      }
      if (prevState && prevState.playing) {
        const p = audio.play();
        if (p && p.catch) {
          p.catch(() => setStatus("Tap play untuk lanjut dengar"));
        }
      }
    });

    // trigger a load check (some browsers only fire error after explicit load())
    audio.load();

    // ---------- play / pause ----------
    function togglePlay() {
      if (!available) return;
      if (audio.paused) {
        const p = audio.play();
        if (p && p.catch) p.catch(() => setStatus("Tap play lagi untuk memutar"));
      } else {
        audio.pause();
      }
    }
    playBtn.addEventListener("click", togglePlay);

    audio.addEventListener("play", () => {
      playBtn.textContent = "⏸";
      eq.classList.add("playing");
      window.ClassSound && window.ClassSound.play("success");
      persistNow();
    });
    audio.addEventListener("pause", () => {
      playBtn.textContent = "▶";
      eq.classList.remove("playing");
      persistNow();
    });
    audio.addEventListener("ended", () => {
      playBtn.textContent = "▶";
      eq.classList.remove("playing");
      seek.value = 0;
      saveState({ time: 0, playing: false, panelOpen: panel.classList.contains("open") });
    });

    // ---------- progress ----------
    audio.addEventListener("timeupdate", () => {
      if (seeking || !audio.duration) return;
      seek.value = (audio.currentTime / audio.duration) * 100;
      curEl.textContent = fmtTime(audio.currentTime);
    });
    seek.addEventListener("input", () => (seeking = true));
    seek.addEventListener("change", () => {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
      seeking = false;
      persistNow();
    });

    // ---------- volume / mute ----------
    volume.addEventListener("input", () => {
      audio.volume = parseFloat(volume.value);
      audio.muted = audio.volume === 0;
      updateMuteIcon();
      try {
        localStorage.setItem("cq-music-volume", String(audio.volume));
        localStorage.setItem("cq-music-muted", audio.muted ? "1" : "0");
      } catch (e) {}
    });
    muteBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      updateMuteIcon();
      try {
        localStorage.setItem("cq-music-muted", audio.muted ? "1" : "0");
      } catch (e) {}
    });

    // ---------- keyboard shortcuts ----------
    document.addEventListener("keydown", (e) => {
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      const isFormField = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || document.activeElement.isContentEditable;
      if (isFormField) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        audio.muted = !audio.muted;
        updateMuteIcon();
      }
    });

    // ---------- simpan posisi terus-menerus & tepat sebelum pindah/tutup halaman ----------
    setInterval(() => { if (!audio.paused) persistNow(); }, 2000);
    window.addEventListener("pagehide", () => persistNow());
    document.addEventListener("visibilitychange", () => { if (document.hidden) persistNow(); });
  }
})();
