import React from 'react';
import { PRODUCT_INFO } from '../data/productData';
import { ShieldCheck, Truck, Package } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';

interface SpecsTableProps {
  onOpenCheckout: () => void;
  onAddToCart: (rect: DOMRect) => void;
}

export const SpecsTable: React.FC<SpecsTableProps> = ({ onOpenCheckout, onAddToCart }) => {
  return (
    <section id="specs" className="py-24 bg-[#08080b] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
            Dane techniczne
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4"
            style={{ textWrap: 'balance' }}
          >
            Precyzja w każdym milimetrze.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Czyste fakty inżynieryjne. Żadnych zbędnych ozdobników.
          </p>
        </div>

        {/* Specs Table Card */}
        <div className="rounded-3xl bg-zinc-900/60 border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-zinc-400 block">Produkt</span>
              <h3 className="text-xl font-bold text-white">Ultra Bee Brakes</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Cena zestawu (promocja)</span>
                <span className="text-2xl font-extrabold text-white tabular-nums">799 zł</span>
              </div>
              <AddToCartButton
                onAdd={onAddToCart}
                price={799}
                label="Dodaj"
                compact
              />
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/5">
            {PRODUCT_INFO.technicalSpecs.map((spec, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 px-6 sm:px-8 py-4.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="sm:col-span-5 text-sm font-medium text-zinc-400 mb-1 sm:mb-0">
                  {spec.label}
                </div>
                <div className="sm:col-span-7 text-sm font-semibold text-white sm:text-right">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="p-6 bg-zinc-950/80 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Darmowa wysyłka kurierem / paczkomatem</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span>Gwarancja fabryczna i test szczelności</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-white shrink-0" />
              <span>Kompletny zestaw gotowy do montażu</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
