/* Stillpoint — ATTRACTOR. The Aizawa system, a set of three coupled differential
   equations whose solution never repeats yet never escapes. A single point, integrated
   forever, slowly draws a shell of chaos. Drag to turn it in your hands. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  // Aizawa parameters
  const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1, DT = 0.01;
  const N = 8500;                 // trail length
  let W, H, cx, cy, zoom;
  let xs, ys, zs, head, p;
  let yaw = 0.6, pitch = -0.5, spin = 0.00018, autoSpin = true;
  let dragging = false, lx = 0, ly = 0;

  function reset() {
    xs = new Float32Array(N); ys = new Float32Array(N); zs = new Float32Array(N);
    head = 0; p = { x: 0.1, y: 0, z: 0 };
    for (let i = 0; i < N; i++) integrate();
  }
  function integrate() {
    const x = p.x, y = p.y, z = p.z;
    const dx = (z - b) * x - d * y;
    const dy = d * x + (z - b) * y;
    const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;
    p.x = x + dx * DT; p.y = y + dy * DT; p.z = z + dz * DT;
    xs[head] = p.x; ys[head] = p.y; zs[head] = p.z;
    head = (head + 1) % N;
  }

  KF.scenes.attractor = {
    name: "Attractor",
    hint: "chaos, bound · drag to turn it",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; cx = W / 2; cy = H / 2; zoom = Math.min(W, H) * 0.26; reset(); },
    resize(w, h) { W = w; H = h; cx = W / 2; cy = H / 2; zoom = Math.min(W, H) * 0.26; },

    frame(dtNow, dt, ctx) {
      ctx.fillStyle = "rgba(6,8,15,0.16)";
      ctx.fillRect(0, 0, W, H);

      const steps = Math.round(U.clamp(dt / 16, 0.5, 2) * 11);
      for (let s = 0; s < steps; s++) integrate();
      if (autoSpin) yaw += spin * dt;

      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch), sinP = Math.sin(pitch);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.1;
      let started = false;
      for (let k = 0; k < N; k++) {
        const idx = (head + k) % N;            // oldest → newest
        let x = xs[idx], y = ys[idx], z = zs[idx] - 0.6;
        // rotate yaw (around Y) then pitch (around X)
        let X = x * cosY - z * sinY;
        let Z = x * sinY + z * cosY;
        let Y = y * cosP - Z * sinP;
        Z = y * sinP + Z * cosP;
        const persp = 2.4 / (2.4 + Z);
        const sx = cx + X * zoom * persp;
        const sy = cy + Y * zoom * persp;
        if (!started) { ctx.beginPath(); ctx.moveTo(sx, sy); started = true; }
        else ctx.lineTo(sx, sy);
        if ((k & 31) === 0) {
          const depth = U.clamp((Z + 1.6) / 3.2, 0, 1);
          const rr = Math.round(U.lerp(150, 232, 1 - depth));
          const gg = Math.round(U.lerp(196, 181, 1 - depth));
          const bb = Math.round(U.lerp(222, 120, 1 - depth));
          const al = 0.06 + (k / N) * 0.5;
          ctx.strokeStyle = `rgba(${rr},${gg},${bb},${al.toFixed(3)})`;
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx, sy);
        }
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    },

    pointerdown(x, y) { dragging = true; autoSpin = false; lx = x; ly = y; },
    pointermove(x, y, e) {
      if (!dragging || !e.buttons) return;
      yaw += (x - lx) * 0.005;
      pitch += (y - ly) * 0.005;
      pitch = U.clamp(pitch, -1.4, 1.4);
      lx = x; ly = y;
    },
    pointerup() { dragging = false; setTimeout(() => (autoSpin = true), 2500); },

    exit() { xs = ys = zs = null; },
  };
})();
