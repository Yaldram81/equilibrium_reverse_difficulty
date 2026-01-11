
import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { DifficultyBar } from './components/DifficultyBar';
import { HintsPanel } from './components/HintsPanel';
import { StatsPanel } from './components/StatsPanel';
import { GameState } from './types';
import { getAdaptiveHint } from './services/geminiService';

const INITIAL_DIFFICULTY = 100;

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    currentDifficulty: INITIAL_DIFFICULTY,
    failCount: 0,
    successCount: 0,
    hintsUnlocked: [],
    playerStats: {
      score: 0,
      timeSpent: 0,
      highScore: 0
    },
    lastSession: Date.now(),
    history: [{ difficulty: INITIAL_DIFFICULTY, timestamp: Date.now() }]
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'fail'; message: string } | null>(null);

  const handleFail = useCallback(async () => {
    setState(prev => {
      const newDifficulty = Math.max(prev.currentDifficulty - 4, 10);
      const newFails = prev.failCount + 1;
      
      // Every 3 fails, we might unlock a hint
      return {
        ...prev,
        failCount: newFails,
        currentDifficulty: newDifficulty,
        history: [...prev.history, { difficulty: newDifficulty, timestamp: Date.now() }]
      };
    });

    setFeedback({ type: 'fail', message: 'DIFFICULTY DEGRADED' });
    setTimeout(() => setFeedback(null), 1000);

    // Logic for hint unlocking (async call to Gemini)
    if ((state.failCount + 1) % 3 === 0) {
      const hint = await getAdaptiveHint(state.currentDifficulty, state.failCount + 1);
      setState(prev => ({
        ...prev,
        hintsUnlocked: [hint, ...prev.hintsUnlocked].slice(0, 10)
      }));
    }
  }, [state.failCount, state.currentDifficulty]);

  const handleSuccess = useCallback(() => {
    setState(prev => {
      const newDifficulty = Math.min(prev.currentDifficulty + 6, 150); // Allow exceeding 100 for extreme players
      const newScore = prev.playerStats.score + Math.round(prev.currentDifficulty * 10);
      
      return {
        ...prev,
        successCount: prev.successCount + 1,
        currentDifficulty: newDifficulty,
        playerStats: {
          ...prev.playerStats,
          score: newScore,
          highScore: Math.max(prev.playerStats.highScore, newScore)
        },
        history: [...prev.history, { difficulty: newDifficulty, timestamp: Date.now() }]
      };
    });

    setFeedback({ type: 'success', message: 'DIFFICULTY SURGE' });
    setTimeout(() => setFeedback(null), 1000);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
            EQUILIBRIUM
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">The Reverse Difficulty Loop</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Total Score</div>
            <div className="text-3xl font-mono font-black text-indigo-400">{state.playerStats.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase">High Score</div>
            <div className="text-xl font-mono font-bold text-slate-400">{state.playerStats.highScore.toLocaleString()}</div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Stats & Hints */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
          <StatsPanel state={state} />
          <HintsPanel hints={state.hintsUnlocked} />
        </div>

        {/* Middle Column: Game Canvas */}
        <div className="lg:col-span-3 flex flex-col gap-6 order-1 lg:order-2">
          {/* Top Bar for Game Area */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <DifficultyBar difficulty={Math.min(state.currentDifficulty, 100)} />
          </div>

          <div className="relative">
            <GameCanvas 
              difficulty={state.currentDifficulty} 
              onSuccess={handleSuccess} 
              onFail={handleFail} 
            />

            {/* Feedback Overlay */}
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className={`
                  px-8 py-4 rounded-full font-black text-2xl italic tracking-tighter border-4 shadow-2xl animate-ping opacity-0
                  ${feedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'}
                `}>
                  {feedback.message}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls / Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Success Reward</div>
                <div className="text-xs font-semibold">+Difficulty, +Points</div>
              </div>
            </div>

            <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Failure Consequence</div>
                <div className="text-xs font-semibold">-Difficulty, Unlock Hints</div>
              </div>
            </div>

            <div className="bg-indigo-600 p-4 rounded-xl flex items-center justify-center text-white font-bold cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20" onClick={() => window.location.reload()}>
              RESTART MATRIX
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest mt-8 pb-8">
        Designed for Challenge Equilibrium &bull; Adaptive Difficulty System v1.0 &bull; Powered by Gemini Intelligence
      </footer>
    </div>
  );
};

export default App;
