class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;

  constructor() {
    this.isMuted = false;
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, this.ctx!.currentTime, 0.05);
    }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.1) {
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
  playShoot() { this.playTone(220, 0.1, 'sawtooth', 0.05); }
  playHit() { this.playTone(110, 0.2, 'triangle', 0.1); }
  playCorrect() { this.playTone(660, 0.3, 'sine', 0.1); setTimeout(() => this.playTone(880, 0.4, 'sine', 0.1), 100); }
  playWrong() { this.playTone(150, 0.5, 'sawtooth', 0.1); }
  playGameStart() { this.playTone(440, 0.5, 'square', 0.1); }
  playTick() { this.playTone(1200, 0.02, 'sine', 0.02); }
  
  // More impactful combo sound
  playCombo() { 
    this.playTone(440, 0.2, 'square', 0.1); 
    setTimeout(() => this.playTone(554, 0.2, 'square', 0.1), 100);
    setTimeout(() => this.playTone(659, 0.4, 'square', 0.1), 200);
  }

  playUpgradeSuccess() {
    const notes = [523, 659, 783, 1046];
    notes.forEach((n, i) => setTimeout(() => this.playTone(n, 0.4, 'sine', 0.1), i * 150));
  }

  startBGM() {
    this.initCtx();
    if (this.bgmOscillator) return;
    // Simple looping subtle drone for BGM
  }

  stopBGM() {
    if (this.bgmOscillator) {
      this.bgmOscillator.stop();
      this.bgmOscillator = null;
    }
  }
}

export const audio = new AudioService();