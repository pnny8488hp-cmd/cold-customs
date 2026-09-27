import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, Check, RotateCcw } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useProductImages, ImageSlots, defaultImages } from '../context/ImageContext';

interface HeroProps {
  onOpenCheckout: () => void;
  onOpenUploader: () => void;
  onAddToCart: (rect: DOMRect, image?: string) => void;
  stock?: number | null;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCheckout, onOpenUploader, onAddToCart, stock }) => {
  const { images, isCustomLoaded, fitMode, setFitMode } = useProductImages();
  const [activeTabId, setActiveTabId] = useState<keyof ImageSlots>('kit');

  const componentsList: {
    id: keyof ImageSlots;
    name: string;
    shortName: string;
    category: string;
    description: string;
    specs: { label: string; value: string }[];
  }[] = [
    {
      id: 'kit',
      name: 'Kompletny układ Ultra Bee Brakes',
      shortName: 'Cały zestaw',
      category: 'Zestaw gotowy do montażu',
      description:
        'W pełni hydrauliczny motocyklowy układ hamulcowy na tył. Zestaw ze wszystkimi elementami przygotowanymi do natychmiastowego montażu.',
      specs: [
        { label: 'Układ', value: 'W pełni hydrauliczny' },
        { label: 'Pozycja', value: 'Tył (lewa klamka)' },
        { label: 'Tarcza w zestawie', value: '240 mm / 3,2 mm' },
      ],
    },
    {
      id: 'lever',
      name: 'Klamka lewa z pompą i zbiorniczkiem',
      shortName: 'Klamka & Pompa',
      category: 'Sekcja sterująca',
      description:
        'Klamka hamulcowa na lewą stronę kierownicy ze zintegrowaną pompą hydrauliczną i zbiorniczkiem na płyn DOT 4 / DOT 5.1.',
      specs: [
        { label: 'Montaż', value: 'Lewa klamka na kierownicę' },
        { label: 'Płyn roboczy', value: 'DOT 4 / DOT 5.1' },
        { label: 'Przewód', value: 'Wzmocniony oplot ciśnieniowy' },
      ],
    },
    {
      id: 'caliper',
      name: 'Aluminiowy zacisk dwutłoczkowy',
      shortName: 'Zacisk 2-tłoczkowy',
      category: 'Zacisk hamulcowy',
      description:
        'Dwutłoczkowy zacisk z odlewanego aluminium z fabrycznymi klockami. Zapewnia potężną siłę docisku i wysoką odporność na przegrzewanie w terenie.',
      specs: [
        { label: 'Konstrukcja', value: 'Aluminiowy, dwutłoczkowy' },
        { label: 'Klocki hamulcowe', value: 'W zestawie' },
        { label: 'Odpowietrznik', value: 'Z gumową osłonką' },
      ],
    },
    {
      id: 'rotor',
      name: 'Gruba tarcza hamulcowa 240 mm',
      shortName: 'Tarcza 240 mm',
      category: 'Tarcza hamulcowa',
      description:
        'Wentylowana tarcza hamulcowa ze stali nierdzewnej o średnicy 240 mm i grubości 3,2 mm. Grubość zapobiega przegrzewaniu i skrzywieniom w trudnych warunkach.',
      specs: [
        { label: 'Średnica', value: '240 mm' },
        { label: 'Grubość', value: '3,2 mm' },
        { label: 'Mocowanie', value: '6 śrub montażowych' },
      ],
    },
    {
      id: 'guard',
      name: 'Wspornik / adapter montażowy zacisku',
      shortName: 'Wspornik CNC',
      category: 'Mocowanie zacisku',
      description:
        'Solidny wspornik i adapter montażowy wycinany CNC ze stopu aluminium w kolorze czarnym z charakterystycznymi otworami heksagonalnymi.',
      specs: [
        { label: 'Materiał', value: 'Aluminium anodowane na czarno' },
        { label: 'Konstrukcja', value: 'Ażurowy plaster miodu' },
        { label: 'Mocowanie', value: 'Adapter pod zacisk tylny' },
      ],
    },
  ];

  const currentComponent =
    componentsList.find((c) => c.id === activeTabId) || componentsList[0];

  const currentImage = images[activeTabId];

  return (
    <section id="overview" className="relative pt-[108px] pb-20 md:pt-[116px] md:pb-28 overflow-hidden bg-grid-subtle">
      {/* Background ambient radial glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
        {/* Editorial Apple-style Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full w-fit mx-auto"
          >
            <span>Sklep Cold Customs</span>
            <span aria-hidden="true">·</span>
            <span>Układ Plug & Play na Tył</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
            style={{ textWrap: 'balance' }}
          >
            Ultra Bee Brakes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed mb-6 max-w-2xl mx-auto"
            style={{ textWrap: 'balance' }}
          >
            Dedykowany motocyklowy układ hamulcowy na tył w standardzie Plug & Play.
            W pełni hydrauliczny system zapewniający potężną siłę docisku, odporność
            na przegrzewanie i perfekcyjną modulację lewej klamki.
          </motion.p>

          {/* Compatible Models Quick Pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-3xl mx-auto"
          >
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Plug & Play:
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-200">
              <strong className="text-white">Surron</strong> LBX & LBS
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-200">
              <strong className="text-white">79 Bike</strong> Falcon Pro & GT/Lite
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-200">
              <strong className="text-white">E-Ride Pro</strong> Pro S & SS / 3.0
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-200">
              <strong className="text-white">Ventus</strong>
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-200">
              <strong className="text-white">Talaria</strong> XXX / MX4
            </span>
          </motion.div>

          {/* Value signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              Zacisk dwutłoczkowy z aluminium
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-zinc-400" />
              Tarcza 240 mm / 3,2 mm w zestawie
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              14 dni na zwrot bez ryzyka
            </span>
          </div>
        </div>

        {/* Interactive Apple-Style Product Showcase */}
        <div className="max-w-5xl mx-auto mt-6">
          {/* Main Visual Display Stage */}
          <div className="relative rounded-3xl bg-zinc-950/70 border border-white/10 p-4 sm:p-8 md:p-12 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Product Image Frame (Only this updates on thumbnail click) */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden bg-zinc-900/60 border border-white/10 group shadow-xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeTabId}
                      src={currentImage}
                      alt="Ultra Bee Brakes"
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.4 }}
                      transition={{ duration: 0.25 }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImages[activeTabId];
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AnimatePresence>

                </div>

                {/* Visual Photo Thumbnails Selector */}
                <div className="flex items-center justify-center gap-2.5 mt-4">
                  {componentsList.map((comp) => {
                    const isActive = comp.id === activeTabId;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setActiveTabId(comp.id)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-zinc-900 ${
                          isActive
                            ? 'border-white scale-105 shadow-md shadow-white/20 ring-2 ring-white/20'
                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/40'
                        }`}
                        title={comp.shortName}
                      >
                        <img
                          src={images[comp.id]}
                          alt={comp.shortName}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultImages[comp.id];
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Static Description & Specifications (Does NOT change on photo switch) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  Dedykowany układ hydrauliczny na tył
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ultra Bee Brakes
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  W pełni motocyklowy układ hamulcowy na tył. Zapewnia potężną siłę docisku,
                  odporność na przegrzewanie w ciężkim terenie oraz natychmiastowe, precyzyjne
                  dozowanie lewej klamki.
                </p>

                <div className="border-t border-white/10 pt-4 space-y-2.5 mb-6">
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-400">Tarcza hamulcowa</span>
                    <span className="text-zinc-200 font-semibold tabular-nums text-right">
                      240 mm / grubość 3,2 mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-400">Zacisk hamulcowy</span>
                    <span className="text-zinc-200 font-semibold tabular-nums text-right">
                      Dwutłoczkowy z odlewanego aluminium
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-400">Płyn roboczy</span>
                    <span className="text-zinc-200 font-semibold tabular-nums text-right">
                      DOT 4 / DOT 5.1
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex items-center text-xs mb-2">
                      <span className="text-zinc-400 font-medium">Kompatybilność Plug & Play</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-white/10 text-zinc-300">
                        <span className="text-white font-semibold">Surron:</span> LBX & LBS
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-white/10 text-zinc-300">
                        <span className="text-white font-semibold">79 Bike:</span> Falcon Pro/GT
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-white/10 text-zinc-300">
                        <span className="text-white font-semibold">E-Ride Pro:</span> Pro S/SS/3.0
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-white/10 text-zinc-300">
                        <span className="text-white font-semibold">Ventus:</span> Wszystkie wersje
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg bg-zinc-950/60 border border-white/10 text-zinc-300 col-span-2">
                        <span className="text-white font-semibold">Talaria:</span> XXX / MX4
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Cart Buttons */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">799 zł</span>
                        <span className="text-sm text-zinc-600 line-through tabular-nums">849 zł</span>
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-0.5 tracking-wide uppercase">promocja</div>
                    </div>
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <Truck className="w-3.5 h-3.5" />
                      Darmowa wysyłka
                    </span>
                  </div>

                  {/* Stock availability indicator */}
                  {stock !== undefined && stock !== null && (
                    <div className="mb-3 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-zinc-950/80 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            stock > 3
                              ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500/50'
                              : stock > 0
                              ? 'bg-amber-400 animate-ping'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-zinc-300 font-medium">
                          {stock > 3 ? (
                            <>
                              Dostępność: <strong className="text-white font-bold">{stock} szt.</strong> w magazynie
                            </>
                          ) : stock > 0 ? (
                            <>
                              <span className="text-amber-400 font-bold">Ostatnie {stock} szt.!</span> Szybka wysyłka
                            </>
                          ) : (
                            <span className="text-rose-400 font-bold">Chwilowy brak w magazynie</span>
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {stock > 0 ? 'Wysyłka w 24h' : 'Dostawa wkrótce'}
                      </span>
                    </div>
                  )}

                  {/* Single Add to Cart Button */}
                  <AddToCartButton
                    onAdd={(rect) => onAddToCart(rect, currentImage)}
                    price={799}
                    label={stock !== null && stock !== undefined && stock <= 0 ? 'Chwilowo wyprzedane' : 'Dodaj do koszyka'}
                    className="w-full"
                    disabled={stock !== null && stock !== undefined && stock <= 0}
                  />

                  {/* 14-day return policy highlight */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>14 dni na bezproblemowy zwrot</span>
                    </span>
                    <span className="text-[11px] text-zinc-400 hidden sm:inline">
                      Przetestuj bez ryzyka
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
