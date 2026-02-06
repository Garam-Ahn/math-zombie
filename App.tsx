
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GameStatus, 
  PlantType, 
  PlantEntity, 
  ZombieEntity, 
  ProjectileEntity, 
  MathProblem, 
  SunEntity,
  MathHistoryItem,
  VisualCoin
} from './types';
import { 
  ROWS, 
  COLS, 
  TICK_RATE, 
  PLANT_CONFIGS, 
  ZOMBIE_VARIANTS, 
  INITIAL_SUN,
  INITIAL_LIVES,
  REVENGE_THRESHOLD,
  FREEZE_THRESHOLD,
  MAX_ZOMBIES_ON_SCREEN,
  PEASHOOTER_LIMIT
} from './constants';
import { generateMathEncouragement } from './services/geminiService';
import { firebaseService } from './services/firebaseService';
import { MathModal } from './components/MathModal';
import { UpgradeModal } from './components/UpgradeModal';
import { RevengeModal } from './components/RevengeModal';
import { ReportModal } from './components/ReportModal';
import { StudyMode } from './components/StudyMode';
import { PieGauge } from './components/PieGauge';
import { NuclearChallengeModal } from './components/NuclearChallengeModal';
import { ClockModal } from './components/ClockModal';
import { audio } from './services/audioService';
import { SVG_PEASHOOTER, SVG_ZOMBIE_NORMAL, SVG_COIN, SVG_LOCK, SVG_SUNFLOWER } from './assets';

const uuid = () => performance.now().toString(36) + Math.random().toString(36).substring(2);

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.TITLE);
  const [selectedTables, setSelectedTables] = useState<number[]>([]); 
  const [lockedTables, setLockedTables] = useState<number[]>(() => {
    try {
        const saved = localStorage.getItem('mvz_locked_tables');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [sun, setSun] = useState(INITIAL_SUN);
  const [plants, setPlants] = useState<PlantEntity[]>([]);
  const [zombies, setZombies] = useState<ZombieEntity[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileEntity[]>([]);
  const [floatingSuns, setFloatingSuns] = useState<SunEntity[]>([]);
  const [visualCoins, setVisualCoins] = useState<VisualCoin[]>([]);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0); 
  const [sessionCoins, setSessionCoins] = useState(0); 
  const [wrongCount, setWrongCount] = useState(0); 
  const [showRevenge, setShowRevenge] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [freezeCharge, setFreezeCharge] = useState(0); 
  const [isFrozen, setIsFrozen] = useState(false); 
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  const [tileSelection, setTileSelection] = useState<{row: number, col: number} | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  const [activeReloadPlantId, setActiveReloadPlantId] = useState<string | null>(null);
  const [activeMathProblem, setActiveMathProblem] = useState<{
    plantType: PlantType;
    row: number;
    col: number;
    problem: MathProblem;
    isNuclear?: boolean;
  } | null>(null);
  const [activeNuclearChallenge, setActiveNuclearChallenge] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [activeClockChallenge, setActiveClockChallenge] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [activePlantInteraction, setActivePlantInteraction] = useState<PlantEntity | null>(null);
  const [nuclearExplosion, setNuclearExplosion] = useState(false);

  const stateRef = useRef({
    lives, plants, zombies, projectiles, floatingSuns, status, wave, isFrozen,
    lastTick: 0, zombieSpawnTimer: 0, sunSpawnTimer: 0, waveTimer: 0,
    isPaused: false, showRevenge: false
  });

  useEffect(() => {
    stateRef.current.lives = lives;
    stateRef.current.plants = plants;
    stateRef.current.zombies = zombies;
    stateRef.current.projectiles = projectiles;
    stateRef.current.floatingSuns = floatingSuns;
    stateRef.current.status = status;
    stateRef.current.wave = wave;
    stateRef.current.isFrozen = isFrozen;
    stateRef.current.isPaused = !!activeMathProblem || !!activePlantInteraction || isPaused || showReport || showStudyModal || !!activeReloadPlantId || !!activeNuclearChallenge || !!activeClockChallenge;
    stateRef.current.showRevenge = showRevenge;
  }, [lives, plants, zombies, projectiles, floatingSuns, status, wave, isFrozen, activeMathProblem, activePlantInteraction, isPaused, showRevenge, showReport, showStudyModal, activeReloadPlantId, activeNuclearChallenge, activeClockChallenge]);

  useEffect(() => {
    if (status === GameStatus.PLAYING && !stateRef.current.isPaused && !showRevenge) {
      audio.startBGM();
    } else {
      audio.stopBGM();
    }
  }, [status, isPaused, showRevenge, showReport, showStudyModal, activeMathProblem, activePlantInteraction, activeReloadPlantId, activeNuclearChallenge, activeClockChallenge]);

  const triggerShake = useCallback((isHeavy = false) => {
    if (isShaking) return;
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), isHeavy ? 400 : 100);
  }, [isShaking]);

  const triggerFreeze = useCallback((duration: number = 5000) => {
      setIsFrozen(true);
      setFeedbackMsg(`❄️ FREEZE! (${duration/1000}s) ❄️`);
      setTimeout(() => {
          setIsFrozen(false);
          setFeedbackMsg("");
      }, duration);
  }, []);

  const spawnCoin = useCallback((x: number, y: number) => {
      const val = 10;
      setVisualCoins(prev => [...prev, { id: uuid(), x, y, value: val, createdAt: performance.now() }]);
      setSessionCoins(prev => prev + val);
      setTotalCoins(prev => prev + val);
      audio.playCoin();
  }, []);

  const createZombie = (currentWave: number, forceRow?: number): ZombieEntity => {
    const possibleVariants: Array<typeof ZOMBIE_VARIANTS[number]> = [ZOMBIE_VARIANTS[0]];
    if (currentWave >= 3) possibleVariants.push(ZOMBIE_VARIANTS[1]);
    if (currentWave >= 6) possibleVariants.push(ZOMBIE_VARIANTS[2]);
    let variant = possibleVariants[Math.floor(Math.random() * possibleVariants.length)];
    const row = forceRow ?? Math.floor(Math.random() * ROWS);
    const difficultyMult = 1 + (currentWave * 0.15);
    const finalHp = variant.hp * difficultyMult;
    return {
      id: uuid(), row, x: 100, hp: finalHp, maxHp: finalHp, speed: variant.speed,
      damage: variant.damage, attackSpeed: variant.attackSpeed, isEating: false,
      type: variant.type, svg: variant.svg, lastHitTime: 0, lastAttackTime: 0
    };
  };

  const spawnSun = useCallback((x?: number, y?: number) => {
    setFloatingSuns(prev => [...prev, { id: uuid(), x: x ?? Math.random() * 80 + 10, y: y ?? Math.random() * 80 + 10, value: 25, createdAt: performance.now() }]);
  }, []);

  const collectSun = useCallback((id: string, value: number) => {
    setSun(prev => prev + value);
    setFloatingSuns(prev => prev.filter(s => s.id !== id));
    audio.playCollect();
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const loop = (timestamp: number) => {
      const state = stateRef.current;
      if (state.status !== GameStatus.PLAYING || state.isPaused || state.showRevenge) {
        state.lastTick = timestamp;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const delta = timestamp - state.lastTick;
      if (delta >= TICK_RATE) {
        state.lastTick = timestamp;
        if (!state.isFrozen) {
          state.waveTimer += delta;
          state.zombieSpawnTimer += delta;
        }
        state.sunSpawnTimer += delta;
        if (state.waveTimer > 30000) {
          setWave(prev => prev + 1);
          state.waveTimer = 0;
        }

        // Auto-collect suns after 10 seconds
        const now = performance.now();
        const expiredSuns = state.floatingSuns.filter(s => now - s.createdAt > 10000);
        expiredSuns.forEach(s => collectSun(s.id, s.value));

        let currentZombies = state.zombies.map(z => ({...z}));
        let updatedPlants = state.plants.map(p => ({...p}));
        const newProjectiles: ProjectileEntity[] = [];
        const plantsToRemove: string[] = [];

        if (!state.isFrozen && state.zombieSpawnTimer > Math.max(1500, 8000 - (state.wave * 800))) {
          if (currentZombies.length < MAX_ZOMBIES_ON_SCREEN) {
            currentZombies.push(createZombie(state.wave));
            state.zombieSpawnTimer = 0;
          }
        }
        if (state.sunSpawnTimer > 8000) {
          spawnSun();
          state.sunSpawnTimer = 0;
        }

        updatedPlants.forEach(plant => {
          const config = PLANT_CONFIGS[plant.type];
          if (plant.type === PlantType.CHERRYBOMB && timestamp - plant.lastActionTime > 1500) {
            const isNuclear = (plant.level || 1) >= 5;
            currentZombies.forEach(z => {
                if (z.isDying) return;
                const dist = Math.sqrt(Math.pow((z.x/100)*COLS - plant.col, 2) + Math.pow(z.row - plant.row, 2));
                if (isNuclear || dist < 2.0) {
                    z.hp -= isNuclear ? 2500 : 500;
                    z.lastHitTime = timestamp;
                }
            });
            if (isNuclear) {
                setNuclearExplosion(true);
                setTimeout(() => setNuclearExplosion(false), 800);
            }
            triggerShake(isNuclear); audio.playHit();
            plantsToRemove.push(plant.id);
          }

          if (plant.type === PlantType.ICESHROOM && timestamp - plant.lastActionTime > 1000) {
            triggerFreeze(8000); 
            audio.playThunder();
            plantsToRemove.push(plant.id);
          }

          if (plant.type === PlantType.PEASHOOTER && (plant.ammo || 0) > 0) {
            const hasZombie = currentZombies.some(z => z.row === plant.row && z.x > 5 && !z.isDying);
            if (hasZombie && timestamp - plant.lastActionTime > config.cooldown) {
              newProjectiles.push({ id: uuid(), row: plant.row, x: (plant.col / COLS) * 100 + 5, damage: config.damage! * (1 + (plant.level-1)*0.4), level: plant.level });
              audio.playShoot();
              plant.lastActionTime = timestamp;
              plant.ammo = (plant.ammo || 0) - 1;
            }
          }
          if (plant.type === PlantType.SUNFLOWER && timestamp - plant.lastActionTime > config.cooldown) {
            updatedPlants.forEach(n => {
              if (n.id !== plant.id && n.hp < n.maxHp && (Math.abs(n.row - plant.row) <= 1 && Math.abs(n.col - plant.col) <= 1)) {
                n.hp = Math.min(n.maxHp, n.hp + 20);
              }
            });
            plant.lastActionTime = timestamp;
          }
        });

        const movedProjectiles = state.projectiles.concat(newProjectiles).map(p => ({...p, x: p.x + 1.2}));
        const finalProjectiles: ProjectileEntity[] = [];
        movedProjectiles.forEach(proj => {
          let hit = false;
          const target = currentZombies.find(z => !z.isDying && z.row === proj.row && z.x < proj.x && z.x + 8 > proj.x);
          if (target) {
            hit = true;
            target.hp -= proj.damage;
            target.lastHitTime = timestamp;
            target.x = Math.min(100, target.x + 1.5);
            triggerShake();
            audio.playHit();
          }
          if (!hit && proj.x < 100) finalProjectiles.push(proj);
        });

        const activeZombies: ZombieEntity[] = [];
        let livesLost = 0;
        currentZombies.forEach(z => {
          if (z.hp <= 0 && !z.isDying) {
            z.isDying = true;
            z.deathTime = timestamp;
            setScore(s => s + 10);
            spawnCoin(z.x, (z.row / ROWS) * 100 + 10);
          }
          if (z.isDying) {
            if (timestamp - z.deathTime! < 800) activeZombies.push(z);
            return;
          }
          let speed = state.isFrozen ? 0 : z.speed;
          if (timestamp - (z.lastHitTime || 0) < 150) speed = -0.05;
          const blocker = updatedPlants.find(p => p.row === z.row && p.col === Math.floor((z.x / 100) * COLS));
          if (blocker) {
            speed = 0;
            z.isEating = true;
            if (timestamp - z.lastAttackTime > z.attackSpeed) {
              blocker.hp -= z.damage;
              z.lastAttackTime = timestamp;
              audio.playHit();
            }
          } else { z.isEating = false; }
          z.x -= speed;
          if (z.x <= 0) livesLost++;
          else activeZombies.push(z);
        });

        if (livesLost > 0) {
          setLives(l => Math.max(0, l - livesLost));
          setShowDamageOverlay(true);
          setTimeout(() => setShowDamageOverlay(false), 300);
          audio.playDamage();
          if (lives - livesLost <= 0) setStatus(GameStatus.GAME_OVER);
        }
        setPlants(updatedPlants.filter(p => p.hp > 0 && !plantsToRemove.includes(p.id)));
        setZombies(activeZombies);
        setProjectiles(finalProjectiles);

        if (freezeCharge >= 100 && !isFrozen) {
            setFreezeCharge(0);
            triggerFreeze(5000);
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spawnSun, triggerShake, triggerFreeze, spawnCoin, collectSun, lives, freezeCharge, isFrozen]);

  const initiatePlanting = useCallback((type: PlantType, row: number, col: number) => {
    const config = PLANT_CONFIGS[type];
    if (sun < config.cost) {
      setFeedbackMsg("NEED MORE SUN!");
      setTimeout(() => setFeedbackMsg(""), 1000);
      return;
    }
    
    setTileSelection(null); 
    
    if (type === PlantType.CHERRYBOMB) {
      setActiveNuclearChallenge({ row, col });
    } else if (type === PlantType.ICESHROOM) {
      setActiveClockChallenge({ row, col });
    } else {
      const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const b = Math.floor(Math.random() * 9) + 1;
      setActiveMathProblem({ plantType: type, row, col, problem: { factorA: table, factorB: b, answer: table * b } });
    }
  }, [sun, selectedTables]);

  const handleCellClick = (row: number, col: number) => {
    audio.initCtx();
    if (stateRef.current.isPaused) return;
    const existing = plants.find(p => p.row === row && p.col === col);
    if (existing) {
      if ((existing.ammo || 0) <= 0 && (existing.type === PlantType.PEASHOOTER || existing.type === PlantType.JALAPENO)) {
        const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
        const b = Math.floor(Math.random() * 9) + 1;
        setActiveReloadPlantId(existing.id);
        setActiveMathProblem({ plantType: existing.type, row, col, problem: { factorA: table, factorB: b, answer: table * b } });
      } else {
        setActivePlantInteraction(existing);
      }
      return;
    }
    
    if (selectedPlantType) {
      initiatePlanting(selectedPlantType, row, col);
    } else {
      setTileSelection({ row, col });
    }
    audio.playCollect();
  };

  const handleMathResult = (success: boolean) => {
    if (success && activeMathProblem) {
      const config = PLANT_CONFIGS[activeMathProblem.plantType];
      if (activeReloadPlantId) {
        setPlants(prev => prev.map(p => p.id === activeReloadPlantId ? {...p, ammo: config.maxAmmo} : p));
      } else {
        setSun(s => s - config.cost);
        setPlants(prev => [...prev, {
          id: uuid(), type: activeMathProblem.plantType, row: activeMathProblem.row, col: activeMathProblem.col,
          hp: config.hp, maxHp: config.hp, level: activeMathProblem.isNuclear ? 5 : 1, lastActionTime: performance.now(), ammo: config.maxAmmo
        }]);
        setFreezeCharge(prev => Math.min(100, prev + 10)); 
      }
      setSelectedPlantType(null);
    }
    setActiveMathProblem(null);
    setActiveReloadPlantId(null);
    setTileSelection(null);
  };

  const handleNuclearResult = (success: boolean) => {
      if (activeNuclearChallenge) {
          if (success) {
              setSun(s => s - PLANT_CONFIGS[PlantType.CHERRYBOMB].cost);
              setPlants(prev => [...prev, {
                  id: uuid(), type: PlantType.CHERRYBOMB, row: activeNuclearChallenge.row, col: activeNuclearChallenge.col,
                  hp: 1000, maxHp: 1000, level: 5, lastActionTime: performance.now()
              }]);
              setFeedbackMsg("💣 NUCLEAR CHERRY BOMB! 💣");
              audio.playRevengeSuccess();
              setTimeout(() => setFeedbackMsg(""), 2000);
              setActiveNuclearChallenge(null);
              setSelectedPlantType(null);
          } else {
              const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
              const b = Math.floor(Math.random() * 9) + 1;
              setActiveMathProblem({ 
                  plantType: PlantType.CHERRYBOMB, 
                  row: activeNuclearChallenge.row, 
                  col: activeNuclearChallenge.col, 
                  problem: { factorA: table, factorB: b, answer: table * b } 
              });
              setActiveNuclearChallenge(null);
          }
      }
  };

  const handleClockResult = (success: boolean) => {
      if (activeClockChallenge) {
          if (success) {
              const config = PLANT_CONFIGS[PlantType.ICESHROOM];
              setSun(s => s - config.cost);
              setPlants(prev => [...prev, {
                  id: uuid(), type: PlantType.ICESHROOM, row: activeClockChallenge.row, col: activeClockChallenge.col,
                  hp: config.hp, maxHp: config.hp, level: 1, lastActionTime: performance.now()
              }]);
              setFeedbackMsg("🧊 ICE-SHROOM SUMMONED! 🧊");
              audio.playUpgradeSuccess();
              setTimeout(() => setFeedbackMsg(""), 2000);
              setSelectedPlantType(null);
          }
          setActiveClockChallenge(null);
      }
  };

  const handleTableToggle = (num: number) => {
      audio.initCtx();
      if (lockedTables.includes(num)) { audio.playWrong(); return; }
      setSelectedTables(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
      audio.playCollect();
  };

  if (status === GameStatus.TITLE) {
    return (
      <div className="h-[100dvh] w-screen relative overflow-hidden bg-emerald-600 flex flex-col items-center justify-center p-4 select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-500 z-0" />
        
        <div className="absolute bottom-[-10%] left-[-5%] w-[110%] h-[40%] bg-emerald-600/30 blur-3xl z-1 rotate-3" />
        <div className="absolute top-[10%] left-[10%] w-24 h-24 opacity-20 animate-float pointer-events-none" dangerouslySetInnerHTML={{ __html: SVG_SUNFLOWER(1) }} />
        <div className="absolute top-[20%] right-[15%] w-32 h-32 opacity-20 animate-float pointer-events-none" style={{animationDelay: '1s'}} dangerouslySetInnerHTML={{ __html: SVG_SUNFLOWER(3) }} />
        
        <div className="relative z-10 flex flex-col items-center animate-float">
          <h1 className="text-6xl md:text-9xl text-yellow-400 font-black text-center drop-shadow-[0_8px_0_#000] leading-tight" style={{ textShadow: '4px 4px 0 #000' }}>
            MATH VS<br/><span className="text-white">ZOMBIES</span>
          </h1>
          <p className="text-emerald-900 text-2xl font-black mt-4 tracking-widest bg-white/40 px-6 py-1 rounded-full backdrop-blur-sm">Multiplication Defense Master</p>
        </div>
        
        <div className="relative z-20 mt-16 flex gap-6">
          <button onClick={() => { audio.initCtx(); setStatus(GameStatus.MENU); audio.playCollect(); }} className="glossy-btn px-16 py-8 text-4xl font-black text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform">PLAY</button>
          <button onClick={() => { audio.initCtx(); setStatus(GameStatus.STUDY); audio.playCollect(); }} className="bg-purple-600 border-b-8 border-purple-800 rounded-2xl px-12 py-8 text-3xl font-black text-white hover:bg-purple-500 active:translate-y-2 active:border-b-0 transition-all">STUDY</button>
        </div>

        <div className="absolute bottom-4 text-emerald-900 font-bold opacity-60">Master the tables, Save the garden!</div>
      </div>
    );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="min-h-[100dvh] w-screen bg-slate-900 flex flex-col items-center justify-start py-8 px-6 text-white font-sans overflow-y-auto">
              <h2 className="text-3xl md:text-5xl font-black mb-12 text-yellow-400 text-center drop-shadow-lg uppercase italic tracking-tighter">Choose Your Training Tables</h2>
              <div className="grid grid-cols-4 gap-4 md:gap-8 w-full max-w-3xl mb-12">
                  {[2,3,4,5,6,7,8,9].map(num => (
                      <button key={num} onClick={() => handleTableToggle(num)}
                        className={`py-8 md:py-12 text-3xl md:text-5xl font-black rounded-3xl border-b-8 transition-all hover:scale-105 active:scale-95
                            ${selectedTables.includes(num) ? 'bg-emerald-500 border-emerald-700 text-white shadow-[0_0_20px_#10b981]' : 'bg-slate-700 border-slate-800 text-slate-400'}
                            ${lockedTables.includes(num) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                        `}>{num}</button>
                  ))}
              </div>
              <button disabled={selectedTables.length === 0} onClick={() => { audio.initCtx(); setStatus(GameStatus.PLAYING); audio.playGameStart(); }} 
                className={`px-16 py-8 md:px-24 md:py-10 text-3xl md:text-4xl font-black rounded-3xl border-b-[12px] active:translate-y-2 active:border-b-0 transition-all
                    ${selectedTables.length > 0 ? 'bg-yellow-500 border-yellow-700 text-yellow-950 shadow-2xl' : 'bg-slate-600 text-slate-400 border-slate-700 opacity-50'}
                `}>BATTLE START!</button>
          </div>
      );
  }

  return (
    <div className={`h-[100dvh] w-screen relative overflow-hidden font-sans bg-slate-950 ${isShaking ? 'screenshake' : ''}`}>
      {showDamageOverlay && <div className="absolute inset-0 bg-red-600/40 z-[100] animate-pulse pointer-events-none" />}
      {nuclearExplosion && <div className="absolute inset-0 bg-white z-[300] animate-pulse pointer-events-none" />}

      <div className={`flex flex-col h-full w-full transition-all duration-500 ${stateRef.current.isPaused ? 'grayscale brightness-50' : ''}`}>
        
        <div className="h-14 md:h-20 bg-slate-900 border-b-4 border-slate-800 flex items-center justify-between px-2 md:px-6 z-20 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
                <div className="bg-slate-800 rounded-xl px-1.5 py-1 md:py-2 border-2 border-slate-700 flex items-center gap-1 shadow-inner min-w-fit">
                    <span className="text-base md:text-2xl">☀️</span>
                    <span className="text-base md:text-2xl font-black text-yellow-400">{Math.floor(sun)}</span>
                </div>
                <div className="flex gap-0.5 md:gap-1">
                    {[...Array(INITIAL_LIVES)].map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 md:w-5 md:h-5 rounded-sm border ${i < lives ? 'bg-red-500 border-red-700' : 'bg-slate-800 border-slate-900'}`} />
                    ))}
                </div>
            </div>
            
            <div className="flex flex-1 justify-end items-center gap-1 md:gap-3 overflow-x-auto scrollbar-hide px-2">
                {Object.values(PLANT_CONFIGS).map(config => (
                    <button key={config.type} onClick={() => { setSelectedPlantType(config.type); setTileSelection(null); }}
                      className={`min-w-[38px] h-10 md:min-w-[64px] md:h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center flex-shrink-0
                        ${selectedPlantType === config.type ? 'border-yellow-400 bg-slate-700 scale-105 shadow-lg' : 'border-slate-800 bg-slate-800'}
                        ${sun < config.cost ? 'opacity-40 grayscale' : 'hover:bg-slate-700'}
                      `}>
                        <div className="w-5 h-5 md:w-10 md:h-10 pointer-events-none" dangerouslySetInnerHTML={{ __html: config.svg(1) }} />
                        <span className="text-[7px] md:text-xs font-black text-yellow-500">{config.cost}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 relative lawn-bg overflow-hidden touch-none flex flex-col z-0">
            <div className="absolute inset-0 flex flex-col py-1 md:py-2 px-2 md:px-4 z-10">
                {Array.from({ length: ROWS }).map((_, r) => (
                    <div key={r} className="flex-1 flex w-full">
                        {Array.from({ length: COLS }).map((_, c) => (
                            <div key={c} className={`flex-1 border border-white/5 hover:bg-white/10 transition-colors rounded-sm mx-0.5 my-0.5 relative`} 
                                 onClick={() => handleCellClick(r, c)}>
                                 {tileSelection?.row === r && tileSelection?.col === c && (
                                     <div className={`absolute left-1/2 -translate-x-1/2 z-[60] bg-slate-950/90 backdrop-blur-md border-4 border-slate-700 rounded-2xl p-2 flex gap-2 shadow-2xl animate-float md:min-w-max
                                         ${r < 2 ? 'top-[110%]' : 'bottom-[110%]'}
                                     `}>
                                         <div className="flex gap-2 items-center">
                                            {Object.values(PLANT_CONFIGS).map(cfg => (
                                                <button key={cfg.type} onClick={(e) => { e.stopPropagation(); initiatePlanting(cfg.type, r, c); }}
                                                    className={`w-10 h-10 md:w-16 md:h-16 bg-slate-800 border-2 rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95
                                                        ${sun >= cfg.cost ? 'border-yellow-500' : 'opacity-40 grayscale border-slate-700'}
                                                    `}>
                                                    <div className="w-6 h-6 md:w-12 md:h-12 pointer-events-none" dangerouslySetInnerHTML={{ __html: cfg.svg(1) }} />
                                                    <span className="text-[8px] md:text-[10px] font-bold text-yellow-500">{cfg.cost}</span>
                                                </button>
                                            ))}
                                         </div>
                                         <button onClick={(e) => { e.stopPropagation(); setTileSelection(null); }} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black border-2 border-white shadow-lg active:scale-90">X</button>
                                     </div>
                                 )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Plants Layer */}
            {plants.map(plant => (
                <div key={plant.id} className="absolute flex items-center justify-center animate-float pointer-events-none z-20"
                     style={{ 
                        top: `${(plant.row/ROWS)*100}%`, 
                        left: `${(plant.col/COLS)*100}%`, 
                        width: `${100/COLS}%`, 
                        height: `${100/ROWS}%`
                     }}>
                    <div className="w-[85%] h-[85%] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: (PLANT_CONFIGS[plant.type].svg || (() => ''))(plant.level || 1) }} />
                    {plant.level >= 5 && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full blur-md" />}
                    {plant.hp < plant.maxHp && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full overflow-hidden border border-white/20">
                            <div className="h-full bg-red-500" style={{ width: `${(plant.hp/plant.maxHp)*100}%` }} />
                        </div>
                    )}
                </div>
            ))}

            {/* Projectiles Layer */}
            {projectiles.map(proj => (
                <div key={proj.id} className="absolute w-2.5 h-2.5 md:w-6 md:h-6 rounded-full bg-lime-400 border-2 border-white shadow-[0_0_10px_#a3e635] z-30"
                     style={{ top: `${(proj.row/ROWS)*100 + (50/ROWS)}%`, left: `${proj.x}%`, transform: 'translate(-50%, -50%)' }} />
            ))}

            {/* Zombies Layer */}
            {zombies.map(zombie => {
                const isHit = Date.now() - (zombie.lastHitTime || 0) < 200;
                return (
                    <div key={zombie.id} className={`absolute pointer-events-none transition-all duration-100 z-40 ${isHit ? 'animate-zombie-hit' : (zombie.isEating ? '' : 'animate-walk')}`}
                         style={{ 
                            top: `${(zombie.row/ROWS)*100}%`, 
                            left: `${zombie.x}%`, 
                            width: `${100/COLS}%`, 
                            height: `${100/ROWS}%`, 
                            transform: 'translateX(-50%)',
                            opacity: zombie.isDying ? 0.5 : 1
                        }}>
                        <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: zombie.svg }} />
                        {!zombie.isDying && (
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-900 rounded-full border border-white/30 overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${(zombie.hp/zombie.maxHp)*100}%` }} />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Items Layer */}
            {floatingSuns.map(s => (
                <button key={s.id} onClick={(e) => { e.stopPropagation(); collectSun(s.id, s.value); }}
                        className="absolute w-12 h-12 md:w-18 md:h-18 animate-spin text-3xl md:text-6xl drop-shadow-xl z-50 flex items-center justify-center pointer-events-auto"
                        style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}>☀️</button>
            ))}

            {visualCoins.map(c => (
                <div key={c.id} className="absolute w-10 h-10 md:w-12 md:h-12 animate-bounce text-xl z-50 pointer-events-none"
                     style={{ left: `${c.x}%`, top: `${c.y}%` }} dangerouslySetInnerHTML={{ __html: SVG_COIN }} />
            ))}

            {/* UI HUD Layer */}
            <div className="absolute bottom-1 right-1 flex flex-row items-end gap-1 scale-[0.4] sm:scale-75 md:scale-100 origin-bottom-right z-[55]">
                <PieGauge value={wrongCount * (100/REVENGE_THRESHOLD)} max={100} label="REVENGE" icon="🔥" type="REVENGE" isActive={showRevenge} />
                <PieGauge value={freezeCharge} max={100} label="FREEZE" icon="❄️" type="FREEZE" isActive={isFrozen} />
            </div>

            {feedbackMsg && (
                <div className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none">
                    <div className="bg-black/85 backdrop-blur-2xl px-16 py-8 rounded-[3rem] border-8 border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.5)] text-4xl md:text-7xl font-black text-white animate-bounce uppercase italic tracking-tighter">
                        {feedbackMsg}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Modals Layer */}
      <div className="z-[300]">
        {activeMathProblem && <MathModal plant={PLANT_CONFIGS[activeMathProblem.plantType]} problem={activeMathProblem.problem} onSolve={handleMathResult} onAttempt={() => {}} onClose={() => setActiveMathProblem(null)} onOpenStudy={() => setShowStudyModal(true)} />}
        {activeNuclearChallenge && <NuclearChallengeModal tables={selectedTables} onComplete={handleNuclearResult} onClose={() => setActiveNuclearChallenge(null)} onOpenStudy={() => setShowStudyModal(true)} isStudyOpen={showStudyModal} />}
        {activeClockChallenge && <ClockModal onSolve={handleClockResult} onClose={() => setActiveClockChallenge(null)} />}
        {activePlantInteraction && <UpgradeModal plant={activePlantInteraction} availableTables={selectedTables} onUpgrade={(id, lv) => { setPlants(prev => prev.map(p => p.id === id ? {...p, level: p.level + lv, hp: p.maxHp, ammo: PLANT_CONFIGS[p.type].maxAmmo} : p)); setActivePlantInteraction(null); }} onHeal={(id) => { setPlants(prev => prev.map(p => p.id === id ? {...p, hp: p.maxHp} : p)); setActivePlantInteraction(null); }} onRemove={(id) => { setPlants(prev => prev.filter(p => p.id !== id)); setActivePlantInteraction(null); }} onAttempt={() => {}} onClose={() => setActivePlantInteraction(null)} onOpenStudy={() => setShowStudyModal(true)} isStudyOpen={showStudyModal} />}
        {showStudyModal && <div className="fixed inset-0 z-[400]"><StudyMode onBack={() => setShowStudyModal(false)} onPlay={() => { audio.initCtx(); setShowStudyModal(false); }} isIngame={true} /></div>}
      </div>
    </div>
  );
}
