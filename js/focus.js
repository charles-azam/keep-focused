/* Stillpoint — FOCUS LOOP.
   Arrive → Work → (the Valve: an evidence-based intercept for the urge to check) → Break → Return.
   Built on the report: cyclic sighing for fast arousal down-regulation, parking thoughts to
   defuse attention residue, and break length/kind matched to how depleting the work was. */
(function () {
  const KF = window.KF;
  const U = KF.util;

  let state = "idle";          // idle | setup | working | valve | break | resume | done
  let session = null;          // {intent, type, durationMin, startedAt, overtime}
  let brk = null;              // {mode, endsAt, min}
  let interval = null;
  let sighRAF = null;

  // ---- physiological sigh pattern (double inhale, long exhale) ----
  const SIGH = [
    { label: "breathe in", dur: 1.5, from: 0.5, to: 0.82, note: 0.55 },
    { label: "…and a little more", dur: 0.9, from: 0.82, to: 1.0, note: 0.8 },
    { label: "long exhale", dur: 5.5, from: 1.0, to: 0.12, note: 0.18 },
    { label: "rest", dur: 0.8, from: 0.12, to: 0.12, note: null },
  ];
  const SIGH_CYCLE = SIGH.reduce((s, p) => s + p.dur, 0);

  // ---------- dom ----------
  function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function fmt(ms) { const s = Math.max(0, Math.round(ms / 1000)); return (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0"); }

  let toggle, hud, hudTime, hudLabel, nudge, overlay;

  function build() {
    toggle = document.getElementById("focus-toggle");
    if (toggle) toggle.addEventListener("click", (e) => { e.stopPropagation(); state === "idle" ? openSetup() : exitFocus(); });

    hud = h(`<div id="focus-hud">
      <span class="fh-label">session</span>
      <span class="fh-time">0:00</span>
      <button class="fh-btn fh-valve">about to check?</button>
      <button class="fh-btn fh-break">break</button>
      <button class="fh-btn fh-end" title="end session">✕</button>
      <span class="fh-nudge">a natural place to pause →</span>
    </div>`);
    document.body.appendChild(hud);
    hudTime = hud.querySelector(".fh-time");
    hudLabel = hud.querySelector(".fh-label");
    nudge = hud.querySelector(".fh-nudge");
    hud.querySelector(".fh-valve").addEventListener("click", (e) => { e.stopPropagation(); openValve(); });
    hud.querySelector(".fh-break").addEventListener("click", (e) => { e.stopPropagation(); openBreak(); });
    hud.querySelector(".fh-end").addEventListener("click", (e) => { e.stopPropagation(); finish(); });

    overlay = h(`<div id="focus-overlay"><div class="fo-inner"></div></div>`);
    document.body.appendChild(overlay);
    overlay.addEventListener("pointerdown", (e) => { if (e.target === overlay && state !== "valve") {} });
  }

  function panel(html) { overlay.querySelector(".fo-inner").innerHTML = html; }
  function show() { overlay.classList.add("show"); }
  function hide() { overlay.classList.remove("show"); }

  // ---------- SETUP ----------
  function openSetup() {
    state = "setup";
    const last = KF.store.lastSession();
    document.body.classList.add("focusing");
    panel(`
      <div class="fo-kicker">a working session</div>
      <h2 class="fo-h">What are you settling into?</h2>
      <input class="fo-input" id="fo-intent" maxlength="80" placeholder="one line of intent — e.g. “draft the proposal”" value="${(last.intent || "").replace(/"/g, "&quot;")}" />
      <div class="fo-row-label">the work is mostly…</div>
      <div class="fo-choices" id="fo-type">
        <button class="fo-choice ${last.type === "deep" ? "on" : ""}" data-type="deep">
          <span class="fc-t">deep & cognitive</span><span class="fc-s">writing, coding, problem-solving</span></button>
        <button class="fo-choice ${last.type === "light" ? "on" : ""}" data-type="light">
          <span class="fc-t">lighter & admin</span><span class="fc-s">email triage, clerical, creative tinkering</span></button>
      </div>
      <div class="fo-row-label">hold the session for…</div>
      <div class="fo-choices fo-durs" id="fo-dur">
        ${[25, 50, 90].map((m) => `<button class="fo-pill ${last.durationMin === m ? "on" : ""}" data-min="${m}">${m} min</button>`).join("")}
        <button class="fo-pill ${last.durationMin === 0 ? "on" : ""}" data-min="0">open · no timer</button>
      </div>
      <p class="fo-fine">a gentle guide, not an alarm. you break when you're ready.</p>
      <button class="fo-cta" id="fo-begin">begin</button>
      ${KF.store.parked().length ? `<button class="fo-ghost" id="fo-review">review ${KF.store.parked().length} parked thought${KF.store.parked().length > 1 ? "s" : ""}</button>` : ""}
    `);
    let type = last.type || "deep";
    let dur = last.durationMin == null ? 50 : last.durationMin;
    overlay.querySelectorAll("#fo-type .fo-choice").forEach((b) =>
      b.addEventListener("click", () => { type = b.dataset.type; overlay.querySelectorAll("#fo-type .fo-choice").forEach((x) => x.classList.toggle("on", x === b)); }));
    overlay.querySelectorAll("#fo-dur .fo-pill").forEach((b) =>
      b.addEventListener("click", () => { dur = +b.dataset.min; overlay.querySelectorAll("#fo-dur .fo-pill").forEach((x) => x.classList.toggle("on", x === b)); }));
    overlay.querySelector("#fo-begin").addEventListener("click", () => {
      const intent = (overlay.querySelector("#fo-intent").value || "").trim();
      beginSession({ intent, type, durationMin: dur });
    });
    const rev = overlay.querySelector("#fo-review");
    if (rev) rev.addEventListener("click", () => openParked(true));
    show();
  }

  // ---------- WORKING ----------
  function beginSession(opts) {
    session = { intent: opts.intent, type: opts.type, durationMin: opts.durationMin, startedAt: Date.now(), overtime: false };
    KF.store.saveSession({ intent: opts.intent, type: opts.type, durationMin: opts.durationMin });
    brk = null;
    state = "working";
    hide();
    hud.classList.add("show");
    hud.classList.remove("overtime", "on-break");
    hudLabel.textContent = session.intent ? session.intent : "in session";
    if (KF.audio) KF.audio.swell(0.25);
    if (toggle) toggle.classList.add("active");
    if (!interval) interval = setInterval(tick, 1000);
    tick();
  }

  function tick() {
    if (state === "working") {
      const el = Date.now() - session.startedAt;
      hudTime.textContent = fmt(el);
      if (session.durationMin && !session.overtime && el >= session.durationMin * 60000) {
        session.overtime = true;
        hud.classList.add("overtime");
        nudge.classList.add("show");
        if (KF.audio) KF.audio.swell(0.4);
      }
    } else if (state === "break") {
      const rem = brk.endsAt - Date.now();
      hudTime.textContent = fmt(Math.max(0, rem));
      overlay.querySelectorAll(".fo-count").forEach((e) => (e.textContent = fmt(Math.max(0, rem))));
      if (rem <= 0) endBreak();
    }
  }

  // ---------- THE VALVE ----------
  function openValve() {
    if (state !== "working") return;
    state = "valve";
    const parkedN = KF.store.parked().length;
    panel(`
      <div class="fo-kicker">the urge, intercepted</div>
      <h2 class="fo-h">Before the inbox — one slow breath.</h2>
      <div class="sigh-stage">
        <div class="sigh-ring"><div class="sigh-orb"></div></div>
        <div class="sigh-label">breathe in</div>
        <div class="sigh-count">90s</div>
      </div>
      <div class="fo-park">
        <div class="fo-row-label">what pulled you away? park it here — you'll deal with it on your terms, later.</div>
        <div class="fo-park-row">
          <input class="fo-input" id="fo-park" maxlength="200" placeholder="e.g. “reply to Dana about Friday”" />
          <button class="fo-pill on" id="fo-park-btn">park it</button>
        </div>
        <div class="fo-park-note" id="fo-park-note">${parkedN ? parkedN + " already parked" : "nothing parked yet"}</div>
      </div>
      <div class="fo-actions">
        <button class="fo-cta" id="fo-back">back to work</button>
      </div>
    `);
    show();
    const orb = overlay.querySelector(".sigh-orb");
    const label = overlay.querySelector(".sigh-label");
    const count = overlay.querySelector(".sigh-count");
    runSigh(orb, label, count, 90);

    const input = overlay.querySelector("#fo-park");
    const note = overlay.querySelector("#fo-park-note");
    const doPark = () => {
      const v = (input.value || "").trim();
      if (!v) return;
      const list = KF.store.park(v);
      input.value = "";
      note.textContent = list.length + " parked — out of your head, safe for later";
      if (KF.audio) KF.audio.note(0.3, { vel: 0.4 });
    };
    overlay.querySelector("#fo-park-btn").addEventListener("click", doPark);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") doPark(); });
    setTimeout(() => input.focus(), 60);
    overlay.querySelector("#fo-back").addEventListener("click", closeValve);
  }

  function closeValve() {
    if (sighRAF) cancelAnimationFrame(sighRAF), (sighRAF = null);
    state = "working";
    hide();
    if (KF.audio) KF.audio.swell(0.3);
  }

  function runSigh(orb, label, count, seconds) {
    const start = performance.now();
    let lastPhase = -1;
    function frame(now) {
      const elapsed = (now - start) / 1000;
      const remaining = Math.max(0, Math.ceil(seconds - elapsed));
      if (count) count.textContent = remaining + "s";
      if (elapsed >= seconds) {
        if (label) label.textContent = "good. carry that back.";
        orb.style.transform = "scale(0.5)";
        sighRAF = null;
        return;
      }
      let tc = elapsed % SIGH_CYCLE;
      let pi = 0;
      for (let i = 0; i < SIGH.length; i++) { if (tc < SIGH[i].dur) { pi = i; break; } tc -= SIGH[i].dur; }
      const ph = SIGH[pi];
      const k = U.smooth(U.clamp(tc / ph.dur, 0, 1));
      const scale = U.lerp(ph.from, ph.to, k);
      orb.style.transform = "scale(" + scale.toFixed(3) + ")";
      if (label && pi !== lastPhase) {
        label.textContent = ph.label;
        if (ph.note != null && KF.audio) KF.audio.note(ph.note, { vel: 0.35, dur: ph.dur });
        lastPhase = pi;
      }
      sighRAF = requestAnimationFrame(frame);
    }
    sighRAF = requestAnimationFrame(frame);
  }

  // ---------- BREAK ROUTER ----------
  function recommend() {
    const el = session ? (Date.now() - session.startedAt) / 60000 : 0;
    const deep = !session || session.type === "deep";
    // evidence: longer breaks beat short ones; demanding work needs >10 min & non-cognitive
    if (deep && el >= 40) return { key: "step", min: 12, why: "You've done a long, demanding stretch. The evidence is clear: hard cognitive work needs a longer, screen-free break — more than ten minutes. Step away." };
    if (deep) return { key: "rest", min: 10, why: "Deep work depletes fast. A short, non-cognitive rest restores reaction time and mood better than pushing on." };
    return { key: "wander", min: 4, why: "Lighter work — a brief wander is plenty to lift fatigue and vigor before the next block." };
  }

  const BREAKS = {
    sigh: { t: "90-second sigh", s: "exhale-emphasized breathing — fastest way to drop arousal", min: 1.5 },
    rest: { t: "rest (NSDR-style)", s: "eyes closed, body heavy — small but real gains in alertness", min: 10 },
    step: { t: "step away", s: "leave the screen: walk, water, look into the distance", min: 12 },
    wander: { t: "wander Stillpoint", s: "drift through a calm room — no feeds, nothing owed", min: 4 },
  };

  function openBreak() {
    if (state !== "working") return;
    state = "break-menu";
    const rec = recommend();
    const order = ["rest", "step", "wander", "sigh"].sort((a, b) => (a === rec.key ? -1 : b === rec.key ? 1 : 0));
    panel(`
      <div class="fo-kicker">take a break — the good kind</div>
      <h2 class="fo-h">${rec.why}</h2>
      <div class="fo-breaks">
        ${order.map((k) => {
          const b = BREAKS[k];
          const min = k === rec.key ? rec.min : b.min;
          return `<button class="fo-break-card ${k === rec.key ? "rec" : ""}" data-key="${k}" data-min="${min}">
            ${k === rec.key ? `<span class="fo-tag">recommended</span>` : ""}
            <span class="fb-t">${b.t}</span>
            <span class="fb-s">${b.s}</span>
            <span class="fb-min">${min < 2 ? "90s" : min + " min"}</span>
          </button>`;
        }).join("")}
      </div>
      <p class="fo-fine">whatever you pick: don't open a feed or an inbox. that's the one rule.</p>
      <button class="fo-ghost" id="fo-skip">skip — keep working</button>
    `);
    overlay.querySelectorAll(".fo-break-card").forEach((c) =>
      c.addEventListener("click", () => startBreak(c.dataset.key, +c.dataset.min)));
    overlay.querySelector("#fo-skip").addEventListener("click", () => { state = "working"; hide(); });
    show();
  }

  function startBreak(key, min) {
    brk = { mode: key, min, endsAt: Date.now() + min * 60000 };
    state = "break";
    hud.classList.add("on-break");
    hud.classList.remove("overtime");
    nudge.classList.remove("show");
    hudLabel.textContent = "on a break";

    if (key === "sigh") {
      panel(`<div class="fo-kicker">90-second sigh</div>
        <div class="sigh-stage big"><div class="sigh-ring"><div class="sigh-orb"></div></div>
        <div class="sigh-label">breathe in</div><div class="sigh-count">90s</div></div>
        <button class="fo-cta" id="fo-bdone">done</button>`);
      runSigh(overlay.querySelector(".sigh-orb"), overlay.querySelector(".sigh-label"), overlay.querySelector(".sigh-count"), 90);
      overlay.querySelector("#fo-bdone").addEventListener("click", endBreak);
      show();
    } else if (key === "rest") {
      document.body.classList.add("resting");
      panel(`<div class="rest-screen">
        <div class="rest-cue">let your eyes close</div>
        <div class="rest-breath"></div>
        <div class="fo-count rest-count">${fmt(min * 60000)}</div>
        <button class="fo-ghost" id="fo-bdone">end rest</button>
      </div>`);
      const cues = ["let your eyes close", "let the body grow heavy", "nothing to solve right now", "follow the breath out", "soften the jaw, the shoulders", "you are allowed to do nothing"];
      let ci = 0;
      overlay._cueTimer = setInterval(() => { ci = (ci + 1) % cues.length; const e = overlay.querySelector(".rest-cue"); if (e) e.textContent = cues[ci]; }, 9000);
      overlay.querySelector("#fo-bdone").addEventListener("click", endBreak);
      show();
    } else if (key === "step") {
      panel(`<div class="fo-kicker">step away</div>
        <h2 class="fo-h">Leave the screen.</h2>
        <p class="fo-step">Stand up. Walk, get water, look out a window at something far away. Your attention restores when it stops being aimed at a screen — and movement and distance both help.</p>
        <div class="fo-count step-count">${fmt(min * 60000)}</div>
        <p class="fo-fine">come back when this reaches zero. it'll chime softly.</p>
        <button class="fo-ghost" id="fo-bdone">I'm back</button>`);
      overlay.querySelector("#fo-bdone").addEventListener("click", endBreak);
      show();
    } else { // wander
      hide();
      const rooms = ["drift", "pond", "garden", "orrery", "pendulum"];
      if (KF.go) KF.go(U.pick(rooms));
    }
    tick();
  }

  function endBreak() {
    if (overlay._cueTimer) clearInterval(overlay._cueTimer), (overlay._cueTimer = null);
    if (sighRAF) cancelAnimationFrame(sighRAF), (sighRAF = null);
    document.body.classList.remove("resting");
    hud.classList.remove("on-break");
    if (KF.audio) KF.audio.swell(0.5);
    state = "resume";
    panel(`<div class="fo-kicker">break complete</div>
      <h2 class="fo-h">Ready to settle back in?</h2>
      <p class="fo-fine">${session && session.intent ? "where you were: “" + session.intent.replace(/</g, "") + "”" : "pick the thread back up gently."}</p>
      <div class="fo-actions">
        <button class="fo-cta" id="fo-again">another session</button>
        <button class="fo-ghost" id="fo-fin">I'm done</button>
      </div>`);
    overlay.querySelector("#fo-again").addEventListener("click", () => {
      beginSession({ intent: session ? session.intent : "", type: session ? session.type : "deep", durationMin: session ? session.durationMin : 50 });
    });
    overlay.querySelector("#fo-fin").addEventListener("click", finish);
    show();
  }

  // ---------- PARKED REVIEW / FINISH ----------
  function openParked(fromSetup) {
    const list = KF.store.parked();
    panel(`
      <div class="fo-kicker">parked while you worked</div>
      <h2 class="fo-h">${list.length ? "Here's what you set aside." : "Nothing parked. Clean slate."}</h2>
      <p class="fo-fine">${list.length ? "Now — on your own terms, batched — decide what actually needs you. Most of it won't." : ""}</p>
      <ul class="fo-parked">
        ${list.map((p, i) => `<li><span>${p.text.replace(/</g, "&lt;")}</span><button class="fo-x" data-i="${i}">done</button></li>`).join("")}
      </ul>
      <div class="fo-actions">
        ${list.length ? `<button class="fo-ghost" id="fo-clear">clear all</button>` : ""}
        <button class="fo-cta" id="fo-close">${fromSetup ? "back" : "close"}</button>
      </div>`);
    overlay.querySelectorAll(".fo-x").forEach((b) => b.addEventListener("click", () => { KF.store.unpark(+b.dataset.i); openParked(fromSetup); }));
    const clear = overlay.querySelector("#fo-clear");
    if (clear) clear.addEventListener("click", () => { KF.store.clearParked(); openParked(fromSetup); });
    overlay.querySelector("#fo-close").addEventListener("click", () => { fromSetup ? openSetup() : exitFocus(); });
    show();
  }

  function finish() {
    if (KF.store.parked().length) { state = "done"; openParked(false); }
    else exitFocus();
  }

  function exitFocus() {
    state = "idle";
    session = null; brk = null;
    if (interval) clearInterval(interval), (interval = null);
    if (overlay._cueTimer) clearInterval(overlay._cueTimer), (overlay._cueTimer = null);
    if (sighRAF) cancelAnimationFrame(sighRAF), (sighRAF = null);
    document.body.classList.remove("focusing", "resting");
    hud.classList.remove("show", "overtime", "on-break");
    nudge.classList.remove("show");
    hide();
    if (toggle) toggle.classList.remove("active");
  }

  KF.focus = { open: openSetup, exit: exitFocus, isActive: () => state !== "idle" };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
