# Stillpoint

*the still point of the turning world*

A quiet place to go whenever you need to refocus. No accounts, no notifications, no
goals, no score. Just a handful of calm rooms you drift between — physics toys that
turn for their own sake, an empty feed that asks nothing of you, two-hundred-year-old
news, and high-level science facts that surface gently and dissolve.

It is built for a technical brain at the end of its rope: nothing here is dumbed down,
and nothing here is urgent.

---

## How to open it

**The simplest way:** double-click `index.html`. It runs entirely in the browser from
a single folder — no build step, no server, no install. (An internet connection just
loads the typefaces; everything else is offline.)

**For the smoothest experience**, serve the folder so the browser treats it as a real
site:

```bash
cd keep-focused
python3 -m http.server 8765
# then open http://localhost:8765
```

Press **begin**, find a breath, and wander.

---

## The rooms

| Room | What it is |
|------|------------|
| **Drift** | A breath to follow. Fireflies shy away from your cursor; touch anywhere to release an ember. |
| **Orrery** | A solar system that turns for no reason. Inner planets hurry, outer ones brood. Touch to set a new comet turning at that radius (Kepler's law: ω ∝ r^−3⁄2). |
| **Pendulum** | A pendulum wave — each bob a hair slower than its neighbour, so the line dissolves into travelling waves and re-assembles. Touch to release them together. |
| **Gravity** | A softened, damped n-body sandbox. A cloud of motes; touch to place a mass and watch them ribbon into orbits. |
| **Pond** | A real height-field wave simulation. Drop stones and watch the rings *interfere*. Rain falls on its own. |
| **Garden** | A moonlit zen garden. Drag to rake grooves; tap to set down a smooth stone. |
| **Cairn** | Stack pebbles into little balancing towers. They never topple, and each landing rings a note that climbs with the tower. |
| **Feed** | The shape of a doomscroll, emptied of dread. Scroll forever; nothing happens, nothing is owed. |
| **1826** | The news, two hundred years stale — the only safe kind. Real dispatches from the year, set as a broadsheet. |

Science facts (Noether's theorem, the Carnot bound, ATP synthase, the Chandrasekhar
limit, …) and the occasional nature note drift in over any room, then fade. Touch one
to let it go.

Every click, anywhere, makes a soft pentatonic note — so nothing you do can sound wrong.

---

## Focus mode — work without checking email

Click the **◎** in the top-right to start a *working session*. This turns Stillpoint
from an ambient place to wander into a tool that holds your attention away from inboxes —
and gives you the *right kind* of break when you stop. It's built on the focus-reset
research (see `RESEARCH.md` if you generate it): the real enemy of focus is opening new
loops mid-session, and the best breaks are the ones that close loops rather than open them.

The loop: **Arrive → Work → (the Valve) → Break → Return.**

- **Arrive** — name your intent in one line and pick the kind of work (deep/cognitive vs
  lighter/admin) and a duration. The timer is a *gentle guide, not an alarm* — when it
  elapses it simply suggests a pause; you stop when you're ready.
- **The Valve** ⭐ — the moment you feel the pull to check email/Slack/news, hit
  **"about to check?"**. Instead of the inbox you get a **90-second physiological sigh**
  (the fastest evidence-backed way to drop arousal) and a box to **park the thought** —
  so the loop is closed *without* opening the real one. Nothing gets lost; nothing
  hijacks you.
- **Break** — at the end of a block, Stillpoint recommends a break *matched to how
  depleting the work was*: a short NSDR-style **rest**, a screen-free **step away**, a
  **wander** through a calm room, or a quick **90-second sigh**. Long, demanding work gets
  pushed toward a longer, non-cognitive break — because that's what the evidence supports.
  The one rule on every break screen: *don't open a feed or an inbox.*
- **Return** — everything you parked is shown back to you **only when you choose** (end of
  a session, or "review parked"), so you process it batched, on your own terms. Most of it,
  it turns out, never needed you.

It's all stored locally (no accounts, no network). Nothing you park leaves your machine.

---

## Keys

- **← → ↑ ↓** — move between rooms
- **1–9** — jump straight to a room
- **m** — mute / unmute
- **f** — fullscreen

Each room is bookmarkable: `…/index.html#pond` opens straight into the pond.

---

## Making it your refocus button

A few ways to have it one click away whenever your attention frays:

- **Bookmark** `index.html` (or a specific room, e.g. `#drift`) on your toolbar.
- **Host it** for free on GitHub Pages, Netlify, or Vercel — drop the folder in and
  you get a URL you can open anywhere, on any device.
- **Make it your new-tab page** with a "custom new tab URL" browser extension, pointed
  at your hosted URL — so a fresh tab *is* the still point.

---

## Under the hood

Plain HTML, CSS, and vanilla JavaScript — no framework, no dependencies, no tracking.
Loaded as classic scripts so it works straight from `file://`.

```
index.html
css/styles.css
js/
  core.js        small utilities + namespace
  audio.js       gentle pentatonic synth (Web Audio)
  content.js     the facts, the 1826 dispatches, the feed's murmurs
  ambient.js     starfield + global click ripples
  cards.js       the drifting fact / dispatch cards
  app.js         rooms, dock, render loop, the opening veil
  scenes/        drift · orrery · pendulum · gravity · pond · garden · cairn · feed · almanac
```

Add a fact by appending to `KF.content.facts` in `js/content.js`. Add a room by
registering `KF.scenes.yourRoom = { … }` and adding its key to `ORDER` in `js/app.js`.
