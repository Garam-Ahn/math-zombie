
import React, { useState, useEffect, useRef } from 'react';
import { SVG_SUNFLOWER } from '../assets';
import { audio } from '../services/audioService';
import { getNumberColorClass } from '../constants';

interface StudyModeProps {
  onBack: () => void;
  onPlay: () => void;
}

export const StudyMode: React.FC<StudyModeProps> = ({ onBack, onPlay }) => {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-cycle through the table (Rhythmic Focus)
  useEffect(() => {
    let interval: number;
    if (isAutoPlay) {
      interval = window.setInterval(() => {
        setActiveIndex(prev => {
          const next = (prev + 1) % 9;
          // Play a soft tick sound for rhythm
          if (next === 0) {
             // Loop complete pause slightly or just continue
          }
          audio.playTick();
          return next;
        });
      }, 2000); // 2 seconds per item for calm focus
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, selectedTable]);

  // Scroll active item into view
  useEffect(() => {
    if (scrollRef.current) {
        const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeIndex]);

  const handleTableSelect = (num: number) => {
      setSelectedTable(num);
      setActiveIndex(0);
      setIsAutoPlay(true);
      audio.playCollect();
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#1a4731] relative flex flex-col items-center justify-center p-2 md:p-4 font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] pointer-events-none"></div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 opacity-20 pointer-events-none animate-pulse" dangerouslySetInnerHTML={{ __html: SVG_SUNFLOWER(1) }}></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 opacity-20 pointer-events-none animate-bounce" style={{animationDuration: '4s'}} dangerouslySetInnerHTML={{ __html: SVG_SUNFLOWER(3) }}></div>

      {/* Header */}
      <div className="z-10 w-full max-w-6xl flex justify-between items-center mb-2 md:mb-4 lg:mb-6 flex-shrink-0">
        <button onClick={onBack} className="text-white text-lg md:text-xl font-bold hover:text-green-300 drop-shadow-md">← Back</button>
        <h1 className="text-2xl md:text-3xl lg:text-5xl text-green-100 font-black drop-shadow-lg tracking-widest text-center truncate px-2">
            🌿 ZEN STUDY 🌿
        </h1>
        <button onClick={onPlay} className="glossy-btn bg-yellow-500 text-yellow-900 px-4 py-2 md:px-8 md:py-3 text-sm md:text-xl font-bold animate-pulse whitespace-nowrap">
            Play ▶
        </button>
      </div>

      <div className="flex flex-row gap-4 w-full max-w-6xl flex-1 min-h-0 items-stretch">
          
          {/* Left: Selector */}
          <div className="flex flex-col justify-center gap-2 p-3 md:p-4 wood-panel bg-[#3e2723] flex-shrink-0 overflow-y-auto w-20 md:w-auto scrollbar-hide">
              <h3 className="text-center text-yellow-200 font-bold mb-1 md:mb-2 text-xs md:text-base">TABLE</h3>
              <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
                {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                        key={num} 
                        onClick={() => handleTableSelect(num)}
                        className={`w-12 h-10 md:w-16 md:h-16 rounded-xl text-xl md:text-2xl font-black border-b-4 transition-all flex items-center justify-center flex-shrink-0
                            ${selectedTable === num 
                                ? 'bg-green-500 text-white border-green-700 scale-105 shadow-[0_0_15px_#22c55e]' 
                                : 'bg-stone-700 text-stone-400 border-stone-900 hover:bg-stone-600'}
                        `}
                    >
                        <span className={getNumberColorClass(num)}>{num}</span>
                    </button>
                ))}
              </div>
          </div>

          {/* Right: Visualization Area */}
          <div className="flex-1 wood-panel bg-[#fefce8] relative overflow-hidden flex flex-col md:flex-row p-4 md:p-6 lg:p-8 items-center justify-center shadow-2xl border-4 border-[#854d0e]">
                
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
                     style={{backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2rem'}}>
                </div>

                {/* Main Focus Display (Large) */}
                <div className="flex-1 flex flex-col items-center justify-center z-10 w-full h-full min-h-0">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-700 mb-2 md:mb-4 uppercase tracking-wider">
                        Focus Pattern
                    </div>
                    <div className="text-5xl md:text-7xl lg:text-9xl font-black flex items-center gap-2 md:gap-4 drop-shadow-md transition-all duration-300 transform scale-105 mb-4 md:mb-8">
                        <span className={getNumberColorClass(selectedTable)}>{selectedTable}</span>
                        <span className="text-stone-400 text-3xl md:text-5xl lg:text-6xl">×</span>
                        <span className={getNumberColorClass(activeIndex + 1)}>{activeIndex + 1}</span>
                        <span className="text-stone-400 text-3xl md:text-5xl lg:text-6xl">=</span>
                        {/* Active Recall: Answer fades in slightly later than the rest in a mental model, 
                            but here we pulse it to draw attention */}
                        <span key={`${selectedTable}-${activeIndex}`} className="text-stone-800 animate-[bounce_0.5s_ease-out]">
                            {selectedTable * (activeIndex + 1)}
                        </span>
                    </div>
                    
                    {/* Visual Dots Representation - Horizontal Stacking */}
                    <div className="flex-1 w-full overflow-x-auto flex items-end justify-center pb-2 px-2 scrollbar-hide min-h-0">
                         <div className="flex gap-2 bg-white/30 rounded-xl border border-white/50 backdrop-blur-sm p-2">
                            {Array.from({ length: activeIndex + 1 }).map((_, groupIdx) => (
                                <div key={groupIdx} className="flex flex-col gap-0.5 md:gap-1 bg-blue-100 p-0.5 md:p-1 rounded border border-blue-200 animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                                    {Array.from({ length: selectedTable }).map((_, dotIdx) => (
                                        <div key={dotIdx} className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-500 shadow-sm border border-green-600"></div>
                                    ))}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                {/* List View (Scrollable) - Hidden on very small landscape screens to save space, or kept small */}
                <div className="hidden md:block md:h-full md:w-56 lg:w-64 bg-white/50 rounded-xl border-2 border-[#d97706] overflow-y-auto p-2 scrollbar-hide snap-y ml-4" ref={scrollRef}>
                    {Array.from({ length: 9 }).map((_, i) => {
                        const num = i + 1;
                        const isActive = i === activeIndex;
                        return (
                            <div 
                                key={num}
                                onClick={() => { setActiveIndex(i); setIsAutoPlay(false); audio.playCollect(); }}
                                className={`
                                    flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer transition-all snap-center
                                    ${isActive 
                                        ? 'bg-green-100 border-2 border-green-500 scale-105 shadow-md' 
                                        : 'bg-white/80 border border-transparent hover:bg-white'}
                                `}
                            >
                                <div className="text-lg lg:text-xl font-bold text-stone-600">
                                    <span className={getNumberColorClass(selectedTable)}>{selectedTable}</span> × <span className={getNumberColorClass(num)}>{num}</span>
                                </div>
                                <div className={`text-xl lg:text-2xl font-black ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>
                                    {selectedTable * num}
                                </div>
                            </div>
                        );
                    })}
                </div>
          </div>
      </div>
    </div>
  );
};
