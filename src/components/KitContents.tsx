import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Eye, RotateCcw, ShoppingBag, ShieldCheck, Sparkles, Wrench, Package } from 'lucide-react';
import { useProductImages, defaultImages } from '../context/ImageContext';
import { ProductItem, ProductVariant } from '../data/productData';

interface KitContentsProps {
  activeProduct: ProductItem;
  onOpenCheckout: () => void;
  onAddToCart: (rect: DOMRect, product: ProductItem, variant?: ProductVariant) => void;
}

export const KitContents: React.FC<KitContentsProps> = ({
  activeProduct,
  onOpenCheckout,
  onAddToCart,
}) => {
  const { images } = useProductImages();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isUltraBee = activeProduct.id === 'ultra-bee-brakes';

  // Specific data for Ultra Bee Brakes technical breakdown
  const ultraBeeContents = [
    {
      id: 'lever',
      title: 'Klamka hamulcowa (lewa) z pompą i zbiorniczkiem',
      shortName: 'Klamka & Pompa',
      desc: 'Ergonomiczna klamka z pompą i zintegrowanym zbiorniczkiem na płyn hamulcowy DOT 4 / 5.1.',
      image: images.lever,
      defaultImg: defaultImages.lever,
      badge: 'Układ hydrauliczny',
    },
    {
      id: 'caliper',
      title: 'Zacisk hamulcowy z klockami',
      shortName: 'Zacisk 2-tłoczkowy',
      desc: 'Aluminiowy zacisk dwutłoczkowy o dużej pojemności cieplnej z fabrycznymi klockami.',
      image: images.caliper,
      defaultImg: defaultImages.caliper,
      badge: '2 tłoczki',
    },
    {
      id: 'guard',
      title: 'Wspornik / adapter montażowy zacisku',
      shortName: 'Adapter & Osłona CNC',
      desc: 'Frezowany CNC wspornik ze stopu aluminium zintegrowany z osłoną.',
      image: images.guard,
      defaultImg: defaultImages.guard,
      badge: 'Aluminium CNC',
    },
    {
      id: 'rotor',
      title: 'Tarcza hamulcowa 240 mm (grubość 3,2 mm)',
      shortName: 'Tarcza 240 mm (3,2 mm)',
      desc: 'Gruba tarcza wentylowana o średnicy 240 mm i grubości 3,2 mm.',
      image: images.rotor,
      defaultImg: defaultImages.rotor,
      badge: 'Grubość 3,2 mm',
    },
  ];

  const activeItem = isUltraBee && selectedIndex !== null ? ultraBeeContents[selectedIndex] : null;
  const currentBigImage = activeItem ? activeItem.image : images.kit;
  const currentFallback = activeItem ? activeItem.defaultImg : defaultImages.kit;
  const currentTitle = activeItem ? activeItem.title : activeProduct.name;
  const currentBadge = activeItem ? activeItem.shortName : 'Cały zestaw (wszystkie elementy)';

  const handleTileClick = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  /* ──────────────────────────────────────────────────────────────────────────
     1. BESPOKE FRONT PLATE SECTION (Entirely distinct design from UB Brakes)
     ────────────────────────────────────────────────────────────────────────── */
  if (!isUltraBee) {
    const withStickerVariant = activeProduct.variants?.find((v) => v.id === 'with-sticker') || {
      id: 'with-sticker',
      name: 'Z okleiną Cold Customs #1',
      shortName: 'Z okleiną #1',
      price: 119,
      badge: 'Okleina w cenie',
      image: activeProduct.images?.plateSticker || activeProduct.image,
      description: 'Z zaaplikowaną grubą okleiną wyścigową Cold Customs #1.',
    };

    const cleanVariant = activeProduct.variants?.find((v) => v.id === 'without-sticker') || {
      id: 'without-sticker',
      name: 'Bez naklejki (Czysty czarny)',
      shortName: 'Bez naklejki',
      price: 119,
      image: activeProduct.images?.plateClean || activeProduct.image,
      description: 'Gładka, czarna tablica ze zintegrowanymi siatkami.',
    };

    return (
      <section id="package" className="py-24 bg-[#050507] border-t border-white/5 relative overflow-hidden">
        {/* Subtle ambient backlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Vented Plate Cold Customs · 2 Warianty Wykończenia
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4" style={{ textWrap: 'balance' }}>
              Wybierz Swój Styl Vented Plate
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Dwa warianty w tej samej cenie <strong className="text-white">119 zł</strong>. Zdecyduj się na gotową okleinę wyścigową Cold Customs #1 lub czysty satynowy czarny pod własne oklejenie. W zestawie wzmocnione opaski montażowe.
            </p>
          </div>

          {/* Dual Variant Master Cards (Side-by-side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Card 1: Z Okleiną Cold Customs #1 */}
            <div className="rounded-3xl bg-zinc-900/60 border-2 border-emerald-500/40 hover:border-emerald-500/80 transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-emerald-950/20 relative group">
              <div className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full bg-emerald-500 text-black text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                Okleina w cenie (119 zł)
              </div>

              <div>
                {/* Photo Stage */}
                <div className="relative rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden aspect-[4/3] mb-6 flex items-center justify-center p-3">
                  <img
                    src={activeProduct.images?.plateSticker || activeProduct.image}
                    alt="Vented Plate z okleiną Cold Customs #1"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-zinc-300 font-medium">
                    Fabrycznie naklejona
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Wersja z Okleiną #1</h3>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      Cold Customs Racing Edition
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white tabular-nums block">
                      119 zł
                    </span>
                    <span className="text-xs text-zinc-500 line-through tabular-nums">
                      159 zł
                    </span>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Gotowa do jazdy prosto z pudełka. Posiada równo i trwale zaaplikowaną grubą okleinę wyścigową Cold Customs z laminatem ochronnym odpornym na gałęzie, błoto i mycie ciśnieniowe.
                </p>

                {/* Features list */}
                <div className="space-y-2.5 text-xs text-zinc-300 mb-8 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gruba folia motocrossowa z laminatem UV</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zintegrowane metalowe siatki wlotów powietrza</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>W zestawie 4 czarne wzmocnione opaski (zip-ties)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onAddToCart(rect, activeProduct, withStickerVariant);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Dodaj do koszyka (Z okleiną · 119 zł)</span>
              </button>
            </div>

            {/* Card 2: Bez Naklejki (Czysty Czarny) */}
            <div className="rounded-3xl bg-zinc-900/60 border-2 border-white/10 hover:border-white/30 transition-all p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group">
              <div className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full bg-zinc-800 border border-white/15 text-zinc-200 text-[11px] font-bold uppercase tracking-wider shadow-md">
                Czysty Plate (119 zł)
              </div>

              <div>
                {/* Photo Stage */}
                <div className="relative rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden aspect-[4/3] mb-6 flex items-center justify-center p-3">
                  <img
                    src={activeProduct.images?.plateClean || activeProduct.image}
                    alt="Vented Plate czysty czarny bez naklejki"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 font-medium">
                    Gładka czerń
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Wersja Czysta</h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                      Stealth Black · Gotowa pod własny custom
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white tabular-nums block">
                      119 zł
                    </span>
                    <span className="text-xs text-zinc-500 line-through tabular-nums">
                      159 zł
                    </span>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Idealny wybór, jeśli chcesz nakleić własny numer startowy, logotypy teamowe lub okleinę pod kolor motocykla. Czysta, gładka powierzchnia z wlotami wentylacyjnymi.
                </p>

                {/* Features list */}
                <div className="space-y-2.5 text-xs text-zinc-300 mb-8 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Satynowa, trwała czerń bez żadnych oznaczeń</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Zintegrowane metalowe siatki wlotów powietrza</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>W zestawie 4 czarne wzmocnione opaski (zip-ties)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onAddToCart(rect, activeProduct, cleanVariant);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Dodaj do koszyka (Bez naklejki · 119 zł)</span>
              </button>
            </div>
          </div>

          {/* What's in the Box & Mounting strip */}
          <div className="rounded-2xl bg-zinc-900/80 border border-white/10 p-6 sm:p-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Co dokładnie znajduje się w przesyłce? (Tylko 2 elementy)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-bold block text-sm mb-1">
                    1. Wybrana tablica Vented Plate
                  </span>
                  <p className="text-zinc-400 leading-relaxed">
                    Wersja z naklejoną okleiną #1 lub wersja czysta, z fabrycznie wbudowanymi metalowymi siatkami wentylacyjnymi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-bold block text-sm mb-1">
                    2. Komplet 4 opasek (zip-ties)
                  </span>
                  <p className="text-zinc-400 leading-relaxed">
                    Wzmocnione czarne opaski zaciskowe o podwyższonej odporności na promienie UV, oleje, wstrząsy i drgania.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-bold block text-sm mb-1">
                    Gwarancja i montaż Plug & Play
                  </span>
                  <p className="text-zinc-400 leading-relaxed">
                    Montaż w 3 minuty na lagach. 14 dni na bezproblemowy zwrot.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Return & Shipping Notice */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300">
                <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>14 dni na bezproblemowy zwrot</strong> (bezpieczny zakup bez ryzyka).
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenCheckout}
                className="text-white font-bold hover:text-emerald-400 transition-colors underline underline-offset-4"
              >
                Przejdź do zamówienia &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     2. ULTRA BEE BRAKES TECHNICAL BREAKDOWN (Classic engineering view)
     ────────────────────────────────────────────────────────────────────────── */
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
                {activeProduct.name}.
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Wszystko, czego potrzebujesz do kompletnego montażu: fabrycznie przygotowany układ ze wszystkimi złączami i elementami montażowymi. Kliknij dowolny element z listy obok, aby obejrzeć detal.
              </p>

              {/* Kit Interactive Large Image Card */}
              <div className="relative rounded-2xl bg-zinc-900 border border-white/10 mb-5 overflow-hidden aspect-square shadow-2xl group">
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
                    key={selectedIndex !== null ? ultraBeeContents[selectedIndex].id : `${activeProduct.id}-all`}
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
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Stan</span>
                  <span className="text-zinc-200 font-semibold">Gotowy do montażu</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Kategoria</span>
                  <span className="text-zinc-200 font-semibold">{activeProduct.category}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Płyn roboczy</span>
                  <span className="text-zinc-200 font-semibold">DOT 4 / DOT 5.1</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Gwarancja / zwrot</span>
                  <span className="text-emerald-400 font-semibold text-[11px] block truncate">
                    14 dni na bezproblemowy zwrot
                  </span>
                </div>
              </div>

              {/* Promo Price & Return Guarantee Card */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Cena promocyjna</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-white tabular-nums">
                        {activeProduct.price} {activeProduct.currency}
                      </span>
                      {activeProduct.originalPrice > activeProduct.price && (
                        <span className="text-xs text-zinc-500 line-through tabular-nums">
                          {activeProduct.originalPrice} {activeProduct.currency}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeProduct.discount > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      -{activeProduct.discount} zł taniej
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    14 dni na bezproblemowy zwrot
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {activeProduct.price >= 399 ? 'Darmowa wysyłka' : 'Wysyłka od 399 zł gratis'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Kit Items List */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Elementy w zestawie Ultra Bee Brakes
              </span>
              <span className="text-zinc-500 text-[11px]">Kliknij kafelek, aby zmienić duże zdjęcie</span>
            </div>

            {ultraBeeContents.map((item, index) => {
              const num = String(index + 1).padStart(2, '0');
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTileClick(index)}
                  className={`w-full text-left p-5 sm:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group ${
                    isSelected
                      ? 'bg-zinc-900/95 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-950/20 scale-[1.01]'
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
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className={`text-base font-semibold transition-colors ${
                          isSelected ? 'text-white' : 'text-white group-hover:text-zinc-100'
                        }`}>
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 text-zinc-400 border-white/10'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Aktywny podgląd
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
                  <span className="text-white font-medium block">Darmowa dostawa od 399 zł</span>
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

