
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GameState } from '../types';

interface StatsPanelProps {
  state: GameState;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ state }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 h-full flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">Session Analytics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-black text-rose-500">{state.failCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Failures</div>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
          <div className="text-2xl font-black text-emerald-500">{state.successCount}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500">Successes</div>
        </div>
      </div>

      <div className="flex-grow min-h-[150px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={state.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="timestamp" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              labelStyle={{ display: 'none' }}
            />
            <Line 
              type="monotone" 
              dataKey="difficulty" 
              stroke="#6366f1" 
              strokeWidth={3} 
              dot={false}
              animationDuration={1500} 
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-[10px] text-center text-slate-500 mt-1 uppercase font-bold">Difficulty Trend</div>
      </div>
    </div>
  );
};
