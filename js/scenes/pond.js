/* Stillpoint — POND. A genuine wave simulation on a height field. Drop stones and watch
   the rings cross and interfere. Moonlight glints off the slopes. Rain falls now and then. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const SC = 7;                 // px per simulation cell
  let W, H, gw, gh, a, b, off, octx, img, data, rainT = 0, last = -1e9;

  function alloc() {
    gw = Math.max(8, Math.ceil(W / SC));
    gh = Math.max(8, Math.ceil(H / SC));
    a = new Float32Array(gw * gh);
    b = new Float32Array(gw * gh);
    off = document.createElement("canvas");
    off.width = gw; off.height = gh;
    octx = off.getContext("2d");
    img = octx.createImageData(gw, gh);
    data = img.data;
  }

  function drop(cx, cy, amp) {
    const gx = U.clamp((cx / W) * gw | 0, 2, gw - 3);
    const gy = U.clamp((cy / H) * gh | 0, 2, gh - 3);
    for (let y = -1; y <= 1; y++)
      for (let x = -1; x <= 1; x++) {
        a[(gy + y) * gw + (gx + x)] += amp;
      }
  }

  function step() {
    const DAMP = 0.992;
    for (let y = 1; y < gh - 1; y++) {
      const row = y * gw;
      for (let x = 1; x < gw - 1; x++) {
        const i = row + x;
        b[i] = (((a[i - 1] + a[i + 1] + a[i - gw] + a[i + gw]) * 0.5) - b[i]) * DAMP;
      }
    }
    const tmp = a; a = b; b = tmp;
  }

  function render() {
    const moon = gw * 0.62; // x-position of the moonlit band
    for (let y = 0; y < gh; y++) {
      const row = y * gw;
      for (let x = 0; x < gw; x++) {
        const i = row + x;
        const h = a[i];
        const sx = (a[i + 1] || 0) - (a[i - 1] || 0);
        const sy = (a[i + gw] || 0) - (a[i - gw] || 0);
        const glint = -sx * 70 - sy * 36;          // light from upper-left
        const band = Math.exp(-Math.pow((x - moon) / (gw * 0.16), 2)) * 26;
        const sh = glint + band;
        let r = 14 + h * 10 + sh * 0.85 + Math.max(0, sh) * 0.5;
        let g = 34 + h * 14 + sh * 1.0;
        let bl = 52 + h * 18 + sh * 1.0;
        const o = i * 4;
        data[o] = U.clamp(r, 0, 255);
        data[o + 1] = U.clamp(g, 0, 255);
        data[o + 2] = U.clamp(bl, 0, 255);
        data[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
  }

  KF.scenes.pond = {
    name: "Pond",
    hint: "drop a stone · the rings will cross",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; alloc(); rainT = 0; },
    resize(w, h) { W = w; H = h; alloc(); },

    frame(t, dt, ctx) {
      step(); step(); // two steps/frame -> brisker waves
      render();
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H);

      // gentle vignette + a low moon glow
      const mx = W * 0.62, my = H * 0.2;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(W, H) * 0.5);
      mg.addColorStop(0, "rgba(245,235,210,0.10)");
      mg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);

      // occasional rain
      rainT += dt;
      if (rainT > 1400 && Math.random() < 0.04) {
        rainT = 0;
        drop(U.rand(W * 0.1, W * 0.9), U.rand(H * 0.1, H * 0.9), 1.6);
      }
    },

    pointerdown(x, y) { drop(x, y, 4.5); last = performance.now ? 0 : 0; },
    pointermove(x, y, e) {
      // dragging draws a trailing line of ripples
      if (e.buttons) drop(x, y, 1.8);
    },

    exit() { a = b = null; off = null; },
  };
})();
