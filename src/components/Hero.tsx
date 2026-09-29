import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, Check, RotateCcw, Sparkles } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useProductImages, ImageSlots, defaultImages } from '../context/ImageContext';
import { useShipping } from '../context/ShippingContext';
import { ProductItem, ProductVariant, FREE_SHIPPING_THRESHOLD } from '../data/productData';

interface HeroProps {
  activeProduct: ProductItem;
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onOpenCheckout: () => void;
  onOpenUploader: () => void;
  onAddToCart: (rect: DOMRect, product: ProductItem, variant?: ProductVariant) => void;
  stock?: number | null;
}

export const Hero: React.FC<HeroProps> = ({
  activeProduct,
  products,
  onSelectProduct,
  onOpenCheckout,
  onAddToCart,
  stock,
}) => {
  const { images } = useProductImages();
  const { settings, isSameDayActiveNow } = useShipping();
  const [activeTabId, setActiveTabId] = useState<keyof ImageSlots>('kit');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    activeProduct.variants ? activeProduct.variants[0] : undefined
  );

  useEffect(() => {
    setSelectedVariant(activeProduct.variants ? activeProduct.variants[0] : undefined);
  }, [activeProduct.id]);

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

  const isUltraBee = activeProduct.id === 'ultra-bee-brakes';

  let displayedImage = activeProduct.image;
  if (isUltraBee) {
    displayedImage = images[activeTabId] || defaultImages[activeTabId];
  } else if (selectedVariant) {
    if (selectedVariant.id === 'without-sticker') {
      displayedImage = images.plateClean || selectedVariant.image;
    } else if (selectedVariant.id === 'with-sticker') {
      displayedImage = images.plateSticker || selectedVariant.image;
    } else {
      displayedImage = selectedVariant.image;
    }
  }

  return (
    <section id="overview" className="relative pt-[108px] pb-20 md:pt-[116px] md:pb-28 overflow-hidden bg-grid-subtle">
      {/* Background ambient radial glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
        {/* Editorial Product Switcher Navigation - Highly prominent 2-product switcher */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/95 border-2 border-white/15 backdrop-blur-xl shadow-2xl max-w-full overflow-x-auto ring-1 ring-white/10">
            {products.map((p) => {
              const isSelected = p.id === activeProduct.id;
              const isBrakes = p.id === 'ultra-bee-brakes';
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProduct(p)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2.5 outline-none ${
                    isSelected
                      ? 'bg-white text-black shadow-lg shadow-white/10 ring-2 ring-emerald-500 scale-[1.02]'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80 bg-zinc-950/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    <span>{isBrakes ? '1. Ultra Bee Brakes' : '2. Vented Plate Cold Customs'}</span>
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-extrabold ${
                      isSelected
                        ? isBrakes
                          ? 'bg-zinc-900 text-white'
                          : 'bg-emerald-500 text-black'
                        : isBrakes
                        ? 'bg-white/10 text-zinc-300'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isBrakes ? '799 zł' : '119 zł'}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-zinc-500 mt-2 font-medium tracking-wide">
            Kliknij powyżej lub sprawdź <a href="#catalog" className="text-emerald-400 hover:underline">katalog produktów</a> poniżej
          </span>
        </div>

        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            key={activeProduct.id + '-kicker'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 rounded-full w-fit mx-auto"
          >
            <span>Cold Customs</span>
            <span aria-hidden="true">·</span>
            <span>{activeProduct.category}</span>
          </motion.div>

          <motion.h1
            key={activeProduct.id + '-title'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
            style={{ textWrap: 'balance' }}
          >
            {activeProduct.name}.
          </motion.h1>

          <motion.p
            key={activeProduct.id + '-desc'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed mb-6 max-w-2xl mx-auto"
            style={{ textWrap: 'balance' }}
          >
            {activeProduct.shortDescription}
          </motion.p>

          {/* Value signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              Precyzja inżynieryjna Cold Customs
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Truck className="w-4 h-4 text-emerald-400" />
              Darmowa wysyłka od 399 zł
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              14 dni na bezproblemowy zwrot
            </span>
          </div>
        </div>

        {/* Interactive Showcase */}
        <div className="max-w-5xl mx-auto mt-6">
          <div className="relative rounded-3xl bg-zinc-950/70 border border-white/10 p-4 sm:p-8 md:p-12 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Product Image Frame (fills the whole space) */}
              <div className="lg:col-span-7 flex flex-col items-center w-full">
                <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 group shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${activeProduct.id}-${isUltraBee ? activeTabId : selectedVariant?.id}`}
                      src={displayedImage}
                      alt={`${activeProduct.name} – ${activeProduct.shortDescription} – Cold Customs`}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0.4 }}
                      transition={{ duration: 0.25 }}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (isUltraBee) {
                          (e.target as HTMLImageElement).src = defaultImages[activeTabId];
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AnimatePresence>
                </div>

                {/* Visual Photo Thumbnails Selector */}
                {isUltraBee ? (
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
                ) : activeProduct.variants ? (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {activeProduct.variants.map((v) => {
                      const isActive = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-zinc-800 border-white text-white shadow-md ring-1 ring-white/20'
                              : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                            <img
                              src={
                                v.id === 'without-sticker'
                                  ? images.plateClean || v.image
                                  : v.id === 'with-sticker'
                                  ? images.plateSticker || v.image
                                  : v.image
                              }
                              alt={v.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{v.shortName}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {/* Description & Technical Specifications */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  {activeProduct.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {activeProduct.name}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-5">
                  {activeProduct.tagline}
                </p>

                {/* Variant Options Selector for Front Plate */}
                {activeProduct.variants && activeProduct.variants.length > 0 && (
                  <div className="mb-5 p-3 rounded-2xl bg-zinc-900/80 border border-white/10">
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[11px] block mb-2">
                      Wybierz wersję:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProduct.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-zinc-800/90 border-emerald-500 ring-1 ring-emerald-500/50 text-white shadow-md'
                                : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {v.shortName}
                              </span>
                              <span className="text-[11px] text-zinc-400 block truncate">
                                {v.price} zł
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Key Technical Specs */}
                <div className="border-t border-white/10 pt-4 space-y-2 mb-6">
                  {activeProduct.technicalSpecs.slice(0, 4).map((spec, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-zinc-400">{spec.label}</span>
                      <span className="text-zinc-200 font-semibold tabular-nums text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price and Cart Buttons */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                          {activeProduct.price} {activeProduct.currency}
                        </span>
                        {activeProduct.originalPrice > activeProduct.price && (
                          <span className="text-sm text-zinc-500 line-through tabular-nums">
                            {activeProduct.originalPrice} {activeProduct.currency}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 tracking-wide uppercase">Cena promocyjna</div>
                    </div>

                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <Truck className="w-3.5 h-3.5" />
                      {activeProduct.price >= FREE_SHIPPING_THRESHOLD ? 'Darmowa wysyłka' : 'Wysyłka od 399 zł gratis'}
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
                      <span className="text-[11px] text-zinc-400">
                        {stock > 0 ? (
                          isSameDayActiveNow ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                              Wysyłka dziś (zamów do {settings.cutoffHour}:00)
                            </span>
                          ) : (
                            <span>{settings.customNotice || 'Wysyłka w 24h'}</span>
                          )
                        ) : (
                          'Dostawa wkrótce'
                        )}
                      </span>
                    </div>
                  )}

                  {/* Single Add to Cart Button */}
                  <AddToCartButton
                    onAdd={(rect) => onAddToCart(rect, activeProduct, selectedVariant)}
                    price={activeProduct.price}
                    label={
                      stock !== null && stock !== undefined && stock <= 0
                        ? 'Chwilowo wyprzedane'
                        : selectedVariant
                        ? `Dodaj (${selectedVariant.shortName}) · ${activeProduct.price} zł`
                        : `Dodaj do koszyka · ${activeProduct.price} zł`
                    }
                    className="w-full"
                    disabled={stock !== null && stock !== undefined && stock <= 0}
                  />

                  {/* 14-day return policy highlight */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>14 dni na bezproblemowy zwrot</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Darmowa dostawa od 399 zł
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
