import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useProductImages, ImageSlots } from '../context/ImageContext';

interface ComponentExplorerProps {
  onOpenCheckout: () => void;
  onAddToCart: (rect: DOMRect, image?: string) => void;
}

export const ComponentExplorer: React.FC<ComponentExplorerProps> = ({
  onOpenCheckout,
  onAddToCart,
}) => {
  const { images, isCustomLoaded, fitMode } = useProductImages();
  const [selectedId, setSelectedId] = useState<keyof ImageSlots>('lever');

  const componentsData: {
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
        'Kompletny hydrauliczny układ hamulcowy na tył. Zestaw gotowy do montażu ze wszystkimi elementami: klamką, pompą, przewodem, zaciskiem, adapterem i tarczą 240 mm.',
      specs: [
        { label: 'Układ', value: 'W pełni hydrauliczny' },
        { label: 'Pozycja', value: 'Tył (lewa klamka)' },
        { label: 'Tarcza', value: '240 mm × 3,2 mm' },
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
        { label: 'Przyłącze', value: 'Wzmocniony przewód ciśnieniowy' },
      ],
    },
    {
      id: 'caliper',
      name: 'Aluminiowy zacisk dwutłoczkowy',
      shortName: 'Zacisk 2-tłoczkowy',
      category: 'Zacisk hamulcowy',
      description:
        'Dwutłoczkowy zacisk z odlewanego aluminium z klockami w zestawie. Gwarantuje mocny docisk klocków i wysoką odporność na przegrzewanie w terenie.',
      specs: [
        { label: 'Konstrukcja', value: 'Aluminiowy, dwutłoczkowy' },
        { label: 'Klocki', value: 'W zestawie' },
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
        { label: 'Materiał', value: 'Aluminium anodowane' },
        { label: 'Konstrukcja', value: 'Ażurowy plaster miodu' },
        { label: 'Mocowanie', value: 'Sztywne mocowanie zacisku' },
      ],
    },
  ];

  const selectedItem =
    componentsData.find((c) => c.id === selectedId) || componentsData[1];

  const currentImage = images[selectedId];

  return (
    <section id="components" className="py-24 bg-[#050507] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
              Elementy układu
            </span>
            <h2 
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Komponenty Ultra Bee Brakes.
            </h2>
          </div>
          <p className="text-zinc-400 text-sm max-w-md mt-4 md:mt-0">
            Wszystkie elementy zostały zaprojektowane do harmonijnej pracy w zamkniętym układzie hydraulicznym.
          </p>
        </div>

        {/* Component Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {componentsData.map((comp) => {
            const isSelected = comp.id === selectedId;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedId(comp.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-zinc-900 border-white/30 shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/15 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300 mb-3 border border-white/10">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-zinc-400 block">
                    {comp.category}
                  </span>
                  <span className={`text-sm font-semibold block mt-0.5 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {comp.shortName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Component Stage */}
        <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-6 sm:p-10 md:p-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              {/* Product Visual */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/10 flex items-center justify-center p-2 group shadow-xl">
                  <img
                    src={currentImage}
                    alt={selectedItem.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                      fitMode === 'cover' ? 'object-cover rounded-xl' : 'object-contain p-4'
                    }`}
                  />
                  <div className="absolute top-4 left-4 text-xs font-medium text-zinc-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {selectedItem.category}
                  </div>
                  {isCustomLoaded && (
                    <div className="absolute bottom-4 right-4 text-[10px] font-medium text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/30">
                      Oryginalne ujęcie
                    </div>
                  )}
                </div>
              </div>

              {/* Spec Sheet & Notes */}
              <div className="lg:col-span-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {selectedItem.name}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                  {selectedItem.description}
                </p>

                <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 sm:p-5 mb-6 space-y-3">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Dane techniczne
                  </span>
                  {selectedItem.specs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="text-zinc-400">{spec.label}</span>
                      <span className="text-zinc-200 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <AddToCartButton
                    onAdd={(rect) => onAddToCart(rect, currentImage)}
                    price={849}
                    label="Dodaj zestaw do koszyka"
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
