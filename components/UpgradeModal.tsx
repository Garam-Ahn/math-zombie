
import React, { useState, useEffect } from 'react';
import { PlantEntity, MathProblem, PlantType } from '../types';
import { audio } from '../services/audioService';
import { PLANT_CONFIGS, getNumberColorClass } from '../constants';

interface UpgradeModalProps {
  plant: PlantEntity;
  availableTables: number[];
  onUpgrade: (plantId: string, levelIncrement: number) => void;
  onHeal: (plantId: string) => void;
  onRemove: (plantId: string) => void;
  onAttempt: (problem: MathProblem, answer: number, isCorrect: boolean) => void;
  onClose: () => void;
  onOpenStudy: () => void;
  isStudyOpen: boolean; // Added to track if timer should pause
}

type Mode = 'MENU' | 'UPGRADE_CHALLENGE' | 'HEAL_CHALLENGE';

const CHALLENGE_TIME_MS = 10000;
const QUESTIONS_COUNT = 3;

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ plant, availableTables, onUpgrade, onHeal, onRemove, onAttempt, onClose, onOpenStudy, isStudyOpen }) => {
  const config = PLANT_CONFIGS[plant.type];
  const [mode, setMode] = useState<Mode>('MENU');
  
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TIME_MS);
  const [shake, setShake] = useState(false);
  const [comboFlash, setComboFlash] = useState(false);

  const [usedProblemKeys, setUsedProblemKeys] = useState<string[]>([]);

  // Calculate stats for display
  const currentDamage = config.damage ? Math.floor(config.damage * (1 + (plant.level - 1) * 0.5)) : 0;
  const jalBoost = plant.type === PlantType.JALAPENO ? (2 + (plant.level * 0.5)).toFixed(1) : null;

  useEffect(() => {
    let timer: number;
    // ONLY run timer if not in Study Mode and in a challenge
    if ((mode === 'UPGRADE_CHALLENGE' || mode === 'HEAL_CHALLENGE') && problem && !isStudyOpen) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) { handleFail(true); return 0; }
          if (prev % 1000 < 50 && prev > 100) audio.playTick();
          return prev - 50;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [mode, problem, isStudyOpen]); // isStudyOpen triggers effect update

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (mode === 'MENU' || isStudyOpen) return;
        if (e.key >= '0' && e.key <= '9') {
            handleNumberClick(parseInt(e.key));
        } else if (e.key === 'Backspace') {
            handleBackspace();
        } else if (e.key === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleSubmit();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, mode, problem, isStudyOpen]);

  const generateProblem = () => {
    let newProb: MathProblem;
    let key: string;
    let attempts = 0;
    
    do {
        const table = availableTables[Math.floor(Math.random() * availableTables.length)];
        const b = Math.floor(Math.random() * 9) + 1;
        newProb = { factorA: table, factorB: b, answer: table * b };
        key = `${table}x${b}`;
        attempts++;
    } while (usedProblemKeys.includes(key) && attempts < 20);

    setUsedProblemKeys(prev => [...prev, key]);
    setProblem(newProb);
    setTimeLeft(CHALLENGE_TIME_MS);
    setInput('');
  };

  const startChallenge = (targetMode: 'UPGRADE_CHALLENGE' | 'HEAL_CHALLENGE') => {
    setMode(targetMode); 
    setStreak(0); 
    setQuestionIndex(0); 
    setUsedProblemKeys([]);
    generateProblem();
  };

  const handleFail = (timeout = false) => {
    if (timeout && problem) {
       onAttempt(problem, -1, false);
    }

    audio.playWrong();
    if (mode === 'UPGRADE_CHALLENGE' && streak >= 2) {
       finishChallenge(streak); 
    } else {
       alert("아쉽네요! 다음에 다시 도전해요.");
       onClose();
    }
  };

  const handleNumberClick = (num: number) => {
    if (input.length < 3) { setInput(prev => prev + num.toString()); audio.playCollect(); }
  };

  const handleBackspace = () => setInput(prev => prev.slice(0, -1));

  const handleSubmit = () => {
    if (!problem) return;
    const val = parseInt(input, 10);
    const correct = val === problem.answer;
    
    onAttempt(problem, val, correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setComboFlash(true);
      setTimeout(() => setComboFlash(false), 300);
      audio.playCombo();
      if (questionIndex + 1 >= QUESTIONS_COUNT) finishChallenge(newStreak);
      else { setQuestionIndex(prev => prev + 1); generateProblem(); }
    } else {
      setShake(true); setTimeout(() => setShake(false), 500);
      setInput('');
      handleFail(false);
    }
  };

  const finishChallenge = (finalStreak: number) => {
    if (mode === 'UPGRADE_CHALLENGE') {
        let levelUp = 0;
        if (finalStreak >= 3) levelUp = 2;
        else if (finalStreak >= 2) levelUp = 1;

        if (levelUp > 0) { audio.playUpgradeSuccess(); onUpgrade(plant.id, levelUp); }
        else { onClose(); }
    } else if (mode === 'HEAL_CHALLENGE') {
        if (finalStreak >= 3) { audio.playUpgradeSuccess(); onHeal(plant.id); }
        else { alert("3문제 연속 정답이 필요해요!"); onClose(); }
    }
  };

  if (mode === 'MENU') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="wood-panel p-4 md:p-8 w-full max-w-sm md:max-w-xl landscape:max-w-2xl landscape:flex landscape:flex-row landscape:gap-6 relative">
           <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-white hover:text-red-300 font-bold drop-shadow-md">X</button>
           
           <div className="flex flex-col items-center mb-6 landscape:mb-0 landscape:flex-1 justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 mb-4 filter drop-shadow-xl" dangerouslySetInnerHTML={{ __html: config.svg(plant.level) }} />
              <h2 className="text-xl md:text-2xl font-bold text-yellow-100 mb-2 drop-shadow-md">{config.name} Lv.{plant.level}</h2>
              
              <div className="w-full bg-stone-900 h-6 rounded-full border-2 border-stone-600 mb-2 relative overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${(plant.hp / plant.maxHp) * 100}%` }} />
                  <span className="absolute inset-0 text-xs md:text-sm text-white flex items-center justify-center drop-shadow-md font-bold">HP {Math.floor(plant.hp)}/{plant.maxHp}</span>
              </div>
              
              {config.maxAmmo && (
                <div className="w-full bg-stone-900 h-6 rounded-full border-2 border-stone-600 mb-2 relative overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${((plant.ammo || 0) / (config.maxAmmo || 1)) * 100}%` }} />
                     <span className="absolute inset-0 text-xs md:text-sm text-white flex items-center justify-center drop-shadow-md font-bold">Energy {plant.ammo}/{config.maxAmmo}</span>
                </div>
              )}
              
              {currentDamage > 0 && (
                <div className="bg-orange-900/50 px-3 py-1 rounded-full border border-orange-500 text-[10px] md:text-xs text-orange-200 mt-2">
                  ⚔️ 데미지: {currentDamage}
                </div>
              )}
              {jalBoost && (
                <div className="bg-red-900/50 px-3 py-1 rounded-full border border-red-500 text-[10px] md:text-xs text-red-200 mt-2 animate-pulse">
                  🔥 파워업: x{jalBoost}배
                </div>
              )}
           </div>
           
           <div className="grid grid-cols-2 landscape:grid-cols-1 gap-4 w-full landscape:flex-1 justify-center">
                <div className="flex gap-4 col-span-2 landscape:col-span-1">
                    <button onClick={() => startChallenge('UPGRADE_CHALLENGE')} className="flex-1 glossy-btn bg-yellow-400 text-white py-4 font-bold border-none">⭐ 업그레이드</button>
                    <button onClick={() => startChallenge('HEAL_CHALLENGE')} className="flex-1 glossy-red bg-pink-500 text-white py-4 font-bold border-none">❤️ 힐링</button>
                </div>
                <button onClick={() => onRemove(plant.id)} className="col-span-2 landscape:col-span-1 bg-stone-600 hover:bg-stone-500 text-white py-4 rounded-lg font-bold border-b-4 border-stone-800 active:border-b-0 active:translate-y-1">
                  🗑️ 파기하기 (+{Math.floor(config.cost * 0.5)})
                </button>
                <p className="text-[10px] md:text-xs text-stone-300 text-center mt-2 opacity-80">연속 정답을 맞추면 강력해져요!</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-colors duration-200 ${comboFlash ? 'bg-yellow-400/30' : ''}`}>
       <div className={`wood-panel p-4 sm:p-6 md:p-8 w-full max-w-md landscape:max-w-2xl md:max-w-3xl ${shake ? 'animate-pulse' : ''}`}>
          <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4 text-xs md:text-lg">
                  <span className={mode === 'HEAL_CHALLENGE' ? "text-pink-400 font-bold" : "text-yellow-400 font-bold"}>{mode === 'HEAL_CHALLENGE' ? "❤️ HEAL" : "⭐ UPGRADE"}</span>
                  <span className={`text-white font-bold ${comboFlash ? 'scale-125 text-yellow-300' : ''} transition-transform`}>콤보: {streak}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={onOpenStudy}
                  className={`bg-purple-600 text-white px-3 py-1 rounded-full border-2 border-purple-800 shadow-md text-sm font-bold flex items-center gap-1 hover:bg-purple-500 active:scale-95 ${isStudyOpen ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  <span>📖</span> {isStudyOpen ? "공부중..." : "공부하기"}
                </button>
                {!isStudyOpen && <button onClick={onClose} className="text-white font-bold text-xl hover:text-red-400">X</button>}
              </div>
          </div>

          <div className="flex flex-col landscape:flex-row landscape:gap-4 md:gap-8 relative">
              {/* Timer Pause Overlay */}
              {isStudyOpen && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl border-4 border-dashed border-purple-500/50">
                      <div className="text-white font-black text-2xl animate-pulse">⏰ 시간이 멈췄습니다! ⏰</div>
                  </div>
              )}

              <div className="landscape:flex-1">
                <div className="text-center text-[10px] md:text-sm mb-2 text-stone-300">
                    {mode === 'HEAL_CHALLENGE' ? "3문제를 연속으로 맞춰보세요!" : "2문제 이상 맞추면 레벨업!"}
                </div>
                <div className="w-full h-4 md:h-6 bg-stone-900 rounded-full mb-6 border-2 border-stone-600 relative overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{ width: `${(timeLeft / CHALLENGE_TIME_MS) * 100}%` }} />
                </div>
                <div className="bg-[#fefce8] rounded-lg border-2 border-[#fcd34d] p-6 md:p-8 mb-4 landscape:mb-0 text-center h-24 md:h-32 flex items-center justify-center shadow-inner">
                    <div className="text-3xl md:text-4xl flex justify-center items-center gap-2 md:gap-4 text-stone-800 font-black">
                        <span className={getNumberColorClass(problem?.factorA || 0)}>{problem?.factorA}</span>
                        <span className="text-stone-400">x</span>
                        <span className={getNumberColorClass(problem?.factorB || 0)}>{problem?.factorB}</span>
                        <span className="text-stone-400">=</span>
                        <span className="text-black border-b-4 border-stone-800 min-w-[50px] md:min-w-[80px]">{input || '?'}</span>
                    </div>
                </div>
              </div>
              <div className="landscape:flex-1">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                    <button key={num} onClick={() => handleNumberClick(num)} className="glossy-btn bg-stone-200 text-black text-lg md:text-3xl py-3 font-black">
                        <span style={{ textShadow: 'none' }}>{num}</span>
                    </button>
                    ))}
                    <button onClick={handleBackspace} className="glossy-red bg-red-500 text-white text-sm md:text-xl py-3 rounded-lg">DEL</button>
                    <button onClick={handleSubmit} className="bg-green-500 text-white text-sm md:text-xl py-3 rounded-lg border-b-4 border-green-700 active:border-0 active:translate-y-1 font-bold">확인</button>
                </div>
              </div>
          </div>
       </div>
    </div>
  );
}
