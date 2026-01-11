
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameObject } from '../types';

interface GameCanvasProps {
  difficulty: number;
  onSuccess: () => void;
  onFail: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const GameCanvas: React.FC<GameCanvasProps> = ({ difficulty, onSuccess, onFail }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Difficulty scaling params
  const spawnRate = Math.max(2000 - (difficulty * 15), 400);
  const baseSpeed = 0.5 + (difficulty / 30);
  // Slightly increased radius for better visibility of letters at high difficulty
  const targetRadius = Math.max(48 - (difficulty / 4), 22);

  const spawnObject = useCallback(() => {
    const isHazard = Math.random() < (difficulty / 250);
    const randomChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    const radius = targetRadius;
    
    // Random initial horizontal push
    const vx = (Math.random() - 0.5) * (baseSpeed * 2);
    const vy = baseSpeed * (0.8 + Math.random() * 0.4);

    const newObj: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (CANVAS_WIDTH - radius * 2) + radius,
      y: -radius,
      vx,
      vy,
      radius,
      color: isHazard ? '#ef4444' : '#10b981',
      type: isHazard ? 'hazard' : 'target',
      label: randomChar
    };
    setObjects(prev => [...prev, newObj]);
  }, [difficulty, baseSpeed, targetRadius]);

  const updatePhysics = (currentObjects: GameObject[]) => {
    let next = currentObjects.map(obj => ({
      ...obj,
      x: obj.x + obj.vx,
      y: obj.y + obj.vy
    }));

    // Wall Collisions (Left/Right)
    next = next.map(obj => {
      let nx = obj.x;
      let nvx = obj.vx;
      if (nx - obj.radius < 0) {
        nx = obj.radius;
        nvx = Math.abs(nvx) * 0.8; // Dampened bounce
      } else if (nx + obj.radius > CANVAS_WIDTH) {
        nx = CANVAS_WIDTH - obj.radius;
        nvx = -Math.abs(nvx) * 0.8;
      }
      return { ...obj, x: nx, vx: nvx };
    });

    // Object-to-Object Collisions
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const objA = next[i];
        const objB = next[j];
        const dx = objB.x - objA.x;
        const dy = objB.y - objA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = objA.radius + objB.radius;

        if (distance < minDistance) {
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          const vxA = objA.vx * cos + objA.vy * sin;
          const vyA = objA.vy * cos - objA.vx * sin;
          const vxB = objB.vx * cos + objB.vy * sin;
          const vyB = objB.vy * cos - objB.vx * sin;

          const finalVxA = vxB;
          const finalVxB = vxA;

          next[i].vx = finalVxA * cos - vyA * sin;
          next[i].vy = vyA * cos + finalVxA * sin;
          next[j].vx = finalVxB * cos - vyB * sin;
          next[j].vy = vyB * cos + finalVxB * sin;

          const overlap = minDistance - distance;
          const lx = (overlap / 2) * cos;
          const ly = (overlap / 2) * sin;
          next[i].x -= lx;
          next[i].y -= ly;
          next[j].x += lx;
          next[j].y += ly;
        }
      }
    }

    return next;
  };

  const update = useCallback((time: number) => {
    if (time - lastSpawnRef.current > spawnRate) {
      spawnObject();
      lastSpawnRef.current = time;
    }

    setObjects(prev => {
      const physicallyUpdated = updatePhysics(prev);
      const offScreen = physicallyUpdated.filter(obj => obj.y > CANVAS_HEIGHT + obj.radius);
      
      if (offScreen.some(obj => obj.type === 'target')) {
        onFail();
      }
      
      return physicallyUpdated.filter(obj => obj.y <= CANVAS_HEIGHT + obj.radius);
    });

    requestRef.current = requestAnimationFrame(update);
  }, [spawnRate, spawnObject, onFail]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (!ALPHABET.includes(key)) return;

      setObjects(prev => {
        const matchingObjects = prev.filter(obj => obj.label === key);
        if (matchingObjects.length === 0) return prev;

        const targetToBurst = matchingObjects.sort((a, b) => b.y - a.y)[0];

        if (targetToBurst.type === 'target') {
          onSuccess();
        } else {
          onFail();
        }

        return prev.filter(obj => obj.id !== targetToBurst.id);
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSuccess, onFail]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setObjects(prev => {
      let foundTarget = false;
      let foundHazard = false;
      const filtered = prev.filter(obj => {
        const dist = Math.sqrt((obj.x - x)**2 + (obj.y - y)**2);
        if (dist < obj.radius + 5) {
          if (obj.type === 'target') foundTarget = true;
          if (obj.type === 'hazard') foundHazard = true;
          return false;
        }
        return true;
      });
      if (foundTarget) onSuccess();
      if (foundHazard) onFail();
      return filtered;
    });
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dynamic background grid
    const gridOpacity = Math.max(0.1, difficulty / 200);
    ctx.strokeStyle = `rgba(30, 41, 59, ${gridOpacity})`;
    ctx.lineWidth = 1;
    const gridSize = 50 - (difficulty / 5);
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Objects rendering
    objects.forEach(obj => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = obj.color;
      ctx.fillStyle = obj.color;
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Increased font size multiplier to 1.5 and used valid 'bold' weight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.floor(obj.radius * 1.5)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.label, obj.x, obj.y);
      
      ctx.restore();
    });
  }, [objects, difficulty]);

  return (
    <div className="relative group cursor-crosshair overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl focus:outline-none" tabIndex={0}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        className="block w-full h-auto aspect-[16/10]"
      />
      
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(circle at center, transparent 30%, ${difficulty > 70 ? 'rgba(225, 29, 72, 0.05)' : 'rgba(16, 185, 129, 0.03)'} 100%)`,
          opacity: Math.min(difficulty / 100, 1)
        }} 
      />

      <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        Type letters or Click to burst
      </div>

      <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/20 group-hover:border-indigo-500/40 transition-colors" />
      
      {difficulty > 85 && (
        <div className="absolute inset-0 pointer-events-none animate-pulse bg-rose-500/5 mix-blend-overlay" />
      )}
    </div>
  );
};
