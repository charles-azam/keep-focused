/* Stillpoint — SWARM. The Physarum model: each agent only smells the trail ahead-left,
   ahead, ahead-right, turns toward the strongest, moves, and leaves a little trail of its
   own. From that one rule, thousands of them weave slow living networks. Touch lays down
   food; the swarm reaches for it. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const CELL = 3;
  let W, H, gw, gh, trail, trail2, off, octx, img, data;
  let ax, ay, ah; // agent arrays
  let nAgents = 0;
  let foodX = -1, foodY = -1;

  const SA = 0.4;       // sensor angle
  const SO = 5;         // sensor offset (cells)
  const RA = 0.5;       // rotate angle
  const SS = 0.85;      // step size (cells) — slow
  const DEP = 0.5;      // deposit
  const DECAY = 0.9;

  function alloc() {
    gw = Math.max(8, Math.ceil(W / CELL));
    gh = Math.max(8, Math.ceil(H / CELL));
    trail = new Float32Array(gw * gh);
    trail2 = new Float32Array(gw * gh);
    nAgents = Math.min(12000, Math.round(gw * gh * 0.16));
    ax = new Float32Array(nAgents); ay = new Float32Array(nAgents); ah = new Float32Array(nAgents);
    for (let i = 0; i < nAgents; i++) {
      // scattered across the whole field, random headings — networks form everywhere
      ax[i] = Math.random() * gw;
      ay[i] = Math.random() * gh;
      ah[i] = Math.random() * U.TAU;
    }
    off = document.createElement("canvas"); off.width = gw; off.height = gh;
    octx = off.getContext("2d");
    img = octx.createImageData(gw, gh); data = img.data;
  }

  function sense(x, y, h) {
    const sx = x + Math.cos(h) * SO, sy = y + Math.sin(h) * SO;
    const ix = ((sx % gw) + gw) % gw | 0, iy = ((sy % gh) + gh) % gh | 0;
    return trail[iy * gw + ix];
  }

  function stepAgents() {
    for (let i = 0; i < nAgents; i++) {
      const x = ax[i], y = ay[i], h = ah[i];
      const c = sense(x, y, h), l = sense(x, y, h - SA), r = sense(x, y, h + SA);
      let nh = h;
      if (c > l && c > r) { /* keep */ }
      else if (l > r) nh = h - RA;
      else if (r > l) nh = h + RA;
      else nh = h + (Math.random() - 0.5) * RA * 2;
      // bias gently toward food (cursor)
      if (foodX >= 0) {
        const want = Math.atan2(foodY - y, foodX - x);
        let dd = want - nh; while (dd > Math.PI) dd -= U.TAU; while (dd < -Math.PI) dd += U.TAU;
        nh += dd * 0.06;
      }
      let nx = x + Math.cos(nh) * SS, ny = y + Math.sin(nh) * SS;
      nx = ((nx % gw) + gw) % gw; ny = ((ny % gh) + gh) % gh;
      ax[i] = nx; ay[i] = ny; ah[i] = nh;
      const ci = (ny | 0) * gw + (nx | 0);
      trail[ci] += DEP;
    }
  }

  function diffuseDecay() {
    // toroidal, full-grid (matches the agents' wrap) — no edge accumulation
    for (let y = 0; y < gh; y++) {
      const ym = (y - 1 + gh) % gh, yp = (y + 1) % gh, row = y * gw;
      for (let x = 0; x < gw; x++) {
        const xm = (x - 1 + gw) % gw, xp = (x + 1) % gw, i = row + x;
        const s = (trail[i] * 4 + trail[row + xm] + trail[row + xp] + trail[ym * gw + x] + trail[yp * gw + x]) / 8;
        trail2[i] = s * DECAY;
      }
    }
    const t = trail; trail = trail2; trail2 = t;
    if (foodX >= 0) { // keep refreshing the food source while held
      const fi = (foodY | 0) * gw + (foodX | 0);
      if (fi >= 0 && fi < trail.length) trail[fi] += 1.0;
    }
  }

  function render() {
    for (let i = 0; i < gw * gh; i++) {
      let v = U.clamp(trail[i] * 1.3, 0, 1);
      v = Math.pow(v, 0.7); // lift faint filaments
      const o = i * 4;
      data[o] = 12 + v * 220;
      data[o + 1] = 24 + v * 172;
      data[o + 2] = 42 + v * 150;
      data[o + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  KF.scenes.swarm = {
    name: "Swarm",
    hint: "touch to lay down food · the swarm reaches",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; alloc(); foodX = foodY = -1; },
    resize(w, h) { W = w; H = h; alloc(); },

    frame(dtNow, dt, ctx) {
      stepAgents();
      diffuseDecay();
      render();
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H);
    },

    pointerdown(x, y) { foodX = (x / W) * gw; foodY = (y / H) * gh; },
    pointermove(x, y, e) { if (e.buttons) { foodX = (x / W) * gw; foodY = (y / H) * gh; } },
    pointerup() { foodX = foodY = -1; },
    pointerleave() { foodX = foodY = -1; },

    exit() { trail = trail2 = ax = ay = ah = null; off = null; },
  };
})();
