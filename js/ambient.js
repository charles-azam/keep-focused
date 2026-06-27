/* Stillpoint — ambient starfield (always behind everything) + global click ripples. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const sky = document.getElementById("ambient");
  const fx = document.getElementById("fx");
  let skyCtx, fxCtx, W, H;

  let stars = [];
  let dust = [];
  let ripples = [];
  let sparks = [];

  function build() {
    const r1 = U.fit(sky);
    skyCtx = r1.ctx; W = r1.w; H = r1.h;
    U.fit(fx);
    fxCtx = fx.getContext("2d");
    fxCtx.setTransform(Math.min(devicePixelRatio || 1, 2), 0, 0, Math.min(devicePixelRatio || 1, 2), 0, 0);

    const n = Math.round((W * H) / 9000);
    stars = U.range(n).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: U.rand(0.4, 1.5),
      base: U.rand(0.2, 0.8),
      tw: U.rand(0.3, 1.4),
      ph: Math.random() * U.TAU,
      drift: U.rand(0.002, 0.012),
      hue: Math.random() < 0.25 ? "warm" : Math.random() < 0.4 ? "cool" : "pale",
    }));

    dust = U.range(7).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: U.rand(120, 280),
      vx: U.rand(-0.08, 0.08),
      vy: U.rand(-0.05, 0.05),
      a: U.rand(0.015, 0.04),
      warm: Math.random() < 0.5,
    }));
  }

  function tick(t) {
    // ---- sky ----
    skyCtx.clearRect(0, 0, W, H);

    // soft drifting neb01a dust
    skyCtx.globalCompositeOperation = "lighter";
    for (const d of dust) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < -d.r) d.x = W + d.r; if (d.x > W + d.r) d.x = -d.r;
      if (d.y < -d.r) d.y = H + d.r; if (d.y > H + d.r) d.y = -d.r;
      const g = skyCtx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
      const c = d.warm ? "230,170,110" : "120,165,200";
      g.addColorStop(0, `rgba(${c},${d.a})`);
      g.addColorStop(1, `rgba(${c},0)`);
      skyCtx.fillStyle = g;
      skyCtx.fillRect(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
    }

    for (const s of stars) {
      s.y += s.drift; // very slow fall
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
      const a = s.base + Math.sin(t * 0.001 * s.tw + s.ph) * 0.28;
      const col =
        s.hue === "warm" ? "243,210,160" : s.hue === "cool" ? "165,205,225" : "236,232,222";
      skyCtx.beginPath();
      skyCtx.fillStyle = `rgba(${col},${U.clamp(a, 0, 1)})`;
      skyCtx.arc(s.x, s.y, s.r, 0, U.TAU);
      skyCtx.fill();
    }
    skyCtx.globalCompositeOperation = "source-over";

    // ---- fx (ripples + sparks) ----
    fxCtx.clearRect(0, 0, W, H);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.life += 0.016;
      const p = r.life / r.dur;
      if (p >= 1) { ripples.splice(i, 1); continue; }
      const rad = U.smooth(p) * r.max;
      const a = (1 - p) * 0.5;
      fxCtx.beginPath();
      fxCtx.strokeStyle = `rgba(${r.col},${a})`;
      fxCtx.lineWidth = 1.4 * (1 - p) + 0.3;
      fxCtx.arc(r.x, r.y, rad, 0, U.TAU);
      fxCtx.stroke();
      if (r.second) {
        fxCtx.beginPath();
        fxCtx.strokeStyle = `rgba(${r.col},${a * 0.5})`;
        fxCtx.arc(r.x, r.y, rad * 0.6, 0, U.TAU);
        fxCtx.stroke();
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.02; s.life -= 0.014;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      fxCtx.globalAlpha = U.clamp(s.life, 0, 1);
      fxCtx.fillStyle = s.col;
      fxCtx.beginPath();
      fxCtx.arc(s.x, s.y, s.r, 0, U.TAU);
      fxCtx.fill();
    }
    fxCtx.globalAlpha = 1;

    requestAnimationFrame(tick);
  }

  // public: drop a slow, quiet ripple anywhere
  KF.ripple = function (x, y, opts) {
    opts = opts || {};
    ripples.push({
      x, y, life: 0,
      dur: opts.dur || U.rand(2.4, 3.4),
      max: opts.max || U.rand(50, 90),
      col: opts.col || "158,199,218",
      second: opts.second !== false,
    });
    const n = opts.sparks == null ? 0 : opts.sparks;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * U.TAU;
      const sp = U.rand(0.3, 1.2);
      sparks.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.4,
        r: U.rand(0.6, 1.4), life: U.rand(0.6, 1.0),
        col: opts.sparkCol || "rgba(243,210,160,0.8)",
      });
    }
  };

  // global interaction feedback — every touch makes one soft, slow ring + a note
  function onDown(e) {
    if (!KF.started) return;
    const x = e.clientX, y = e.clientY;
    const onChrome = e.target.closest("#dock,.chip,#brand,.card,#focus-overlay,#focus-hud");
    KF.ripple(x, y, {
      col: onChrome ? "230,181,114" : "158,199,218",
      max: onChrome ? 34 : U.rand(46, 80),
      sparks: 0,
    });
    if (KF.audio) KF.audio.tap(y, onChrome ? 0.32 : 0.42);
  }

  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("resize", build);
  build();
  requestAnimationFrame(tick);
})();
