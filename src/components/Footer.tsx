import React from 'react';

interface FooterProps {
  onOpenOrdersSheet?: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOrdersSheet, onOpenLegal }) => {
  return (
    <footer className="py-12 bg-[#040406] border-t border-white/5 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-white tracking-wider">
              COLD CUSTOMS
            </span>
            <span className="text-zinc-600">/</span>
            <span>Wyczynowe komponenty motocyklowe</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#overview" className="hover:text-white transition-colors">
              Przegląd
            </a>
            <a href="#catalog" className="hover:text-white transition-colors">
              Katalog
            </a>
            <a href="#package" className="hover:text-white transition-colors">
              Zestaw
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            {onOpenLegal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Regulamin
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prywatność (RODO)
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[11px]">
          <p>© {new Date().getFullYear()} Cold Customs. Wszelkie prawa zastrzeżone.</p>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <span>Darmowa dostawa od 399 zł</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-400">
              14 dni na bezproblemowy zwrot
            </span>
            {onOpenLegal && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Regulamin sklepu
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Polityka prywatności
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

