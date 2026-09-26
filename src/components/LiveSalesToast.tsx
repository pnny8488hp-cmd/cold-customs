import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, ShieldCheck } from 'lucide-react';
import { useProductImages } from '../context/ImageContext';

export interface RealSale {
  id: string;
  city: string;
  paczkomat: string;
  deliveryMethod: string;
  payment: string;
  quantity: number;
  timeAgo: string;
}

interface LiveSalesToastProps {
  onOpenCheckout?: () => void;
  isCheckoutOpen?: boolean;
}

export const LiveSalesToast: React.FC<LiveSalesToastProps> = ({
  onOpenCheckout,
  isCheckoutOpen = false,
}) => {
  const { images } = useProductImages();
  const [sales, setSales] = useState<RealSale[]>([]);
  const [currentSale, setCurrentSale] = useState<RealSale | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currentIndexRef = useRef(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real orders from database
  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const res = await fetch('/api/recent-sales');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sales) && data.sales.length > 0) {
            setSales(data.sales);
          } else {
            setSales([]);
          }
        }
      } catch (err) {
        console.error('Błąd pobierania ostatnich zamówień:', err);
      }
    };

    fetchRecentSales();
    // Poll for new real orders every 60 seconds
    const interval = setInterval(fetchRecentSales, 60000);
    return () => clearInterval(interval);
  }, []);

  // Display notification cycle ONLY if there are real orders
  useEffect(() => {
    if (isDismissed || sales.length === 0) return;

    // Show initial real notification after 4 seconds
    const initialTimer = setTimeout(() => {
      showNextNotification();
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [sales, isDismissed]);

  const showNextNotification = () => {
    if (isDismissed || isCheckoutOpen || sales.length === 0) return;

    const nextSale = sales[currentIndexRef.current % sales.length];
    currentIndexRef.current += 1;
    setCurrentSale(nextSale);

    startHideTimer();
  };

  const startHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!isHovered) {
        hideAndScheduleNext();
      }
    }, 6500);
  };

  const hideAndScheduleNext = () => {
    setCurrentSale(null);

    // Pause for 18-28 seconds before showing next real order
    const nextDelay = Math.floor(Math.random() * 10000) + 18000;
    setTimeout(() => {
      if (!isDismissed && !isCheckoutOpen && sales.length > 0) {
        showNextNotification();
      }
    }, nextDelay);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (currentSale) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        hideAndScheduleNext();
      }, 3000);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSale(null);
    setIsDismissed(true);
  };

  const handleClickToast = () => {
    if (onOpenCheckout) {
      onOpenCheckout();
    }
  };

  // If no real orders exist yet, or dismissed, or checkout is open -> show nothing
  if (isCheckoutOpen || isDismissed || sales.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[360px] w-[calc(100vw-2rem)] pointer-events-none">
      <AnimatePresence>
        {currentSale && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleClickToast}
            className="pointer-events-auto cursor-pointer group relative overflow-hidden rounded-2xl bg-[#0d0e15]/95 border border-white/10 p-3.5 shadow-2xl backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all duration-300"
          >
            {/* Ambient glow */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3 relative z-10">
              {/* Product Thumbnail with pulsing indicator */}
              <div className="relative shrink-0 w-12 h-12 rounded-xl bg-black/50 border border-white/10 p-1 overflow-hidden flex items-center justify-center">
                <img
                  src={images.kit}
                  alt="Cold Customs Kit"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#0d0e15]" />
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Realne zamówienie w sklepie</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400 font-normal">{currentSale.timeAgo}</span>
                </div>

                <p className="text-xs font-bold text-zinc-100 truncate">
                  Ktoś z {currentSale.city}
                </p>

                <p className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                  <Package className="w-3 h-3 text-emerald-400/80 shrink-0" />
                  <span className="font-medium text-zinc-300 truncate">
                    Ultra Bee Brakes ({currentSale.quantity} szt.)
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded text-zinc-300 border border-white/5 truncate max-w-[170px]">
                    {currentSale.deliveryMethod} {currentSale.paczkomat ? `(${currentSale.paczkomat})` : ''}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-400 font-medium shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Zweryfikowane
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
                title="Zamknij"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
