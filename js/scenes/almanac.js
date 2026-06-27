/* Stillpoint — 1826. The news, two hundred years stale, which is the only safe kind.
   Real events of the year, set as a broadsheet. Nothing here can still alarm you. */
(function () {
  const KF = window.KF;
  const C = KF.content;

  let root;

  KF.scenes.almanac = {
    name: "1826",
    hint: "the news, two hundred years stale — the only safe kind",
    type: "dom",

    mount(container) {
      root = document.createElement("div");
      root.className = "almanac scene";
      const inner = document.createElement("div");
      inner.className = "almanac-inner";

      inner.innerHTML =
        `<div class="masthead">` +
        `<h2>The Stillpoint Almanack</h2>` +
        `<div class="line">Two Hundred Years Hence · Anno Domini MDCCCXXVI</div>` +
        `</div>` +
        `<p style="text-align:center;font-style:italic;color:var(--dim);font-family:var(--serif);margin:0 0 30px">` +
        `Dispatches from the year 1826, when none of today's troubles had yet been invented.</p>`;

      for (const d of C.dispatches) {
        const art = document.createElement("article");
        art.className = "dispatch";
        const paras = d.body
          .split(/(?<=\.)\s+(?=[A-Z])/)
          .reduce((acc, s, i) => {
            // group sentences into ~2-sentence paragraphs for an old-print feel
            const gi = (i / 2) | 0;
            acc[gi] = (acc[gi] ? acc[gi] + " " : "") + s;
            return acc;
          }, [])
          .map((p) => `<p>${p}</p>`)
          .join("");
        art.innerHTML =
          `<div class="date">${d.date} · <span class="place">${d.place}</span></div>` +
          `<h3>${d.head}</h3>` + paras;
        inner.appendChild(art);
      }

      const close = document.createElement("p");
      close.style.cssText =
        "text-align:center;font-style:italic;color:var(--faint);font-family:var(--serif);margin:40px 0 0";
      close.textContent = "Here ends the news. Rest now; it has all already happened.";
      inner.appendChild(close);

      root.appendChild(inner);
      container.appendChild(root);
    },

    unmount() { if (root) root.remove(); root = null; },
  };
})();
