/* =====================================================================
   particles.js — engine partikel ringan (green / white / ember / dust)
   - requestAnimationFrame yang benar (di-cancel saat tab tidak aktif)
   - respects prefers-reduced-motion
   - jumlah partikel dibatasi & diskalakan ke ukuran layar
===================================================================== */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function createEngine(canvas, opts) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d", { alpha: true });
    const options = Object.assign(
      {
        density: 22000, // px^2 per partikel (makin besar = makin jarang)
        maxParticles: 90,
        embers: true,
        emberRatio: 0.16,
        colors: { green: "61,255,160", white: "255,255,255" },
      },
      opts || {}
    );

    let w = 0, h = 0, particles = [], rafId = null, running = false;

    function resize(force) {
      const rect = canvas.parentElement.getBoundingClientRect();
      const newW = Math.max(1, Math.floor(rect.width));
      const newH = Math.max(1, Math.floor(rect.height));

      // Di HP, address bar browser suka nongol/ilang pas scroll — ini memicu
      // event 'resize' terus-menerus walau LEBAR-nya sama (cuma tinggi berubah
      // dikit). Kalau kita reseed partikel tiap kali itu terjadi, hasilnya
      // kelihatan "kedip-kedip" karena semua partikel loncat ke posisi baru.
      // Jadi: reseed penuh cuma kalau lebar berubah, atau tinggi berubah banyak.
      const widthChanged = newW !== w;
      const heightChangedALot = Math.abs(newH - h) > 120;
      const needsReseed = force || widthChanged || heightChangedALot || particles.length === 0;

      w = canvas.width = newW;
      h = canvas.height = newH;
      if (needsReseed) seed();
    }

    let resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => resize(false), 180);
    }

    function makeParticle() {
      const isEmber = options.embers && Math.random() < options.emberRatio;
      const isWhite = !isEmber && Math.random() < 0.22;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: isEmber ? Math.random() * 1.6 + 0.6 : Math.random() * 1.7 + 0.5,
        vy: isEmber ? -(Math.random() * 0.55 + 0.25) : -(Math.random() * 0.3 + 0.06),
        vx: (Math.random() - 0.5) * (isEmber ? 0.5 : 0.22),
        alpha: Math.random() * 0.5 + 0.15,
        flicker: Math.random() * 0.02 + 0.006,
        ember: isEmber,
        color: isEmber ? "255,150,60" : isWhite ? options.colors.white : options.colors.green,
      };
    }

    function seed() {
      const count = Math.min(options.maxParticles, Math.floor((w * h) / options.density));
      particles = Array.from({ length: Math.max(12, count) }, makeParticle);
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += (Math.random() - 0.5) * p.flicker;
        p.alpha = Math.max(0.06, Math.min(0.7, p.alpha));
        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
        if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color},0.9)`;
        ctx.shadowBlur = p.ember ? 6 : 3.5;
        ctx.fill();
      });
    }

    function loop() {
      if (!running) return;
      step();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      if (reduceMotion) { step(); return; }
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize(true);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    start();
    return { start, stop, resize };
  }

  window.ClassParticles = { createEngine };
})();
        x: Math.random() * w,
        y: Math.random() * h,
        r: isEmber ? Math.random() * 1.6 + 0.6 : Math.random() * 1.7 + 0.5,
        vy: isEmber ? -(Math.random() * 0.55 + 0.25) : -(Math.random() * 0.3 + 0.06),
        vx: (Math.random() - 0.5) * (isEmber ? 0.5 : 0.22),
        alpha: Math.random() * 0.5 + 0.15,
        flicker: Math.random() * 0.02 + 0.006,
        ember: isEmber,
        color: isEmber ? "255,150,60" : isWhite ? options.colors.white : options.colors.green,
      };
    }

    function seed() {
      const count = Math.min(options.maxParticles, Math.floor((w * h) / options.density));
      particles = Array.from({ length: Math.max(12, count) }, makeParticle);
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.alpha += (Math.random() - 0.5) * p.flicker;
        p.alpha = Math.max(0.06, Math.min(0.7, p.alpha));
        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
        if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color},0.9)`;
        ctx.shadowBlur = p.ember ? 6 : 3.5;
        ctx.fill();
      });
    }

    function loop() {
      if (!running) return;
      step();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      if (reduceMotion) { step(); return; }
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    start();
    return { start, stop, resize };
  }

  window.ClassParticles = { createEngine };
})();
