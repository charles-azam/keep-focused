/* Stillpoint — INK. Jos Stam's stable fluids: a real, unconditionally-stable solver for
   the Navier–Stokes equations. Drag to push the fluid; dye curls through the velocity field,
   diffusing, folding, settling. Viscous and slow on purpose. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const CELL = 12, ITERS = 10, DT = 0.11, VISC = 0.00009, DIFF = 0.00001;
  let W, H, gw, gh, n2, rowStride;
  let u, v, u0, v0, dens, dens0, off, octx, img, data;
  let last = null;

  const IX = (i, j) => i + rowStride * j;

  function alloc() {
    gw = Math.max(8, Math.ceil(W / CELL));
    gh = Math.max(8, Math.ceil(H / CELL));
    rowStride = gw + 2;
    n2 = (gw + 2) * (gh + 2);
    u = new Float32Array(n2); v = new Float32Array(n2);
    u0 = new Float32Array(n2); v0 = new Float32Array(n2);
    dens = new Float32Array(n2); dens0 = new Float32Array(n2);
    off = document.createElement("canvas"); off.width = gw; off.height = gh;
    octx = off.getContext("2d");
    img = octx.createImageData(gw, gh); data = img.data;
  }

  function setBnd(b, x) {
    for (let i = 1; i <= gw; i++) {
      x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
      x[IX(i, gh + 1)] = b === 2 ? -x[IX(i, gh)] : x[IX(i, gh)];
    }
    for (let j = 1; j <= gh; j++) {
      x[IX(0, j)] = b === 1 ? -x[IX(1, j)] : x[IX(1, j)];
      x[IX(gw + 1, j)] = b === 1 ? -x[IX(gw, j)] : x[IX(gw, j)];
    }
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, gh + 1)] = 0.5 * (x[IX(1, gh + 1)] + x[IX(0, gh)]);
    x[IX(gw + 1, 0)] = 0.5 * (x[IX(gw, 0)] + x[IX(gw + 1, 1)]);
    x[IX(gw + 1, gh + 1)] = 0.5 * (x[IX(gw, gh + 1)] + x[IX(gw + 1, gh)]);
  }

  function linSolve(b, x, x0, a, c) {
    const invc = 1 / c;
    for (let k = 0; k < ITERS; k++) {
      for (let j = 1; j <= gh; j++)
        for (let i = 1; i <= gw; i++) {
          const id = IX(i, j);
          x[id] = (x0[id] + a * (x[id - 1] + x[id + 1] + x[id - rowStride] + x[id + rowStride])) * invc;
        }
      setBnd(b, x);
    }
  }

  function diffuse(b, x, x0, diff) { const a = DT * diff * gw * gh; linSolve(b, x, x0, a, 1 + 4 * a); }

  function advect(b, d, d0, uu, vv) {
    const dt0x = DT * gw, dt0y = DT * gh;
    for (let j = 1; j <= gh; j++)
      for (let i = 1; i <= gw; i++) {
        const id = IX(i, j);
        let x = i - dt0x * uu[id], y = j - dt0y * vv[id];
        if (x < 0.5) x = 0.5; if (x > gw + 0.5) x = gw + 0.5;
        if (y < 0.5) y = 0.5; if (y > gh + 0.5) y = gh + 0.5;
        const i0 = x | 0, i1 = i0 + 1, j0 = y | 0, j1 = j0 + 1;
        const s1 = x - i0, s0 = 1 - s1, t1 = y - j0, t0 = 1 - t1;
        d[id] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) + s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
      }
    setBnd(b, d);
  }

  function project(uu, vv, p, div) {
    const h = 1 / gw;
    for (let j = 1; j <= gh; j++)
      for (let i = 1; i <= gw; i++) {
        const id = IX(i, j);
        div[id] = -0.5 * h * (uu[id + 1] - uu[id - 1] + vv[id + rowStride] - vv[id - rowStride]);
        p[id] = 0;
      }
    setBnd(0, div); setBnd(0, p);
    linSolve(0, p, div, 1, 4);
    for (let j = 1; j <= gh; j++)
      for (let i = 1; i <= gw; i++) {
        const id = IX(i, j);
        uu[id] -= 0.5 * (p[id + 1] - p[id - 1]) / h;
        vv[id] -= 0.5 * (p[id + rowStride] - p[id - rowStride]) / h;
      }
    setBnd(1, uu); setBnd(2, vv);
  }

  function addSource(x, s) { for (let i = 0; i < n2; i++) x[i] += DT * s[i]; }

  function velStep() {
    let t;
    addSource(u, u0); addSource(v, v0);
    t = u; u = u0; u0 = t; diffuse(1, u, u0, VISC);
    t = v; v = v0; v0 = t; diffuse(2, v, v0, VISC);
    project(u, v, u0, v0);
    t = u; u = u0; u0 = t; t = v; v = v0; v0 = t;
    advect(1, u, u0, u0, v0); advect(2, v, v0, u0, v0);
    project(u, v, u0, v0);
  }
  function densStep() {
    let t;
    addSource(dens, dens0);
    t = dens; dens = dens0; dens0 = t; diffuse(0, dens, dens0, DIFF);
    t = dens; dens = dens0; dens0 = t; advect(0, dens, dens0, u, v);
  }

  function render() {
    for (let j = 0; j < gh; j++)
      for (let i = 0; i < gw; i++) {
        const dvr = U.clamp(dens[IX(i + 1, j + 1)], 0, 1);
        const dv = Math.pow(dvr, 0.7); // lift faint smoke into view
        const sp = Math.min(1, Math.hypot(u[IX(i + 1, j + 1)], v[IX(i + 1, j + 1)]) * 26);
        const o = (j * gw + i) * 4;
        // dye: teal where slow, warm where fast-moving
        const r = 12 + dv * (120 + sp * 150);
        const g = 18 + dv * 178;
        const b = 32 + dv * (185 - sp * 70);
        data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255;
      }
    octx.putImageData(img, 0, 0);
  }

  KF.scenes.ink = {
    name: "Ink",
    hint: "drag to stir · dye follows the current",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; alloc(); last = null; },
    resize(w, h) { W = w; H = h; alloc(); },

    frame(dtNow, dt, ctx) {
      u0.fill(0); v0.fill(0); dens0.fill(0); // clear sources each frame
      // (inputs were injected on pointer events into u0/v0/dens0 via inject())
      pending.forEach(inject); pending.length = 0;
      velStep();
      densStep();
      // gentle settle
      for (let i = 0; i < n2; i++) { u[i] *= 0.999; v[i] *= 0.999; dens[i] *= 0.9992; }
      render();
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H);
    },

    pointerdown(x, y) { last = { x, y }; queue(x, y, 0, 0); },
    pointermove(x, y, e) {
      if (!e.buttons) { last = { x, y }; return; }
      const dx = last ? x - last.x : 0, dy = last ? y - last.y : 0;
      queue(x, y, dx, dy);
      last = { x, y };
    },
    pointerup() { last = null; },

    exit() { u = v = u0 = v0 = dens = dens0 = null; off = null; pending.length = 0; },
  };

  // queue pointer impulses, apply at frame time (cells exist then)
  const pending = [];
  function queue(x, y, dx, dy) { pending.push({ x, y, dx, dy }); }
  function inject(p) {
    if (!gw) return;
    const i = U.clamp(((p.x / W) * gw | 0) + 1, 1, gw);
    const j = U.clamp(((p.y / H) * gh | 0) + 1, 1, gh);
    const id = IX(i, j);
    u0[id] += p.dx * 0.32;
    v0[id] += p.dy * 0.32;
    dens0[id] += 34;
    // spread a little to neighbours for a softer plume
    [-1, 1, -rowStride, rowStride].forEach((o) => { dens0[id + o] += 14; });
  }
})();
