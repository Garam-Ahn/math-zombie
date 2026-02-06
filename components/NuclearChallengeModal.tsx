
import React, { useState, useEffect, useMemo } from 'react';
import { MathProblem } from '../types';
import { audio } from '../services/audioService';
import { getNumberColorClass } from '../constants';
import { SVG_CHERRYBOMB } from '../assets';

interface NuclearChallengeModalProps {
  tables: number[];
  onComplete: (success: boolean) => void;
  onClose: () => void;
  onOpenStudy: () => void;
  isStudyOpen: boolean;
}

const TOTAL_QUESTIONS = 5;

export const NuclearChallengeModal: React.FC<NuclearChallengeModalProps> = ({ tables, onComplete, onClose, onOpenStudy, isStudyOpen }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shake, setShake] = useState(false);
  
  const generateProblem = (t: number[]): MathProblem => {
      const a = t[Math.floor(Math.random() * t.length)];
      const b = Math.floor(Math.random() * 9) + 1;
      return { factorA: a, factorB: b, answer: a * b };
  };

  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateProblem(tables));

  const options = useMemo(() => {
      const ans = currentProblem.answer;
      const set = new Set<number>();
      set.add(ans);
      while (set.size < 4) {
          const rand = generateProblem(tables).answer;
          if (rand !== ans) set.add(rand);
      }
      return Array.from(set).sort(() => Math.random() - 0.5);
  }, [currentProblem, tables]);

  const handleChoice = (val: number) => {
      if (isStudyOpen) return;
      if (val === currentProblem.answer) {
          audio.playCombo();
          if (currentIndex + 1 >= TOTAL_QUESTIONS) {
              onComplete(true);
          } else {
              setCurrentIndex(prev => prev + 1);
              setCurrentProblem(generateProblem(tables));
          }
      } else {
          audio.playWrong();
          setShake(true);
          setTimeout(() => {
              setShake(false);
              onComplete(false); 
          }, 500);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className={`wood-panel w-full max-w-2xl p-6 md:p-10 border-8 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] transition-transform ${shake ? 'animate-pulse scale-95' : ''}`}>
        
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 animate-bounce" dangerouslySetInnerHTML={{ __html: SVG_CHERRYBOMB(5) }} />
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-tighter">NUCLEAR CHALLENGE</h2>
                    <p className="text-stone-400 text-xs md:text-sm">Answer 5 correctly in a row!</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onOpenStudy} className="bg-purple-600 px-4 py-2 rounded-full text-white font-bold text-xs md:text-sm hover:bg-purple-500">📖 STUDY</button>
                <button onClick={onClose} className="bg-stone-700 w-8 h-8 rounded-full text-white font-black">X</button>
            </div>
        </div>

        <div className="relative">
            {isStudyOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                    <span className="text-white text-2xl font-black animate-pulse uppercase">Paused</span>
                </div>
            )}

            <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 text-center shadow-inner border-4 border-stone-200">
                <div className="flex justify-center gap-2 mb-4">
                    {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
                        <div key={i} className={`w-8 h-3 rounded-full border ${i < currentIndex ? 'bg-red-500 border-red-700' : (i === currentIndex ? 'bg-yellow-400 border-yellow-600 animate-pulse' : 'bg-stone-200 border-stone-300')}`} />
                    ))}
                </div>
                <div className="text-5xl md:text-8xl font-black text-stone-900 flex items-center justify-center gap-4">
                    <span className={getNumberColorClass(currentProblem.factorA)}>{currentProblem.factorA}</span>
                    <span className="text-stone-300 text-3xl md:text-5xl">×</span>
                    <span className={getNumberColorClass(currentProblem.factorB)}>{currentProblem.factorB}</span>
                    <span className="text-stone-300 text-3xl md:text-5xl">=</span>
                    <span className="text-black border-b-4 border-stone-900 min-w-[60px] md:min-w-[100px]">?</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                    <button key={i} onClick={() => handleChoice(opt)} disabled={isStudyOpen}
                        className="bg-gradient-to-b from-stone-100 to-stone-200 hover:from-yellow-300 hover:to-orange-400 py-6 md:py-10 rounded-2xl text-3xl md:text-5xl font-black text-stone-800 hover:text-white border-b-8 border-stone-300 hover:border-orange-600 transition-all active:translate-y-2 active:border-b-0">
                        {opt}
                    </button>
                ))}
            </div>
        </div>

        <p className="text-center text-red-400/60 mt-6 font-bold text-xs uppercase animate-pulse">Failure reverts to a normal cherry bomb!</p>
      </div>
    </div>
  );
};
