import React from 'react';
import { Disc, Zap, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { useProductImages } from '../context/ImageContext';

interface FeaturesProps {
  onOpenCheckout: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onOpenCheckout }) => {
  const { images } = useProductImages();

  return (
    <section id="features" className="py-24 border-t border-white/5 bg-[#08080b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-3">
            Inżynieria układu
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6"
            style={{ textWrap: 'balance' }}
          >
            Moc i kontrola bez kompromisów.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            W pełni hydrauliczny układ na tył stworzony z myślą o maksymalnej sile docisku
            oraz stabilności cieplnej w ciężkich warunkach terenowych.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Hydraulic Power */}
          <div className="md:col-span-8 rounded-3xl bg-zinc-900/60 border border-white/10 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-lg">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
                Układ hydrauliczny
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Precyzyjna siła docisku
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Zamknięty obieg hydrauliczny z lewą klamką na kierownicy zapewnia potężną siłę
                docisku i bezpośrednie wyczucie punktu oporu. Precyzyjna modulacja ułatwia
                stabilne operowanie tylnym kołem.
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <div>
                <span className="text-zinc-200 font-semibold block text-base">DOT 4 / DOT 5.1</span>
                <span>Płyn hamulcowy</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-200 font-semibold block text-base">Lewa klamka</span>
                <span>Montaż na kierownicy</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-200 font-semibold block text-base">Tył</span>
                <span>Strona montażu</span>
              </div>
            </div>
          </div>

          {/* Card 2: 240mm 3.2mm Rotor */}
          <div className="md:col-span-4 rounded-3xl bg-zinc-900/60 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Disc className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
                Tarcza w zestawie
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Średnica 240 mm / 3,2 mm
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                Grubość 3,2 mm zwiększa pojemność cieplną tarczy, zapobiegając przegrzewaniu i skrzywieniom podczas intensywnej jazdy w terenie.
              </p>
            </div>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-950/60 border border-white/5">
              <img
                src={images.rotor}
                alt="Gruba tarcza hamulcowa 240 mm"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 text-[11px] font-mono font-semibold bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-white border border-white/10">
                3.2 mm
              </div>
            </div>
          </div>

          {/* Card 3: Dual-Piston Caliper */}
          <div className="md:col-span-5 rounded-3xl bg-zinc-900/60 border border-white/10 p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
                Zacisk
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Aluminiowy, dwutłoczkowy
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                Dwa tłoczki hydrauliczne w aluminiowym korpusie zapewniają równomierny docisk klocków do powierzchni tarczy.
              </p>
            </div>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-950/60 border border-white/5">
              <img
                src={images.caliper}
                alt="Aluminiowy zacisk dwutłoczkowy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Card 4: Heat & Terain Resistance */}
          <div className="md:col-span-7 rounded-3xl bg-zinc-900/60 border border-white/10 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
                Warunki terenowe
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Odporność na przegrzewanie
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                Zaprojektowany do pracy pod ciągłym obciążeniem w trudnych warunkach terenowych: błocie, piasku i stromych zjazdach. Gruba tarcza i stabilny obieg hydrauliczny eliminują efekt fadingu.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Cena: <strong className="text-white text-sm font-semibold ml-1">849 zł</strong>
                <span className="ml-2 text-emerald-400 font-medium">(Darmowa wysyłka)</span>
              </span>
              <button
                onClick={onOpenCheckout}
                className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>Przejdź do zamówienia</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
