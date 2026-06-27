/* Stillpoint — BLOOM. The Gray–Scott reaction–diffusion system: two chemicals, one
   feeding, one killing, and out of that arithmetic come coral, labyrinths, mitosis.
   Touch to seed; watch the pattern grow on its own, slowly. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const CELL = 5;
  let W, H, gw, gh, A, B, A2, B2, off, octx, img, data;
  const Da = 1.0, Db = 0.5, F = 0.037, K = 0.06;   // "coral" growth regime

  function alloc() {
    gw = Math.max(8, Math.ceil(W / CELL));
    gh = Math.max(8, Math.ceil(H / CELL));
    const n = gw * gh;
    A = new Float32Array(n).fill(1);
    B = new Float32Array(n);
    A2 = new Float32Array(n);
    B2 = new Float32Array(n);
    off = document.createElement("canvas"); off.width = gw; off.height = gh;
    octx = off.getContext("2d");
    img = octx.createImageData(gw, gh); data = img.data;
  }

  function seed(cx, cy, r) {
    const gx = U.clamp((cx / W) * gw | 0, 1, gw - 2);
    const gy = U.clamp((cy / H) * gh | 0, 1, gh - 2);
    const rr = r || 4;
    for (let y = -rr; y <= rr; y++)
      for (let x = -rr; x <= rr; x++) {
        if (x * x + y * y > rr * rr) continue;
        const ix = U.clamp(gx + x, 0, gw - 1), iy = U.clamp(gy + y, 0, gh - 1);
        const i = iy * gw + ix;
        B[i] = 1; A[i] = 0;
      }
  }

  function step() {
    for (let y = 1; y < gh - 1; y++) {
      const row = y * gw;
      for (let x = 1; x < gw - 1; x++) {
        const i = row + x;
        const a = A[i], b = B[i];
        // laplacian (5-point + diagonals)
        const lapA = (A[i - 1] + A[i + 1] + A[i - gw] + A[i + gw]) * 0.2 +
          (A[i - gw - 1] + A[i - gw + 1] + A[i + gw - 1] + A[i + gw + 1]) * 0.05 - a;
        const lapB = (B[i - 1] + B[i + 1] + B[i - gw] + B[i + gw]) * 0.2 +
          (B[i - gw - 1] + B[i - gw + 1] + B[i + gw - 1] + B[i + gw + 1]) * 0.05 - b;
        const abb = a * b * b;
        A2[i] = a + (Da * lapA - abb + F * (1 - a));
        B2[i] = b + (Db * lapB + abb - (K + F) * b);
      }
    }
    let t = A; A = A2; A2 = t;
    t = B; B = B2; B2 = t;
  }

  function render() {
    for (let i = 0; i < gw * gh; i++) {
      const v = U.clamp(B[i] / 0.34, 0, 1);
      let r, g, bl;
      if (v < 0.5) { const n = v * 2; r = 8 + n * 26; g = 12 + n * 96; bl = 24 + n * 110; }
      else { const n = (v - 0.5) * 2; r = 34 + n * 200; g = 108 + n * 78; bl = 134 - n * 16; }
      const o = i * 4;
      data[o] = r; data[o + 1] = g; data[o + 2] = bl; data[o + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  KF.scenes.bloom = {
    name: "Bloom",
    hint: "touch to seed · then let it grow",
    type: "canvas",

    enter(ctx, w, h) {
      W = w; H = h; alloc();
      // a few quiet seeds so something is already unfolding
      for (let i = 0; i < 5; i++) seed(U.rand(W * 0.2, W * 0.8), U.rand(H * 0.2, H * 0.8), 3);
    },
    resize(w, h) { W = w; H = h; alloc(); for (let i = 0; i < 4; i++) seed(U.rand(W * 0.2, W * 0.8), U.rand(H * 0.2, H * 0.8), 3); },

    frame(dtNow, dt, ctx) {
      const iters = 6; // many small steps -> slow, organic growth
      for (let s = 0; s < iters; s++) step();
      render();
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H);
    },

    pointerdown(x, y) { seed(x, y, 4); },
    pointermove(x, y, e) { if (e.buttons) seed(x, y, 3); },

    exit() { A = B = A2 = B2 = null; off = null; },
  };
})();
