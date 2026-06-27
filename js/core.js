/* Stillpoint — core namespace + small utilities */
(function () {
  const KF = (window.KF = window.KF || {});
  KF.scenes = {};

  // ---- math / helpers ----
  const U = (KF.util = {});
  U.TAU = Math.PI * 2;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
  U.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  U.range = (n) => Array.from({ length: n }, (_, i) => i);
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  U.smooth = (t) => t * t * (3 - 2 * t);

  // shuffled-bag picker so content doesn't repeat until exhausted
  U.bag = function (arr) {
    let order = [];
    return function () {
      if (!order.length) {
        order = arr.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          [order[i], order[j]] = [order[j], order[i]];
        }
      }
      return arr[order.pop()];
    };
  };

  // device-pixel-ratio aware canvas sizing
  U.fit = function (canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth,
      h = window.innerHeight;
    canvas.width = (w * dpr) | 0;
    canvas.height = (h * dpr) | 0;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
  };

  // simple event bus
  const listeners = {};
  KF.on = (name, fn) => ((listeners[name] = listeners[name] || []).push(fn), fn);
  KF.emit = (name, data) => (listeners[name] || []).forEach((fn) => fn(data));

  KF.el = (sel) => document.querySelector(sel);
})();
