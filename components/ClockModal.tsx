
import React, { useState, useMemo } from 'react';
import { audio } from '../services/audioService';
import { SVG_ICESHROOM } from '../assets';

interface ClockModalProps {
  onSolve: (success: boolean) => void;
  onClose: () => void;
}

export const ClockModal: React.FC<ClockModalProps> = ({ onSolve, onClose }) => {
  const [shake, setShake] = useState(false);

  const targetTime = useMemo(() => {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 12) * 5; 
    return { hours, minutes };
  }, []);

  const formatTime = (h: number, m: number) => {
    const minStr = m === 0 ? "o'clock" : `${m} minutes`;
    return `${h} ${minStr}`;
  };

  const options = useMemo(() => {
    const correct = formatTime(targetTime.hours, targetTime.minutes);
    const set = new Set<string>();
    set.add(correct);
    while (set.size < 4) {
      const h = Math.floor(Math.random() * 12) + 1;
      const m = Math.floor(Math.random() * 12) * 5;
      const opt = formatTime(h, m);
      if (opt !== correct) set.add(opt);
    }
    return Array.from(set).sort(() => Math.random() - 0.5);
  }, [targetTime]);

  const handleChoice = (choice: string) => {
    const correct = formatTime(targetTime.hours, targetTime.minutes);
    if (choice === correct) {
      audio.playCorrect();
      onSolve(true);
    } else {
      audio.playWrong();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const minuteAngle = targetTime.minutes * 6;
  const hourAngle = (targetTime.hours % 12) * 30 + (targetTime.minutes / 60) * 30;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className={`wood-panel w-full max-w-2xl p-6 md:p-10 border-8 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-transform ${shake ? 'animate-pulse scale-95' : ''}`}>
        
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 animate-float" dangerouslySetInnerHTML={{ __html: SVG_ICESHROOM(1) }} />
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-blue-400 uppercase tracking-tighter">TIME CHALLENGE</h2>
                    <p className="text-stone-400 text-xs md:text-sm">What time is it now?</p>
                </div>
            </div>
            <button onClick={onClose} className="bg-stone-700 w-8 h-8 rounded-full text-white font-black hover:bg-red-500 transition-colors">X</button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 md:w-64 md:h-64 bg-white rounded-full border-8 border-stone-800 shadow-2xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                    {[...Array(12)].map((_, i) => (
                        <line key={i} x1="50" y1="5" x2="50" y2="10" 
                            transform={`rotate(${i * 30}, 50, 50)`} 
                            stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
                    ))}
                    
                    <line x1="50" y1="50" x2="50" y2="25" 
                        transform={`rotate(${hourAngle}, 50, 50)`} 
                        stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
                    
                    <line x1="50" y1="50" x2="50" y2="15" 
                        transform={`rotate(${minuteAngle}, 50, 50)`} 
                        stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                    
                    <circle cx="50" cy="50" r="3" fill="#1c1917" />
                    
                    {[12, 3, 6, 9].map((num, i) => {
                        const angle = (num === 12 ? 0 : num * 30) * (Math.PI / 180);
                        const radius = 35;
                        const x = 50 + radius * Math.sin(angle);
                        const y = 50 - radius * Math.cos(angle);
                        return <text key={num} x={x} y={y} fontSize="8" fontWeight="black" textAnchor="middle" dominantBaseline="middle" fill="#57534e">{num}</text>
                    })}
                </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
                {options.map((opt, i) => (
                    <button key={i} onClick={() => handleChoice(opt)}
                        className="bg-slate-800 hover:bg-blue-600 py-6 md:py-10 rounded-2xl text-xl md:text-2xl font-black text-white border-b-8 border-slate-900 hover:border-blue-800 transition-all active:translate-y-2 active:border-b-0 px-2">
                        {opt}
                    </button>
                ))}
            </div>
        </div>

        <p className="text-center text-blue-400/60 mt-6 font-bold text-xs uppercase animate-pulse">Solve to freeze the garden!</p>
      </div>
    </div>
  );
};
