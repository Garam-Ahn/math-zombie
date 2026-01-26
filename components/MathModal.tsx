
import React, { useState, useEffect } from 'react';
import { PlantConfig, MathProblem } from '../types';
import { audio } from '../services/audioService';
import { getNumberColorClass } from '../constants';

interface MathModalProps {
  plant: PlantConfig;
  problem: MathProblem;
  onSolve: (success: boolean) => void;
  onAttempt: (answer: number, isCorrect: boolean) => void;
  onClose: () => void;
  onOpenStudy: () => void; // Added prop
}

export const MathModal: React.FC<MathModalProps> = ({ plant, problem, onSolve, onAttempt, onClose, onOpenStudy }) => {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const handleNumberClick = (num: number) => {
    if (isSolved) return;
    if (input.length < 3) {
      setInput(prev => prev + num.toString());
      audio.playCollect();
    }
  };

  const handleBackspace = () => {
    if (isSolved) return;
    setInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (isSolved) return;
    const val = parseInt(input, 10);
    const correct = val === problem.answer;
    
    onAttempt(val, correct);

    if (correct) {
      setIsSolved(true);
      onSolve(true);
      audio.playCorrect();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput('');
      audio.playWrong();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved) return;
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, isSolved]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`wood-panel p-4 sm:p-6 md:p-8 w-full max-w-md landscape:max-w-3xl transform transition-transform ${shake ? 'translate-x-2' : ''}`}>
        
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 filter drop-shadow-md" dangerouslySetInnerHTML={{ __html: plant.svg(1) }} />
            <div className="flex flex-col">
              <span className="text-yellow-100 text-xs sm:text-sm drop-shadow-md">Unlock Plant</span>
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold drop-shadow-md" style={{ textShadow: '2px 2px 0 #000' }}>정답을 맞춰봐!</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onOpenStudy}
              className="bg-purple-600 text-white w-10 h-10 rounded-full border-2 border-purple-800 shadow-lg flex items-center justify-center hover:bg-purple-500 active:scale-95 group relative"
              title="공부하러 가기"
            >
              <span className="text-xl">📖</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">모르면 클릭!</span>
            </button>
            <button 
              onClick={onClose} 
              className="bg-red-600 text-white w-10 h-10 rounded-full border-2 border-red-800 shadow-lg font-bold hover:bg-red-500 active:scale-95"
              disabled={isSolved}
            >
              X
            </button>
          </div>
        </div>

        <div className="flex flex-col landscape:flex-row landscape:gap-8 md:gap-12">
            <div className="landscape:w-1/2 flex flex-col justify-center">
                <div className="bg-[#fefce8] p-2 sm:p-4 mb-4 landscape:mb-0 text-center rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] border-2 border-[#fcd34d] h-full flex flex-col justify-center min-h-[140px] landscape:min-h-[200px] relative overflow-hidden">
                  <div className="absolute top-4 left-0 w-full h-[1px] bg-blue-200 opacity-50"></div>
                  <div className="absolute top-12 left-0 w-full h-[1px] bg-blue-200 opacity-50"></div>
                  <div className="absolute top-20 left-0 w-full h-[1px] bg-blue-200 opacity-50"></div>
                  
                  <div className="text-4xl sm:text-5xl md:text-6xl text-stone-800 flex justify-center items-center gap-2 flex-wrap z-10 font-black">
                      <span className={getNumberColorClass(problem.factorA)}>{problem.factorA}</span>
                      <span className="text-stone-400">×</span>
                      <span className={getNumberColorClass(problem.factorB)}>{problem.factorB}</span>
                      <span className="text-stone-400">=</span>
                      <span className={`min-w-[60px] border-b-4 border-stone-800 text-black`}>
                      {input || "?"}
                      </span>
                  </div>
                </div>
            </div>

            <div className="landscape:w-1/2">
                <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    disabled={isSolved}
                    className={`glossy-btn bg-green-500 text-black text-2xl sm:text-3xl py-3 shadow-md font-black
                        ${isSolved ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}
                    `}
                    >
                    <span style={{ textShadow: 'none' }}>{num}</span>
                    </button>
                ))}
                <button 
                    onClick={handleBackspace} 
                    disabled={isSolved}
                    className={`glossy-red text-white text-xl sm:text-2xl py-3 rounded-lg shadow-md font-black
                    ${isSolved ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    `}
                >
                    DEL
                </button>
                <button 
                    onClick={() => handleNumberClick(0)} 
                    disabled={isSolved}
                    className={`glossy-btn bg-green-500 text-black text-2xl sm:text-3xl py-3 shadow-md font-black
                    ${isSolved ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}
                    `}
                >
                    <span style={{ textShadow: 'none' }}>0</span>
                </button>
                <button 
                    onClick={handleSubmit} 
                    disabled={isSolved}
                    className={`bg-yellow-400 text-yellow-900 text-lg md:text-xl py-3 rounded-lg border-b-4 border-yellow-600 shadow-md font-black
                    ${isSolved ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-300 active:border-b-0 active:translate-y-1'}
                    `}
                >
                    {isSolved ? '정답!' : '확인'}
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
