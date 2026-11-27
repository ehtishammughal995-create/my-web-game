// Synthesized Web Audio API musical engine with soft compressor for rich, non-clipping cascades
import { DEFAULT_SOUNDSCAPE_CONFIG } from '../game/cosmetics';
import { ChimeVoiceId, SoundscapeMixerConfig } from '../game/types';

const PENTATONIC_FREQS = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.0,  // A5
  1046.5, // C6
  1174.66,// D6
  1318.51,// E6
  1567.98,// G6
  1760.0, // A6
  2093.0, // C7
];

interface AmbientGraph {
  masterGain: GainNode;
  rainGain: GainNode;
  windGain: GainNode;
  spaceGain: GainNode;
  crystalGain: GainNode;
}

export type HapticCue = 'bounce' | 'collision' | 'chime' | 'explosion' | 'pickup';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: AudioNode | null = null;
  private muted = false;
  private lastNoteTime = 0;
  private lastLaserTime = 0;
  private lastChimeTime = 0;
  private lastTrackTime = 0;
  private hapticListener: ((cue: HapticCue) => void) | null = null;

  private soundscapeConfig: SoundscapeMixerConfig = {
    ...DEFAULT_SOUNDSCAPE_CONFIG,
    layers: { ...DEFAULT_SOUNDSCAPE_CONFIG.layers },
  };
  private ambientGraph: AmbientGraph | null = null;
  private ambientTimerId: number | null = null;

  public setHapticListener(listener: ((cue: HapticCue) => void) | null) {
    this.hapticListener = listener;
  }

  private emitHaptic(cue: HapticCue) {
    this.hapticListener?.(cue);
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.75, this.ctx.currentTime);

      compressor.connect(master);
      master.connect(this.ctx.destination);
      this.masterGain = compressor;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureOutput(): { ctx: AudioContext; out: AudioNode } | null {
    if (this.muted) return null;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return null;
    return { ctx, out: this.masterGain };
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
        b6 = white * 0.115926;
        data[i] = Math.max(-0.95, Math.min(0.95, pink));
      }
      // Crossfade loop ends for click-free looping
      const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
      for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        const tailIdx = length - fadeSamples + i;
        const blended = data[tailIdx] * (1 - t) + data[i] * t;
        data[i] = blended;
        data[tailIdx] = blended;
      }
    }
    return buffer;
  }

  private initAmbientGraph(ctx: AudioContext): AmbientGraph {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.connect(ctx.destination);

    const pinkBuffer = this.createPinkNoiseBuffer(ctx, 3.5);

    // 1. Rain layer: filtered noise bed
    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0, now);
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = pinkBuffer;
    rainSrc.loop = true;
    const rainLp = ctx.createBiquadFilter();
    rainLp.type = 'lowpass';
    rainLp.frequency.setValueAtTime(2100, now);
    const rainHp = ctx.createBiquadFilter();
    rainHp.type = 'highpass';
    rainHp.frequency.setValueAtTime(240, now);
    rainSrc.connect(rainHp);
    rainHp.connect(rainLp);
    rainLp.connect(rainGain);
    rainGain.connect(masterGain);
    rainSrc.start(now);

    // 2. Cosmic Wind layer: dual sweeping bandpass noise with slow LFOs
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0, now);
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = pinkBuffer;
    windSrc.loop = true;
    const windBpA = ctx.createBiquadFilter();
    windBpA.type = 'bandpass';
    windBpA.frequency.setValueAtTime(340, now);
    windBpA.Q.setValueAtTime(2.6, now);
    const windBpB = ctx.createBiquadFilter();
    windBpB.type = 'bandpass';
    windBpB.frequency.setValueAtTime(620, now);
    windBpB.Q.setValueAtTime(3.1, now);

    const lfoA = ctx.createOscillator();
    lfoA.type = 'sine';
    lfoA.frequency.setValueAtTime(0.09, now);
    const lfoAGain = ctx.createGain();
    lfoAGain.gain.setValueAtTime(160, now);
    lfoA.connect(lfoAGain);
    lfoAGain.connect(windBpA.frequency);

    const lfoB = ctx.createOscillator();
    lfoB.type = 'sine';
    lfoB.frequency.setValueAtTime(0.14, now);
    const lfoBGain = ctx.createGain();
    lfoBGain.gain.setValueAtTime(220, now);
    lfoB.connect(lfoBGain);
    lfoBGain.connect(windBpB.frequency);

    windSrc.connect(windBpA);
    windSrc.connect(windBpB);
    windBpA.connect(windGain);
    windBpB.connect(windGain);
    windGain.connect(masterGain);
    windSrc.start(now);
    lfoA.start(now);
    lfoB.start(now);

    // 3. Deep Space layer: warm breathing C2-G2-D3-G3 sub-harmonic drone
    const spaceGain = ctx.createGain();
    spaceGain.gain.setValueAtTime(0, now);
    const spaceLp = ctx.createBiquadFilter();
    spaceLp.type = 'lowpass';
    spaceLp.frequency.setValueAtTime(240, now);
    spaceLp.Q.setValueAtTime(1.2, now);

    const spaceLfo = ctx.createOscillator();
    spaceLfo.type = 'sine';
    spaceLfo.frequency.setValueAtTime(0.065, now);
    const spaceLfoGain = ctx.createGain();
    spaceLfoGain.gain.setValueAtTime(95, now);
    spaceLfo.connect(spaceLfoGain);
    spaceLfoGain.connect(spaceLp.frequency);

    const spaceFreqs: Array<{ freq: number; type: OscillatorType; amp: number }> = [
      { freq: 65.41, type: 'sine', amp: 0.34 },
      { freq: 98.0, type: 'triangle', amp: 0.16 },
      { freq: 130.81, type: 'sine', amp: 0.18 },
      { freq: 146.83, type: 'sine', amp: 0.11 },
      { freq: 196.0, type: 'sine', amp: 0.08 },
    ];
    for (const voice of spaceFreqs) {
      const osc = ctx.createOscillator();
      const vGain = ctx.createGain();
      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.freq, now);
      vGain.gain.setValueAtTime(voice.amp, now);
      osc.connect(vGain);
      vGain.connect(spaceLp);
      osc.start(now);
    }
    spaceLp.connect(spaceGain);
    spaceGain.connect(masterGain);
    spaceLfo.start(now);

    // 4. Crystal Chimes layer: soft airy shimmer bed + scheduled wind chimes
    const crystalGain = ctx.createGain();
    crystalGain.gain.setValueAtTime(0, now);
    const shimmerOsc = ctx.createOscillator();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(261.63, now);
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.04, now);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(crystalGain);
    crystalGain.connect(masterGain);
    shimmerOsc.start(now);

    this.startAmbientMicroEvents();
    return {
      masterGain,
      rainGain,
      windGain,
      spaceGain,
      crystalGain,
    };
  }

  private startAmbientMicroEvents() {
    if (this.ambientTimerId !== null || typeof window === 'undefined') return;
    this.ambientTimerId = window.setInterval(() => {
      if (this.muted || !this.soundscapeConfig.enabled) return;
      const ctx = this.ctx;
      const g = this.ambientGraph;
      if (!ctx || !g || ctx.state !== 'running') return;

      const rainAmt = this.soundscapeConfig.layers.rain;
      if (rainAmt > 0.12 && Math.random() < 0.42 * rainAmt) {
        const now = ctx.currentTime;
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const base = 740 + Math.random() * 1450;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(base, now);
        dropOsc.frequency.exponentialRampToValueAtTime(base * 1.38, now + 0.045);
        dropGain.gain.setValueAtTime(0.0001, now);
        dropGain.gain.linearRampToValueAtTime(0.028 * rainAmt, now + 0.006);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        dropOsc.connect(dropGain);
        dropGain.connect(g.masterGain);
        dropOsc.start(now);
        dropOsc.stop(now + 0.09);
      }

      const crystalAmt = this.soundscapeConfig.layers.crystalStream;
      if (crystalAmt > 0.1 && Math.random() < 0.28 * crystalAmt) {
        const now = ctx.currentTime;
        const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1318.51];
        const freq = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.036 * crystalAmt, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
        osc.connect(gain);
        gain.connect(g.masterGain);
        osc.start(now);
        osc.stop(now + 1.5);
      }
    }, 360);
  }

  private applyAmbientLevels(initializeIfEnabled: boolean) {
    const shouldPlay = !this.muted && this.soundscapeConfig.enabled;
    if (!this.ambientGraph && shouldPlay && initializeIfEnabled) {
      const ctx = this.ensureContext();
      if (ctx) {
        this.ambientGraph = this.initAmbientGraph(ctx);
      }
    }
    if (!this.ctx || !this.ambientGraph) return;
    const now = this.ctx.currentTime;
    const g = this.ambientGraph;
    const cfg = this.soundscapeConfig;
    const targetMaster = shouldPlay ? cfg.masterVolume * 0.45 : 0;

    g.masterGain.gain.setTargetAtTime(targetMaster, now, 0.15);
    g.rainGain.gain.setTargetAtTime(cfg.layers.rain * 0.34, now, 0.14);
    g.windGain.gain.setTargetAtTime(cfg.layers.cosmicWind * 0.42, now, 0.14);
    g.spaceGain.gain.setTargetAtTime(cfg.layers.deepSpace * 0.4, now, 0.16);
    g.crystalGain.gain.setTargetAtTime(cfg.layers.crystalStream * 0.25, now, 0.14);
  }

  public setSoundscapeConfig(config: SoundscapeMixerConfig, fromUserGesture = false) {
    this.soundscapeConfig = {
      enabled: config.enabled,
      masterVolume: config.masterVolume,
      layers: { ...config.layers },
    };
    this.applyAmbientLevels(fromUserGesture);
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    this.applyAmbientLevels(false);
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public unlock() {
    this.ensureOutput();
    this.applyAmbientLevels(true);
  }

  public playLaunch() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playPegHit(combo: number, isAccent: boolean) {
    this.emitHaptic(isAccent ? 'collision' : 'bounce');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastNoteTime < 0.022) return;
    this.lastNoteTime = now;

    const noteIdx = Math.abs(combo) % PENTATONIC_FREQS.length;
    const baseFreq = PENTATONIC_FREQS[noteIdx];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isAccent ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    const peak = isAccent ? 0.15 : 0.085;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isAccent ? 0.24 : 0.15));

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playBlockBreak(combo: number) {
    this.emitHaptic('collision');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const noteIdx = Math.min(
      PENTATONIC_FREQS.length - 1,
      5 + (Math.abs(combo) % 10)
    );
    const freq = PENTATONIC_FREQS[noteIdx];

    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.05, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    overtone.connect(oGain);
    oGain.connect(gain);
    gain.connect(out);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.24);
    overtone.stop(now + 0.24);
  }

  public playBombExplosion() {
    this.emitHaptic('explosion');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    // Sub-bass drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.32);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.36);

    // Filtered noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.24);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + 0.24);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.22, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(out);
    noise.start(now);
  }

  public playLaser() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastLaserTime < 0.05) return;
    this.lastLaserTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.13);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playPickup() {
    this.emitHaptic('pickup');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    [659.25, 987.77].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  public playRingBreak(ringIndex: number) {
    this.emitHaptic('collision');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const base = PENTATONIC_FREQS[Math.min(PENTATONIC_FREQS.length - 3, 5 + ringIndex)];
    [base, base * 1.25, base * 1.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.032;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  public playBumper() {
    this.emitHaptic('collision');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.13);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playSpring() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.15);
    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playSplitter() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    [659.25, 987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.03;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  public playPortal() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.16);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playBucketCatch() {
    this.emitHaptic('pickup');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playStageClear() {
    this.emitHaptic('chime');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.065;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.44);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  public playAsmrRingTap(ringIdx: number, eerie: boolean) {
    this.emitHaptic('chime');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastNoteTime < 0.024) return;
    this.lastNoteTime = now;

    // Eerie harmonic minor/diminished intervals vs soothing crystal pentatonic
    const EERIE_FREQS = [220.0, 246.94, 261.63, 311.13, 329.63, 415.3, 440.0, 523.25, 622.25, 659.25, 830.61];
    const table = eerie ? EERIE_FREQS : PENTATONIC_FREQS;
    const freq = table[Math.abs(ringIdx) % table.length];

    const osc = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const gain = ctx.createGain();
    const sGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    shimmer.type = eerie ? 'triangle' : 'sine';
    shimmer.frequency.setValueAtTime(freq * (eerie ? 1.498 : 2), now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.095, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    sGain.gain.setValueAtTime(0.035, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    shimmer.connect(sGain);
    sGain.connect(gain);
    gain.connect(out);

    osc.start(now);
    shimmer.start(now);
    osc.stop(now + 0.36);
    shimmer.stop(now + 0.36);
  }

  public playComboExplosion(isMajor25: boolean) {
    this.emitHaptic('explosion');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const notes = isMajor25
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
      : [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.035;
      osc.type = isMajor25 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(isMajor25 ? 0.14 : 0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isMajor25 ? 0.48 : 0.3));
      osc.connect(gain);
      gain.connect(out);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  public playPlaceToy() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playChimeSpawn() {
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.045);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playChimeNote(freq: number, voice: ChimeVoiceId, intensity = 0.85) {
    this.emitHaptic('chime');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastChimeTime < 0.014) return;
    this.lastChimeTime = now;

    const amp = Math.max(0.25, Math.min(1.15, intensity));

    if (voice === 'kalimba') {
      const osc = ctx.createOscillator();
      const tine = ctx.createOscillator();
      const gain = ctx.createGain();
      const tGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      tine.type = 'triangle';
      tine.frequency.setValueAtTime(freq * 2.756, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.125 * amp, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);

      tGain.gain.setValueAtTime(0.04 * amp, now);
      tGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.07);

      osc.connect(gain);
      tine.connect(tGain);
      tGain.connect(gain);
      gain.connect(out);

      osc.start(now);
      tine.start(now);
      osc.stop(now + 0.44);
      tine.stop(now + 0.1);
    } else if (voice === 'marimba') {
      const osc = ctx.createOscillator();
      const wood = ctx.createOscillator();
      const gain = ctx.createGain();
      const wGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      wood.type = 'sine';
      wood.frequency.setValueAtTime(freq * 4, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.145 * amp, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.34);

      wGain.gain.setValueAtTime(0.055 * amp, now);
      wGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);

      osc.connect(gain);
      wood.connect(wGain);
      wGain.connect(gain);
      gain.connect(out);

      osc.start(now);
      wood.start(now);
      osc.stop(now + 0.36);
      wood.stop(now + 0.06);
    } else if (voice === 'glass') {
      const osc = ctx.createOscillator();
      const shimmer = ctx.createOscillator();
      const gain = ctx.createGain();
      const sGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2.004, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.105 * amp, now + 0.016);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.62);

      sGain.gain.setValueAtTime(0.045 * amp, now);
      sGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.36);

      osc.connect(gain);
      shimmer.connect(sGain);
      sGain.connect(gain);
      gain.connect(out);

      osc.start(now);
      shimmer.start(now);
      osc.stop(now + 0.64);
      shimmer.stop(now + 0.4);
    } else {
      // Singing Bowl: lush fundamental + gentle chorus + bronze partial
      const osc = ctx.createOscillator();
      const beat = ctx.createOscillator();
      const partial = ctx.createOscillator();
      const gain = ctx.createGain();
      const pGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      beat.type = 'sine';
      beat.frequency.setValueAtTime(freq * 1.005, now);
      partial.type = 'sine';
      partial.frequency.setValueAtTime(freq * 2.76, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.095 * amp, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.95);

      pGain.gain.setValueAtTime(0.028 * amp, now);
      pGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

      osc.connect(gain);
      beat.connect(gain);
      partial.connect(pGain);
      pGain.connect(gain);
      gain.connect(out);

      osc.start(now);
      beat.start(now);
      partial.start(now);
      osc.stop(now + 0.98);
      beat.stop(now + 0.98);
      partial.stop(now + 0.48);
    }
  }

  public playTrackWoodTap(noteIndex: number, intensity = 0.75) {
    this.emitHaptic('bounce');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastTrackTime < 0.02) return;
    this.lastTrackTime = now;

    const freq = PENTATONIC_FREQS[Math.abs(noteIndex) % PENTATONIC_FREQS.length];
    const amp = Math.max(0.25, Math.min(1, intensity));

    // Warm wooden xylophone / glass marble click
    const osc = ctx.createOscillator();
    const body = ctx.createOscillator();
    const gain = ctx.createGain();
    const bGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    body.type = 'triangle';
    body.frequency.setValueAtTime(freq * 2.98, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.115 * amp, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.24);

    bGain.gain.setValueAtTime(0.045 * amp, now);
    bGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.042);

    osc.connect(gain);
    body.connect(bGain);
    bGain.connect(gain);
    gain.connect(out);

    osc.start(now);
    body.start(now);
    osc.stop(now + 0.26);
    body.stop(now + 0.055);
  }

  public playSeesawTip() {
    this.emitHaptic('collision');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(145, now + 0.065);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playWaterDrop(noteIndex = 0, intensity = 0.7) {
    this.emitHaptic('chime');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastChimeTime < 0.032) return;
    this.lastChimeTime = now;

    const baseFreq = PENTATONIC_FREQS[Math.abs(noteIndex) % PENTATONIC_FREQS.length];
    const amp = Math.max(0.25, Math.min(1, intensity));

    // Classic ASMR water droplet upward pitch chirp + delicate bell tail
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(baseFreq * 0.78, now);
    dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.48, now + 0.065);

    dropGain.gain.setValueAtTime(0.001, now);
    dropGain.gain.linearRampToValueAtTime(0.115 * amp, now + 0.008);
    dropGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

    dropOsc.connect(dropGain);
    dropGain.connect(out);
    dropOsc.start(now);
    dropOsc.stop(now + 0.16);

    // Soft resonant water-marimba shimmer
    const ringOsc = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(baseFreq, now + 0.01);
    ringGain.gain.setValueAtTime(0.001, now + 0.01);
    ringGain.gain.linearRampToValueAtTime(0.055 * amp, now + 0.02);
    ringGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.36);

    ringOsc.connect(ringGain);
    ringGain.connect(out);
    ringOsc.start(now + 0.01);
    ringOsc.stop(now + 0.38);
  }

  public playPendulumClick(noteIndex = 0, isSteelClack = false, intensity = 0.72) {
    this.emitHaptic(isSteelClack ? 'collision' : 'chime');
    const audio = this.ensureOutput();
    if (!audio) return;
    const { ctx, out } = audio;

    const now = ctx.currentTime;
    if (now - this.lastTrackTime < 0.022) return;
    this.lastTrackTime = now;

    const freq = PENTATONIC_FREQS[Math.abs(noteIndex) % PENTATONIC_FREQS.length];
    const amp = Math.max(0.22, Math.min(1, intensity));

    if (isSteelClack) {
      // Crisp Newton's Cradle sphere clack + faint harmonic shimmer
      const clack = ctx.createOscillator();
      const body = ctx.createOscillator();
      const gain = ctx.createGain();
      const bodyGain = ctx.createGain();

      clack.type = 'triangle';
      clack.frequency.setValueAtTime(1650 + (noteIndex % 5) * 90, now);
      clack.frequency.exponentialRampToValueAtTime(620, now + 0.025);

      body.type = 'sine';
      body.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11 * amp, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);

      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.linearRampToValueAtTime(0.045 * amp, now + 0.004);
      bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);

      clack.connect(gain);
      body.connect(bodyGain);
      gain.connect(out);
      bodyGain.connect(out);

      clack.start(now);
      body.start(now);
      clack.stop(now + 0.055);
      body.stop(now + 0.2);
    } else {
      // Ethereal glass-kalimba resonance for harmonic wave crossings
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();
      const overGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.003, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.085 * amp, now + 0.009);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

      overGain.gain.setValueAtTime(0.025 * amp, now);
      overGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);

      osc.connect(gain);
      overtone.connect(overGain);
      overGain.connect(gain);
      gain.connect(out);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.47);
      overtone.stop(now + 0.24);
    }
  }
}

export const soundEngine = new SoundEngine();
