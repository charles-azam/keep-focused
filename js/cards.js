/* Stillpoint — cards that drift in with a fact, a dispatch, or a small green thought,
   then dissolve. Click to let one go early. Never more than two at once. */
(function () {
  const KF = window.KF;
  const U = KF.util;
  const C = KF.content;
  const layer = document.getElementById("cards");

  const nextFact = U.bag(C.facts);
  const nextDispatch = U.bag(C.dispatches);
  const nextNature = U.bag(C.nature);

  let alive = 0;
  let paused = false;
  let timer = null;

  function place(card) {
    // choose a side band, avoid brand (top-left) and dock (bottom-center)
    const side = Math.random() < 0.5 ? "left" : "right";
    const w = window.innerWidth;
    const margin = w < 640 ? 14 : Math.max(28, w * 0.04);
    if (side === "left") card.style.left = margin + "px";
    else card.style.right = margin + "px";
    const top = U.rand(0.16, 0.6) * window.innerHeight;
    card.style.top = top + "px";
  }

  function makeFact(f) {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML =
      `<div class="kicker"><span>${f.field}</span><span class="src">a fact</span></div>` +
      `<h3>${f.title}</h3><p>${f.body}</p>` +
      (f.glyph ? `<div class="glyph">${f.glyph}</div>` : "") +
      `<div class="dismiss">touch to let go</div>`;
    return el;
  }

  function makeDispatch(d) {
    const el = document.createElement("article");
    el.className = "card";
    const teaser = d.body.length > 220 ? d.body.slice(0, 210).replace(/\s+\S*$/, "") + "…" : d.body;
    el.innerHTML =
      `<div class="kicker"><span>200 years ago · ${d.date}</span><span class="src">dispatch</span></div>` +
      `<h3>${d.head}</h3><p>${teaser}</p>` +
      `<div class="glyph" style="color:var(--amber)">${d.place}</div>` +
      `<div class="dismiss">touch to let go · or visit 1826</div>`;
    return el;
  }

  function makeNature(line) {
    const el = document.createElement("article");
    el.className = "card";
    el.style.width = "min(300px,72vw)";
    el.innerHTML =
      `<div class="kicker"><span>a small green thought</span><span class="src">∿</span></div>` +
      `<p style="font-style:italic;font-size:16px;line-height:1.5">${line}</p>`;
    return el;
  }

  function spawn() {
    if (paused || alive >= 2 || document.hidden) return schedule();

    const roll = Math.random();
    let el;
    if (roll < 0.6) el = makeFact(nextFact());
    else if (roll < 0.85) el = makeDispatch(nextDispatch());
    else el = makeNature(nextNature());

    place(el);
    layer.appendChild(el);
    alive++;

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));

    let dismissed = false;
    const dwell = U.rand(16000, 26000);
    const leave = () => {
      if (dismissed) return;
      dismissed = true;
      el.classList.remove("in");
      el.classList.add("out");
      setTimeout(() => { el.remove(); alive--; }, 1700);
    };
    el.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      KF.ripple(e.clientX, e.clientY, { col: "230,181,114", max: 50, sparks: 8 });
      if (KF.audio) KF.audio.note(0.7, { vel: 0.4 });
      leave();
    });
    const to = setTimeout(leave, dwell);
    el._cleanup = () => clearTimeout(to);

    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(spawn, U.rand(18000, 34000));
  }

  KF.cards = {
    begin() {
      clearTimeout(timer);
      timer = setTimeout(spawn, 11000); // first one arrives after a settling minute-ish
    },
    pause() { paused = true; },
    resume() { paused = false; },
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && KF.started) schedule();
  });
})();
