/* Stillpoint — CAIRN. Build little towers of balanced stones. Each tap drops a pebble
   that settles onto whatever is below. They never topple. Nothing depends on it. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, groundY, stones = [];

  function restFor(x, w, hh) {
    // stack against each stone's *destination* (restY), so rapid taps build deterministically
    let top = groundY;
    for (const s of stones) {
      const overlap = Math.abs(s.x - x) < (s.w / 2 + w / 2) * 0.72;
      if (overlap) top = Math.min(top, s.restY - s.h / 2);
    }
    return top - hh / 2;
  }

  KF.scenes.cairn = {
    name: "Cairn",
    hint: "tap to stack a stone · they balance, always",
    type: "canvas",

    enter(ctx, w, h) { W = w; H = h; groundY = H * 0.84; stones = []; },
    resize(w, h) { W = w; H = h; groundY = H * 0.84; },

    frame(t, dt, ctx) {
      ctx.clearRect(0, 0, W, H);

      // ground line + soft horizon
      const hg = ctx.createLinearGradient(0, groundY - 30, 0, H);
      hg.addColorStop(0, "rgba(20,28,44,0)");
      hg.addColorStop(1, "rgba(16,22,36,0.55)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, groundY - 30, W, H - groundY + 30);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(236,228,211,0.12)";
      ctx.lineWidth = 1;
      ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

      const g = 0.85 * dt / 16;
      for (const s of stones) {
        if (!s.landed) {
          s.vy += g;
          s.y += s.vy * dt / 16;
          if (s.y >= s.restY) {
            s.y = s.restY; s.landed = true; s.sy = 0.7; s.vy = 0;
            const k = U.clamp(1 - (groundY - s.y) / (groundY * 0.7), 0, 1);
            if (KF.audio) KF.audio.note(0.15 + k * 0.6, { vel: 0.5, dur: 1.2 });
          }
        }
        if (s.sy < 1) s.sy = Math.min(1, s.sy + dt / 200);

        ctx.save();
        ctx.translate(s.x, s.y + (1 - (s.sy || 1)) * s.h * 0.5);
        ctx.scale(1, s.sy || 1);
        // shadow
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.ellipse(2, s.h * 0.18, s.w / 2, s.h / 2, 0, 0, U.TAU);
        ctx.fill();
        // body
        const grd = ctx.createLinearGradient(0, -s.h / 2, 0, s.h / 2);
        grd.addColorStop(0, s.top);
        grd.addColorStop(1, s.bot);
        ctx.beginPath();
        ctx.fillStyle = grd;
        ctx.ellipse(0, 0, s.w / 2, s.h / 2, 0, 0, U.TAU);
        ctx.fill();
        // glint
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.ellipse(-s.w * 0.16, -s.h * 0.2, s.w * 0.18, s.h * 0.16, 0, 0, U.TAU);
        ctx.fill();
        ctx.restore();
      }
    },

    pointerdown(x, y) {
      const w = U.rand(40, 92);
      const h = U.rand(16, 30);
      const tones = [["#7a8390", "#3c4350"], ["#86807a", "#433f3a"], ["#6f7d83", "#363f44"]];
      const pair = U.pick(tones);
      const restY = restFor(x, w, h);
      const startY = Math.min(restY - 170, restY - h); // a short, gentle drop from just above the pile
      stones.push({ x, w, h, y: startY, restY, vy: 0, landed: false, sy: 1, top: pair[0], bot: pair[1] });
      if (stones.length > 70) stones.shift();
    },

    exit() { stones = []; },
  };
})();
