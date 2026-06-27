/* Stillpoint — DRIFT. The home. A breath to follow, fireflies that shy away softly,
   and embers you let go of with a touch. Nothing is required. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, flies = [], embers = [];
  let mx = -1e9, my = -1e9;
  let t0 = 0;

  // breathing cycle (seconds): inhale, hold, exhale, rest
  const PHASES = [
    { name: "breathe in", d: 4 },
    { name: "hold", d: 4 },
    { name: "breathe out", d: 6 },
    { name: "rest", d: 2 },
  ];
  const CYCLE = PHASES.reduce((s, p) => s + p.d, 0);

  function breath(time) {
    let s = (time % CYCLE);
    for (const p of PHASES) {
      if (s < p.d) {
        const k = s / p.d;
        let r;
        if (p.name === "breathe in") r = U.smooth(k);
        else if (p.name === "hold") r = 1;
        else if (p.name === "breathe out") r = 1 - U.smooth(k);
        else r = 0;
        return { phase: p.name, r };
      }
      s -= p.d;
    }
    return { phase: "rest", r: 0 };
  }

  KF.scenes.drift = {
    name: "Drift",
    hint: "follow the breath · touch anywhere to let go of an ember",
    type: "canvas",

    enter(ctx, w, h) {
      W = w; H = h; t0 = 0;
      flies = U.range(26).map(() => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: U.rand(-0.2, 0.2), vy: U.rand(-0.2, 0.2),
        ph: Math.random() * U.TAU, sp: U.rand(0.4, 1.0),
        r: U.rand(0.8, 2.0), hue: Math.random() < 0.5 ? "243,210,160" : "165,205,225",
      }));
      embers = [];
    },
    resize(w, h) { W = w; H = h; },

    frame(t, dt, ctx) {
      t0 += dt;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const b = breath(t0 / 1000);

      // --- breathing aura ---
      const baseR = Math.min(W, H) * 0.10;
      const rad = baseR * (0.7 + b.r * 0.9);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad * 2.4);
      grd.addColorStop(0, `rgba(230,181,114,${0.10 + b.r * 0.10})`);
      grd.addColorStop(0.5, `rgba(158,199,218,${0.04 + b.r * 0.04})`);
      grd.addColorStop(1, "rgba(158,199,218,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(cx - rad * 2.4, cy - rad * 2.4, rad * 4.8, rad * 4.8);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(236,228,211,${0.18 + b.r * 0.22})`;
      ctx.lineWidth = 1.2;
      ctx.arc(cx, cy, rad, 0, U.TAU);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(236,228,211,${0.06})`;
      ctx.arc(cx, cy, rad + 10 + b.r * 18, 0, U.TAU);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(236,228,211,${0.42 + b.r * 0.2})`;
      ctx.font = "300 22px 'Fraunces', Georgia, serif";
      ctx.fillText(b.phase, cx, cy + 7);

      // --- fireflies ---
      ctx.globalCompositeOperation = "lighter";
      for (const f of flies) {
        f.x += f.vx + Math.cos(f.ph + t0 * 0.0004 * f.sp) * 0.18;
        f.y += f.vy + Math.sin(f.ph * 1.3 + t0 * 0.0004 * f.sp) * 0.18;
        // shy away from the cursor, gently
        const dx = f.x - mx, dy = f.y - my, d = Math.hypot(dx, dy);
        if (d < 120) {
          const push = (120 - d) / 120 * 0.6;
          f.x += (dx / (d || 1)) * push;
          f.y += (dy / (d || 1)) * push;
        }
        if (f.x < 0) f.x += W; if (f.x > W) f.x -= W;
        if (f.y < 0) f.y += H; if (f.y > H) f.y -= H;
        const glow = 0.4 + 0.4 * Math.sin(t0 * 0.002 * f.sp + f.ph);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
        g.addColorStop(0, `rgba(${f.hue},${0.5 * glow})`);
        g.addColorStop(1, `rgba(${f.hue},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(f.x - f.r * 6, f.y - f.r * 6, f.r * 12, f.r * 12);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${f.hue},${0.7 * glow})`;
        ctx.arc(f.x, f.y, f.r, 0, U.TAU);
        ctx.fill();
      }

      // --- embers ---
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life -= dt / 1000 / e.dur;
        if (e.life <= 0) { embers.splice(i, 1); continue; }
        e.y -= e.rise * dt / 16;
        e.x += Math.sin(t0 * 0.002 + e.sway) * 0.5;
        const a = U.clamp(e.life, 0, 1);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        g.addColorStop(0, `rgba(243,210,160,${0.6 * a})`);
        g.addColorStop(1, "rgba(243,210,160,0)");
        ctx.fillStyle = g;
        ctx.fillRect(e.x - e.r * 5, e.y - e.r * 5, e.r * 10, e.r * 10);
      }
      ctx.globalCompositeOperation = "source-over";
    },

    pointermove(x, y) { mx = x; my = y; },
    pointerleave() { mx = -1e9; my = -1e9; },

    pointerdown(x, y) {
      for (let i = 0; i < 3; i++) {
        embers.push({
          x: x + U.rand(-8, 8), y: y + U.rand(-4, 4),
          r: U.rand(1.4, 3), rise: U.rand(0.3, 0.7), sway: Math.random() * U.TAU,
          life: 1, dur: U.rand(3.5, 6),
        });
      }
    },

    exit() { flies = []; embers = []; },
  };
})();
