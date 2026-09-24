/**
 * Web Audio Procedural Synthesizer & Focus Audio Player
 * Generates ambient soundscapes (Rain, Fireplace, Ocean Waves, Forest Wind, Brown Noise)
 * completely client-side with zero external assets, plus custom file upload support.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSourceNodes: { [key: string]: any } = {};
  private activeSoundId: string | null = null;
  private isPlaying: boolean = false;
  private customAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public playSound(soundId: string, customDataUrl?: string) {
    this.stopSound();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.activeSoundId = soundId;
    this.isPlaying = true;

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.5, this.ctx.currentTime + 1.5);

    if (soundId === 'custom' && customDataUrl) {
      this.playCustomAudio(customDataUrl);
      return;
    }

    switch (soundId) {
      case 'rain':
        this.synthesizeRain();
        break;
      case 'ocean':
        this.synthesizeOcean();
        break;
      case 'fireplace':
        this.synthesizeFireplace();
        break;
      case 'forest':
        this.synthesizeForest();
        break;
      case 'brown_noise':
      default:
        this.synthesizeBrownNoise();
        break;
    }
  }

  private playCustomAudio(dataUrl: string) {
    try {
      this.customAudio = new Audio(dataUrl);
      this.customAudio.loop = true;
      this.customAudio.volume = 0.5;
      this.customAudio.play().catch(e => console.warn('Audio play prevented:', e));
    } catch (err) {
      console.error('Error playing custom audio:', err);
    }
  }

  private synthesizeBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.currentSourceNodes = { source: whiteNoise, filter };
  }

  private synthesizeRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(this.masterGain);
    rainSource.start();

    this.currentSourceNodes = { source: rainSource, filter };
  }

  private synthesizeOcean() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter that modulates with LFO for rolling wave sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.currentSourceNodes = { source: noiseSource, filter, lfo };
  }

  private synthesizeFireplace() {
    if (!this.ctx || !this.masterGain) return;
    // Ambient warm rumble + crackle pops
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Crackle pops
      const isPop = Math.random() < 0.0006;
      output[i] = isPop ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.06;
    }

    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = noiseBuffer;
    fireSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    fireSource.connect(filter);
    filter.connect(this.masterGain);
    fireSource.start();

    this.currentSourceNodes = { source: fireSource, filter };
  }

  private synthesizeForest() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    windSource.connect(filter);
    filter.connect(this.masterGain);

    windSource.start();
    lfo.start();

    this.currentSourceNodes = { source: windSource, filter, lfo };
  }

  public stopSound(fadeDuration: number = 1.0) {
    if (!this.isPlaying) return;

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + fadeDuration);
      } catch (e) {
        // Ignored
      }
    }

    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    setTimeout(() => {
      Object.values(this.currentSourceNodes).forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {
          // Ignored
        }
      });
      this.currentSourceNodes = {};
      this.isPlaying = false;
      this.activeSoundId = null;
    }, fadeDuration * 1000);
  }

  // Play subtle 8-bit sound effects (level up, timer finish, click)
  public playPixelSfx(type: 'click' | 'complete' | 'level_up' | 'emergency') {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'complete') {
      // Cheerful fanfare notes
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
        const noteOsc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, now + index * 0.12);
        noteGain.gain.setValueAtTime(0.2, now + index * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.12 + 0.25);
        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx!.destination);
        noteOsc.start(now + index * 0.12);
        noteOsc.stop(now + index * 0.12 + 0.25);
      });
    } else if (type === 'emergency') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getActiveSoundId() {
    return this.activeSoundId;
  }
}

export const audioEngine = new AudioEngine();
