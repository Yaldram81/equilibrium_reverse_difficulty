
export interface PlayerStats {
  score: number;
  timeSpent: number;
  highScore: number;
}

export interface GameState {
  currentDifficulty: number; // 0-100
  failCount: number;
  successCount: number;
  hintsUnlocked: string[];
  playerStats: PlayerStats;
  lastSession: number;
  history: { difficulty: number; timestamp: number }[];
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity
  radius: number;
  color: string;
  type: 'target' | 'hazard';
  label: string;
}
