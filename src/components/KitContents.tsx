import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { useProductImages, defaultImages } from '../context/ImageContext';

interface KitContentsProps {
  onOpenCheckout: () => void;
  onAddToCart: (rect: DOMRect, image?: string) => void;
}

export const KitContents: React.FC<KitContentsProps> = ({
  onOpenCheckout,
}) => {
  const { images } = useProductImages();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const kitContentsList = [
    {
      id: 'lever',
      title: 'Klamka hamulcowa (lewa) z pompą i zbiorniczkiem',
      shortName: 'Klamka & Pompa',
      desc: 'Ergonomiczna klamka z pompą i zintegrowanym zbiorniczkiem na płyn hamulcowy DOT 4 / 5.1.',
      image: images.lever,
      defaultImg: defaultImages.lever,
    },
    {
      id: 'caliper',
      title: 'Zacisk hamulcowy z klockami',
      shortName: 'Zacisk 2-tłoczkowy',
      desc: 'Aluminiowy zacisk dwutłoczkowy o dużej pojemności cieplnej z fabrycznymi klockami.',
      image: images.caliper,
      defaultImg: defaultImages.caliper,
    },
    {
      id: 'guard',
      title: 'Wspornik / adapter montażowy zacisku',
      shortName: 'Adapter & Osłona CNC',
      desc: 'Frezowany CNC wspornik ze stopu aluminium zintegrowany z osłoną.',
      image: images.guard,
      defaultImg: defaultImages.guard,
    },
    {
      id: 'rotor',
      title: 'Tarcza hamulcowa 240 mm (grubość 3,2 mm)',
      shortName: 'Tarcza 240 mm (3,2 mm)',
      desc: 'Gruba tarcza wentylowana o średnicy 240 mm i grubości 3,2 mm.',
      image: images.rotor,
      defaultImg: defaultImages.rotor,
    },
  ];

  const activeItem = selectedIndex !== null ? kitContentsList[selectedIndex] : null;
  const currentBigImage = activeItem ? activeItem.image : images.kit;
  const currentFallback = activeItem ? activeItem.defaultImg : defaultImages.kit;
  const currentTitle = activeItem ? activeItem.title : 'Kompletny zestaw Ultra Bee Brakes';
  const currentBadge = activeItem ? activeItem.shortName : 'Cały zestaw (wszystkie elementy)';

  const handleTileClick = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="package" className="py-24 bg-[#050507] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Visual summary & Interactive Large Image */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
                W jednym zestawie
              </span>
              <h2 
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4"
                style={{ textWrap: 'balance' }}
              >
                Zestaw Ultra Bee Brakes.
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Wszystko, czego potrzebujesz do kompletnego montażu: fabrycznie zalany płynem i odpowietrzony układ z połączonym wzmocnionym przewodem. Kliknij dowolny element z listy obok, aby obejrzeć detal.
              </p>

              {/* Kit Interactive Large Image Card */}
              <div className="relative rounded-2xl bg-zinc-900/60 border border-white/10 mb-5 overflow-hidden aspect-square shadow-2xl group">
                {/* Active Element Badge and Reset */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="text-[11px] font-semibold text-white bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-md">
                    {currentBadge}
                  </span>
                  {selectedIndex !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(null)}
                      className="pointer-events-auto text-[11px] font-medium text-emerald-300 hover:text-emerald-200 bg-black/85 hover:bg-black/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 cursor-pointer transition-all shadow-md flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cały zestaw</span>
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedIndex !== null ? kitContentsList[selectedIndex].id : 'all-kit'}
                    src={currentBigImage}
                    alt={currentTitle}
                    initial={{ opacity: 0.35, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.35, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = currentFallback;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </AnimatePresence>
              </div>

              {/* Quick Spec Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Tarcza w zestawie</span>
                  <span className="text-zinc-200 font-semibold">240 mm / 3,2 mm</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Zacisk hamulcowy</span>
                  <span className="text-zinc-200 font-semibold">2-tłoczkowy CNC</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Przewód w zestawie</span>
                  <span className="text-zinc-200 font-semibold">Wzmocniony zbrojony</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Kompatybilność Plug & Play</span>
                  <span className="text-emerald-400 font-semibold text-[11px] block truncate" title="Surron · 79 Bike · E-Ride Pro · Ventus · Talaria">
                    Surron · 79 Bike · E-Ride · Ventus · Talaria
                  </span>
                </div>
              </div>

              {/* Promo Price & Return Guarantee Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Cena promocyjna zestawu</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-white tabular-nums">799 zł</span>
                      <span className="text-xs text-zinc-500 line-through tabular-nums">849 zł</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    -50 zł taniej
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    14 dni na bezproblemowy zwrot
                  </span>
                  <span className="text-[11px] text-zinc-500">Darmowa wysyłka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Interactive Kit Items List */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Elementy w zestawie</span>
              <span className="text-zinc-500 text-[11px]">Kliknij kafelek, aby zmienić duże zdjęcie</span>
            </div>

            {kitContentsList.map((item, index) => {
              const num = String(index + 1).padStart(2, '0');
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTileClick(index)}
                  className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group ${
                    isSelected
                      ? 'bg-zinc-900/95 border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-950/20 scale-[1.01]'
                      : 'bg-zinc-900/40 border-white/10 hover:border-white/25 hover:bg-zinc-900/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`text-sm font-mono font-semibold pt-0.5 transition-colors ${
                      isSelected ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}>
                      {num}.
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-white' : 'text-white group-hover:text-zinc-100'
                        }`}>
                          {item.title}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Aktywny podgląd
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className={`w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-zinc-950 border overflow-hidden shadow-sm transition-all ${
                    isSelected
                      ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-white/10 group-hover:border-white/30'
                  }`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
              );
            })}

            {/* Included highlights banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-white font-medium block">Darmowa dostawa w cenie</span>
                  <span className="text-zinc-400">Paczkomat InPost lub Kurier pod drzwi</span>
                </div>
              </div>
              <button
                onClick={onOpenCheckout}
                className="text-xs font-semibold text-white underline underline-offset-4 hover:text-zinc-300 cursor-pointer self-start sm:self-auto"
              >
                Przejdź do kasy &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
