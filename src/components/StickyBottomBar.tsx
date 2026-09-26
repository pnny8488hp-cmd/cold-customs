import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Truck } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';

interface StickyBottomBarProps {
  onOpenCheckout: () => void;
  onAddToCart: (rect: DOMRect) => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onOpenCheckout,
  onAddToCart,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-40"
        >
          <div className="glass-panel rounded-2xl p-3 px-4 shadow-2xl flex items-center justify-between gap-3 border border-white/15">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  Ultra Bee Brakes
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
                  <Truck className="w-3 h-3" />
                  Darmowa wysyłka
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                <span className="text-white font-bold tabular-nums">849 zł</span>
                <span className="mx-1.5 text-zinc-600">·</span>
                <span>Sklep Cold Customs</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <AddToCartButton
                onAdd={onAddToCart}
                price={849}
                label="Kup"
                compact
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
