# Stillpoint

*the still point of the turning world*

A wordless, slow place to go whenever you need to refocus. No accounts, no
notifications, no goals, no score — and nothing to *read*, because when your
attention is frayed the last thing you want is more words.

Instead it's a small planetarium of real mathematics: a handful of deep
generative and physical simulations, each mesmerizing enough to quiet a busy
mind, each gently *influenced* by your touch rather than "played." You drift
between them slowly and watch.

Built for a technical brain at the end of its rope: nothing here is dumbed down,
nothing here is urgent, and nothing here asks anything of you.

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

Press **begin**, and drift.

---

## The rooms

Six simulations, all wordless and slow. Each is the *real* thing, not a cartoon of it.

| Room | What it actually is | Touch does |
|------|---------------------|------------|
| **Flow** | A curl-noise flow field — thousands of luminous motes carried along an invisible, slowly-turning vector field | Stirs a slow eddy into the current |
| **Ink** | Jos Stam's *stable fluids* — a real, unconditionally-stable Navier–Stokes solver | Pushes the fluid; dye curls through the velocity field |
| **Bloom** | The Gray–Scott reaction–diffusion system — two chemicals whose arithmetic grows coral, labyrinths, mitosis (Turing patterns) | Seeds the pattern; it grows on its own |
| **Swarm** | The Physarum slime-mould model — each agent only smells the trail ahead and turns toward it, yet thousands weave living networks | Lays down food; the swarm reaches for it |
| **Cymatics** | Chladni figures — sand on a vibrating plate settling onto the nodal lines of the plate's eigenmodes | Changes the note; the pattern re-forms |
| **Attractor** | The Aizawa strange attractor — three coupled ODEs whose solution never repeats yet never escapes, traced into a luminous ribbon | Turns it in your hands |

Every touch, anywhere, makes a soft pentatonic note — so nothing you do can sound wrong.

---

## Focus mode — work without checking email

Click the **◎** in the top-right to start a *working session*. This turns Stillpoint
from an ambient place to drift into a tool that holds your attention away from inboxes —
and gives you the *right kind* of break when you stop. It's built on the focus-reset
research: the real enemy of focus is opening new loops mid-session, and the best breaks
are the ones that close loops rather than open them.

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
- **1–6** — jump straight to a room
- **m** — mute / unmute
- **f** — fullscreen

Each room is bookmarkable: `…/index.html#bloom` opens straight into Bloom.

---

## Making it your refocus button

A few ways to have it one click away whenever your attention frays:

- **Bookmark** `index.html` (or a specific room, e.g. `#flow`) on your toolbar.
- **Host it** for free on GitHub Pages, Netlify, or Vercel — drop the folder in and
  you get a URL you can open anywhere, on any device.
- **Make it your new-tab page** with a "custom new tab URL" browser extension, pointed
  at your hosted URL — so a fresh tab *is* the still point.

---

## Under the hood

Plain HTML, CSS, and vanilla JavaScript — no framework, no dependencies, no tracking.
Loaded as classic scripts so it works straight from `file://`. The grid-based
simulations (Ink, Bloom, Swarm, Cymatics) run on typed arrays at a downsampled
resolution and scale up, so they stay smooth.

```
index.html
css/styles.css
js/
  core.js        small utilities + namespace
  store.js       local store for the focus loop (parked thoughts)
  audio.js       gentle pentatonic synth (Web Audio)
  ambient.js     starfield + soft click ripples
  app.js         rooms, dock, render loop, the opening veil
  focus.js       the Focus Loop (sessions, the Valve, break router)
  scenes/        flow · ink · bloom · swarm · cymatics · attractor
```

Add a room by registering `KF.scenes.yourRoom = { name, hint, type:'canvas',
enter, frame, resize, pointerdown, … }` and adding its key to `ORDER` in `js/app.js`.
