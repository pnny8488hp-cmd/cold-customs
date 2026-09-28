import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenCheckout: () => void;
  onOpenUploader: () => void;
  cartCount: number;
  totalCartPrice: number;
  isCartBouncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCheckout,
  cartCount,
  totalCartPrice,
  isCartBouncing,
}) => {
  return (
    <header className="fixed top-[44px] left-0 right-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-lg font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>COLD CUSTOMS</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a href="#overview" className="hover:text-white transition-colors">
            Przegląd
          </a>
          <a
            href="#catalog"
            className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-semibold transition-all shadow-sm"
          >
            Katalog Produktów
          </a>
          <a href="#package" className="hover:text-white transition-colors">
            Zestaw
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Zone 3: Cart */}
        <div className="flex items-center gap-2.5">
          <motion.button
            id="navbar-cart-btn"
            onClick={onOpenCheckout}
            animate={
              isCartBouncing
                ? {
                    scale: [1, 1.25, 0.9, 1.1, 1],
                    transition: { duration: 0.5 },
                  }
                : {}
            }
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-black bg-white rounded-full hover:bg-zinc-200 transition-all shadow-sm whitespace-nowrap cursor-pointer relative"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {cartCount > 0 ? `Koszyk · ${totalCartPrice} zł` : 'Koszyk'}
            </span>
            <span className="sm:hidden">
              {cartCount > 0 ? `${totalCartPrice} zł` : 'Koszyk'}
            </span>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4.5 h-4.5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
