/* Stillpoint — GRAVITY. A patient cloud of motes, falling gently toward whatever masses
   you place. Softened and damped — orbits and spirals, never an explosion. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, parts = [], masses = [];
  const G = 26, SOFT = 900, DAMP = 0.9992, VMAX = 6;

  function spawn() {
    const n = Math.min(420, Math.round((W * H) / 4200));
    const cx = W / 2, cy = H / 2;
    parts = U.range(n).map(() => {
      const x = Math.random() * W, y = Math.random() * H;
      // seed a gentle orbit around the centre so motion is graceful from the first frame
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) || 1;
      const v = Math.sqrt((G * 1.0) / (r + 40)) * 0.9;
      return { x, y, vx: (-dy / r) * v + U.rand(-0.2, 0.2), vy: (dx / r) * v + U.rand(-0.2, 0.2), px: x, py: y };
    });
  }

  KF.scenes.gravity = {
    name: "Gravity",
    hint: "touch to place a mass · the cloud will find its orbits",
    type: "canvas",

    enter(ctx, w, h) {
      W = w; H = h;
      spawn();
      masses = [{ x: W / 2, y: H / 2, m: 1.0, ph: 0 }];
    },
    resize(w, h) { W = w; H = h; spawn(); },

    frame(t, dt, ctx) {
      ctx.fillStyle = "rgba(6,8,15,0.07)";
      ctx.fillRect(0, 0, W, H);

      const step = U.clamp(dt / 16, 0.5, 2);

      // draw masses
      for (const M of masses) {
        M.ph += dt * 0.002;
        const R = 6 + M.m * 6;
        const g = ctx.createRadialGradient(M.x, M.y, 0, M.x, M.y, R * 5);
        g.addColorStop(0, "rgba(245,205,130,0.7)");
        g.addColorStop(0.4, "rgba(225,150,80,0.25)");
        g.addColorStop(1, "rgba(225,150,80,0)");
        ctx.fillStyle = g;
        ctx.fillRect(M.x - R * 5, M.y - R * 5, R * 10, R * 10);
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,240,205,0.95)";
        ctx.arc(M.x, M.y, R * (0.5 + 0.04 * Math.sin(M.ph)), 0, U.TAU);
        ctx.fill();
      }

      ctx.lineWidth = 1.1;
      for (const p of parts) {
        let ax = 0, ay = 0;
        for (const M of masses) {
          const dx = M.x - p.x, dy = M.y - p.y;
          const d2 = dx * dx + dy * dy + SOFT;
          const f = (G * M.m) / d2;
          const inv = 1 / Math.sqrt(d2);
          ax += dx * inv * f;
          ay += dy * inv * f;
        }
        p.vx = (p.vx + ax * step) * DAMP;
        p.vy = (p.vy + ay * step) * DAMP;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > VMAX) { p.vx *= VMAX / sp; p.vy *= VMAX / sp; }
        p.px = p.x; p.py = p.y;
        p.x += p.vx * step; p.y += p.vy * step;

        // wrap softly
        if (p.x < -20) { p.x = W + 20; p.px = p.x; }
        if (p.x > W + 20) { p.x = -20; p.px = p.x; }
        if (p.y < -20) { p.y = H + 20; p.py = p.y; }
        if (p.y > H + 20) { p.y = -20; p.py = p.y; }

        // colour by speed: slow=cool, fast=warm
        const k = U.clamp(sp / VMAX, 0, 1);
        const r = Math.round(U.lerp(150, 245, k));
        const gg = Math.round(U.lerp(195, 200, k));
        const b = Math.round(U.lerp(220, 140, k));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${gg},${b},${0.5 + k * 0.45})`;
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    },

    pointerdown(x, y) {
      if (masses.length > 5) masses.shift();
      masses.push({ x, y, m: U.rand(0.7, 1.4), ph: 0 });
    },

    exit() { parts = []; masses = []; },
  };
})();
