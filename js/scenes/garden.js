/* Stillpoint — GARDEN. Rake the sand into grooves; set down smooth stones. The marks
   stay where you leave them. There is no pattern you are supposed to make. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let W, H, sand, sctx, stones = [];
  let down = false, moved = false, last = null;

  function paintSand() {
    sand.width = W; sand.height = H;
    const g = sctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.75);
    g.addColorStop(0, "#6d6553");
    g.addColorStop(1, "#4c4636");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, W, H);
    // grain
    for (let i = 0; i < (W * H) / 900; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      sctx.fillStyle = Math.random() < 0.5 ? "rgba(255,250,235,0.03)" : "rgba(0,0,0,0.045)";
      sctx.fillRect(x, y, 1.4, 1.4);
    }
    // a soft ambient set of background circles (ripples around centre) for calm
  }

  function rake(p0, p1) {
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;        // normal to stroke
    const teeth = 7, gap = 6;
    sctx.lineCap = "round";
    for (let i = 0; i < teeth; i++) {
      const o = (i - (teeth - 1) / 2) * gap;
      const ax = p0.x + nx * o, ay = p0.y + ny * o;
      const bx = p1.x + nx * o, by = p1.y + ny * o;
      // groove shadow
      sctx.strokeStyle = "rgba(18,13,5,0.30)";
      sctx.lineWidth = 3.2;
      sctx.beginPath(); sctx.moveTo(ax, ay); sctx.lineTo(bx, by); sctx.stroke();
      // ridge highlight, offset toward light
      sctx.strokeStyle = "rgba(255,250,235,0.14)";
      sctx.lineWidth = 1.4;
      sctx.beginPath(); sctx.moveTo(ax + nx * 1.6 - 0.6, ay + ny * 1.6 - 0.6);
      sctx.lineTo(bx + nx * 1.6 - 0.6, by + ny * 1.6 - 0.6); sctx.stroke();
    }
  }

  function placeStone(x, y) {
    const r = U.rand(13, 26);
    stones.push({ x, y, r, sq: U.rand(0.8, 1.15), rot: U.rand(0, Math.PI), tone: U.rand(0.1, 0.45) });
    if (KF.audio) KF.audio.note(0.2 + Math.random() * 0.2, { vel: 0.5, dur: 1.0 });
  }

  function drawStones(ctx) {
    for (const s of stones) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.scale(s.sq, 1 / s.sq);
      // cast shadow
      ctx.beginPath();
      ctx.fillStyle = "rgba(30,24,12,0.28)";
      ctx.ellipse(2, 4, s.r * 1.05, s.r * 1.05, 0, 0, U.TAU);
      ctx.fill();
      // body
      const g = ctx.createRadialGradient(-s.r * 0.35, -s.r * 0.4, s.r * 0.2, 0, 0, s.r);
      g.addColorStop(0, "#7d7a74");
      g.addColorStop(0.6, "#56544f");
      g.addColorStop(1, "#36352f");
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(0, 0, s.r, 0, U.TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  KF.scenes.garden = {
    name: "Garden",
    hint: "drag to rake the sand · tap to set a stone",
    type: "canvas",

    enter(ctx, w, h) {
      W = w; H = h;
      sand = document.createElement("canvas");
      sctx = sand.getContext("2d");
      paintSand();
      stones = [];
      down = false; moved = false; last = null;
    },
    resize(w, h) {
      // keep stones, repaint sand (marks reset on resize — acceptable)
      W = w; H = h; paintSand();
    },

    frame(t, dt, ctx) {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(sand, 0, 0);
      drawStones(ctx);
    },

    pointerdown(x, y) { down = true; moved = false; last = { x, y }; },
    pointermove(x, y, e) {
      if (!down || !last) return;
      if (Math.hypot(x - last.x, y - last.y) > 2) {
        moved = true;
        rake(last, { x, y });
        last = { x, y };
      }
    },
    pointerup(x, y) {
      if (down && !moved) placeStone(x, y);
      down = false; last = null;
    },

    exit() { sand = null; stones = []; },
  };
})();
