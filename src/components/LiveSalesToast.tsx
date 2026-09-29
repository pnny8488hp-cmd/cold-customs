import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, ShieldCheck } from 'lucide-react';
import { useProductImages } from '../context/ImageContext';

export interface RealSale {
  id: string;
  city: string;
  paczkomat?: string;
  deliveryMethod: string;
  payment?: string;
  quantity: number;
  timeAgo: string;
  productName?: string;
  productId?: string;
  isReal?: boolean;
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
  const [intervalMs, setIntervalMs] = useState(25000);
  const currentIndexRef = useRef(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const salesRef = useRef<RealSale[]>([]);
  salesRef.current = sales;

  // Listen for admin panel live preview test event
  useEffect(() => {
    const handleTestToast = (e: CustomEvent<RealSale>) => {
      if (e.detail) {
        setIsDismissed(false);
        setCurrentSale(e.detail);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setCurrentSale(null);
        }, 7000);
      }
    };

    window.addEventListener('ubb-test-toast' as any, handleTestToast as EventListener);
    return () => {
      window.removeEventListener('ubb-test-toast' as any, handleTestToast as EventListener);
    };
  }, []);

  // Fetch orders & notification settings from server
  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const res = await fetch('/api/recent-sales');
        if (res.ok) {
          const data = await res.json();
          if (data && data.enabled === false) {
            setSales([]);
            return;
          }
          if (data && Array.isArray(data.sales) && data.sales.length > 0) {
            setSales(data.sales);
            if (data.intervalSeconds) {
              setIntervalMs(Math.max(6000, Number(data.intervalSeconds) * 1000));
            }
          } else {
            setSales([]);
          }
        }
      } catch (err) {
        console.error('Błąd pobierania ostatnich zamówień:', err);
      }
    };

    fetchRecentSales();
    const interval = setInterval(fetchRecentSales, 30000);
    return () => clearInterval(interval);
  }, []);

  // Display notification cycle
  useEffect(() => {
    if (isDismissed || sales.length === 0) return;

    // Show initial notification after 3.5 seconds
    const initialTimer = setTimeout(() => {
      showNextNotification();
    }, 3500);

    return () => clearTimeout(initialTimer);
  }, [sales, isDismissed]);

  const showNextNotification = () => {
    if (isDismissed || isCheckoutOpen || salesRef.current.length === 0) return;

    const list = salesRef.current;
    const nextSale = list[currentIndexRef.current % list.length];
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

    // Natural delay based on configured interval
    const jitter = Math.floor(Math.random() * 4000) - 2000;
    const nextDelay = Math.max(5000, intervalMs + jitter);

    setTimeout(() => {
      if (!isDismissed && !isCheckoutOpen && salesRef.current.length > 0) {
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

  const getSaleImage = (sale: RealSale) => {
    const prodName = (sale.productName || '').toLowerCase();
    const prodId = sale.productId || '';
    if (prodId === 'front-plate-cold-customs' || prodName.includes('plate') || prodName.includes('vented')) {
      if (prodName.includes('oklein') || prodName.includes('#1') || prodName.includes('sticker')) {
        return images.plateSticker || images.plateClean;
      }
      return images.plateClean || images.plateSticker;
    }
    return images.kit;
  };

  // If no sales exist or dismissed or checkout is open -> show nothing
  if ((isCheckoutOpen || isDismissed || sales.length === 0) && !currentSale) {
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
                  src={getSaleImage(currentSale)}
                  alt={currentSale.productName || 'Cold Customs'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                    {currentSale.productName || 'Ultra Bee Brakes'} ({currentSale.quantity} szt.)
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
