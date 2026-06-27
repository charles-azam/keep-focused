/* Stillpoint — tiny local store. Parked thoughts + last session settings.
   Local only, no accounts, no network. */
(function () {
  const KF = window.KF;
  const PFX = "stillpoint:";
  function get(k, def) {
    try { const v = localStorage.getItem(PFX + k); return v == null ? def : JSON.parse(v); }
    catch (e) { return def; }
  }
  function set(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) {} }

  KF.store = {
    get, set,
    parked() { return get("parked", []); },
    park(text) {
      const list = get("parked", []);
      list.push({ t: Date.now(), text: String(text || "").slice(0, 280) });
      set("parked", list);
      return list;
    },
    unpark(i) { const l = get("parked", []); l.splice(i, 1); set("parked", l); return l; },
    clearParked() { set("parked", []); },
    lastSession() { return get("session", { type: "deep", durationMin: 50, intent: "" }); },
    saveSession(s) { set("session", s); },
  };
})();
