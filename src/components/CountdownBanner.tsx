import React from 'react';
import { Truck, Sparkles, Clock } from 'lucide-react';
import { useShipping } from '../context/ShippingContext';

export const CountdownBanner: React.FC = () => {
  const {
    settings,
    isSameDayActiveNow,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
  } = useShipping();

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[44px] flex items-center justify-center gap-2 sm:gap-3 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 text-xs">
      {isSameDayActiveNow ? (
        <div className="flex items-center gap-2 sm:gap-3 max-w-full overflow-hidden">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Wysyłka DZISIAJ:</span>
            <span className="sm:hidden">Wysyłka dziś:</span>
          </div>

          <p className="text-zinc-200 truncate font-medium">
            Zamów przed <strong className="text-white font-bold">{settings.cutoffHour}:00</strong>, a paczkę wyślemy jeszcze dzisiaj!
          </p>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <span className="text-[11px] text-zinc-400 hidden md:inline">Pozostało:</span>
            {[pad(hoursRemaining), pad(minutesRemaining), pad(secondsRemaining)].map((unit, i) => (
              <React.Fragment key={i}>
                <span className="inline-flex items-center justify-center font-mono font-black text-xs text-white bg-zinc-800/90 border border-emerald-500/40 rounded px-1.5 py-0.5 tabular-nums min-w-[24px]">
                  {unit}
                </span>
                {i < 2 && <span className="text-emerald-400 font-bold text-xs">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-zinc-300 truncate">
          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-white">
            {settings.customNotice || (
              <>
                Zamów przed <strong className="text-white font-bold">{settings.cutoffHour}:00</strong>, a paczkę wyślemy jeszcze dzisiaj!
              </>
            )}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 hidden xs:inline">Paczkomaty InPost & Kurier</span>
          <span className="text-zinc-600 hidden sm:inline">·</span>
          <span className="text-emerald-400 font-semibold hidden sm:inline">
            Darmowa dostawa od 399 zł
          </span>
        </div>
      )}
    </div>
  );
};

