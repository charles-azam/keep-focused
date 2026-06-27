/* Stillpoint — FEED. The shape of doomscroll, emptied of dread. You may scroll forever;
   nothing happens, nothing is owed, and now and then a line gives you permission to rest. */
(function () {
  const KF = window.KF;
  const U = KF.util;
  const C = KF.content;

  const nextMurmur = U.bag(C.murmurs);
  const nextNature = U.bag(C.nature);
  const nextFact = U.bag(C.facts);

  let wrap, col, sentinel, onScroll;

  function skeleton() {
    const p = document.createElement("div");
    p.className = "post";
    const lines = 1 + ((Math.random() * 3) | 0);
    let body = "";
    for (let i = 0; i < lines; i++) {
      const w = 50 + ((Math.random() * 50) | 0);
      body += `<div class="body-line" style="width:${w}%"></div>`;
    }
    p.innerHTML =
      `<div class="row"><div class="av"></div><div><div class="meta"></div>` +
      `<div class="meta sm" style="margin-top:7px"></div></div></div>` +
      body +
      `<div class="actions"><span>♡</span><span>↺</span><span>❝</span><span>⋯</span></div>`;
    return p;
  }

  function note(text, italic) {
    const p = document.createElement("div");
    p.className = "post note";
    p.innerHTML = `<p>${text}</p>`;
    return p;
  }

  function breath() {
    const p = document.createElement("div");
    p.className = "post note";
    p.innerHTML = `<div class="breath-dot"></div><p>breathe, if you like</p>`;
    return p;
  }

  function factCard() {
    const f = nextFact();
    const p = document.createElement("div");
    p.className = "post";
    p.innerHTML =
      `<div class="row"><div class="av" style="background:linear-gradient(135deg,#3a2f1c,#1a2742)"></div>` +
      `<div><div class="meta" style="background:rgba(230,181,114,.4);width:90px"></div>` +
      `<div class="meta sm" style="margin-top:7px;width:50px"></div></div></div>` +
      `<p style="font-family:var(--serif);font-size:15px;line-height:1.55;color:var(--paper-2);margin:0">${f.body}</p>` +
      `<div class="actions"><span>♡</span><span>↺</span><span>❝</span></div>`;
    return p;
  }

  function makeOne() {
    const r = Math.random();
    if (r < 0.5) return skeleton();
    if (r < 0.78) return note(nextMurmur());
    if (r < 0.88) return note('<span style="opacity:.85">' + nextNature() + "</span>", true);
    if (r < 0.95) return factCard();
    return breath();
  }

  function addBatch(n) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) frag.appendChild(makeOne());
    col.insertBefore(frag, sentinel);
  }

  KF.scenes.feed = {
    name: "Feed",
    hint: "scroll as long as you like · there is no bottom, and nothing is due",
    type: "dom",

    mount(container) {
      wrap = document.createElement("div");
      wrap.className = "feed-wrap scene";
      col = document.createElement("div");
      col.className = "feed-col";
      col.innerHTML = `<div class="feed-top">you're all caught up.<br>you always were.</div>`;
      sentinel = document.createElement("div");
      sentinel.style.height = "1px";
      col.appendChild(sentinel);
      wrap.appendChild(col);
      container.appendChild(wrap);

      addBatch(8);

      onScroll = () => {
        if (wrap.scrollTop + wrap.clientHeight > wrap.scrollHeight - 900) addBatch(6);
      };
      wrap.addEventListener("scroll", onScroll, { passive: true });
    },

    unmount() {
      if (wrap) { wrap.removeEventListener("scroll", onScroll); wrap.remove(); }
      wrap = col = sentinel = null;
    },
  };
})();
