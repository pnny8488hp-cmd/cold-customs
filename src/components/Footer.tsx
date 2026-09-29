import React from 'react';
import { Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenOrdersSheet?: () => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOrdersSheet, onOpenLegal }) => {
  const [logoVersion, setLogoVersion] = React.useState(() => Date.now());

  React.useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setLogoVersion(e.detail || Date.now());
    };
    window.addEventListener('cc-logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('cc-logo-updated', handleLogoUpdate);
  }, []);

  return (
    <footer className="py-12 bg-[#040406] border-t border-white/5 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top bar with brand and main links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={`/logo.jpg?v=${logoVersion}`}
              alt="Cold Customs Logo"
              className="w-8 h-8 aspect-square rounded-lg shadow border border-white/10 shrink-0 object-contain bg-black p-0.5"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/favicon-192x192.png';
              }}
            />
            <span className="text-sm font-extrabold text-white tracking-wider">
              COLD CUSTOMS
            </span>
            <span className="text-zinc-600">/</span>
            <span>Sklep z częściami i akcesoriami motocyklowymi</span>
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

        {/* Contact & Social Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
          {/* Phone */}
          <a
            href="tel:+48534396429"
            className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Zadzwoń / Napisz SMS
              </span>
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors font-mono">
                +48 534 396 429
              </span>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:coldcustoms.contact@gmail.com"
            className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Kontakt E-mail
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate block">
                coldcustoms.contact@gmail.com
              </span>
            </div>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@coldcustoms_official"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/20 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-black border border-white/15 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.36a6.34 6.34 0 0 0-6.61 6.32A6.33 6.33 0 0 0 10.02 22a6.34 6.34 0 0 0 6.35-6.33V9.08a8.31 8.31 0 0 0 4.67 1.44v-3.48a4.84 4.84 0 0 1-1.45-.35z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                Oficjalny TikTok
              </span>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors truncate flex items-center gap-1.5">
                @coldcustoms_official
                <ExternalLink className="w-3 h-3 text-zinc-500 inline shrink-0" />
              </span>
            </div>
          </a>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[11px]">
          <p>
            © {new Date().getFullYear()}{' '}
            <span
              onClick={onOpenOrdersSheet}
              className="cursor-default select-none"
              title=""
            >
              Cold Customs
            </span>
            . Wszelkie prawa zastrzeżone.
          </p>
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


