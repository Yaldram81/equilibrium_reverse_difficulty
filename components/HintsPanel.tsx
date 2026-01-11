
import React from 'react';

interface HintsPanelProps {
  hints: string[];
}

export const HintsPanel: React.FC<HintsPanelProps> = ({ hints }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col h-full max-h-[300px]">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 mb-2">Unlocked Intelligence</h3>
      <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2">
        {hints.length === 0 ? (
          <p className="text-slate-600 text-xs italic text-center py-8">Fail to reveal forbidden knowledge...</p>
        ) : (
          hints.map((hint, idx) => (
            <div key={idx} className="bg-indigo-950/30 border-l-4 border-indigo-500 p-2 rounded animate-in fade-in slide-in-from-left duration-500">
              <p className="text-indigo-200 text-xs leading-relaxed">“{hint}”</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
