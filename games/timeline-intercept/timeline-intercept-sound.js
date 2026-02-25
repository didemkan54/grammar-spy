/**
 * Timeline Intercept sound controller.
 * Uses subtle synthesized tones by default.
 * Placeholder asset paths are reserved for future real sound replacement.
 */
export class TimelineInterceptSound {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.placeholderAssets = {
      click: "../../assets/sounds/soft-click.placeholder",
      correct: "../../assets/sounds/correct-chime.placeholder",
      fail: "../../assets/sounds/fail-tap.placeholder",
      drag: "../../assets/sounds/drag-whoosh.placeholder"
    };
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  playClick() {
    this.playTone({ freq: 380, duration: 0.045, type: "triangle", gain: 0.04 });
  }

  playDrag() {
    this.playSweep({ start: 260, end: 420, duration: 0.08, gain: 0.025 });
  }

  playCorrect() {
    this.playChord([
      { freq: 440, duration: 0.11, gain: 0.04 },
      { freq: 554, duration: 0.12, gain: 0.035 }
    ]);
  }

  playFail() {
    this.playTone({ freq: 180, duration: 0.12, type: "sine", gain: 0.038 });
  }

  playTone({ freq, duration, type, gain }) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(gain || 0.03, ctx.currentTime + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  playSweep({ start, end, duration, gain }) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(start, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + duration);

    amp.gain.setValueAtTime(0.0001, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(gain || 0.02, ctx.currentTime + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  playChord(tones) {
    if (!this.enabled) return;
    tones.forEach((tone, idx) => {
      window.setTimeout(() => this.playTone(tone), idx * 22);
    });
  }
}
