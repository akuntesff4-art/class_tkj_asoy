/* =====================================================================
   animations.js — scroll reveal, counters, tilt, magnetic btn, cursor glow
===================================================================== */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal(root) {
    const els = (root || document).querySelectorAll(".reveal:not([data-revealed])");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            entry.target.dataset.revealed = "1";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  }

  function initCounters(root) {
    const nums = (root || document).querySelectorAll("[data-count]:not([data-counted])");
    nums.forEach((el) => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            el.dataset.counted = "1";
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || "";
            if (reduceMotion || isNaN(target)) {
              el.textContent = target + suffix;
            } else {
              const duration = 1100;
              const start = performance.now();
              function tick(now) {
                const p = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(tick);
              }
              requestAnimationFrame(tick);
            }
            io.unobserve(el);
          });
        },
        { threshold: 0.6 }
      );
      io.observe(el);
    });
  }

  function initTilt(root) {
    if (reduceMotion || window.matchMedia("(hover:none)").matches) return;
    (root || document).querySelectorAll(".tilt:not([data-tilt-bound])").forEach((card) => {
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-y * 4.5).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  function initMagnetic(root) {
    if (reduceMotion || window.matchMedia("(hover:none)").matches) return;
    (root || document).querySelectorAll(".magnetic:not([data-mag-bound])").forEach((btn) => {
      btn.dataset.magBound = "1";
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  function initRipple(root) {
    (root || document).querySelectorAll(".ripple-btn:not([data-ripple-bound])").forEach((btn) => {
      btn.dataset.rippleBound = "1";
      btn.addEventListener("click", (e) => {
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const span = document.createElement("span");
        span.className = "ripple-fx";
        span.style.width = span.style.height = size + "px";
        span.style.left = e.clientX - r.left - size / 2 + "px";
        span.style.top = e.clientY - r.top - size / 2 + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 650);
      });
    });
  }

  function initCursorGlow() {
    if (window.matchMedia("(hover:none)").matches) return;
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    document.addEventListener("mousemove", (e) => {
      glow.style.opacity = "1";
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
  }

  function initActiveNav() {
    const path = (location.pathname.split("/").pop() || "index.html").replace(/^$/, "index.html");
    document.querySelectorAll(".navlink").forEach((a) => {
      if (a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    function toggle() {
      btn.classList.toggle("show", window.scrollY > 480);
    }
    document.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    toggle();
  }

  function initAll(root) {
    initReveal(root);
    initCounters(root);
    initTilt(root);
    initMagnetic(root);
    initRipple(root);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAll();
    initCursorGlow();
    initActiveNav();
    initBackToTop();
  });
  document.addEventListener("cq-content-rendered", (e) => initAll(e.detail && e.detail.root));

  window.ClassAnim = { initAll, initReveal, initCounters, initTilt, initMagnetic, initRipple };
})();
