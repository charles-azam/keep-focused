/* Stillpoint — orchestration. Holds the rooms, the dock, the render loop, the veil. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  const ORDER = ["flow", "ink", "bloom", "swarm", "cymatics", "attractor"];

  const canvas = document.getElementById("scene-canvas");
  const sceneDom = document.getElementById("scene-dom");
  const dock = document.getElementById("dock");
  const brand = document.getElementById("brand");
  const roomName = document.getElementById("room-name");
  const hint = document.getElementById("hint");
  const chip = document.getElementById("sound-toggle");
  const veil = document.getElementById("veil");
  const enterBtn = document.getElementById("enter");

  let ctx, W, H;
  let active = null, activeKey = null;
  let last = 0, hintTimer = null;

  function fit() {
    const r = U.fit(canvas);
    ctx = r.ctx; W = r.w; H = r.h;
  }

  // ---------- dock ----------
  function buildDock() {
    ORDER.forEach((key) => {
      const sc = KF.scenes[key];
      if (!sc) return;
      const b = document.createElement("button");
      b.className = "dot";
      b.dataset.key = key;
      b.innerHTML = `<span class="label">${sc.name}</span>`;
      b.addEventListener("click", (e) => { e.stopPropagation(); go(key); });
      dock.appendChild(b);
    });
  }

  function markDock() {
    dock.querySelectorAll(".dot").forEach((d) => {
      d.classList.toggle("active", d.dataset.key === activeKey);
    });
  }

  // ---------- room switching ----------
  function go(key) {
    if (key === activeKey || !KF.scenes[key]) return;
    const sc = KF.scenes[key];

    // tear down current
    if (active) {
      if (active.type === "dom" && active.unmount) active.unmount();
      else if (active.exit) active.exit();
    }
    sceneDom.classList.remove("active");

    active = sc; activeKey = key;

    if (sc.type === "dom") {
      ctx.clearRect(0, 0, W, H);
      sc.mount(sceneDom);
      sceneDom.classList.add("active");
    } else {
      ctx.clearRect(0, 0, W, H);
      if (sc.enter) sc.enter(ctx, W, H);
    }

    markDock();
    roomName.textContent = sc.name;
    roomName.classList.add("show");
    showHint(sc.hint);
    if (KF.audio) KF.audio.swell(0.2 + ORDER.indexOf(key) * 0.03);
    last = performance.now();
  }

  function showHint(text) {
    hint.textContent = text || "";
    hint.classList.add("show");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hint.classList.remove("show"), 5200);
  }

  // ---------- render loop ----------
  function loop(now) {
    const dt = Math.min(50, now - last || 16);
    last = now;
    if (active && active.type !== "dom" && active.frame) {
      active.frame(now, dt, ctx, W, H);
    }
    requestAnimationFrame(loop);
  }

  // ---------- pointer forwarding (canvas scenes only) ----------
  function fwd(name, e) {
    if (!active || active.type === "dom" || !active[name]) return;
    if (e.target.closest("#dock,.chip,#brand,.card,#scene-dom.active,#focus-overlay,#focus-hud")) return;
    active[name](e.clientX, e.clientY, e);
  }
  window.addEventListener("pointerdown", (e) => fwd("pointerdown", e), { passive: true });
  window.addEventListener("pointermove", (e) => fwd("pointermove", e), { passive: true });
  window.addEventListener("pointerup", (e) => fwd("pointerup", e), { passive: true });
  window.addEventListener("pointercancel", (e) => fwd("pointerup", e), { passive: true });
  canvas.addEventListener("pointerleave", (e) => fwd("pointerleave", e), { passive: true });

  // ---------- resize ----------
  window.addEventListener("resize", () => {
    fit();
    if (active && active.type !== "dom" && active.resize) active.resize(W, H);
  });

  // ---------- keyboard ----------
  window.addEventListener("keydown", (e) => {
    if (!KF.started) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      go(ORDER[(ORDER.indexOf(activeKey) + 1) % ORDER.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      go(ORDER[(ORDER.indexOf(activeKey) - 1 + ORDER.length) % ORDER.length]);
    } else if (/^[1-9]$/.test(e.key)) {
      const k = ORDER[(+e.key) - 1];
      if (k) go(k);
    } else if (e.key.toLowerCase() === "m") {
      toggleSound();
    } else if (e.key.toLowerCase() === "f") {
      const d = document;
      if (!d.fullscreenElement) (d.documentElement.requestFullscreen || (() => {})).call(d.documentElement);
      else (d.exitFullscreen || (() => {})).call(d);
    }
  });

  // ---------- sound ----------
  function toggleSound() {
    const muted = !KF.audio.isMuted();
    KF.audio.setMuted(muted);
    chip.classList.toggle("muted", muted);
  }
  chip.addEventListener("click", (e) => { e.stopPropagation(); toggleSound(); });

  // ---------- begin ----------
  function begin() {
    if (KF.started) return;
    KF.started = true;
    if (KF.audio) KF.audio.start();
    veil.classList.add("gone");
    setTimeout(() => { veil.style.display = "none"; }, 1700);
    brand.classList.add("show");
    dock.classList.add("show");
    chip.classList.add("show");
    if (focusChip) focusChip.classList.add("show");
    last = performance.now();
    go("flow");
  }
  enterBtn.addEventListener("click", (e) => { e.stopPropagation(); begin(); });
  // also allow Enter/Space/any tap on the veil
  veil.addEventListener("pointerdown", () => { if (!KF.started) begin(); });
  window.addEventListener("keydown", (e) => {
    if (!KF.started && (e.key === "Enter" || e.key === " ")) begin();
  });

  // sync hash so a room can be bookmarked
  function syncHash() { try { history.replaceState(null, "", "#" + activeKey); } catch (e) {} }
  window.addEventListener("hashchange", () => {
    const k = (location.hash || "").replace("#", "");
    if (KF.started && ORDER.includes(k) && k !== activeKey) go(k);
  });
  const _go = go;
  go = function (key) { _go(key); if (KF.started) syncHash(); };
  KF.go = go; // let the focus loop route to a calm room for "wander" breaks
  const focusChip = document.getElementById("focus-toggle");

  // ---------- boot ----------
  fit();
  buildDock();
  requestAnimationFrame(loop);

  // deep-link: open straight into a room (skips the veil); audio unlocks on first touch
  const hashKey = (location.hash || "").replace("#", "");
  if (ORDER.includes(hashKey)) {
    KF.started = true;
    if (KF.audio) KF.audio.start();
    veil.style.display = "none";
    brand.classList.add("show");
    dock.classList.add("show");
    chip.classList.add("show");
    if (focusChip) focusChip.classList.add("show");
    last = performance.now();
    _go(hashKey);
  }
})();
