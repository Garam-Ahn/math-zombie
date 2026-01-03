
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
import { firebaseService } from './services/firebaseService'; // SKELETON INTEGRATION
import { MathModal } from './components/MathModal';
import { UpgradeModal } from './components/UpgradeModal';
import { RevengeModal } from './components/RevengeModal';
import { ReportModal } from './components/ReportModal';
import { StudyMode } from './components/StudyMode'; // New Import
import { PieGauge } from './components/PieGauge';
import { audio } from './services/audioService';
import { SVG_PEASHOOTER, SVG_ZOMBIE_NORMAL, SVG_COIN, SVG_LOCK } from './assets';

const uuid = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.TITLE);
  const [selectedTables, setSelectedTables] = useState<number[]>([]); 
  
  // Parental Controls
  const [lockedTables, setLockedTables] = useState<number[]>(() => {
    try {
        const saved = localStorage.getItem('mvz_locked_tables');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isParentMode, setIsParentMode] = useState(false);
  
  // PIN Logic
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const PARENT_PIN = "0215";

  // In-Game Study Mode
  const [showStudyModal, setShowStudyModal] = useState(false);

  const [isMuted, setIsMuted] = useState(audio.getMuteStatus());
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

  // Coins Data
  const [totalCoins, setTotalCoins] = useState(0); // Loaded from save
  const [sessionCoins, setSessionCoins] = useState(0); // Earned this round

  // --- DATA TRACKING & SKILLS ---
  const [mathHistory, setMathHistory] = useState<MathHistoryItem[]>([]);
  const [wrongCount, setWrongCount] = useState(0); 
  const [showRevenge, setShowRevenge] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // Visual effects
  const [flashLightning, setFlashLightning] = useState(false); 
  const [showRevengeSuccess, setShowRevengeSuccess] = useState(false);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);
  const [bossMessage, setBossMessage] = useState<string | null>(null);

  const [freezeCharge, setFreezeCharge] = useState(0); 
  const [isFrozen, setIsFrozen] = useState(false); 

  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);
  // New state for tile-based selection
  const [tileSelection, setTileSelection] = useState<{row: number, col: number} | null>(null);

  const [tooltip, setTooltip] = useState<{name: string, desc: string} | null>(null);
  const [tooltipTimer, setTooltipTimer] = useState<number | null>(null);

  // Active Reloading Problem
  const [activeReloadPlantId, setActiveReloadPlantId] = useState<string | null>(null);

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
    isFrozen,
    lastTick: 0,
    zombieSpawnTimer: 0,
    sunSpawnTimer: 0,
    waveTimer: 0,
    isPaused: false,
    showRevenge: false
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
    // PAUSE GAME logic
    stateRef.current.isPaused = !!activeMathProblem || !!activePlantInteraction || isPaused || showReport || showPinModal || showStudyModal || !!activeReloadPlantId;
    stateRef.current.showRevenge = showRevenge;
  }, [lives, plants, zombies, projectiles, floatingSuns, status, wave, isFrozen, activeMathProblem, activePlantInteraction, isPaused, showRevenge, showReport, tileSelection, showPinModal, showStudyModal, activeReloadPlantId]);

  useEffect(() => {
    if (status === GameStatus.PLAYING && !stateRef.current.isPaused && !showRevenge) {
      audio.startBGM();
    } else {
      audio.stopBGM();
    }
    return () => audio.stopBGM();
  }, [status, isPaused, showRevenge, showReport, tileSelection, showPinModal, showStudyModal, activeMathProblem, activePlantInteraction, activeReloadPlantId]);

  // --- AUTO FREEZE TRIGGER ---
  useEffect(() => {
    if (freezeCharge >= 100 && !isFrozen && !showRevenge && status === GameStatus.PLAYING) {
        triggerFreezeSkill();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freezeCharge, isFrozen, showRevenge, status]);

  const triggerFreezeSkill = () => {
    setIsFrozen(true);
    setFreezeCharge(0);
    audio.playCollect(); 
    setFeedbackMsg("❄️ AUTO FREEZE! ❄️");
    setTimeout(() => {
        setIsFrozen(false);
        setFeedbackMsg("");
    }, 5000);
  };

  const spawnCoin = (x: number, y: number) => {
      const val = 10;
      setVisualCoins(prev => [...prev, {
          id: uuid(),
          x,
          y,
          value: val,
          createdAt: performance.now()
      }]);
      setSessionCoins(prev => prev + val);
      setTotalCoins(prev => prev + val);
      audio.playCoin();
  };

  const handleMathAttempt = (problem: MathProblem, userAnswer: number, isCorrect: boolean) => {
    const attempt: MathHistoryItem = {
      timestamp: Date.now(),
      factorA: problem.factorA,
      factorB: problem.factorB,
      userAnswer,
      isCorrect
    };

    setMathHistory(prev => {
        const newHistory = [...prev, attempt];
        if (newHistory.length % 5 === 0) {
            firebaseService.syncProgress(newHistory); 
        }
        return newHistory;
    });

    if (isCorrect) {
      const increment = 100 / FREEZE_THRESHOLD;
      setFreezeCharge(prev => Math.min(100, prev + increment)); 
      firebaseService.addScore(10); 
    } else {
      setWrongCount(prev => {
          const newVal = prev + 1;
          if (newVal >= REVENGE_THRESHOLD) {
              setTimeout(() => setShowRevenge(true), 500); 
              return 0; 
          }
          return newVal;
      });
    }
  };

  // Triggered AFTER Revenge Modal is completed successfully
  const handleRevengeComplete = () => {
    setShowRevenge(false);
    setShowRevengeSuccess(true);
    
    // Fix: Show flash only briefly to avoid white screen lock
    setFlashLightning(true);
    setTimeout(() => setFlashLightning(false), 500);

    setWrongCount(0); 
    firebaseService.addScore(100);
    audio.playRevengeSuccess(); 
    
    // Bonus coins
    setSessionCoins(p => p + 100);
    setTotalCoins(p => p + 100);

    // Instead of just clearing zombies, we reduce their HP then SPAWN THE BOSS
    setZombies(prev => prev.map(z => {
        if (z.isDying) return z;
        return { ...z, hp: 0 }; // Kill all existing weak zombies to make room for boss
    }));

    setTimeout(() => {
        setShowRevengeSuccess(false);
        // SPAWN ZOMBOSS EVENT
        spawnZombossAndHorde();
    }, 3000);
  };

  const spawnZombossAndHorde = () => {
      setBossMessage("WARNING: ZOMBOSS APPROACHING!");
      audio.playBossWarning();
      
      setTimeout(() => {
          setBossMessage(null);
          
          // Spawn Zomboss in middle row
          // FIX: Spawn Zomboss closer (95) so he leads the charge
          const zomboss: ZombieEntity = {
              id: uuid(),
              row: 2, 
              x: 95, 
              hp: 1000, 
              maxHp: 1000,
              speed: 0.02, // Slow
              damage: 100,
              attackSpeed: 2000,
              isEating: false,
              type: 'BOSS',
              svg: ZOMBIE_VARIANTS.find(v => v.type === 'BOSS')!.svg,
              lastHitTime: 0,
              lastAttackTime: 0
          };

          // Spawn Horde (4 other random zombies)
          // FIX: Spawn them further back (110+) so they are behind Zomboss
          const horde: ZombieEntity[] = [];
          for(let i=0; i<5; i++) {
              const row = i % ROWS; 
              const z = createZombie(wave + 5, row);
              // Stagger them behind Zomboss
              z.x = 110 + (i * 5) + Math.random() * 5;
              horde.push(z);
          }

          setZombies(prev => [...prev, zomboss, ...horde]);

      }, 3000);
  };

  const createZombie = (currentWave: number, forceRow?: number): ZombieEntity => {
    const possibleVariants: (typeof ZOMBIE_VARIANTS)[number][] = [ZOMBIE_VARIANTS[0]];
    if (currentWave >= 3) possibleVariants.push(ZOMBIE_VARIANTS[1]);
    if (currentWave >= 6) possibleVariants.push(ZOMBIE_VARIANTS[2]);
    
    let variant = possibleVariants[Math.floor(Math.random() * possibleVariants.length)];
    const row = forceRow ?? Math.floor(Math.random() * ROWS);
    
    // ELITE WAVE LOGIC: Scale stats instead of quantity
    const isElite = Math.random() < 0.2 + (currentWave * 0.05); // Chance increases with wave
    const difficultyMult = 1 + (currentWave * 0.15); 
    
    const finalHp = variant.hp * difficultyMult * (isElite ? 2 : 1);
    const finalSpeed = variant.speed * (1 + (currentWave * 0.05));

    return {
      id: uuid(),
      row,
      x: 100, 
      hp: finalHp,
      maxHp: finalHp,
      speed: finalSpeed,
      damage: variant.damage,
      attackSpeed: variant.attackSpeed,
      isEating: false,
      type: variant.type,
      svg: variant.svg,
      lastHitTime: 0,
      lastAttackTime: 0,
      isElite
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

  // --- RELOAD LOGIC ---
  const handleReloadResult = (success: boolean) => {
      if (!activeReloadPlantId) return;
      if (success) {
          setPlants(prev => prev.map(p => {
              if (p.id === activeReloadPlantId) {
                  return { ...p, ammo: PLANT_CONFIGS[p.type].maxAmmo, lastActionTime: 0 }; // Full reload + instant ready
              }
              return p;
          }));
          audio.playUpgradeSuccess();
          setFeedbackMsg("RELOADED!");
          setTimeout(() => setFeedbackMsg(""), 1000);
      }
      setActiveReloadPlantId(null);
      // Close math modal by clearing activeMathProblem is handled by the Modal onClose binding if we reuse logic, 
      // but here we are using a separate flow.
      setActiveMathProblem(null);
  };

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

        // Wave Progress
        if (state.waveTimer > 30000) { 
           setWave(prev => prev + 1);
           setFeedbackMsg(`WAVE ${state.wave + 1}`);
           setTimeout(() => setFeedbackMsg(""), 3000);
           state.waveTimer = 0;
        }

        let currentZombies = [...state.zombies];
        const spawnRate = Math.max(1500, 10000 - (state.wave * 800)); 
        
        if (!state.isFrozen && state.zombieSpawnTimer > spawnRate) {
          // ZOMBIE CAP CHECK: Don't spawn if too many
          if (currentZombies.length < MAX_ZOMBIES_ON_SCREEN) {
             currentZombies.push(createZombie(state.wave));
             state.zombieSpawnTimer = 0;
          }
        }

        if (state.sunSpawnTimer > 8000) {
          spawnSun();
          state.sunSpawnTimer = 0;
        }

        const sunsToAutoCollect = state.floatingSuns.filter(s => timestamp - s.createdAt > 5000);
        if (sunsToAutoCollect.length > 0) {
            sunsToAutoCollect.forEach(s => collectSun(s.id, s.value));
        }

        // Cleanup visual coins after 1.5s
        setVisualCoins(prev => prev.filter(c => timestamp - c.createdAt < 1500));

        const newProjectiles = [...state.projectiles];
        let updatedPlants = state.plants.map(p => ({...p}));
        const plantsToRemove: string[] = [];

        // Plants Action
        updatedPlants = updatedPlants.map(plant => {
          const config = PLANT_CONFIGS[plant.type];
          
          if (plant.type === PlantType.PEASHOOTER) {
            // Check Ammo
            if ((plant.ammo || 0) <= 0) {
                // Out of ammo state, handled in renderer
                return plant;
            }

            const zombieInLane = currentZombies.some(z => {
                if (z.x <= 5 || z.isDying) return false; 
                if (z.row === plant.row) return true;
                if (z.type === 'BOSS' && z.row + 1 === plant.row) return true;
                return false;
            });

            if (zombieInLane && timestamp - plant.lastActionTime > config.cooldown) {
              const finalDamage = (config.damage || 60) * (1 + (plant.level - 1) * 0.5);
              newProjectiles.push({
                id: uuid(),
                row: plant.row,
                x: (plant.col / COLS) * 100 + 5,
                damage: finalDamage,
                level: plant.level
              });
              audio.playShoot();
              plant.lastActionTime = timestamp;
              plant.ammo = (plant.ammo || 0) - 1; // Decrease Ammo
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
                if (z.isDying) return z;
                const zCol = (z.x / 100) * COLS;
                const effectiveRowDist = z.type === 'BOSS' ? Math.min(Math.abs(z.row - plant.row), Math.abs((z.row + 1) - plant.row)) : Math.abs(z.row - plant.row);

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

        // Projectiles
        const survivingProjectiles: ProjectileEntity[] = [];
        let zombiesTookDamage = [...currentZombies];

        newProjectiles.forEach(proj => {
          // OPTIMIZATION: Projectiles move faster (2x) to reduce count on screen
          proj.x += 2; 
          let hit = false;
          
          // SORT ZOMBIES BY X (ASCENDING) so projectiles hit the front-most zombie first
          // This ensures Zomboss (who is spawned closer at 95) is hit before horde (110+)
          // even if horde is faster and catches up.
          zombiesTookDamage.sort((a, b) => a.x - b.x);

          // Find Hit Target
          const hitTarget = zombiesTookDamage.find(z => {
             if (z.isDying) return false;
             const isRowMatch = (z.row === proj.row) || (z.type === 'BOSS' && z.row + 1 === proj.row);
             return isRowMatch && z.x < proj.x && z.x + 5 > proj.x;
          });

          if (hitTarget) {
              hit = true;
              audio.playHit();
              
              // SPLASH DAMAGE LOGIC: Find clustered zombies
              const splashTargets = zombiesTookDamage.filter(z => {
                  if (z.isDying) return false;
                  if (z.id === hitTarget.id) return true; // Include self
                  const isRowMatch = (z.row === proj.row) || (z.type === 'BOSS' && z.row + 1 === proj.row);
                  // Splash range: +/- 4% screen width
                  return isRowMatch && Math.abs(z.x - hitTarget.x) < 4;
              });

              // Apply damage to all splash targets
              splashTargets.forEach(z => {
                  const isBoss = z.type === 'BOSS';
                  // NO KNOCKBACK FOR BOSS: Keeps Boss in front to take damage
                  const knockback = isBoss ? 0 : 3;
                  
                  // --- SUNFLOWER AURA LOGIC ---
                  const zCol = Math.floor((z.x / 100) * COLS);
                  const nearbySunflower = updatedPlants.find(p => 
                      p.type === PlantType.SUNFLOWER && 
                      Math.abs(p.row - z.row) <= 1 && 
                      Math.abs(p.col - zCol) <= 1
                  );
                  let damageMultiplier = 1;
                  if (nearbySunflower) {
                      damageMultiplier = 1 + (nearbySunflower.level * 0.2); // +20% damage taken per level
                  }
                  
                  z.hp = z.hp - (proj.damage * damageMultiplier);
                  z.lastHitTime = timestamp;
                  z.x = Math.min(100, z.x + knockback);
              });
          }

          if (!hit && proj.x < 100) survivingProjectiles.push(proj);
        });

        // Zombie Logic
        let livesLost = 0;
        const activeZombies: ZombieEntity[] = [];
        let bossDefeatedThisTick = false;

        for (const z of zombiesTookDamage) {
            if (z.hp <= 0 && !z.isDying) {
                // DEATH LOGIC
                if (z.type === 'BOSS') {
                    bossDefeatedThisTick = true;
                    // BOSS DEFEAT EVENT
                    setFlashLightning(true);
                    setTimeout(() => setFlashLightning(false), 500); // Brief flash only

                    audio.playBossDefeat();
                    setBossMessage("ZOMBOSS DEFEATED!");
                    setTimeout(() => setBossMessage(null), 3000);
                    spawnCoin(z.x, 50); // Big reward
                    setScore(s => s + 500);
                } else {
                    audio.playZombieDeath(); 
                    setScore(s => s + 10);
                    spawnCoin(z.x, (z.row / ROWS) * 100 + 10);
                }
                activeZombies.push({ ...z, isDying: true, deathTime: timestamp }); 
                continue;
            }

            if (z.isDying) {
                if (timestamp - (z.deathTime || 0) < 1000) {
                    activeZombies.push(z);
                }
                continue; 
            }
            
            let moveSpeed = state.isFrozen ? 0 : z.speed;
            
            const isStunned = (timestamp - (z.lastHitTime || 0)) < 300; 
            if (isStunned) {
                moveSpeed = -0.05; 
            }
            
            let eating = false;
            if (!isStunned && !state.isFrozen) {
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
            if (newX <= 0) { 
                livesLost += 1; 
            }
            else activeZombies.push({ ...z, x: newX, isEating: eating, isFrozen: state.isFrozen });
        }

        // --- ZOMBOSS DEATH EFFECT: WEAKEN ALL ZOMBIES ---
        if (bossDefeatedThisTick) {
            setFeedbackMsg("ZOMBIES WEAKENED!");
            setTimeout(() => setFeedbackMsg(""), 3000);
            activeZombies.forEach(z => {
                if (z.type !== 'BOSS' && !z.isDying) {
                    const threshold = z.maxHp * 0.1;
                    if (z.hp < threshold) {
                         // Die immediately if already weak
                         z.hp = 0;
                         // Let next tick handle death animation start for cleaner loop
                    } else {
                         // Reduce to 10%
                         z.hp = threshold;
                    }
                }
            });
        }

        const finalPlants = updatedPlants.filter(p => p.hp > 0 && !plantsToRemove.includes(p.id));
        
        if (livesLost > 0) {
            setLives(l => l - livesLost);
            audio.playDamage();
            setShowDamageOverlay(true);
            setTimeout(() => setShowDamageOverlay(false), 500);
        }

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
  
  // PAUSE NOW TOGGLES REPORT
  const togglePause = () => {
      // Toggle Report. The useEffect above handles the "paused" state logic via state.isPaused
      setShowReport(prev => !prev);
  };

  const handleParentModeToggle = () => {
      if (isParentMode) {
          // Exit parent mode immediately without PIN (convenience)
          setIsParentMode(false);
          audio.playCollect();
      } else {
          // Enter parent mode requires PIN
          setPinInput("");
          setShowPinModal(true);
          audio.playCollect();
      }
  };

  const handlePinSubmit = () => {
      if (pinInput === PARENT_PIN) {
          setIsParentMode(true);
          setShowPinModal(false);
          audio.playCorrect();
      } else {
          audio.playWrong();
          setPinInput(""); // Clear input on error
          // Optional shake effect visual can be added here if needed, simple logic for now
      }
  };

  const handlePinInput = (num: number) => {
      if (pinInput.length < 4) {
          setPinInput(prev => prev + num);
          audio.playCollect();
      }
  };

  const toggleTableSelection = (num: number) => {
    // If Parent Mode is Active: Toggle Lock status
    if (isParentMode) {
        const newLocks = lockedTables.includes(num)
            ? lockedTables.filter(n => n !== num)
            : [...lockedTables, num];
        setLockedTables(newLocks);
        localStorage.setItem('mvz_locked_tables', JSON.stringify(newLocks));
        
        // If locking a currently selected table, deselect it
        if (!lockedTables.includes(num) && selectedTables.includes(num)) {
            setSelectedTables(prev => prev.filter(n => n !== num));
        }
        audio.playCollect(); // Use generic sound for lock toggle
        return;
    }

    // Normal Mode: Cannot select locked tables
    if (lockedTables.includes(num)) {
        audio.playWrong(); // Indicate forbidden
        // Optional: Shake effect or visual feedback handled in render
        return;
    }

    // Normal Selection
    setSelectedTables(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
    audio.playCollect();
  };

  const handleStartGame = () => {
    if (selectedTables.length === 0) return;
    audio.playGameStart();
    setSun(INITIAL_SUN); setLives(INITIAL_LIVES); setPlants([]); setZombies([]); setProjectiles([]); setFloatingSuns([]); setWave(1); setScore(0);
    setSessionCoins(0); 
    setMathHistory([]); setWrongCount(0); setShowRevenge(false);
    setFreezeCharge(0); setIsFrozen(false);
    setStatus(GameStatus.PLAYING); setIsPaused(false);
  };

  const handleGoToTitle = () => {
    audio.stopBGM();
    setPlants([]); setZombies([]); setProjectiles([]); setFloatingSuns([]); setWave(1); setScore(0); setLives(INITIAL_LIVES); setSun(INITIAL_SUN); setSelectedTables([]); setActiveMathProblem(null); setActivePlantInteraction(null); setFeedbackMsg("");
    setStatus(GameStatus.TITLE); setIsPaused(false); setShowRevenge(false);
    setIsParentMode(false); // Reset parent mode on exit
    setShowPinModal(false);
    setShowStudyModal(false);
  };

  const handlePlantSelect = (type: PlantType) => {
    const cfg = PLANT_CONFIGS[type];
    if (selectedPlantType !== type) {
       setSelectedPlantType(type);
       setTooltip({ name: cfg.name, desc: cfg.description });
       setTileSelection(null); // Clear tile selection if manually picking plant
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

  // Called when picking a plant from the tile popup
  const handleTilePlantSelect = (type: PlantType) => {
    if (!tileSelection) return;
    const cfg = PLANT_CONFIGS[type];
    
    // Check Peashooter Limit
    if (type === PlantType.PEASHOOTER) {
        const peashooterCount = plants.filter(p => p.type === PlantType.PEASHOOTER).length;
        if (peashooterCount >= PEASHOOTER_LIMIT) {
            audio.playWrong();
            setFeedbackMsg(`피슈터는 ${PEASHOOTER_LIMIT}마리까지만!`);
            setTimeout(() => setFeedbackMsg(""), 1500);
            setTileSelection(null);
            return;
        }
    }

    if (sun < cfg.cost) {
      audio.playWrong();
      return; // Do nothing if too expensive
    }

    // Identical logic to normal plant placement
    audio.playCollect();
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const b = Math.floor(Math.random() * 9) + 1;
    
    // NOTE: We do NOT need to set selectedPlantType here. 
    // We just set the active problem. The modal should appear if there is an active problem.
    setActiveMathProblem({ 
        plantType: type, 
        row: tileSelection.row, 
        col: tileSelection.col, 
        problem: { factorA: table, factorB: b, answer: table * b } 
    });
    setTileSelection(null); // Close menu
  };

  const handleCellClick = (row: number, col: number) => {
    if (status !== GameStatus.PLAYING || isPaused || showRevenge) return;
    const existingPlant = plants.find(p => p.row === row && p.col === col);
    
    // 1. Interaction with existing plant
    if (existingPlant) {
      // CHECK AMMO
      if (existingPlant.type === PlantType.PEASHOOTER && (existingPlant.ammo || 0) <= 0) {
          // Trigger Reload Math Event
          const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
          const b = Math.floor(Math.random() * 9) + 1;
          setActiveReloadPlantId(existingPlant.id);
          setActiveMathProblem({
              plantType: existingPlant.type,
              row: existingPlant.row,
              col: existingPlant.col,
              problem: { factorA: table, factorB: b, answer: table * b }
          });
          audio.playCollect();
          return;
      }

      if (!selectedPlantType) { 
        setActivePlantInteraction(existingPlant); 
        // IMPORTANT: If tile menu was open, close it to avoid conflict
        setTileSelection(null);
        audio.playCollect(); 
      }
      return;
    }

    // 2. Manual Plant Selection Active (Top Bar)
    if (selectedPlantType) {
        // Check Peashooter Limit
        if (selectedPlantType === PlantType.PEASHOOTER) {
            const peashooterCount = plants.filter(p => p.type === PlantType.PEASHOOTER).length;
            if (peashooterCount >= PEASHOOTER_LIMIT) {
                audio.playWrong();
                setFeedbackMsg(`피슈터는 ${PEASHOOTER_LIMIT}마리까지만!`);
                setTimeout(() => setFeedbackMsg(""), 1500);
                setSelectedPlantType(null);
                setTooltip(null);
                return;
            }
        }

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
        return;
    }

    // 3. No plant selected + Empty Tile -> Open Tile Selection Menu
    setTileSelection({ row, col });
    audio.playCollect();
  };

  const handleMathResult = async (success: boolean) => {
    // Check if this is a RELOAD event
    if (activeReloadPlantId) {
        handleReloadResult(success);
        return;
    }

    if (!activeMathProblem) return;
    
    if (success) {
      const config = PLANT_CONFIGS[activeMathProblem.plantType];
      setSun(prev => Math.max(0, prev - config.cost));
      setPlants(prev => [...prev, {
        id: uuid(), type: activeMathProblem.plantType, row: activeMathProblem.row, col: activeMathProblem.col,
        hp: config.hp, maxHp: config.hp, level: 1, lastActionTime: performance.now(), lastHitTime: 0,
        ammo: config.maxAmmo // Initialize Ammo
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
        // FIX: Restore HP to max, reload Ammo
        const config = PLANT_CONFIGS[p.type];
        return { 
            ...p, 
            level: p.level + levelIncrement, 
            maxHp: p.maxHp + 50, 
            hp: p.maxHp + 50, 
            ammo: config.maxAmmo 
        };
      }
      return p;
    }));
    setActivePlantInteraction(null);
  };

  const handleHeal = (plantId: string) => {
    // FIX: Restore HP to max, reload Ammo
    setPlants(prev => prev.map(p => {
        if (p.id === plantId) {
            const config = PLANT_CONFIGS[p.type];
            return { ...p, hp: p.maxHp, ammo: config.maxAmmo };
        }
        return p;
    }));
    setFeedbackMsg(`Fully Healed & Reloaded!`);
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

  const handleLoadSave = (coins: number, loadedScore: number) => {
      setTotalCoins(coins);
      setScore(loadedScore); // Might be cumulative score
  };

  // --- RENDERERS ---

  if (status === GameStatus.TITLE) {
    return (
      <div className="h-[100dvh] w-screen relative overflow-hidden bg-sky-300 font-sans select-none flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-100" />
        <div className="absolute bottom-0 w-full h-1/2 bg-green-500 rounded-t-[50%] scale-150 translate-y-20 border-t-8 border-green-600"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-green-400 rounded-t-[40%] scale-125 translate-y-10 -translate-x-20 border-t-8 border-green-500"></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* Title Section */}
            <div className="relative z-30 flex flex-col items-center animate-float mb-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl landscape:text-5xl landscape:md:text-6xl text-yellow-400 text-center font-black drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-wider stroke-black leading-tight" style={{ textShadow: '4px 4px 0 #000' }}>
                  MATH<br/>
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white">VS</span><br/>
                  ZOMBIES
                </h1>
                <div className="mt-2 md:mt-4 text-2xl md:text-3xl lg:text-5xl landscape:text-2xl text-blue-400 font-black tracking-widest uppercase transform -rotate-2 hover:scale-110 transition-transform cursor-default" style={{ textShadow: '4px 4px 0 #000', WebkitTextStroke: '2px white' }}>
                    For Gio ⚡
                </div>
                {/* Improved Label Visibility: Moved out of flow, high z-index, specific placement */}
                <div className="absolute -bottom-10 right-0 md:-right-12 rotate-[-8deg] bg-red-600 text-white font-bold text-xs sm:text-sm md:text-xl px-4 py-1 rounded-full border-4 border-white shadow-xl transform hover:scale-110 transition-transform z-40 whitespace-nowrap">
                  Multiplication Edition!
                </div>
            </div>

            {/* VS Characters - Giant Side Positioning for Versus Feel */}
            
            {/* Left Peashooter */}
            <div className="absolute left-[-10px] bottom-0 md:left-4 md:bottom-10 w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 filter drop-shadow-2xl animate-bounce z-10 pointer-events-none" style={{ animationDuration: '3s' }}>
                 <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: SVG_PEASHOOTER(1) }} />
            </div>

            {/* Right Zombie - Flipped to face Left */}
            <div className="absolute right-[-10px] bottom-0 md:right-4 md:bottom-10 w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 filter drop-shadow-2xl animate-bounce z-10 pointer-events-none" style={{ animationDuration: '3.5s' }}>
                 {/* Standard zombie SVG faces left, so no transform needed, or scale-x-[-1] if it faces right. Assuming assets usually face right -> left for enemies.
                     If zombie naturally faces left, we leave it. If it looks right, we flip. 
                     Based on standard PVZ art, zombies walk Left. So it faces Left.
                     So no transform needed to make it face the center (Left).
                 */}
                 <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: SVG_ZOMBIE_NORMAL }} />
            </div>

            {/* Buttons - High Z-index to sit on top of large characters if overlap occurs */}
            <div className="relative z-50 flex gap-4 flex-wrap justify-center mt-8">
                <button 
                  onClick={() => {
                    audio.playCollect();
                    setStatus(GameStatus.MENU);
                  }}
                  className="glossy-btn bg-green-500 hover:bg-green-400 text-white text-2xl md:text-3xl lg:text-4xl landscape:text-xl py-4 px-12 md:py-6 md:px-16 border-b-8 border-green-700 active:border-b-0 active:translate-y-2 transition-all shadow-2xl animate-pulse font-black rounded-xl"
                >
                  PLAY
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            audio.playCollect();
                            setStatus(GameStatus.STUDY);
                        }}
                        className="bg-purple-500 hover:bg-purple-400 text-white p-3 md:p-4 rounded-xl border-b-8 border-purple-700 active:border-b-0 active:translate-y-2 font-bold flex flex-col items-center justify-center min-w-[80px]"
                    >
                        <span className="text-xl md:text-2xl lg:text-3xl">🌿</span>
                        <span className="text-xs md:text-sm">Study</span>
                    </button>
                    <button
                        onClick={() => { setShowReport(true); audio.playCollect(); }}
                        className="bg-blue-500 hover:bg-blue-400 text-white p-3 md:p-4 rounded-xl border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 font-bold flex flex-col items-center justify-center min-w-[80px]"
                    >
                        <span className="text-xl md:text-2xl lg:text-3xl">📊</span>
                        <span className="text-xs md:text-sm">Report</span>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-2 text-white/60 text-[10px] font-bold z-30">
               © Garam Ahn. All rights reserved.
            </div>
        </div>
        {showReport && (
            <ReportModal 
                history={mathHistory} 
                totalCoins={totalCoins} 
                totalScore={score} 
                onClose={() => setShowReport(false)}
                onLoadSave={handleLoadSave}
            />
        )}
      </div>
    );
  }

  // --- STUDY MODE ---
  if (status === GameStatus.STUDY) {
    return (
        <StudyMode 
            onBack={handleGoToTitle} 
            onPlay={() => { audio.playCollect(); setStatus(GameStatus.MENU); }} 
        />
    );
  }

  if (status === GameStatus.MENU) {
    return (
      <div className="h-[100dvh] bg-stone-800 flex flex-col items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <button onClick={handleGoToTitle} className="text-white text-xl hover:text-yellow-400 font-bold drop-shadow-md bg-black/30 px-4 py-2 rounded-full">← Back</button>
            <button 
                onClick={handleParentModeToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border-2 transition-all shadow-lg
                    ${isParentMode 
                        ? 'bg-red-600 text-white border-red-400 animate-pulse' 
                        : 'bg-stone-700 text-stone-400 border-stone-500'}
                `}
            >
                <div className="w-4 h-4" dangerouslySetInnerHTML={{ __html: SVG_LOCK }} />
                <span className="text-xs uppercase tracking-wider">Parents</span>
            </button>
        </div>

        <div className={`wood-panel p-8 max-w-4xl w-full relative z-10 flex flex-col items-center transition-all ${isParentMode ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-2 text-yellow-100 font-black drop-shadow-md text-center">
              {isParentMode ? "🔒 TAP TO LOCK/UNLOCK TABLES" : "Select Multiplication Tables"}
          </h2>
          {isParentMode && (
              <p className="text-red-300 font-bold mb-6 text-sm">Grayed out tables cannot be selected by the child.</p>
          )}

          <div className="grid grid-cols-4 gap-4 mb-8 w-full mt-4">
            {[2, 3, 4, 5, 6, 7, 8, 9].map(num => {
              const isSelected = selectedTables.includes(num);
              const isLocked = lockedTables.includes(num);
              
              // Visual State Logic
              let btnClass = "";
              if (isParentMode) {
                  // In Parent Mode: Show Locked vs Unlocked state clearly
                  if (isLocked) {
                      btnClass = "bg-stone-800 text-stone-500 border-stone-900 opacity-80 ring-2 ring-red-500";
                  } else {
                      btnClass = "bg-green-600 text-white border-green-800 opacity-50"; // Dim unlocked to show they are toggleable
                  }
              } else {
                  // Normal Mode
                  if (isLocked) {
                      btnClass = "bg-stone-800 text-stone-600 border-stone-900 cursor-not-allowed grayscale opacity-60";
                  } else if (isSelected) {
                      btnClass = "bg-yellow-400 text-yellow-900 border-yellow-600";
                  } else {
                      btnClass = "bg-stone-600 text-stone-400 border-stone-800 hover:bg-stone-500";
                  }
              }

              return (
                <button
                  key={num}
                  onClick={() => toggleTableSelection(num)}
                  className={`relative text-2xl md:text-4xl py-6 rounded-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all font-black shadow-lg
                    ${btnClass}
                  `}
                >
                  <span className={isSelected || (isParentMode && !isLocked) ? "" : "opacity-80"}>{num}</span>
                  
                  {/* Lock Overlay */}
                  {isLocked && (
                      <div className="absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 pointer-events-none drop-shadow-md">
                           <div dangerouslySetInnerHTML={{ __html: SVG_LOCK }} />
                      </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {!isParentMode && (
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
          )}
          {isParentMode && (
              <button 
                onClick={() => setIsParentMode(false)}
                className="w-full py-6 text-xl md:text-2xl font-black rounded-xl border-b-8 border-red-800 bg-red-600 text-white hover:bg-red-500 active:border-b-0 active:translate-y-2 shadow-xl"
              >
                  EXIT PARENT MODE
              </button>
          )}
        </div>

        {/* PIN MODAL */}
        {showPinModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="wood-panel p-6 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-xl text-yellow-200 font-bold mb-4">Enter Parent PIN</h3>
                    
                    {/* Display */}
                    <div className="bg-black/50 w-full p-4 rounded-lg mb-4 text-center text-2xl tracking-[0.5em] font-mono text-white h-16 flex items-center justify-center border-2 border-stone-600 shadow-inner">
                        {pinInput.split('').map(() => '*').join('') || <span className="opacity-30 text-sm tracking-normal">****</span>}
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-2 w-full mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button 
                                key={num} 
                                onClick={() => handlePinInput(num)}
                                className="bg-stone-700 text-white text-xl py-3 rounded shadow active:bg-stone-600 font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-1"
                            >
                                {num}
                            </button>
                        ))}
                        <button onClick={() => setPinInput("")} className="bg-red-600 text-white text-sm py-3 rounded shadow font-bold border-b-4 border-red-800 active:border-b-0 active:translate-y-1">CLR</button>
                        <button onClick={() => handlePinInput(0)} className="bg-stone-700 text-white text-xl py-3 rounded shadow font-bold border-b-4 border-stone-900 active:border-b-0 active:translate-y-1">0</button>
                        <button onClick={handlePinSubmit} className="bg-green-600 text-white text-sm py-3 rounded shadow font-bold border-b-4 border-green-800 active:border-b-0 active:translate-y-1">OK</button>
                    </div>
                    
                    <button onClick={() => setShowPinModal(false)} className="text-stone-400 text-sm hover:text-white mt-2">Cancel</button>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="min-h-screen bg-black/90 flex flex-col items-center justify-center text-center p-4 z-50 fixed inset-0">
        <h1 className="text-6xl sm:text-8xl text-red-500 mb-8 font-black drop-shadow-[0_5px_0_#fff]" style={{ textShadow: '4px 4px 0 #000' }}>GAME OVER</h1>
        <div className="wood-panel p-8 mb-8">
            <p className="text-2xl sm:text-4xl text-yellow-100 font-bold">Score: {score}</p>
            <p className="text-xl text-yellow-200 mt-2">Coins Earned: {sessionCoins}</p>
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

  // MAIN GAME RENDER
  return (
    <div className="h-[100dvh] w-screen relative overflow-hidden font-sans bg-stone-900">
      
      {/* Damage Overlay */}
      {showDamageOverlay && (
          <div className="absolute inset-0 bg-red-600/40 z-[100] animate-pulse pointer-events-none mix-blend-multiply"></div>
      )}

      {/* --- GAME WORLD LAYER (Can be Grayed Out) --- */}
      <div className={`flex flex-col h-full w-full transition-all duration-500 ${isPaused || showRevenge || showReport || showStudyModal || activeReloadPlantId ? 'grayscale brightness-50' : ''}`}>
        
        {/* HUD Bar */}
        <div className="h-14 sm:h-20 bg-[#5d4037] flex items-center justify-between px-4 border-b-8 border-[#3e2723] z-20 shadow-xl relative">
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-black/20"></div>
          <div className="flex items-center gap-2 sm:gap-4 z-10">
            {/* Coins Display */}
            <div className="bg-[#3e2723] rounded-lg px-2 py-1 border border-[#8d6e63] flex flex-col text-[10px] sm:text-xs shadow-inner min-w-[60px] sm:min-w-[80px]">
                <div className="text-yellow-400 font-bold flex justify-between">
                    <span>Now:</span><span>${sessionCoins}</span>
                </div>
                <div className="text-stone-400 font-bold flex justify-between border-t border-stone-600">
                    <span>Total:</span><span>${totalCoins}</span>
                </div>
            </div>

            <div className="bg-[#3e2723] rounded-full px-3 py-1 sm:px-4 sm:py-2 border-2 border-[#8d6e63] flex items-center gap-2 shadow-inner">
              <span className="text-xl sm:text-2xl filter drop-shadow-md">☀️</span>
              <span className="text-white text-base sm:text-xl font-bold">{Math.floor(sun)}</span>
            </div>
            
            {/* Health Bar Gauge */}
            <div className="bg-[#3e2723] rounded-lg px-2 py-1 border-2 border-[#8d6e63] flex gap-1 shadow-inner h-8 sm:h-10 items-center">
               {[...Array(INITIAL_LIVES)].map((_, i) => (
                   <div key={i} className={`w-4 h-4 sm:w-6 sm:h-6 rounded-sm border transition-all duration-300 
                       ${i < lives ? 'bg-red-500 border-red-700 shadow-[0_0_5px_red]' : 'bg-stone-800 border-stone-700 opacity-30'}
                   `}></div>
               ))}
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <button onClick={toggleSound} className="bg-[#8d6e63] w-8 h-8 sm:w-10 sm:h-10 rounded-full border-b-4 border-[#3e2723] flex items-center justify-center text-lg sm:text-xl hover:bg-[#a1887f] active:border-b-0 active:translate-y-1">
                  {isMuted ? "🔇" : "🔊"}
              </button>
              
              {/* STUDY BUTTON */}
              <button onClick={() => { setShowStudyModal(true); audio.playCollect(); }} className="bg-purple-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-b-4 border-purple-800 flex items-center justify-center text-white font-bold hover:bg-purple-500 active:border-b-0 active:translate-y-1">
                  📖
              </button>

              {/* PAUSE BUTTON NOW OPENS REPORT DIRECTLY */}
              <button onClick={togglePause} className="bg-blue-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-b-4 border-blue-800 flex items-center justify-center text-white font-bold hover:bg-blue-500 active:border-b-0 active:translate-y-1">
                  {showReport ? "▶" : "||"}
              </button>
              <button onClick={handleGoToTitle} className="bg-red-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-b-4 border-red-800 flex items-center justify-center text-white text-lg sm:text-xl hover:bg-red-500 active:border-b-0 active:translate-y-1">
                  🏠
              </button>
            </div>
          </div>

          {/* Plant Selector */}
          <div className="flex gap-1 sm:gap-2 z-10">
            {Object.values(PLANT_CONFIGS).map((config, idx) => (
              <button key={config.type} onClick={() => handlePlantSelect(config.type)} 
                className={`relative w-12 h-14 sm:w-16 sm:h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all overflow-visible shadow-lg
                  ${selectedPlantType === config.type ? 'border-yellow-400 bg-[#8d6e63] scale-110' : 'border-[#3e2723] bg-[#5d4037]'}
                  ${sun < config.cost ? 'opacity-50 grayscale' : 'hover:bg-[#6d4c41]'}
                `}>
                
                <div className={`w-8 h-8 sm:w-10 sm:h-10 mb-1 pointer-events-none filter drop-shadow-md`} dangerouslySetInnerHTML={{ __html: config.svg(1) }} />
                <span className={`text-[10px] sm:text-xs font-bold ${sun < config.cost ? 'text-red-300' : 'text-white'}`}>{config.cost}</span>
                
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

        {/* LAWN AREA */}
        <div className="flex-1 relative overflow-hidden touch-none lawn-bg">
          <div className="absolute inset-0 flex flex-col pt-2 sm:pt-4 pb-2 px-4">
            {Array.from({ length: ROWS }).map((_, r) => (
              <div key={r} className="flex-1 flex w-full mb-2">
                {Array.from({ length: COLS }).map((_, c) => {
                  const nearbySunflower = plants.find(p => p.type === PlantType.SUNFLOWER && Math.abs(p.row - r) <= 1 && Math.abs(p.col - c) <= 1);
                  const isSelectedForPlanting = tileSelection?.row === r && tileSelection?.col === c;
                  const isTopRows = r < 2; // Check if it's top row to position popup below

                  return (
                    <div key={c} 
                        className={`flex-1 relative rounded-lg mx-1 transition-colors duration-200 border border-white/5
                          ${nearbySunflower ? 'bg-yellow-400/10 shadow-[inset_0_0_10px_rgba(250,204,21,0.2)]' : 'hover:bg-white/10'}
                          ${isSelectedForPlanting ? 'bg-white/20 border-2 border-white' : ''}
                        `}
                        onClick={() => handleCellClick(r, c)}>
                          
                          {/* Tile Selection Popup */}
                          {isSelectedForPlanting && (
                              <div className={`absolute left-1/2 -translate-x-1/2 z-[60] bg-[#5d4037] border-4 border-[#3e2723] rounded-xl p-2 flex gap-2 shadow-2xl animate-float
                                  ${isTopRows ? 'top-[110%]' : 'bottom-[110%]'}
                              `}>
                                  {Object.values(PLANT_CONFIGS).map((config) => {
                                      const canAfford = sun >= config.cost;
                                      return (
                                          <button 
                                            key={config.type} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTilePlantSelect(config.type);
                                            }}
                                            className={`w-14 h-16 flex flex-col items-center justify-center rounded-lg border-2 transition-all
                                                ${canAfford ? 'bg-[#8d6e63] border-yellow-500 hover:scale-110 hover:bg-[#a1887f]' : 'bg-stone-700 border-stone-600 opacity-60 grayscale cursor-not-allowed'}
                                            `}
                                          >
                                              <div className="w-8 h-8 pointer-events-none" dangerouslySetInnerHTML={{ __html: config.svg(1) }} />
                                              <span className={`text-[10px] font-bold ${canAfford ? 'text-white' : 'text-red-300'}`}>{config.cost}</span>
                                          </button>
                                      );
                                  })}
                                  {/* Close Button small X */}
                                  <button onClick={(e) => { e.stopPropagation(); setTileSelection(null); }} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white shadow-md">X</button>
                                  
                                  {/* Triangle pointer */}
                                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#5d4037] border-r-4 border-b-4 border-[#3e2723] transform rotate-45
                                      ${isTopRows ? '-top-2 border-r-0 border-b-0 border-l-4 border-t-4' : '-bottom-2'}
                                  `}></div>
                              </div>
                          )}
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

          {/* BOSS WARNING OVERLAY */}
          {bossMessage && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600/90 border-y-8 border-red-800 w-full py-8 transform -rotate-3 animate-pulse flex items-center justify-center shadow-2xl">
                      <h1 className="text-4xl md:text-6xl text-white font-black drop-shadow-[0_5px_0_#000] tracking-widest uppercase">
                          ⚠️ {bossMessage} ⚠️
                      </h1>
                  </div>
              </div>
          )}

          {plants.map(plant => {
            const cfg = PLANT_CONFIGS[plant.type];
            const isHit = performance.now() - (plant.lastHitTime || 0) < 500;
            const isShooting = performance.now() - plant.lastActionTime < 200;
            const hpPercent = Math.max(0, (plant.hp / plant.maxHp) * 100);
            const scale = Math.min(1.2, 1 + (plant.level - 1) * 0.05);
            
            // Check Ammo Status
            const noAmmo = cfg.maxAmmo && (plant.ammo || 0) <= 0;

            return (
              <div key={plant.id} className="absolute pointer-events-none flex items-center justify-center"
                style={{ 
                  top: `${(plant.row / ROWS) * 100}%`, 
                  left: `${(plant.col / COLS) * 100}%`, 
                  width: `${100/COLS}%`, 
                  height: `${100/ROWS}%`,
                }}>
                <div className="w-full h-full flex items-center justify-center transition-transform relative" style={{ transform: `scale(${scale})` }}>
                  {plant.level > 2 && (
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-pulse"></div>
                  )}
                  <div className={`w-[90%] h-[90%] filter drop-shadow-lg 
                      ${isHit ? 'animate-hit' : ''} 
                      ${isShooting && plant.type === PlantType.PEASHOOTER ? 'animate-shoot' : ''}
                      ${noAmmo ? 'grayscale opacity-70' : ''}
                  `} dangerouslySetInnerHTML={{ __html: cfg.svg(plant.level) }} />
                  
                  {/* RELOAD INDICATOR */}
                  {noAmmo && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-bounce shadow-md border border-white whitespace-nowrap z-50">
                          ⚠️ RELOAD
                      </div>
                  )}
                </div>
                {plant.hp < plant.maxHp && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-stone-900 rounded-full border border-white overflow-hidden z-50 shadow-md">
                      <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${hpPercent}%` }} />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 flex flex-col items-end gap-0.5">
                    {plant.level > 1 && (
                    <div className="bg-yellow-400 text-yellow-900 text-[8px] px-1.5 py-0.5 rounded-full border border-yellow-600 font-bold z-50 shadow-sm">
                        Lv.{plant.level}
                    </div>
                    )}
                    {/* Ammo Count */}
                    {cfg.maxAmmo && !noAmmo && (
                        <div className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 rounded-full border border-blue-700 font-bold z-50 shadow-sm">
                            {plant.ammo}
                        </div>
                    )}
                </div>
              </div>
            );
          })}

          {zombies.map(zombie => {
            const isHit = performance.now() - (zombie.lastHitTime || 0) < 300; 
            const isBoss = zombie.type === 'BOSS';

            let scale = 1.1; 
            if (zombie.type === 'BUCKET') scale = 1.3;
            if (zombie.type === 'CONE') scale = 1.2;
            if (isBoss) scale = 1.5; 
            
            // ELITE SCALING VISUALS
            if (zombie.isElite) scale *= 1.3;

            if (!isBoss && !zombie.isElite) {
                scale += Math.min(0.5, (wave - 1) * 0.05);
            }

            const heightPercent = isBoss ? (100/ROWS) * 2 : (100/ROWS);
            const hitFilter = isHit ? 'brightness(2) sepia(1) hue-rotate(-50deg)' : (isFrozen ? 'brightness(0.8) contrast(1.2)' : 'none');
            const dyingFilter = zombie.isDying ? 'grayscale(1) brightness(0.5) sepia(1) hue-rotate(-50deg)' : 'none';
            const eliteFilter = zombie.isElite ? 'drop-shadow(0 0 3px red)' : '';
            const freezeShadow = isFrozen && !zombie.isDying ? 'drop-shadow(0 0 5px #22d3ee)' : '';

            return (
              <div key={zombie.id} className="absolute flex flex-col items-center justify-center transition-transform duration-100 ease-linear pointer-events-none gpu-accelerated"
                style={{ 
                    top: `${(zombie.row / ROWS) * 100}%`, 
                    left: `${zombie.x}%`, 
                    width: `${100/COLS}%`, 
                    height: `${heightPercent}%`, 
                    transform: 'translateX(-50%) translateZ(0)', 
                    marginTop: isBoss ? '0' : '-2%',
                    zIndex: isBoss ? 30 : 10,
                    filter: `${freezeShadow} ${eliteFilter}` // Apply shadow to container
                }}>
                {!zombie.isDying && (
                  <div className="absolute left-1/2 ml-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-stone-900 border border-stone-600 rounded-full overflow-hidden z-20 shadow-sm flex flex-col justify-end">
                      <div className="w-full bg-red-500" style={{ height: `${Math.max(0, (zombie.hp / zombie.maxHp) * 100)}%` }} />
                  </div>
                )}
                <div 
                  className={`w-full h-full transform ${zombie.x % 2 > 1 ? 'scale-x-[-1]' : ''} 
                      ${zombie.isDying ? 'animate-dying' : (isHit ? 'animate-hit' : (zombie.isEating ? 'animate-attack' : (isFrozen ? '' : 'animate-walk')))}
                  `} 
                  style={{ 
                      transformOrigin: 'bottom center', 
                      transform: `scale(${scale}) ${zombie.x % 2 > 1 ? 'scaleX(-1)' : ''} translateZ(0)`,
                      filter: zombie.isDying ? dyingFilter : hitFilter,
                      opacity: zombie.isDying ? 0.7 : 1
                  }}
                  dangerouslySetInnerHTML={{ __html: zombie.svg }} 
                />
              </div>
            );
          })}

          {projectiles.map(proj => {
            // VISIBILITY FIX: Changed default colors to yellow/gold for high contrast against green grass
            let color1 = '#fef08a'; // yellow-200
            let color2 = '#eab308'; // yellow-500
            if (proj.level === 2) { color1 = '#93c5fd'; color2 = '#3b82f6'; } 
            if (proj.level >= 3) { color1 = '#fca5a5'; color2 = '#ef4444'; } 

            return (
            <div key={proj.id} 
              className={`absolute rounded-full shadow-none z-20 gpu-accelerated ${proj.level > 2 ? 'w-6 h-6 md:w-8 md:h-8' : 'w-4 h-4 md:w-6 md:h-6'}`}
              style={{ 
                top: `${(proj.row / ROWS) * 100 + 10}%`, 
                left: `${proj.x}%`, 
                transform: 'translate(-50%, -50%) translateZ(0)',
                backgroundColor: color2,
                border: '2px solid white' // Added border for extra visibility
              }} 
            />
          );})}

          {floatingSuns.map(s => (
            <button key={s.id} onClick={(e) => { e.stopPropagation(); collectSun(s.id, s.value); }}
              className="absolute cursor-pointer z-30 transition-transform hover:scale-110 active:scale-90"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}>
              <svg width="60" height="60" viewBox="0 0 100 100" className="animate-[spin_10s_linear_infinite]">
                  <circle cx="50" cy="50" r="30" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                  <path d="M50 10 L50 0 M50 90 L50 100 M10 50 L0 50 M90 50 L100 50 M22 22 L15 15 M78 78 L85 85 M22 78 L15 85 M78 22 L85 15" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </button>
          ))}

          {visualCoins.map(c => (
              <div key={c.id} className="absolute w-12 h-12 animate-[spin_0.5s_linear_infinite]"
                   style={{ left: `${c.x}%`, top: `${c.y}%`, transition: 'top 1s ease-in, opacity 1s ease-in' }}>
                   <div dangerouslySetInnerHTML={{ __html: SVG_COIN }} />
              </div>
          ))}

          {/* --- STATUS GAUGES --- */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 flex items-center gap-2 sm:gap-4 scale-75 sm:scale-100 origin-bottom-right">
            {/* REVENGE GAUGE */}
            <PieGauge 
                value={wrongCount * (100/REVENGE_THRESHOLD)} 
                max={100} 
                label="REVENGE" 
                icon="🔥" 
                type="REVENGE" 
                isActive={showRevenge} 
              />
            
            {/* FREEZE GAUGE */}
            <PieGauge 
                value={freezeCharge} 
                max={100} 
                label="FREEZE" 
                icon="❄️" 
                type="FREEZE" 
                isActive={isFrozen} 
            />
          </div>

        </div>
      </div>
      {/* --- END OF GAME WORLD LAYER --- */}

      {/* --- UI & MODAL LAYER (Unaffected by Grayscale) --- */}
      
      {/* Lightning Flash Effect - Z-INDEX ADJUSTED TO NOT BLOCK REVENGE TEXT */}
      {flashLightning && (
          <div className="absolute inset-0 bg-white z-[85] animate-flash pointer-events-none"></div>
      )}

      {/* REVENGE SUCCESS OVERLAY - Z-INDEX 90 (Above flash) */}
      {showRevengeSuccess && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden pointer-events-none">
            {/* Rotating sunburst bg */}
            <div className="absolute inset-0 bg-yellow-400/20 animate-[spin_10s_linear_infinite]" 
                 style={{backgroundImage: 'conic-gradient(from 0deg, transparent 0 20deg, #fbbf24 20deg 40deg, transparent 40deg 360deg)'}}>
            </div>
            <h1 className="text-6xl md:text-9xl text-yellow-300 font-black drop-shadow-[0_10px_0_#000] text-center animate-bounce z-10 border-4 border-white p-4 bg-black/50 backdrop-blur-sm rounded-xl transform rotate-3">
                REVENGE<br/>LIGHTNING!
            </h1>
        </div>
      )}

      {isFrozen && (
         <div className="absolute inset-0 pointer-events-none z-30 bg-cyan-500/20 mix-blend-overlay border-8 border-cyan-400/50"></div>
      )}

      {/* PAUSE OVERLAY IS GONE, REPLACED BY REPORT MODAL DIRECTLY */}
      
      {/* REPORT MODAL */}
      {showReport && (
        <ReportModal 
            history={mathHistory} 
            totalCoins={totalCoins} 
            totalScore={score} 
            onClose={() => setShowReport(false)}
            onLoadSave={handleLoadSave}
        />
      )}

      {/* IN-GAME STUDY MODAL */}
      {showStudyModal && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm">
               <StudyMode 
                   onBack={() => setShowStudyModal(false)}
                   onPlay={() => setShowStudyModal(false)}
                   isIngame={true}
               />
          </div>
      )}

      {/* UPDATED CONDITION: Show modal if activeMathProblem exists. Don't check selectedPlantType here because tile-click bypasses it. */}
      {activeMathProblem && !showRevenge && (
        <MathModal 
            plant={PLANT_CONFIGS[activeMathProblem.plantType]} 
            problem={activeMathProblem.problem} 
            onSolve={handleMathResult} 
            onAttempt={(ans, correct) => handleMathAttempt(activeMathProblem.problem, ans, correct)}
            onClose={() => { setActiveMathProblem(null); setSelectedPlantType(null); setActiveReloadPlantId(null); }} 
        />
      )}
      {activePlantInteraction && !showRevenge && (
        <UpgradeModal 
            plant={activePlantInteraction} 
            availableTables={selectedTables} 
            onUpgrade={handleUpgrade} 
            onHeal={handleHeal} 
            onRemove={handleRemove} 
            onAttempt={handleMathAttempt}
            onClose={() => setActivePlantInteraction(null)} 
        />
      )}
      {showRevenge && (
          <RevengeModal 
             wrongHistory={mathHistory.filter(h => !h.isCorrect)}
             availableTables={selectedTables}
             onComplete={handleRevengeComplete}
          />
      )}
    </div>
  );
}
