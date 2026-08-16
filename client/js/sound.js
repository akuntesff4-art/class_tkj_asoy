/* =====================================================================
   sound.js — Web Audio API synthesized UI sound effects
   Tidak bergantung pada file audio eksternal untuk SFX interaksi.
===================================================================== */
(function () {
  let ctx = null;
  let enabled = true;

  try {
    enabled = localStorage.getItem("cq-sound") !== "off";
  } catch (e) {}

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Tone sederhana: frekuensi + durasi + tipe osilator + kurva volume
  function tone(freq, duration, type, gainPeak) {
    const c = getCtx();
    if (!c || !enabled) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(gainPeak || 0.05, c.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration + 0.05);
  }

  const presets = {
    click: () => tone(620, 0.09, "sine", 0.05),
    hover: () => tone(880, 0.06, "sine", 0.02),
    success: () => {
      tone(523, 0.12, "sine", 0.05);
      setTimeout(() => tone(784, 0.16, "sine", 0.05), 90);
    },
    open: () => tone(340, 0.14, "triangle", 0.045),
    close: () => tone(220, 0.12, "triangle", 0.04),
  };

  function play(name) {
    if (!enabled) return;
    const fn = presets[name] || presets.click;
    fn();
  }

  function setEnabled(val) {
    enabled = val;
    try {
      localStorage.setItem("cq-sound", val ? "on" : "off");
    } catch (e) {}
    document.dispatchEvent(new CustomEvent("cq-sound-toggle", { detail: { enabled: val } }));
  }

  function isEnabled() {
    return enabled;
  }

  // Auto-bind: elemen dengan [data-sound="click|hover|..."] otomatis dapat SFX
  function bindAuto() {
    document.querySelectorAll("[data-sound]").forEach((el) => {
      const kind = el.dataset.sound || "click";
      if (el.dataset.soundBound) return;
      el.dataset.soundBound = "1";
      el.addEventListener("click", () => play(kind === "hover" ? "click" : kind));
      if (kind !== "hover") {
        el.addEventListener("mouseenter", () => play("hover"));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", bindAuto);
  // Re-bind kalau ada konten yang dirender belakangan (mis. gallery/struktur dari API)
  document.addEventListener("cq-content-rendered", bindAuto);

  window.ClassSound = { play, setEnabled, isEnabled, bindAuto };
})();
