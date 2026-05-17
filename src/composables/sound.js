let ctx = null;
function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone({ freq, dur = 0.12, type = "sine", gain = 0.18, attack = 0.005, release = 0.05, when = 0 }) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.setValueAtTime(gain, t0 + dur - release);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function slide({ from, to, dur = 0.25, type = "sawtooth", gain = 0.14 }) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const Sound = {
  key: () => tone({ freq: 660, dur: 0.07, type: "triangle", gain: 0.12 }),
  del: () => tone({ freq: 320, dur: 0.08, type: "triangle", gain: 0.12 }),
  correct: () => {
    tone({ freq: 523.25, dur: 0.14, type: "triangle", gain: 0.18, when: 0 });
    tone({ freq: 659.25, dur: 0.14, type: "triangle", gain: 0.18, when: 0.09 });
    tone({ freq: 783.99, dur: 0.14, type: "triangle", gain: 0.18, when: 0.18 });
    tone({ freq: 1046.5, dur: 0.32, type: "triangle", gain: 0.2, when: 0.27 });
  },
  wrong: () => {
    slide({ from: 380, to: 180, dur: 0.32, type: "square", gain: 0.12 });
  },
  next: () => {
    tone({ freq: 880, dur: 0.06, type: "sine", gain: 0.1, when: 0 });
    tone({ freq: 1175, dur: 0.08, type: "sine", gain: 0.1, when: 0.06 });
  },
  tab: () => tone({ freq: 520, dur: 0.07, type: "sine", gain: 0.1 }),
  locked: () => {
    tone({ freq: 260, dur: 0.08, type: "square", gain: 0.1, when: 0 });
    tone({ freq: 220, dur: 0.1, type: "square", gain: 0.1, when: 0.08 });
  },
};
