/* Stillpoint — ORRERY. A clockwork of worlds. Inner planets hurry, outer ones brood.
   Touch anywhere to set a new body turning at that radius (Kepler: ω ∝ r^-3/2). */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, cx, cy, scale, bodies = [], sunPh = 0, k = 1;

  function omegaFor(r) { return k / Math.pow(Math.max(r, 8), 1.5); }

  function seed() {
    bodies = [];
    const base = scale;
    const defs = [
      { r: 0.9, s: 2.4, c: "200,170,150", ring: false },
      { r: 1.35, s: 3.4, c: "150,190,210", ring: false },
      { r: 1.85, s: 3.7, c: "120,170,150", ring: false, moon: true },
      { r: 2.5, s: 3.0, c: "210,150,120", ring: false },
      { r: 3.5, s: 6.5, c: "225,200,150", ring: false },
      { r: 4.5, s: 5.6, c: "220,205,170", ring: true },
      { r: 5.6, s: 4.4, c: "150,200,215", ring: false },
      { r: 6.6, s: 4.2, c: "120,160,220", ring: false },
    ];
    for (const d of defs) {
      const rad = d.r * base;
      bodies.push({
        r: rad, ang: Math.random() * U.TAU, omega: omegaFor(rad),
        size: d.s, col: d.c, ring: d.ring, moon: d.moon,
        moonAng: 0, isPlanet: true, trail: [],
      });
    }
  }

  KF.scenes.orrery = {
    name: "Orrery",
    hint: "a clockwork of worlds · touch to add one",
    type: "canvas",

    enter(ctx, w, h) {
      W = w; H = h; cx = W / 2; cy = H / 2;
      scale = Math.min(W, H) / 16;
      k = 9 * Math.pow(scale, 1.5) / 60; // tune so inner planet ~ pleasant
      seed();
    },
    resize(w, h) { W = w; H = h; cx = W / 2; cy = H / 2; scale = Math.min(W, H) / 16; seed(); },

    frame(t, dt, ctx) {
      // gentle persistence for trails
      ctx.fillStyle = "rgba(6,8,15,0.18)";
      ctx.fillRect(0, 0, W, H);

      sunPh += dt * 0.0006;

      // orbit rings (planets only)
      ctx.lineWidth = 1;
      for (const b of bodies) {
        if (!b.isPlanet) continue;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(236,228,211,0.05)";
        ctx.arc(cx, cy, b.r, 0, U.TAU);
        ctx.stroke();
      }

      // sun
      const sr = scale * 0.7 * (1 + Math.sin(sunPh) * 0.04);
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr * 4);
      sg.addColorStop(0, "rgba(255,235,190,0.95)");
      sg.addColorStop(0.25, "rgba(245,200,120,0.6)");
      sg.addColorStop(0.6, "rgba(220,140,70,0.18)");
      sg.addColorStop(1, "rgba(220,140,70,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(cx - sr * 4, cy - sr * 4, sr * 8, sr * 8);
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,240,205,1)";
      ctx.arc(cx, cy, sr, 0, U.TAU);
      ctx.fill();

      // bodies
      const speed = dt / 16;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        b.ang += b.omega * speed;
        const x = cx + Math.cos(b.ang) * b.r;
        const y = cy + Math.sin(b.ang) * b.r;

        // comet tail
        b.trail.push(x, y);
        if (b.trail.length > 40) b.trail.splice(0, b.trail.length - 40);
        if (!b.isPlanet) {
          ctx.beginPath();
          for (let j = 0; j < b.trail.length; j += 2) {
            const a = j / b.trail.length;
            if (j === 0) ctx.moveTo(b.trail[j], b.trail[j + 1]);
            else ctx.lineTo(b.trail[j], b.trail[j + 1]);
            ctx.strokeStyle = `rgba(${b.col},${a * 0.4})`;
          }
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.size * 5);
        g.addColorStop(0, `rgba(${b.col},0.5)`);
        g.addColorStop(1, `rgba(${b.col},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - b.size * 5, y - b.size * 5, b.size * 10, b.size * 10);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${b.col},1)`;
        ctx.arc(x, y, b.size, 0, U.TAU);
        ctx.fill();

        // ring
        if (b.ring) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.5);
          ctx.scale(1, 0.34);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${b.col},0.55)`;
          ctx.lineWidth = 1.6;
          ctx.arc(0, 0, b.size * 2.1, 0, U.TAU);
          ctx.stroke();
          ctx.restore();
        }
        // a single moon
        if (b.moon) {
          b.moonAng += 0.06 * speed;
          const mr = b.size * 3.2;
          const mxp = x + Math.cos(b.moonAng) * mr;
          const myp = y + Math.sin(b.moonAng) * mr * 0.6;
          ctx.beginPath();
          ctx.fillStyle = "rgba(220,220,210,0.9)";
          ctx.arc(mxp, myp, 1.3, 0, U.TAU);
          ctx.fill();
        }
      }
    },

    pointerdown(x, y) {
      const r = Math.max(20, Math.hypot(x - cx, y - cy));
      if (bodies.filter((b) => !b.isPlanet).length > 36) {
        const idx = bodies.findIndex((b) => !b.isPlanet);
        if (idx >= 0) bodies.splice(idx, 1);
      }
      const warm = Math.random() < 0.5;
      bodies.push({
        r, ang: Math.atan2(y - cy, x - cx),
        omega: omegaFor(r) * (Math.random() < 0.5 ? 1 : -1),
        size: U.rand(1.4, 3), col: warm ? "243,210,160" : "165,205,225",
        ring: false, moon: false, isPlanet: false, trail: [],
      });
    },

    exit() { bodies = []; },
  };
})();
