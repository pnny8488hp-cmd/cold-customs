import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Phone } from 'lucide-react';

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
  const [logoVersion, setLogoVersion] = React.useState(() => Date.now());

  React.useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setLogoVersion(e.detail || Date.now());
    };
    window.addEventListener('cc-logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('cc-logo-updated', handleLogoUpdate);
  }, []);

  return (
    <header className="fixed top-[44px] left-0 right-0 z-40 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-lg font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity flex items-center gap-2.5"
          >
            <img
              src={`/logo.jpg?v=${logoVersion}`}
              alt="Cold Customs Logo"
              className="w-10 h-10 aspect-square rounded-xl shadow-md border border-white/10 shrink-0 object-contain bg-black p-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon-192x192.png';
              }}
            />
            <div className="flex flex-col">
              <span className="font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 text-base leading-tight">
                COLD CUSTOMS
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-normal -mt-0.5 hidden sm:block">
                Części Motocyklowe
              </span>
            </div>
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

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Phone quick call */}
          <a
            href="tel:+48534396429"
            title="Zadzwoń do nas: +48 534 396 429"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">+48 534 396 429</span>
          </a>

          {/* TikTok link */}
          <a
            href="https://www.tiktok.com/@coldcustoms_official"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok @coldcustoms_official"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.36a6.34 6.34 0 0 0-6.61 6.32A6.33 6.33 0 0 0 10.02 22a6.34 6.34 0 0 0 6.35-6.33V9.08a8.31 8.31 0 0 0 4.67 1.44v-3.48a4.84 4.84 0 0 1-1.45-.35z" />
            </svg>
          </a>

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
