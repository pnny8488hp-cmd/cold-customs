import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, Check, Sparkles } from 'lucide-react';
import { ProductItem, ProductVariant, PRODUCTS, FREE_SHIPPING_THRESHOLD } from '../data/productData';
import { useProductImages } from '../context/ImageContext';

interface ProductCatalogProps {
  activeProductId: string;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (rect: DOMRect, product: ProductItem, variant?: ProductVariant) => void;
  onOpenCheckout: () => void;
  stockState?: { brakes: number; plates: number };
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  activeProductId,
  onSelectProduct,
  onAddToCart,
  stockState,
}) => {
  const { images } = useProductImages();
  // Track selected variant for products that have them
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>(() => {
    const initial: Record<string, ProductVariant> = {};
    for (const p of PRODUCTS) {
      if (p.variants && p.variants.length > 0) {
        initial[p.id] = p.variants[0];
      }
    }
    return initial;
  });

  const handleVariantChange = (productId: string, variant: ProductVariant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  return (
    <section id="catalog" className="py-20 bg-[#050507] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-2">
              Katalog Cold Customs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white" style={{ textWrap: 'balance' }}>
              Dostępne Produkty
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-md">
            Wybierz produkt, aby zobaczyć szczegóły lub dodaj go bezpośrednio do koszyka. Darmowa wysyłka od 399 zł.
          </p>
        </div>

        {/* 2-product balanced grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {PRODUCTS.map((prod) => {
            const isSelected = prod.id === activeProductId;
            const currentVariant = prod.variants ? selectedVariants[prod.id] || prod.variants[0] : undefined;
            
            let displayedImage = prod.image;
            if (prod.id === 'ultra-bee-brakes') {
              displayedImage = images.kit;
            } else if (currentVariant) {
              if (currentVariant.id === 'without-sticker') {
                displayedImage = images.plateClean || currentVariant.image;
              } else if (currentVariant.id === 'with-sticker') {
                displayedImage = images.plateSticker || currentVariant.image;
              } else {
                displayedImage = currentVariant.image;
              }
            }

            return (
              <motion.div
                key={prod.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectProduct(prod)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProduct(prod);
                  }
                }}
                className={`flex flex-col rounded-2xl transition-colors duration-200 overflow-hidden group cursor-pointer text-left select-none outline-none border-2 ${
                  isSelected
                    ? 'bg-zinc-900/80 border-emerald-500 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-900/40 border-white/10 hover:border-white/25 hover:bg-zinc-900/60'
                }`}
              >
                {/* Product Image Stage - fills the entire card space */}
                <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden border-b border-white/5">
                  {/* Subtle Badge */}
                  {prod.badge && (
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-md bg-black/80 border border-white/15 text-zinc-200 backdrop-blur-md">
                        {prod.badge}
                      </span>
                    </div>
                  )}

                  {/* Active selected pill badge on top right */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-md bg-emerald-500 text-black flex items-center gap-1 shadow-lg shadow-emerald-950/60">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Wybrany produkt</span>
                      </span>
                    </div>
                  )}

                  <img
                    src={displayedImage}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Clean unboxed metadata */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <div className="flex items-center gap-2">
                        <span>{prod.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={prod.price >= FREE_SHIPPING_THRESHOLD ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>
                          {prod.price >= FREE_SHIPPING_THRESHOLD ? 'Darmowa wysyłka' : 'Wysyłka od 399 zł gratis'}
                        </span>
                      </div>

                      {(() => {
                        const prodStock = prod.id === 'front-plate-cold-customs' ? stockState?.plates : stockState?.brakes;
                        if (prodStock === undefined) return null;
                        return (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            prodStock > 3
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : prodStock > 0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {prodStock > 0 ? `Dostępne: ${prodStock} szt.` : 'Brak'}
                          </span>
                        );
                      })()}
                    </div>

                    <h3 className={`text-xl font-bold mb-2 transition-colors ${
                      isSelected ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                    }`}>
                      {prod.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                      {prod.shortDescription}
                    </p>

                    {/* Variant Selector inside card if product has variants */}
                    {prod.variants && prod.variants.length > 0 && (
                      <div className="mb-4 p-2 rounded-xl bg-zinc-950/70 border border-white/10">
                        <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] block mb-1.5">
                          Wybierz wersję:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {prod.variants.map((v) => {
                            const isVarSelected = currentVariant?.id === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVariantChange(prod.id, v);
                                  onSelectProduct(prod);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                                  isVarSelected
                                    ? 'bg-white text-black shadow-sm font-bold'
                                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                                }`}
                                title={v.name}
                              >
                                {v.shortName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action row */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-xs text-zinc-500 block">Cena</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-white tabular-nums">
                            {prod.price} {prod.currency}
                          </span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-zinc-500 line-through tabular-nums">
                              {prod.originalPrice} {prod.currency}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(prod);
                        }}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-zinc-800/80 hover:bg-zinc-800 border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Wybrany</span>
                          </>
                        ) : (
                          <>
                            <span>Szczegóły</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        onAddToCart(rect, prod, currentVariant);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        Dodaj do koszyka · {prod.price} zł
                        {currentVariant ? ` (${currentVariant.shortName})` : ''}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
