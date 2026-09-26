import React from 'react';

interface FooterProps {
  onOpenOrdersSheet?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOrdersSheet }) => {
  return (
    <footer className="py-12 bg-[#040406] border-t border-white/5 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-white tracking-wider">
              COLD CUSTOMS
            </span>
            <span className="text-zinc-600">/</span>
            <span>Układy hamulcowe Sur-Ron Ultra Bee</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#overview" className="hover:text-white transition-colors">
              Przegląd
            </a>
            <a href="#package" className="hover:text-white transition-colors">
              Zestaw
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[11px]">
          <p>© {new Date().getFullYear()} Cold Customs. Wszelkie prawa zastrzeżone.</p>
          <div className="flex items-center gap-4">
            <span>Darmowa dostawa na terenie Polski</span>
            <span aria-hidden="true">·</span>
            <span>14 dni na zwrot</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
