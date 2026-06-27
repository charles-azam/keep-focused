/* Stillpoint — CYMATICS. A square plate driven at one of its resonant modes. Sand dances
   where the plate shakes and goes still along the nodal lines, where it doesn't move at all.
   The pattern is the eigenmode of the wave equation made visible. Touch to change the note. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  // pleasing (n,m) mode pairs for a square plate
  const MODES = [[1, 2], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [4, 5], [2, 7], [3, 6]];
  let W, H, pad, size, ox, oy, parts = [], mi = 0, n = 1, m = 2, morphT = 0;

  // Chladni amplitude on a FREE-edge square plate (the classic symmetric figures), [0,1]
  function s(x, y) {
    return Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) +
      Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
  }
  function dsdx(x, y) {
    return -n * Math.PI * Math.sin(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
      m * Math.PI * Math.sin(m * Math.PI * x) * Math.cos(n * Math.PI * y);
  }
  function dsdy(x, y) {
    return -m * Math.PI * Math.cos(n * Math.PI * x) * Math.sin(m * Math.PI * y) -
      n * Math.PI * Math.cos(m * Math.PI * x) * Math.sin(n * Math.PI * y);
  }

  function layout() {
    pad = Math.min(W, H) * 0.1;
    size = Math.min(W, H) - pad * 2;
    ox = (W - size) / 2; oy = (H - size) / 2;
  }
  function spawn() {
    parts = U.range(Math.min(4200, Math.round((size * size) / 240))).map(() => ({ x: Math.random(), y: Math.random() }));
  }
  function setMode(i) { mi = ((i % MODES.length) + MODES.length) % MODES.length; n = MODES[mi][0]; m = MODES[mi][1]; }

  KF.scenes.cymatics = {
    name: "Cymatics",
    hint: "touch to change the note · sand finds the stillness",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; layout(); spawn(); setMode(0); morphT = 0; },
    resize(w, h) { W = w; H = h; layout(); spawn(); },

    frame(dtNow, dt, ctx) {
      ctx.fillStyle = "rgba(6,8,15,0.32)";
      ctx.fillRect(0, 0, W, H);

      morphT += dt;
      if (morphT > 15000) { morphT = 0; setMode(mi + 1); if (KF.audio) KF.audio.swell(0.3 + mi * 0.04); }

      // plate edge
      ctx.strokeStyle = "rgba(236,228,211,0.07)";
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, size, size);

      const ts = U.clamp(dt / 16, 0.5, 2);
      const jit = 0.011 * ts;      // vibration amplitude
      const pull = 0.00009 * dt;   // gentle nudge toward the nearest nodal line
      for (const p of parts) {
        const a = s(p.x, p.y);
        const mag = Math.abs(a);   // 0 on nodal lines, up to 2 at antinodes
        // random walk whose step grows with local vibration -> grains settle where it's still
        const j = mag * jit;
        p.x += (Math.random() - 0.5) * j;
        p.y += (Math.random() - 0.5) * j;
        // small directed bias down the |amplitude| gradient
        const sign = a >= 0 ? 1 : -1;
        p.x -= sign * dsdx(p.x, p.y) * pull;
        p.y -= sign * dsdy(p.x, p.y) * pull;
        // reflect at the plate edges (free edges are antinodes, not sinks)
        if (p.x < 0) p.x = -p.x; else if (p.x > 1) p.x = 2 - p.x;
        if (p.y < 0) p.y = -p.y; else if (p.y > 1) p.y = 2 - p.y;

        const sx = ox + p.x * size, sy = oy + p.y * size;
        const bright = U.clamp(1 - mag * 0.85, 0.16, 1); // settled grains glow
        ctx.fillStyle = `rgba(236,230,214,${0.55 * bright})`;
        ctx.fillRect(sx, sy, 1.6, 1.6);
      }
    },

    pointerdown() { morphT = 0; setMode(mi + 1); if (KF.audio) KF.audio.swell(0.3 + mi * 0.04); },

    exit() { parts = []; },
  };
})();
