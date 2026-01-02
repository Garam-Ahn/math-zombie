
import React, { useState } from 'react';
import { MathHistoryItem } from '../types';
import { saveService } from '../services/saveService';
import { audio } from '../services/audioService';
import { getNumberColorClass } from '../constants';

interface ReportModalProps {
  history: MathHistoryItem[];
  totalCoins: number;
  totalScore: number;
  onClose: () => void;
  onLoadSave?: (coins: number, score: number) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ history, totalCoins, totalScore, onClose, onLoadSave }) => {
  const [saveCode, setSaveCode] = useState('');
  const [loadInput, setLoadInput] = useState('');
  const [loadMsg, setLoadMsg] = useState('');

  // Analyze History
  const stats: Record<string, { factorA: number, factorB: number, correct: number, attempts: number }> = {};
  history.forEach(h => {
    const key = `${h.factorA}x${h.factorB}`;
    if (!stats[key]) stats[key] = { factorA: h.factorA, factorB: h.factorB, correct: 0, attempts: 0 };
    stats[key].attempts++;
    if (h.isCorrect) stats[key].correct++;
  });

  const items = Object.values(stats);
  const strong = items.filter(i => (i.correct / i.attempts) >= 0.8 && i.attempts >= 2).sort((a,b) => b.attempts - a.attempts).slice(0, 5);
  const weak = items.filter(i => (i.correct / i.attempts) < 0.8).sort((a,b) => (a.correct/a.attempts) - (b.correct/b.attempts)).slice(0, 5);

  const handleGenerateCode = () => {
    const code = saveService.generateSaveCode(totalCoins, totalScore, history);
    setSaveCode(code);
  };

  const handleLoadCode = () => {
    const data = saveService.parseSaveCode(loadInput);
    if (data && onLoadSave) {
        onLoadSave(data.totalCoins, data.totalScore);
        setLoadMsg("Success! Data Loaded.");
        audio.playCollect();
    } else {
        setLoadMsg("Invalid Code.");
        audio.playWrong();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="wood-panel p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-8">
        
        {/* Left: Stats */}
        <div className="flex-1">
            <h2 className="text-3xl font-black text-yellow-400 mb-6 drop-shadow-md border-b-2 border-stone-600 pb-2">📊 BATTLE REPORT</h2>
            
            <div className="mb-6">
                <h3 className="text-green-400 font-bold mb-2">⭐ Top Skills (Mastered)</h3>
                {strong.length === 0 ? <p className="text-stone-400 text-sm">Keep playing to see stats!</p> : (
                    <div className="flex flex-wrap gap-2">
                        {strong.map(s => (
                            <span key={`${s.factorA}x${s.factorB}`} className="bg-green-900/50 border border-green-500 text-green-200 px-3 py-1 rounded-full text-sm font-bold flex gap-1">
                                <span className={getNumberColorClass(s.factorA)}>{s.factorA}</span>
                                <span>×</span>
                                <span className={getNumberColorClass(s.factorB)}>{s.factorB}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-red-400 font-bold mb-2">🔥 Needs Practice</h3>
                {weak.length === 0 ? <p className="text-stone-400 text-sm">{history.length > 0 ? "Perfect so far!" : "No data yet."}</p> : (
                    <div className="flex flex-col gap-2">
                        {weak.map(s => (
                            <div key={`${s.factorA}x${s.factorB}`} className="bg-red-900/50 border border-red-500 text-red-100 px-3 py-2 rounded-lg text-lg font-black flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className={getNumberColorClass(s.factorA)}>{s.factorA}</span>
                                    <span>×</span>
                                    <span className={getNumberColorClass(s.factorB)}>{s.factorB}</span>
                                </div>
                                <div className="flex gap-2 text-stone-300">
                                    <span>=</span>
                                    <span className="text-yellow-400">{s.factorA * s.factorB}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Right: Save/Load */}
        <div className="flex-1 bg-stone-900/50 p-4 rounded-xl border-2 border-stone-700">
            <h3 className="text-xl font-bold text-blue-300 mb-4">💾 REVIVE CODE</h3>
            <p className="text-xs text-stone-400 mb-4">Save your progress (Coins & Score) by copying this code.</p>
            
            <div className="mb-6">
                <button onClick={handleGenerateCode} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold mb-2 w-full">
                    Generate Code
                </button>
                {saveCode && (
                    <div className="bg-black p-2 rounded border border-stone-600 break-all text-xs font-mono select-all text-yellow-200">
                        {saveCode}
                    </div>
                )}
            </div>

            <div className="border-t border-stone-700 pt-4">
                <h3 className="text-sm font-bold text-stone-300 mb-2">Load Code</h3>
                <input 
                    type="text" 
                    value={loadInput}
                    onChange={(e) => setLoadInput(e.target.value)}
                    placeholder="Paste code here..."
                    className="w-full bg-stone-800 border border-stone-600 p-2 rounded text-white mb-2 text-sm"
                />
                <button onClick={handleLoadCode} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold w-full text-sm">
                    Load Data
                </button>
                {loadMsg && <p className="text-center mt-2 text-sm font-bold text-yellow-300">{loadMsg}</p>}
            </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-red-600 w-8 h-8 rounded-full font-bold shadow-lg">X</button>
      </div>
    </div>
  );
};
