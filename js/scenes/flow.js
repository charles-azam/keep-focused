/* Stillpoint — FLOW (home). A curl-noise flow field. Thousands of luminous motes drift
   along an invisible, slowly-turning vector field. Wordless, endless, calm.
   Your cursor stirs a slow eddy into it. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, parts = [], mx = -1e9, my = -1e9, mvx = 0, mvy = 0, t = 0;
  const SCALE = 0.0016;     // spatial frequency of the field (low = large, smooth swirls)
  const SPEED = 0.42;       // base drift speed (slow)
  const DRIFT = 0.000035;   // how fast the field itself evolves

  // cheap, smooth value noise (hash-based, bilinear, smoothstep)
  function hash(x, y) {
    let h = (x | 0) * 374761393 + (y | 0) * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }
  // field angle at a point and time (two octaves for richness)
  function angle(x, y) {
    const z = t * DRIFT;
    let n = vnoise(x * SCALE + z, y * SCALE - z);
    n += 0.5 * vnoise(x * SCALE * 2.3 - z, y * SCALE * 2.3 + z);
    return n * U.TAU * 1.6;
  }

  function spawn(n) {
    parts = U.range(n).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      px: 0, py: 0, life: U.rand(0, 1), max: U.rand(4, 11),
      warm: Math.random() < 0.3,
    }));
    for (const p of parts) { p.px = p.x; p.py = p.y; }
  }

  KF.scenes.flow = {
    name: "Flow",
    hint: "drift · move slowly through it",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; t = 0; spawn(Math.min(2600, Math.round((W * H) / 850))); },
    resize(w, h) { W = w; H = h; spawn(Math.min(2600, Math.round((W * H) / 850))); },

    frame(dtNow, dt, ctx) {
      t += dt;
      // long, dreamy trails
      ctx.fillStyle = "rgba(6,8,15,0.022)";
      ctx.fillRect(0, 0, W, H);

      const step = U.clamp(dt / 16, 0.5, 1.6);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.25;
      for (const p of parts) {
        const a = angle(p.x, p.y);
        let vx = Math.cos(a) * SPEED, vy = Math.sin(a) * SPEED;
        // gentle eddy around a moving cursor
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 220) {
          const f = (220 - d) / 220 * 0.9;
          vx += (-dy / (d || 1)) * f + mvx * 0.04 * (f);
          vy += (dx / (d || 1)) * f + mvy * 0.04 * (f);
        }
        p.px = p.x; p.py = p.y;
        p.x += vx * step; p.y += vy * step;
        p.life += dt / 1000;

        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.life > p.max) {
          p.x = Math.random() * W; p.y = Math.random() * H; p.px = p.x; p.py = p.y;
          p.life = 0; p.max = U.rand(4, 11);
          continue;
        }
        const col = p.warm ? "232,186,120" : "150,196,222";
        ctx.strokeStyle = `rgba(${col},0.5)`;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      mvx *= 0.9; mvy *= 0.9;
    },

    pointermove(x, y) {
      if (mx > -1e8) { mvx = x - mx; mvy = y - my; }
      mx = x; my = y;
    },
    pointerleave() { mx = -1e9; my = -1e9; },
    pointerdown(x, y) { mx = x; my = y; },

    exit() { parts = []; mx = -1e9; my = -1e9; },
  };
})();
