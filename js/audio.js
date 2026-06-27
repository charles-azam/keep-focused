/* Stillpoint — a gentle synth. Every interaction plays a soft, in-tune note.
   Pentatonic, so layered taps can never sound wrong. */
(function () {
  const KF = window.KF;
  const A = (KF.audio = {});

  let ctx = null,
    master = null,
    delay = null,
    fb = null,
    wet = null,
    started = false,
    muted = false;

  // C major pentatonic across three octaves (Hz)
  const SCALE = [
    130.81, 146.83, 164.81, 196.0, 220.0, // C3 D3 E3 G3 A3
    261.63, 293.66, 329.63, 392.0, 440.0, // C4 D4 E4 G4 A4
    523.25, 587.33, 659.25, 783.99, 880.0, // C5 D5 E5 G5 A5
  ];

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0;
    // a small feedback delay for air/space
    delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.33;
    fb = ctx.createGain();
    fb.gain.value = 0.32;
    wet = ctx.createGain();
    wet.gain.value = 0.3;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    master.connect(ctx.destination);
  }

  A.start = function () {
    ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    started = true;
    // ease master up
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, now + 1.5);
  };

  A.setMuted = function (m) {
    muted = m;
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(m ? 0 : 0.9, now + 0.4);
  };
  A.isMuted = () => muted;

  // a single soft voice; degree 0..1 maps low->high
  A.note = function (degree, opts) {
    if (ctx && ctx.state === "suspended") ctx.resume();
    if (!started || !ctx || muted) return;
    opts = opts || {};
    const i = KF.util.clamp(Math.round(degree * (SCALE.length - 1)), 0, SCALE.length - 1);
    const freq = SCALE[i] * (opts.octave ? Math.pow(2, opts.octave) : 1);
    const t = ctx.currentTime;
    const vel = opts.vel == null ? 0.5 : opts.vel;

    const g = ctx.createGain();
    g.gain.value = 0;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400 + freq * 2;
    lp.Q.value = 0.4;

    // two slightly-detuned oscillators -> warmth
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = opts.type || "triangle";
    o2.type = "sine";
    o1.frequency.value = freq;
    o2.frequency.value = freq * 1.005;

    o1.connect(g);
    o2.connect(g);
    g.connect(lp);
    lp.connect(master);
    lp.connect(delay);

    const peak = 0.16 * vel;
    const dur = opts.dur || 1.8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  };

  // convenience: tap at screen y -> pitch (higher = higher)
  A.tap = function (y, vel) {
    const h = window.innerHeight;
    A.note(1 - KF.util.clamp(y / h, 0, 1), { vel: vel || 0.5 });
  };

  // a soft low swell (used on room change / breath)
  A.swell = function (degree) {
    if (!started || !ctx || muted) return;
    const t = ctx.currentTime;
    const freq = SCALE[KF.util.clamp(Math.round((degree || 0.2) * 6), 0, 6)] / 2;
    const g = ctx.createGain();
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o.type = "sine";
    o2.type = "sine";
    o.frequency.value = freq;
    o2.frequency.value = freq * 1.5; // a fifth
    o.connect(g);
    o2.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.07, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
    o.start(t);
    o2.start(t);
    o.stop(t + 3.7);
    o2.stop(t + 3.7);
  };
})();
