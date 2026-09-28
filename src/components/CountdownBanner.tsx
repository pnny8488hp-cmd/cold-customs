import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const RESET_SECONDS = 12 * 60 * 60;

function getInitialSeconds(): number {
  const now = new Date();
  const seed = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % RESET_SECONDS;
  return RESET_SECONDS - seed;
}

export const CountdownBanner: React.FC = () => {
  const [seconds, setSeconds] = useState(getInitialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => {
        const next = s - 1;
        return next <= 0 ? RESET_SECONDS : next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[44px] flex items-center justify-center gap-3 bg-zinc-900 border-b border-white/8 px-4">
      <Timer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <p className="text-xs sm:text-sm text-zinc-400 truncate">
        <span className="text-emerald-400 font-semibold mr-1.5 hidden sm:inline">Darmowa wysyłka od 399 zł</span>
        <span className="hidden sm:inline text-zinc-600 mr-1.5">·</span>
        Ceny promocyjne kończą się za
      </p>
      <div className="flex items-center gap-1">
        {[pad(h), pad(m), pad(s)].map((unit, i) => (
          <React.Fragment key={i}>
            <span className="inline-flex items-center justify-center font-mono font-bold text-xs text-white bg-zinc-800 border border-white/10 rounded px-1.5 py-1 tabular-nums w-8">
              {unit}
            </span>
            {i < 2 && <span className="text-zinc-600 font-bold text-xs">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
