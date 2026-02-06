
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  
  private bgmAudio: HTMLAudioElement | null = null;
  private revengeAudio: HTMLAudioElement | null = null;
  
  private lastPlayed: Record<string, number> = {};

  /**
   * [BGM 주소 최적화]
   * docs.google.com/uc?id= 형식은 스트리밍 재생에 더 안정적입니다.
   */
  private BGM_URL = "https://docs.google.com/uc?id=1144qRm4_qzDy_-zu47VNRQHszFJqHgV2"; 
  private REVENGE_URL = "https://cdn.pixabay.com/audio/2023/10/24/audio_9678e2d46e.mp3";

  constructor() {
    this.isMuted = false;
    if (typeof window !== 'undefined') {
        this.bgmAudio = new Audio(this.BGM_URL);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.3;
        this.bgmAudio.preload = "auto";
        // CORS 정책 대응
        this.bgmAudio.crossOrigin = "anonymous";

        this.revengeAudio = new Audio(this.REVENGE_URL);
        this.revengeAudio.loop = true;
        this.revengeAudio.volume = 0.4;
        this.revengeAudio.preload = "auto";
        this.revengeAudio.crossOrigin = "anonymous";
    }
  }

  public initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100,
      });
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateMute();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateMute();
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  private updateMute() {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx!.currentTime, 0.05);
    }
    if (this.bgmAudio) this.bgmAudio.muted = this.isMuted;
    if (this.revengeAudio) this.revengeAudio.muted = this.isMuted;
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.1) {
    if (this.isMuted) return;
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + dur);
  }

  playCollect() { this.playTone(880, 0.1, 'square', 0.05); }
  
  playShoot() { 
    const now = Date.now();
    if (now - (this.lastPlayed['shoot'] || 0) < 80) return; 
    this.lastPlayed['shoot'] = now;
    this.playTone(440, 0.05, 'triangle', 0.05); 
  } 

  playHit() { 
    const now = Date.now();
    if (now - (this.lastPlayed['hit'] || 0) < 100) return; 
    this.lastPlayed['hit'] = now;
    this.playTone(110, 0.15, 'sawtooth', 0.15); 
  }

  playCorrect() { 
      this.playTone(523.25, 0.1, 'sine', 0.1); 
      setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.1), 100); 
  }
  playWrong() { this.playTone(150, 0.3, 'sawtooth', 0.1); }
  playGameStart() { 
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => this.playTone(f, 0.2, 'square', 0.1), i * 150));
  }
  playTick() { this.playTone(800, 0.01, 'sine', 0.02); }
  
  playCombo() { 
    this.playTone(523.25, 0.1, 'square', 0.1); 
    setTimeout(() => this.playTone(659.25, 0.1, 'square', 0.1), 80);
    setTimeout(() => this.playTone(783.99, 0.2, 'square', 0.1), 160);
  }

  playCoin() {
    this.playTone(987, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(1318, 0.3, 'sine', 0.1), 50);
  }

  playDamage() {
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx!.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.5);
  }

  playUpgradeSuccess() {
    const notes = [523, 659, 783, 1046];
    notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.4, 'sine', 0.1), i * 150));
  }
  
  playZombieDeath() {
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx!.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.3);
  }

  playThunder() {
    this.initCtx();
    const bufferSize = this.ctx!.sampleRate * 2.0; 
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; 
    }
    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx!.currentTime);
    filter.frequency.linearRampToValueAtTime(100, this.ctx!.currentTime + 2.0);
    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 2.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start();
  }

  playRevengeSuccess() {
    this.initCtx();
    const now = this.ctx!.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.1, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.2);
    });
    setTimeout(() => this.playThunder(), 400);
  }

  playBossWarning() {
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 1);
    osc.frequency.linearRampToValueAtTime(400, now + 2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(now + 2);
  }

  playBossDefeat() {
    this.initCtx();
    this.playThunder();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx!.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx!.currentTime + 2);
    gain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx!.currentTime + 2);
  }

  async startBGM() {
    this.initCtx();
    if (this.bgmAudio) {
        try {
            await this.bgmAudio.play();
        } catch (e) {
            console.warn("Autoplay blocked, waiting for user gesture.");
        }
    }
  }

  stopBGM() {
    if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
    }
  }

  async startRevengeBGM() {
    this.initCtx();
    this.stopBGM();
    if (this.revengeAudio) {
        try {
            await this.revengeAudio.play();
        } catch (e) {
            console.warn("Autoplay blocked");
        }
    }
  }

  stopRevengeBGM() {
    if (this.revengeAudio) {
        this.revengeAudio.pause();
        this.revengeAudio.currentTime = 0;
    }
  }
}

export const audio = new AudioService();
