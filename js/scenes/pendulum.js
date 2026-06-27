/* Stillpoint — PENDULUM. A wave made of time. Each bob swings a hair slower than its
   neighbour, so the line dissolves into travelling waves and re-assembles, forever.
   Touch to pull them all aside and let them go together. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, N = 20, topY, pivots = [], lens = [], freqs = [], cols = [];
  const A = 0.52;            // amplitude (rad)
  const CYCLE = 36;          // seconds for full re-sync
  const BASE = 24;           // oscillations of the slowest in one cycle
  let tStart = 0;

  function layout() {
    topY = H * 0.15;
    const fmin = BASE / CYCLE;
    const maxL = H * 0.66;
    pivots = []; lens = []; freqs = []; cols = [];
    const marginX = Math.max(40, W * 0.1);
    const span = W - marginX * 2;
    for (let i = 0; i < N; i++) {
      const f = (BASE + i) / CYCLE;
      freqs.push(f);
      lens.push(maxL * Math.pow(fmin / f, 2));
      pivots.push(marginX + (span * i) / (N - 1));
      const tcol = i / (N - 1);
      const r = Math.round(U.lerp(240, 150, tcol));
      const g = Math.round(U.lerp(195, 200, tcol));
      const bl = Math.round(U.lerp(140, 220, tcol));
      cols.push(`${r},${g},${bl}`);
    }
  }

  KF.scenes.pendulum = {
    name: "Pendulum",
    hint: "a wave made of time · touch to release them together",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; N = w < 620 ? 14 : 20; tStart = 0; layout(); },
    resize(w, h) { W = w; H = h; N = w < 620 ? 14 : 20; layout(); },

    frame(t, dt, ctx) {
      ctx.fillStyle = "rgba(6,8,15,0.28)";
      ctx.fillRect(0, 0, W, H);
      tStart += dt / 1000;

      // suspension bar
      ctx.beginPath();
      ctx.strokeStyle = "rgba(236,228,211,0.14)";
      ctx.lineWidth = 1;
      ctx.moveTo(pivots[0] - 14, topY);
      ctx.lineTo(pivots[N - 1] + 14, topY);
      ctx.stroke();

      for (let i = 0; i < N; i++) {
        const theta = A * Math.cos(U.TAU * freqs[i] * tStart);
        const px = pivots[i];
        const bx = px + Math.sin(theta) * lens[i];
        const by = topY + Math.cos(theta) * lens[i];

        ctx.beginPath();
        ctx.strokeStyle = `rgba(236,228,211,0.10)`;
        ctx.lineWidth = 1;
        ctx.moveTo(px, topY);
        ctx.lineTo(bx, by);
        ctx.stroke();

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 16);
        g.addColorStop(0, `rgba(${cols[i]},0.5)`);
        g.addColorStop(1, `rgba(${cols[i]},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(bx - 16, by - 16, 32, 32);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${cols[i]},0.95)`;
        ctx.arc(bx, by, 5.2, 0, U.TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.arc(bx - 1.4, by - 1.6, 1.4, 0, U.TAU);
        ctx.fill();
      }
    },

    pointerdown() {
      tStart = 0; // pull all to one side (cos=1 at t=0) and release together
      if (KF.audio) KF.audio.swell(0.3);
    },

    exit() {},
  };
})();
