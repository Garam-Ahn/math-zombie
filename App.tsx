import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GameStatus, 
  PlantType, 
  PlantEntity, 
  ZombieEntity, 
  ProjectileEntity, 
  MathProblem, 
  SunEntity,
  Tile
} from './types';
import { 
  ROWS, 
  COLS, 
  TICK_RATE, 
  PLANT_CONFIGS, 
  ZOMBIE_VARIANTS, 
  INITIAL_SUN,
  INITIAL_LIVES
} from './constants';
import { generateMathEncouragement } from './services/geminiService';
import { MathModal } from './components/MathModal';
import { UpgradeModal } from './components/UpgradeModal';
import { audio } from './services/audioService';
import { SVG_PEASHOOTER, SVG_ZOMBIE_NORMAL } from './assets';

const uuid = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.TITLE);
  const [selectedTables, setSelectedTables] = useState<number[]>([]); 
  const [isMuted, setIsMuted] = useState(audio.getMuteStatus());
  const [isPaused, setIsPaused] = useState(false);
  
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [sun, setSun] = useState(INITIAL_SUN);
  const [plants, setPlants] = useState<PlantEntity[]>([]);
  const [zombies, setZombies] = useState<ZombieEntity[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileEntity[]>([]);
  const [floatingSuns, setFloatingSuns] = useState<SunEntity[]>([]);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);

  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  const [tooltip, setTooltip] = useState<{name: string, desc: string} | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<number | null>(null);

  const [activeMathProblem, setActiveMathProblem] = useState<{
    plantType: PlantType;
    row: number;
    col: number;
    problem: MathProblem;
  } | null>(null);

  const [activePlantInteraction, setActivePlantInteraction] = useState<PlantEntity | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  const stateRef = useRef({
    lives,
    plants,
    zombies,
    projectiles,
    floatingSuns,
    status,
    wave,
    lastTick: 0,
    zombieSpawnTimer: 0,
    sunSpawnTimer: 0,
    waveTimer: 0,
    isPaused: false
  });

  useEffect(() => {
    stateRef.current.lives = lives;
    stateRef.current.plants = plants;
    stateRef.current.zombies = zombies;
    stateRef.current.projectiles = projectiles;
    stateRef.current.floatingSuns = floatingSuns;
    stateRef.current.status = status;
    stateRef.current.wave = wave;
    stateRef.current.isPaused = !!activeMathProblem || !!activePlantInteraction || isPaused;
  }, [lives, plants, zombies, projectiles, floatingSuns, status, wave, activeMathProblem, activePlantInteraction, isPaused]);

  useEffect(() => {
    if (status === GameStatus.PLAYING && !isPaused) {
      audio.startBGM();
    } else {
      audio.stopBGM();
    }
    return () => audio.stopBGM();
  }, [status, isPaused]);

  const createZombie = (currentWave: number): ZombieEntity => {
    const possibleVariants: (typeof ZOMBIE_VARIANTS)[number][] = [ZOMBIE_VARIANTS[0]];
    if (currentWave >= 3) possibleVariants.push(ZOMBIE_VARIANTS[1]);
    if (currentWave >= 6) possibleVariants.push(ZOMBIE_VARIANTS[2]);
    
    // Boss Spawn Logic (Wave 8+)
    let variant = possibleVariants[Math.floor(Math.random() * possibleVariants.length)];
    if (currentWave >= 8 && Math.random() < 0.15) { 
       variant = ZOMBIE_VARIANTS[3]; // BOSS
    }

    // Boss cannot spawn on the very last row because it takes 2 rows height
    let maxRow = ROWS;
    if (variant.type === 'BOSS') maxRow = ROWS - 1; 

    const row = Math.floor(Math.random() * maxRow);
    const difficultyMult = 1 + (currentWave * 0.15); 

    return {
      id: uuid(),
      row,
      x: 100, 
      hp: variant.hp * difficultyMult,
      maxHp: variant.hp * difficultyMult,
      speed: variant.speed * (1 + (currentWave * 0.05)),
      damage: variant.damage,
      attackSpeed: variant.attackSpeed,
      isEating: false,
      type: variant.type,
      svg: variant.svg,
      lastHitTime: 0,
      lastAttackTime: 0
    };
  };

  const spawnSun = useCallback((x?: number, y?: number, value = 25) => {
    const newSun: SunEntity = { 
      id: uuid(), 
      x: x ?? Math.random() * 80 + 10, 
      y: y ?? Math.random() * 80 + 10, 
      value,
      createdAt: performance.now() 
    };
    setFloatingSuns(prev => [...prev, newSun]);
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
      if (state.status !== GameStatus.PLAYING || state.isPaused) {
        state.lastTick = timestamp;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const delta = timestamp - state.lastTick;
      if (delta >= TICK_RATE) {
        state.lastTick = timestamp;

        state.waveTimer += delta;
        if (state.waveTimer > 30000) { 
           setWave(prev => prev + 1);
           setFeedbackMsg(`WAVE ${state.wave + 1}`);
           setTimeout(() => setFeedbackMsg(""), 3000);
           state.waveTimer = 0;
        }

        state.zombieSpawnTimer += delta;
        state.sunSpawnTimer += delta;

        let currentZombies = [...state.zombies];
        const spawnRate = Math.max(1500, 10000 - (state.wave * 800)); 
        
        if (state.zombieSpawnTimer > spawnRate) {
          currentZombies.push(createZombie(state.wave));
          state.zombieSpawnTimer = 0;
        }

        if (state.sunSpawnTimer > 8000) {
          spawnSun();
          state.sunSpawnTimer = 0;
        }

        const sunsToAutoCollect = state.floatingSuns.filter(s => timestamp - s.createdAt > 5000);
        if (sunsToAutoCollect.length > 0) {
            sunsToAutoCollect.forEach(s => collectSun(s.id, s.value));
        }

        const newProjectiles = [...state.projectiles];
        let updatedPlants = state.plants.map(p => ({...p}));
        const plantsToRemove: string[] = [];

        updatedPlants = updatedPlants.map(plant => {
          const config = PLANT_CONFIGS[plant.type];
          
          if (plant.type === PlantType.PEASHOOTER) {
            // Check for zombies in the same lane OR boss in adjacent lane
            const zombieInLane = currentZombies.some(z => {
                if (z.x <= 5) return false;
                // Regular hit
                if (z.row === plant.row) return true;
                // Boss Hit (takes up row and row+1)
                if (z.type === 'BOSS' && z.row + 1 === plant.row) return true;
                return false;
            });

            if (zombieInLane && timestamp - plant.lastActionTime > config.cooldown) {
              const finalDamage = (config.damage || 20) * (1 + (plant.level - 1) * 0.5);
              newProjectiles.push({
                id: uuid(),
                row: plant.row,
                x: (plant.col / COLS) * 100 + 5,
                damage: finalDamage,
                level: plant.level
              });
              audio.playShoot();
              plant.lastActionTime = timestamp;
            }
          }
          
          if (plant.type === PlantType.SUNFLOWER) {
             if (timestamp - plant.lastActionTime > config.cooldown) {
                updatedPlants.forEach(n => {
                  if (n.id !== plant.id && n.hp < n.maxHp && (
                    (n.row === plant.row && Math.abs(n.col - plant.col) === 1) || 
                    (n.col === plant.col && Math.abs(n.row - plant.row) === 1)
                  )) {
                    n.hp = Math.min(n.maxHp, n.hp + (20 + plant.level * 10));
                  }
                });
                plant.lastActionTime = timestamp;
             }
          }

          if (plant.type === PlantType.CHERRYBOMB) {
            if (timestamp - plant.lastActionTime > 1500) {
              const radius = 1.5; 
              currentZombies = currentZombies.map(z => {
                const zCol = (z.x / 100) * COLS;
                // Boss logic for distance (Boss center is kinda between row and row+1)
                const rowDist = Math.abs(z.row - plant.row);
                const effectiveRowDist = z.type === 'BOSS' ? Math.min(Math.abs(z.row - plant.row), Math.abs((z.row + 1) - plant.row)) : rowDist;

                if (effectiveRowDist <= 1 && Math.abs(zCol - plant.col) <= radius) {
                  return { ...z, hp: z.hp - (config.damage || 500), lastHitTime: timestamp };
                }
                return z;
              });
              audio.playHit();
              plantsToRemove.push(plant.id);
            }
          }
          
          return plant;
        });

        const survivingProjectiles: ProjectileEntity[] = [];
        let zombiesTookDamage = [...currentZombies];

        newProjectiles.forEach(proj => {
          proj.x += 1; 
          let hit = false;
          zombiesTookDamage = zombiesTookDamage.map(z => {
            if (hit) return z; // Projectile already used

            // Hit Logic
            const isRowMatch = (z.row === proj.row) || (z.type === 'BOSS' && z.row + 1 === proj.row);
            
            if (isRowMatch && z.x < proj.x && z.x + 5 > proj.x) {
              hit = true;
              audio.playHit();
              // Knockback logic
              const knockback = z.type === 'BOSS' ? 0.5 : 3; // Boss resists knockback
              return { ...z, hp: z.hp - proj.damage, lastHitTime: timestamp, x: Math.min(100, z.x + knockback) };
            }
            return z;
          });
          if (!hit && proj.x < 100) survivingProjectiles.push(proj);
        });

        let livesLost = 0;
        const activeZombies: ZombieEntity[] = [];

        for (const z of zombiesTookDamage) {
            if (z.hp <= 0) { setScore(s => s + 10); continue; }
            
            const isStunned = (timestamp - (z.lastHitTime || 0)) < 400;

            let moveSpeed = z.speed;
            if (isStunned) {
                moveSpeed = -0.05; // Knockback effect (move backward slightly)
            }
            
            let eating = false;
            if (!isStunned) {
                // Eating Logic
                // Boss eats plants in row AND row+1
                const plantsToEat = updatedPlants.filter(p => {
                    const rowMatch = (p.row === z.row) || (z.type === 'BOSS' && p.row === z.row + 1);
                    const colMatch = p.col === Math.floor((z.x / 100) * COLS);
                    return rowMatch && colMatch;
                });

                if (plantsToEat.length > 0) {
                  moveSpeed = 0; eating = true;
                  if (timestamp - z.lastAttackTime > z.attackSpeed) {
                    plantsToEat.forEach(p => {
                         p.hp -= z.damage;
                         p.lastHitTime = timestamp;
                    });
                    z.lastAttackTime = timestamp;
                    audio.playHit();
                  }
                }
            }
            
            const newX = z.x - moveSpeed;
            if (newX <= 0) { livesLost += 1; audio.playWrong(); }
            else activeZombies.push({ ...z, x: newX, isEating: eating });
        }

        const finalPlants = updatedPlants.filter(p => p.hp > 0 && !plantsToRemove.includes(p.id));
        setLives(l => l - livesLost);
        if (lives - livesLost <= 0) setStatus(GameStatus.GAME_OVER);
        setPlants(finalPlants);
        setZombies(activeZombies);
        setProjectiles(survivingProjectiles);
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spawnSun, lives, collectSun]);

  const toggleSound = () => setIsMuted(audio.toggleMute());
  const togglePause = () => setIsPaused(prev => !prev);

  const toggleTableSelection = (num: number) => {
    setSelectedTables(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
    audio.playCollect();
  };

  const handleStartGame = () => {
    if (selectedTables.length === 0) return;
    audio.playGameStart();
    setSun(INITIAL_SUN); setLives(INITIAL_LIVES); setPlants([]); setZombies([]); setProjectiles([]); setFloatingSuns([]); setWave(1); setScore(0);
    setStatus(GameStatus.PLAYING); setIsPaused(false);
  };

  const handleGoToTitle = () => {
    audio.stopBGM();
    setPlants([]); setZombies([]); setProjectiles([]); setFloatingSuns([]); setWave(1); setScore(0); setLives(INITIAL_LIVES); setSun(INITIAL_SUN); setSelectedTables([]); setActiveMathProblem(null); setActivePlantInteraction(null); setFeedbackMsg("");
    setStatus(GameStatus.TITLE); setIsPaused(false);
  };

  const handlePlantSelect = (type: PlantType) => {
    const cfg = PLANT_CONFIGS[type];
    if (selectedPlantType !== type) {
       setSelectedPlantType(type);
       setTooltip({ name: cfg.name, desc: cfg.description });
       if (tooltipTimer) clearTimeout(tooltipTimer);
       setTooltipTimer(window.setTimeout(() => setTooltip(null), 4000));
    } else {
      setSelectedPlantType(null);
      setTooltip(null);
    }
    if (sun < cfg.cost) {
      audio.playWrong();
      setFeedbackMsg("햇빛이 부족해요!");
      setTimeout(() => setFeedbackMsg(""), 1000);
      return;
    }
    audio.playCollect();
  };

  const handleCellClick = (row: number, col: number) => {
    if (status !== GameStatus.PLAYING || isPaused) return;
    const existingPlant = plants.find(p => p.row === row && p.col === col);
    if (existingPlant) {
      if (!selectedPlantType) { setActivePlantInteraction(existingPlant); audio.playCollect(); }
      return;
    }
    if (!selectedPlantType) return;
    const config = PLANT_CONFIGS[selectedPlantType];
    
    if (sun < config.cost) {
      setFeedbackMsg("Not enough Sun!");
      setTimeout(() => setFeedbackMsg(""), 1000);
      return;
    }
    
    audio.playCollect();
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const b = Math.floor(Math.random() * 9) + 1;
    setActiveMathProblem({ plantType: selectedPlantType, row, col, problem: { factorA: table, factorB: b, answer: table * b } });
  };

  const handleMathResult = async (success: boolean) => {
    if (!activeMathProblem) return;
    if (success) {
      const config = PLANT_CONFIGS[activeMathProblem.plantType];
      setSun(prev => Math.max(0, prev - config.cost));
      setPlants(prev => [...prev, {
        id: uuid(), type: activeMathProblem.plantType, row: activeMathProblem.row, col: activeMathProblem.col,
        hp: config.hp, maxHp: config.hp, level: 1, lastActionTime: performance.now(), lastHitTime: 0
      }]);
      generateMathEncouragement(true, activeMathProblem.problem.factorA).then(msg => {
          setFeedbackMsg(msg);
          setTimeout(() => setFeedbackMsg(""), 2000);
      });
      setScore(s => s + 10);
      setSelectedPlantType(null); 
      setTooltip(null);
    } else {
       setFeedbackMsg("Try Again!");
       setTimeout(() => setFeedbackMsg(""), 1000);
    }
    setActiveMathProblem(null);
  };

  const handleUpgrade = (plantId: string, levelIncrement: number) => {
    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        setFeedbackMsg(`Level Up! +${levelIncrement}`);
        setTimeout(() => setFeedbackMsg(""), 2000);
        return { ...p, level: p.level + levelIncrement, maxHp: p.maxHp + 50, hp: p.hp + 50 };
      }
      return p;
    }));
    setActivePlantInteraction(null);
  };

  const handleHeal = (plantId: string) => {
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, hp: p.maxHp } : p));
    setFeedbackMsg(`Fully Healed!`);
    setTimeout(() => setFeedbackMsg(""), 2000);
    setActivePlantInteraction(null);
  };

  const handleRemove = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    if (plant) {
       const refund = Math.floor(PLANT_CONFIGS[plant.type].cost * 0.5);
       setSun(prev => prev + refund);
       setPlants(prev => prev.filter(p => p.id !== plantId));
       setFeedbackMsg(`Recycled! +${refund} Sun`);
       setTimeout(() => setFeedbackMsg(""), 2000);
       audio.playCollect();
    }
    setActivePlantInteraction(null);
  };

  // --- RENDERERS ---

  if (status === GameStatus.TITLE) {
    return (
      <div className="h-[100dvh] w-screen relative overflow-hidden bg-sky-300 font-sans select-none">
        {/* Cartoon Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-100" />
        
        {/* Hills */}
        <div className="absolute bottom-0 w-full h-1/2 bg-green-500 rounded-t-[50%] scale-150 translate-y-20 border-t-8 border-green-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-400 rounded-t-[40%] scale-125 translate-y-10 -translate-x-20 border-t-8 border-green-500"></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            <div className="mb-8 relative animate-float">
                <h1 className="text-5xl sm:text-6xl md:text-8xl text-yellow-400 text-center font-black drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-wider stroke-black" style={{ textShadow: '4px 4px 0 #000' }}>
                  MATH<br/>
                  <span className="text-3xl sm:text-4xl md:text-6xl text-white">VS</span><br/>
                  ZOMBIES
                </h1>
                <div className="absolute -bottom-6 right-0 rotate-[-5deg] bg-red-600 text-white font-bold text-sm px-4 py-1 rounded-full border-2 border-white shadow-lg transform hover:scale-110 transition-transform">
                  Multiplication Edition!
                </div>
            </div>

            <div className="flex items-end gap-12 mb-12">
                <div className="w-24 h-24 md:w-32 md:h-32 filter drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }} dangerouslySetInnerHTML={{ __html: SVG_PEASHOOTER(1) }} />
                <div className="w-24 h-24 md:w-32 md:h-32 filter drop-shadow-2xl animate-bounce" style={{ animationDuration: '3.5s' }} dangerouslySetInnerHTML={{ __html: SVG_ZOMBIE_NORMAL }} />
            </div>

            <button 
              onClick={() => {
                audio.playCollect();
                setStatus(GameStatus.MENU);
              }}
              className="glossy-btn bg-green-500 hover:bg-green-400 text-white text-2xl md:text-4xl py-6 px-16 border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all shadow-2xl animate-pulse font-black rounded-xl"
            >
              PLAY
            </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.MENU) {
    return (
      <div className="h-[100dvh] bg-stone-800 flex flex-col items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <button onClick={handleGoToTitle} className="absolute top-6 left-6 text-white text-xl hover:text-yellow-400 z-10 font-bold drop-shadow-md">← Back</button>
        
        <div className="wood-panel p-8 max-w-4xl w-full relative z-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-8 text-yellow-100 font-black drop-shadow-md text-center">Select Multiplication Tables</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-8 w-full">
            {[2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              const isSelected = selectedTables.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleTableSelection(num)}
                  className={`text-2xl md:text-4xl py-6 rounded-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all font-black shadow-lg
                    ${isSelected 
                      ? 'bg-yellow-400 text-yellow-900 border-yellow-600' 
                      : 'bg-stone-600 text-stone-400 border-stone-800 hover:bg-stone-500'}
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={handleStartGame}
            disabled={selectedTables.length === 0}
            className={`w-full py-6 text-2xl md:text-4xl font-black rounded-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all shadow-xl
               ${selectedTables.length > 0 
                 ? 'bg-green-500 text-white border-green-700 hover:bg-green-400' 
                 : 'bg-stone-500 text-stone-300 border-stone-700 cursor-not-allowed'}
            `}
          >
            START DEFENSE
          </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="min-h-screen bg-black/90 flex flex-col items-center justify-center text-center p-4 z-50 fixed inset-0">
        <h1 className="text-6xl sm:text-8xl text-red-500 mb-8 font-black drop-shadow-[0_5px_0_#fff]" style={{ textShadow: '4px 4px 0 #000' }}>GAME OVER</h1>
        <div className="wood-panel p-8 mb-8">
            <p className="text-2xl sm:text-4xl text-yellow-100 font-bold">Score: {score}</p>
        </div>
        <button 
          onClick={handleGoToTitle}
          className="glossy-btn bg-green-500 text-white text-xl px-12 py-6 font-bold"
        >
          Return to Title
        </button>
      </div>
    );
  }

  // Playing View
  return (
    <div className={`h-[100dvh] w-screen flex flex-col bg-stone-900 relative overflow-hidden font-sans ${isPaused ? 'grayscale' : ''}`}>
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <h2 className="text-6xl text-white drop-shadow-lg font-black mb-4">PAUSED</h2>
          <button onClick={togglePause} className="glossy-btn bg-blue-500 text-white px-8 py-4 text-2xl font-bold">RESUME</button>
        </div>
      )}

      {/* HUD Bar */}
      <div className="h-20 bg-[#5d4037] flex items-center justify-between px-4 border-b-8 border-[#3e2723] z-20 shadow-xl relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 z-10">
          <div className="bg-[#3e2723] rounded-full px-4 py-2 border-2 border-[#8d6e63] flex items-center gap-2 shadow-inner">
            <span className="text-2xl filter drop-shadow-md">☀️</span>
            <span className="text-white text-xl font-bold">{Math.floor(sun)}</span>
          </div>
          <div className="bg-[#3e2723] rounded-full px-4 py-2 border-2 border-[#8d6e63] flex items-center gap-2 shadow-inner">
            <span className="text-2xl filter drop-shadow-md">❤️</span>
            <span className="text-red-400 text-xl font-bold">{lives}</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={toggleSound} className="bg-[#8d6e63] w-10 h-10 rounded-full border-b-4 border-[#3e2723] flex items-center justify-center text-xl hover:bg-[#a1887f] active:border-b-0 active:translate-y-1">
                {isMuted ? "🔇" : "🔊"}
            </button>
            <button onClick={togglePause} className="bg-blue-600 w-10 h-10 rounded-full border-b-4 border-blue-800 flex items-center justify-center text-white font-bold hover:bg-blue-500 active:border-b-0 active:translate-y-1">
                {isPaused ? "▶" : "||"}
            </button>
            <button onClick={handleGoToTitle} className="bg-red-600 w-10 h-10 rounded-full border-b-4 border-red-800 flex items-center justify-center text-white text-xl hover:bg-red-500 active:border-b-0 active:translate-y-1">
                🏠
            </button>
          </div>
        </div>

        {/* Plant Selector */}
        <div className="flex gap-2 z-10">
          {Object.values(PLANT_CONFIGS).map((config, idx) => (
            <button key={config.type} onClick={() => handlePlantSelect(config.type)} 
              className={`relative w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all overflow-visible shadow-lg
                ${selectedPlantType === config.type ? 'border-yellow-400 bg-[#8d6e63] scale-110' : 'border-[#3e2723] bg-[#5d4037]'}
                ${sun < config.cost ? 'opacity-50 grayscale' : 'hover:bg-[#6d4c41]'}
              `}>
              
              <div className={`w-10 h-10 mb-1 pointer-events-none filter drop-shadow-md`} dangerouslySetInnerHTML={{ __html: config.svg(1) }} />
              <span className={`text-xs font-bold ${sun < config.cost ? 'text-red-300' : 'text-white'}`}>{config.cost}</span>
              
              {tooltip && selectedPlantType === config.type && (
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 z-50 bg-[#fffbeb] border-2 border-[#78350f] p-3 rounded-xl shadow-xl text-center pointer-events-none min-w-[160px]">
                   <h3 className="text-[#78350f] font-black text-sm mb-1">{tooltip.name}</h3>
                   <p className="text-[#92400e] text-xs leading-tight">{tooltip.desc}</p>
                   <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fffbeb] border-l-2 border-t-2 border-[#78350f] transform rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game Area - Lawn Background */}
      <div className="flex-1 relative overflow-hidden touch-none lawn-bg">
        
        {/* Grid Layer */}
        <div className="absolute inset-0 flex flex-col pt-4 pb-2 px-4">
          {Array.from({ length: ROWS }).map((_, r) => (
            <div key={r} className="flex-1 flex w-full mb-2">
              {Array.from({ length: COLS }).map((_, c) => {
                 const healerNearby = plants.some(p => p.type === PlantType.SUNFLOWER && (Math.abs(p.row - r) + Math.abs(p.col - c) === 1));
                 return (
                  <div key={c} 
                       className={`flex-1 relative rounded-lg mx-1 transition-colors duration-200
                         ${healerNearby ? 'bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)] border-2 border-yellow-300' : 'hover:bg-white/10'}
                       `}
                       onClick={() => handleCellClick(r, c)}>
                        {/* Optional subtle tile marker */}
                        <div className="absolute inset-0 border-2 border-black/5 rounded-lg pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {feedbackMsg && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-full border-2 border-white text-xl font-bold animate-float pointer-events-none shadow-xl">
            {feedbackMsg}
          </div>
        )}

        {/* Entities Layer */}
        {plants.map(plant => {
          const cfg = PLANT_CONFIGS[plant.type];
          const isHit = performance.now() - (plant.lastHitTime || 0) < 500;
          const isShooting = performance.now() - plant.lastActionTime < 200;
          const hpPercent = Math.max(0, (plant.hp / plant.maxHp) * 100);
          
          // CAP SCALING: Prevent overlapping. Max 1.2
          const scale = Math.min(1.2, 1 + (plant.level - 1) * 0.05);

          return (
            <div key={plant.id} className="absolute pointer-events-none"
              style={{ 
                top: `${(plant.row / ROWS) * 100}%`, 
                left: `${(plant.col / COLS) * 100}%`, 
                width: `${100/COLS}%`, 
                height: `${100/ROWS}%`,
                marginTop: '1%' // Offset for margin in grid
              }}>
              
              {/* 1. Visual Layer (Scaled) */}
              <div className="w-full h-full flex items-center justify-center transition-transform" style={{ transform: `scale(${scale})` }}>
                 {/* Aura for high level */}
                 {plant.level > 2 && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-pulse"></div>
                 )}
                 <div className={`w-[90%] h-[90%] filter drop-shadow-lg ${isHit ? 'animate-hit' : ''} ${isShooting && plant.type === PlantType.PEASHOOTER ? 'animate-shoot' : ''}`} dangerouslySetInnerHTML={{ __html: cfg.svg(plant.level) }} />
              </div>

              {/* 2. UI Layer (Unscaled - Fixed relative to grid cell) */}
              {/* HP Bar - Top Center (Unscaled), ensure visible */}
              {plant.hp < plant.maxHp && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-stone-900 rounded-full border border-white overflow-hidden z-50 shadow-md">
                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${hpPercent}%` }} />
                </div>
              )}
              
              {/* Level Badge - Bottom Right to avoid HUD overlap */}
              {plant.level > 1 && (
                <div className="absolute bottom-1 right-1 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full border border-yellow-600 font-bold z-50 shadow-sm">
                    Lv.{plant.level}
                </div>
              )}

            </div>
          );
        })}

        {zombies.map(zombie => {
           const isHit = performance.now() - (zombie.lastHitTime || 0) < 400;
           const isBoss = zombie.type === 'BOSS';

           let scale = 1.1; // Base scale up
           if (zombie.type === 'BUCKET') scale = 1.3;
           if (zombie.type === 'CONE') scale = 1.2;
           if (isBoss) scale = 1; // Boss is already big in SVG or handle via CSS height
           
           if (!isBoss) {
               scale += Math.min(0.5, (wave - 1) * 0.05);
           }

           // Boss takes up 2 rows visually
           const heightPercent = isBoss ? (100/ROWS) * 2 : (100/ROWS);

           return (
            <div key={zombie.id} className="absolute flex flex-col items-center justify-center transition-transform duration-100 ease-linear pointer-events-none"
              style={{ 
                  top: `${(zombie.row / ROWS) * 100}%`, 
                  left: `${zombie.x}%`, 
                  width: `${100/COLS}%`, 
                  height: `${heightPercent}%`, 
                  transform: 'translateX(-50%)', 
                  marginTop: isBoss ? '0' : '-2%',
                  zIndex: isBoss ? 30 : 10 // Boss renders on top
              }}>
              
              {/* Zombie HP Bar - Positioned relative to the center using left-1/2 + margin */}
              <div className="absolute left-1/2 ml-3 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-stone-900 border border-stone-600 rounded-full overflow-hidden z-20 shadow-sm flex flex-col justify-end">
                  <div className="w-full bg-red-500" style={{ height: `${Math.max(0, (zombie.hp / zombie.maxHp) * 100)}%` }} />
              </div>

              <div 
                className={`w-full h-full transform ${zombie.x % 2 > 1 ? 'scale-x-[-1]' : ''} ${isHit ? 'animate-hit' : (zombie.isEating ? 'animate-attack' : 'animate-walk')}`} 
                style={{ transformOrigin: 'bottom center', transform: `scale(${scale}) ${zombie.x % 2 > 1 ? 'scaleX(-1)' : ''}` }}
                dangerouslySetInnerHTML={{ __html: zombie.svg }} 
              />
            </div>
          );
        })}

        {projectiles.map(proj => {
          let color1 = '#bbf7d0'; // Greenish default
          let color2 = '#22c55e';
          if (proj.level === 2) { color1 = '#93c5fd'; color2 = '#3b82f6'; } // Blue plasma
          if (proj.level >= 3) { color1 = '#fca5a5'; color2 = '#ef4444'; } // Red fire

          return (
          <div key={proj.id} 
             className={`absolute rounded-full shadow-[0_0_10px_${color2}] z-20 ${proj.level > 2 ? 'w-6 h-6 md:w-8 md:h-8' : 'w-4 h-4 md:w-6 md:h-6'}`}
             style={{ 
               top: `${(proj.row / ROWS) * 100 + 10}%`, 
               left: `${proj.x}%`, 
               transform: 'translate(-50%, -50%)',
               background: `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`
             }} 
          />
        );})}

        {floatingSuns.map(s => (
          <button key={s.id} onClick={(e) => { e.stopPropagation(); collectSun(s.id, s.value); }}
            className="absolute cursor-pointer z-30 transition-transform hover:scale-110 active:scale-90"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            {/* Custom Sun Graphic instead of emoji */}
            <svg width="60" height="60" viewBox="0 0 100 100" className="animate-[spin_10s_linear_infinite]">
                <defs>
                    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="50%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#eab308" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="30" fill="url(#sunGrad)" stroke="#ca8a04" strokeWidth="2" />
                <path d="M50 10 L50 0 M50 90 L50 100 M10 50 L0 50 M90 50 L100 50 M22 22 L15 15 M78 78 L85 85 M22 78 L15 85 M78 22 L85 15" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>

      {activeMathProblem && selectedPlantType && (
        <MathModal plant={PLANT_CONFIGS[selectedPlantType]} problem={activeMathProblem.problem} onSolve={handleMathResult} onClose={() => { setActiveMathProblem(null); setSelectedPlantType(null); }} />
      )}
      {activePlantInteraction && (
        <UpgradeModal plant={activePlantInteraction} availableTables={selectedTables} onUpgrade={handleUpgrade} onHeal={handleHeal} onRemove={handleRemove} onClose={() => setActivePlantInteraction(null)} />
      )}
    </div>
  );
}