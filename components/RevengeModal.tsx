
import React, { useState, useEffect, useMemo } from 'react';
import { MathProblem, MathHistoryItem } from '../types';
import { audio } from '../services/audioService';
import { REVENGE_PROBLEM_COUNT, getNumberColorClass } from '../constants';

interface RevengeModalProps {
  wrongHistory: MathHistoryItem[];
  availableTables: number[];
  onComplete: () => void;
  onOpenStudy: () => void; // Added prop
}

const generateRandomProblem = (tables: number[]): MathProblem => {
  const table = tables[Math.floor(Math.random() * tables.length)] || 2;
  const b = Math.floor(Math.random() * 9) + 1;
  return { factorA: table, factorB: b, answer: table * b };
};

export const RevengeModal: React.FC<RevengeModalProps> = ({ wrongHistory, availableTables, onComplete, onOpenStudy }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    audio.startRevengeBGM();
    return () => {
        audio.stopRevengeBGM();
    };
  }, []);

  const revengeProblems = useMemo(() => {
    const uniqueMap = new Map<string, MathProblem>();
    
    wrongHistory.filter(h => !h.isCorrect).forEach(h => {
      const key = `${h.factorA}x${h.factorB}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { factorA: h.factorA, factorB: h.factorB, answer: h.factorA * h.factorB });
      }
    });

    const problems: MathProblem[] = Array.from(uniqueMap.values());
    
    while (problems.length < REVENGE_PROBLEM_COUNT) {
      const randProb = generateRandomProblem(availableTables);
      const key = `${randProb.factorA}x${randProb.factorB}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, randProb);
        problems.push(randProb);
      }
    }
    
    return problems.sort(() => Math.random() - 0.5).slice(0, REVENGE_PROBLEM_COUNT);
  }, [wrongHistory, availableTables]);

  const currentProblem = revengeProblems[currentIndex];
  
  const currentOptions = useMemo(() => {
    if (!currentProblem) return [];
    
    const ans = currentProblem.answer;
    const distractors = new Set<number>();
    
    const candidates = [
        ans + currentProblem.factorA, 
        ans - currentProblem.factorA, 
        ans + 1,
        ans - 1,
        (currentProblem.factorA + 1) * currentProblem.factorB,
        (currentProblem.factorA - 1) * currentProblem.factorB,
        ans + 10, 
        ans - 10,
    ];

    candidates.forEach(c => {
        if (c > 0 && c !== ans) distractors.add(c);
    });

    while(distractors.size < 3) {
        const rand = Math.floor(Math.random() * 81) + 1;
        if(rand !== ans) distractors.add(rand);
    }

    const finalDistractors = Array.from(distractors).sort(() => Math.random() - 0.5).slice(0, 3);
    return [ans, ...finalDistractors].sort(() => Math.random() - 0.5);
  }, [currentProblem]);

  const handleChoice = (chosenAnswer: number) => {
    if (!currentProblem || feedback) return;
    
    if (chosenAnswer === currentProblem.answer) {
      audio.playCorrect();
      setFeedback("정답입니다!");
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < revengeProblems.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          audio.stopRevengeBGM();
          onComplete();
        }
      }, 800);
    } else {
      audio.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setFeedback("다시 한번 봐요!");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!currentProblem) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`
          relative w-full max-w-4xl p-6 md:p-10 rounded-3xl 
          bg-gradient-to-b from-purple-800 via-indigo-950 to-black
          border-[8px] border-yellow-400 shadow-[0_0_80px_rgba(168,85,247,0.7)] 
          flex flex-col transition-transform duration-200
          ${shake ? 'animate-pulse scale-95' : 'scale-100'}
      `}>
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-yellow-400/30">
            <h2 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 font-black drop-shadow-[0_2px_0_#000] tracking-tighter uppercase italic">
                ⚡ REVENGE LIGHTNING ⚡
            </h2>
            <div className="flex items-center gap-4">
                <button 
                  onClick={onOpenStudy}
                  className="bg-purple-600 text-white px-4 py-2 rounded-full border-2 border-purple-400 shadow-[0_0_15px_purple] font-black text-sm md:text-base animate-pulse flex items-center gap-2"
                >
                  <span>📖</span> 연습하러 가기
                </button>
                <div className="bg-yellow-400 text-black px-6 py-1 rounded-full font-black text-xl shadow-lg border-2 border-white">
                    {currentIndex + 1} / {revengeProblems.length}
                </div>
            </div>
        </div>

        <div className="flex flex-col landscape:flex-row gap-8 items-stretch flex-1 min-h-[300px]">
            <div className="flex-1 bg-white/95 rounded-2xl border-4 border-indigo-500 shadow-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-white opacity-50"></div>
                <p className="text-indigo-800 mb-8 font-black text-xl md:text-2xl uppercase tracking-widest relative z-10">
                    CHALLENGE!
                </p>
                <div className="text-7xl md:text-9xl text-indigo-950 font-black flex flex-nowrap items-center justify-center gap-4 relative z-10">
                    <span className={getNumberColorClass(currentProblem.factorA)}>{currentProblem.factorA}</span>
                    <span className="text-indigo-300">×</span>
                    <span className={getNumberColorClass(currentProblem.factorB)}>{currentProblem.factorB}</span>
                    <span className="text-indigo-300">=</span>
                    <span className="text-black border-b-8 border-indigo-900 min-w-[100px] text-center">?</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                {currentOptions.map((opt, idx) => (
                    <button 
                        key={`${currentIndex}-${idx}`}
                        onClick={() => handleChoice(opt)}
                        className="
                          relative overflow-hidden
                          w-full h-full py-6 text-4xl md:text-6xl font-black 
                          bg-gradient-to-b from-yellow-300 to-orange-500 
                          text-white rounded-2xl border-b-[10px] border-orange-800 
                          hover:scale-105 active:border-b-0 active:translate-y-2 
                          transition-all shadow-xl
                        "
                        style={{textShadow: '3px 3px 0 rgba(0,0,0,0.3)'}}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 -translate-y-1/2 rounded-[50%]"></div>
                        <span className="relative z-10">{opt}</span>
                    </button>
                ))}
            </div>
        </div>

        {feedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[60]">
                 <div className={`
                    px-12 py-8 rounded-3xl text-5xl font-black animate-bounce shadow-2xl border-8
                    ${feedback.includes('정답') ? 'bg-green-500 text-white border-white scale-110' : 'bg-red-500 text-white border-white'}
                 `}>
                    {feedback}
                 </div>
            </div>
        )}

        <p className="text-center text-white/40 mt-6 text-sm font-bold tracking-widest uppercase">
            ⚡ 번개 에너지가 충전되고 있습니다 ⚡
        </p>
      </div>
    </div>
  );
};
