
import React, { useState, useEffect, useMemo } from 'react';
import { MathProblem, MathHistoryItem } from '../types';
import { audio } from '../services/audioService';
import { REVENGE_PROBLEM_COUNT, getNumberColorClass } from '../constants';

interface RevengeModalProps {
  wrongHistory: MathHistoryItem[];
  availableTables: number[];
  onComplete: () => void;
}

const generateRandomProblem = (tables: number[]): MathProblem => {
  const table = tables[Math.floor(Math.random() * tables.length)] || 2;
  const b = Math.floor(Math.random() * 9) + 1;
  return { factorA: table, factorB: b, answer: table * b };
};

export const RevengeModal: React.FC<RevengeModalProps> = ({ wrongHistory, availableTables, onComplete }) => {
  const [phase, setPhase] = useState<1 | 2>(1); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    audio.startRevengeBGM();
    return () => {
        audio.stopRevengeBGM();
    };
  }, []);

  useEffect(() => {
    if (phase === 2) {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') {
                handleNumberClick(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                setInput(prev => prev.slice(0, -1));
            } else if (e.key === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                handleInputSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input, currentIndex]);

  const uniqueWrongProblems = useMemo(() => {
    const map = new Map<string, MathProblem>();
    wrongHistory.filter(h => !h.isCorrect).forEach(h => {
      const key = `${h.factorA}x${h.factorB}`;
      if (!map.has(key)) {
        map.set(key, { factorA: h.factorA, factorB: h.factorB, answer: h.factorA * h.factorB });
      }
    });
    return Array.from(map.values());
  }, [wrongHistory]);

  const phase2Problems = useMemo(() => {
    const problems: MathProblem[] = [...uniqueWrongProblems];
    while (problems.length < REVENGE_PROBLEM_COUNT) {
      problems.push(generateRandomProblem(availableTables));
    }
    // Limit to REVENGE_PROBLEM_COUNT
    return problems.sort(() => Math.random() - 0.5).slice(0, REVENGE_PROBLEM_COUNT);
  }, [uniqueWrongProblems, availableTables]);

  const currentProblem = phase === 1 ? uniqueWrongProblems[currentIndex] : phase2Problems[currentIndex];
  
  // Memoize options so they don't reshuffle on re-renders (e.g. wrong answer shake)
  const phase1Options = useMemo(() => {
    if (!currentProblem || phase !== 1) return [];
    
    const ans = currentProblem.answer;
    const distractors = [ans + currentProblem.factorA, ans - currentProblem.factorB, ans + 10]
        .filter(d => d > 0 && d !== ans)
        .slice(0, 2);
    
    // Shuffle options once per problem
    return [ans, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentProblem, phase]);

  useEffect(() => {
     if (phase === 1 && uniqueWrongProblems.length === 0) {
         setPhase(2); 
     }
  }, [phase, uniqueWrongProblems]);

  const handleMultipleChoice = (chosenAnswer: number) => {
    if (!currentProblem) return;
    if (chosenAnswer === currentProblem.answer) {
      audio.playCorrect();
      setFeedback("Correct!");
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < uniqueWrongProblems.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setPhase(2);
          setCurrentIndex(0);
        }
      }, 500);
    } else {
      audio.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleInputSubmit = () => {
    if (!currentProblem) return;
    const val = parseInt(input, 10);
    if (val === currentProblem.answer) {
      audio.playCorrect();
      setInput('');
      if (currentIndex + 1 < phase2Problems.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        audio.stopRevengeBGM();
        onComplete();
      }
    } else {
      audio.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput('');
      setFeedback("다시 생각해보세요!");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleNumberClick = (num: number) => {
      if (input.length < 3) {
          setInput(prev => prev + num.toString());
          audio.playCollect();
      }
  };

  if (!currentProblem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* VIBRANT Colorful Box */}
      <div className={`
          relative w-full max-w-4xl p-8 rounded-2xl 
          bg-gradient-to-b from-purple-700 via-indigo-900 to-purple-950
          border-[6px] border-yellow-400 shadow-[0_0_60px_rgba(168,85,247,0.6)] 
          flex flex-col
          ${shake ? 'animate-pulse' : ''}
      `}>
        
        {/* Glowing Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-yellow-400/50">
            <h2 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 font-black drop-shadow-[0_2px_0_#000] tracking-widest uppercase italic">
                {phase === 1 ? "⚡ REVENGE TIME ⚡" : "🔥 FINAL CHALLENGE 🔥"}
            </h2>
            <div className="bg-black/40 px-6 py-2 rounded-full border border-yellow-400/50 shadow-inner">
                <span className="text-white text-2xl font-black tracking-widest">
                    {phase === 1 
                      ? `${currentIndex + 1} / ${uniqueWrongProblems.length}` 
                      : `${currentIndex + 1} / ${REVENGE_PROBLEM_COUNT}`
                    }
                </span>
            </div>
        </div>

        <div className="flex flex-col landscape:flex-row gap-6 items-stretch flex-1">
            
            {/* Left: Problem Display */}
            <div className="flex-[1.2] bg-white rounded-xl border-4 border-indigo-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 opacity-80"></div>
                
                <p className="text-indigo-600 mb-6 font-bold text-xl uppercase tracking-wider relative z-10">
                    {phase === 1 ? "Revenge Logic: Active" : "No Time Limit"}
                </p>
                
                <div className="text-6xl md:text-8xl text-indigo-950 font-black flex flex-nowrap items-center justify-center gap-2 md:gap-4 relative z-10 whitespace-nowrap">
                    <span className={getNumberColorClass(currentProblem.factorA)}>{currentProblem.factorA}</span>
                    <span className="text-indigo-400">×</span>
                    <span className={getNumberColorClass(currentProblem.factorB)}>{currentProblem.factorB}</span>
                    <span className="text-indigo-400">=</span>
                    {/* USER INPUT: Changed to Black */}
                    <span className={`
                        min-w-[120px] border-b-8 border-indigo-900 text-center text-black
                    `}>
                        {phase === 2 ? (input || "?") : "?"}
                    </span>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex-1 flex flex-col justify-center">
                
                {/* Phase 1: Multiple Choice */}
                {phase === 1 && (
                    <div className="flex flex-col gap-3 h-full justify-center">
                        {phase1Options.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleMultipleChoice(opt)}
                                className="w-full py-5 text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:scale-105 border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 transition-all shadow-lg text-shadow-md"
                                style={{textShadow: '2px 2px 0 rgba(0,0,0,0.2)'}}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Phase 2: Keypad */}
                {phase === 2 && (
                     <div className="grid grid-cols-3 gap-3 h-full">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button key={num} onClick={() => handleNumberClick(num)} 
                                className="glossy-btn bg-indigo-600 hover:bg-indigo-500 text-black text-3xl md:text-4xl font-bold shadow-lg active:scale-95 transition-transform"
                            >
                                <span style={{ textShadow: 'none' }}>{num}</span>
                            </button>
                        ))}
                        <button onClick={() => setInput(prev => prev.slice(0, -1))} 
                            className="glossy-red bg-pink-600 hover:bg-pink-500 text-white text-xl md:text-2xl font-bold shadow-lg"
                        >
                            DEL
                        </button>
                        <button onClick={() => handleNumberClick(0)} 
                            className="glossy-btn bg-indigo-600 hover:bg-indigo-500 text-black text-3xl md:text-4xl font-bold shadow-lg"
                        >
                            <span style={{ textShadow: 'none' }}>0</span>
                        </button>
                        <button onClick={handleInputSubmit} 
                            className="bg-gradient-to-b from-green-400 to-green-600 text-white text-2xl md:text-3xl font-black rounded-lg border-b-4 border-green-800 shadow-lg active:border-b-0 active:translate-y-1 hover:brightness-110"
                        >
                            OK (Space)
                        </button>
                    </div>
                )}
            </div>
        </div>

        {feedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
                 <div className="bg-white/95 text-indigo-600 px-10 py-6 rounded-2xl text-4xl font-black animate-bounce border-4 border-indigo-600 shadow-2xl whitespace-nowrap">
                    {feedback}
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};
