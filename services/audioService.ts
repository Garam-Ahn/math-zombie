
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmNodes: AudioScheduledSourceNode[] = [];
  private revengeNodes: AudioScheduledSourceNode[] = [];

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
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx!.currentTime, 0.05);
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
  playShoot() { this.playTone(440, 0.05, 'triangle', 0.05); } // softer shoot
  playHit() { this.playTone(110, 0.2, 'sawtooth', 0.1); }
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
    // Victory Fanfare
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
    
    // Siren effect
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
    // Low frequency boom
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

  // --- BGM LOGIC ---

  private playLoop(notes: {freq: number, dur: number}[], speed: number, type: OscillatorType) {
    if (!this.ctx) return;
    let time = this.ctx.currentTime;
    
    // Schedule loop for next 10 seconds to keep it continuous
    // Note: Real production code would use AudioBuffers, this is a procedural hack
    const loopDuration = notes.reduce((acc, n) => acc + n.dur, 0) * speed;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    gain.gain.value = 0.05;
    
    // Sequencer logic simulation using an LFO on freq is hard, so we just return the node
    // For simplicity in this constraints, we just play a simple drone or arpeggio on interval
    return osc; // Placeholder
  }

  // Cheerful C Major Arpeggio Loop
  startBGM() {
    this.initCtx();
    if (this.bgmNodes.length > 0) return;

    const createNote = (freq: number, startTime: number, duration: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.02, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(startTime);
        osc.stop(startTime + duration);
        this.bgmNodes.push(osc);
    };

    // Schedule a simple joyful melody loop
    const scheduleMelody = () => {
        if (this.bgmNodes.length === 0) return; // Stopped
        const now = this.ctx!.currentTime;
        const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C E G C G E
        melody.forEach((f, i) => createNote(f, now + i * 0.4, 0.4));
    };

    // Initial dummy node to mark as playing
    const dummy = this.ctx!.createOscillator();
    this.bgmNodes.push(dummy);
    
    scheduleMelody();
    // Re-trigger every 2.4s
    const interval = window.setInterval(() => {
        if (this.bgmNodes.length === 0) { clearInterval(interval); return; }
        scheduleMelody();
    }, 2400);
    
    // Store interval ID in a way we can clear it? 
    // Since we can't easily store the interval on the class in this strict setup without leaks,
    // we rely on the bgmNodes length check.
    (this as any).bgmInterval = interval;
  }

  stopBGM() {
    if ((this as any).bgmInterval) clearInterval((this as any).bgmInterval);
    this.bgmNodes.forEach(n => { try { n.stop(); } catch(e){} });
    this.bgmNodes = [];
  }

  // Upbeat Arcade Style for Revenge
  startRevengeBGM() {
    this.initCtx();
    this.stopRevengeBGM();

    const createFastNote = (freq: number, startTime: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(startTime);
        osc.stop(startTime + 0.1);
        this.revengeNodes.push(osc);
    };

    const scheduleRevenge = () => {
        if (this.revengeNodes.length === 0) return;
        const now = this.ctx!.currentTime;
        // Fast ascending scale effect
        const notes = [440, 554, 659, 880, 659, 554]; // A major fast
        notes.forEach((f, i) => createFastNote(f, now + i * 0.15));
    };

    // Initial dummy
    const dummy = this.ctx!.createOscillator();
    this.revengeNodes.push(dummy);

    scheduleRevenge();
    const interval = window.setInterval(() => {
        if (this.revengeNodes.length === 0) { clearInterval(interval); return; }
        scheduleRevenge();
    }, 900); // Faster loop

    (this as any).revengeInterval = interval;
  }

  stopRevengeBGM() {
    if ((this as any).revengeInterval) clearInterval((this as any).revengeInterval);
    this.revengeNodes.forEach(n => { try { n.stop(); } catch(e){} });
    this.revengeNodes = [];
  }
}

export const audio = new AudioService();
