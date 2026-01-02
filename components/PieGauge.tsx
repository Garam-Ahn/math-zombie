import React from 'react';

interface PieGaugeProps {
  value: number; // 0 to 100
  max: number;
  label: string;
  icon: string;
  type: 'FREEZE' | 'REVENGE';
  isActive?: boolean;
}

export const PieGauge: React.FC<PieGaugeProps> = ({ value, max, label, icon, type, isActive }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color Interpolation for Freeze (Red -> Yellow -> Green)
  const getFreezeColor = (pct: number) => {
    // 0% = Red (239, 68, 68), 50% = Yellow (234, 179, 8), 100% = Green (34, 197, 94)
    if (pct < 50) {
      const t = pct / 50; // 0 to 1
      return `rgb(${239 + (234 - 239) * t}, ${68 + (179 - 68) * t}, ${68 + (8 - 68) * t})`;
    } else {
      const t = (pct - 50) / 50; // 0 to 1
      return `rgb(${234 + (34 - 234) * t}, ${179 + (197 - 179) * t}, ${8 + (94 - 8) * t})`;
    }
  };

  const color = type === 'FREEZE' ? getFreezeColor(percentage) : '#ef4444'; // Revenge is always red
  const bgColor = type === 'FREEZE' ? 'bg-stone-800' : 'bg-stone-900';
  const glowClass = type === 'FREEZE' && percentage >= 100 
    ? 'shadow-[0_0_15px_#22c55e] border-green-400' 
    : (type === 'REVENGE' && percentage > 0 ? 'shadow-[0_0_10px_#ef4444]' : 'border-stone-600');

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${isActive ? 'scale-110' : ''}`}>
      <div className={`relative w-20 h-20 rounded-full border-4 ${bgColor} ${glowClass} flex items-center justify-center shadow-lg overflow-hidden`}>
        
        {/* SVG Gauge */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 70 70">
          {/* Background Track */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="transparent"
            stroke="#44403c"
            strokeWidth="8"
          />
          {/* Active Progress */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Icon / Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-2xl filter drop-shadow-md">{icon}</span>
            <span className="text-[10px] font-bold text-white drop-shadow-md mt-1">
                {Math.floor(percentage)}%
            </span>
        </div>

        {/* Active Effect Overlay */}
        {isActive && (
            <div className={`absolute inset-0 z-20 animate-pulse ${type === 'FREEZE' ? 'bg-cyan-400/30' : 'bg-red-500/30'}`}></div>
        )}
      </div>
      
      {/* Label Badge */}
      <div className={`
        mt-2 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-md
        ${type === 'FREEZE' ? 'bg-blue-900 border-blue-500 text-blue-200' : 'bg-red-900 border-red-500 text-red-200'}
      `}>
        {label}
      </div>
    </div>
  );
};