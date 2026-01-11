
import React, { useEffect, useState, useRef } from 'react';

interface DifficultyBarProps {
  difficulty: number;
}

export const DifficultyBar: React.FC<DifficultyBarProps> = ({ difficulty }) => {
  const [pulse, setPulse] = useState<'inc' | 'dec' | null>(null);
  const prevDifficultyRef = useRef(difficulty);

  useEffect(() => {
    if (difficulty > prevDifficultyRef.current) {
      setPulse('inc');
      const timer = setTimeout(() => setPulse(null), 600);
      return () => clearTimeout(timer);
    } else if (difficulty < prevDifficultyRef.current) {
      setPulse('dec');
      const timer = setTimeout(() => setPulse(null), 600);
      return () => clearTimeout(timer);
    }
    prevDifficultyRef.current = difficulty;
  }, [difficulty]);

  const getBarColor = () => {
    if (difficulty < 33) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (difficulty < 66) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  };

  const pulseClass = pulse === 'inc' 
    ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-slate-900 scale-[1.02]' 
    : pulse === 'dec' 
    ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-[0.98]' 
    : '';

  return (
    <div className={`w-full transition-all duration-300 transform ${pulseClass}`}>
      <div className="flex justify-between mb-1 px-1">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          Difficulty Matrix
          {pulse === 'inc' && <span className="text-rose-500 animate-bounce">▲</span>}
          {pulse === 'dec' && <span className="text-emerald-500 animate-bounce">▼</span>}
        </span>
        <span className="text-xs font-bold font-mono text-slate-200">{difficulty.toFixed(1)}%</span>
      </div>
      <div className="h-4 w-full bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-in-out ${getBarColor()}`}
          style={{ width: `${Math.min(difficulty, 100)}%` }}
        />
      </div>
    </div>
  );
};
