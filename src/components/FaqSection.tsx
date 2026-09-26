import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Czy układ jest gotowy do montażu i zalany płynem?',
    a: 'Tak, układ jest fabrycznie zalany płynem hamulcowym i wstępnie odpowietrzony. W zestawie znajduje się kompletny zestaw ze wszystkimi przewodami, klockami i adapterem montażowym.',
  },
  {
    q: 'Dlaczego tarcza ma grubość aż 3,2 mm?',
    a: 'Większość standardowych tarcz ma tylko 1,8–2,0 mm grubości, co przy ostrym hamowaniu w terenie prowadzi do przegrzania i bicia tarczy. Grubość 3,2 mm w połączeniu ze średnicą 240 mm gwarantuje olbrzymią sztywność oraz stabilność termiczną.',
  },
  {
    q: 'Jaki płyn hamulcowy stosuje się w pompie?',
    a: 'Układ jest przystosowany do pracy ze standardowym motocyklowym płynem hamulcowym DOT 4 oraz DOT 5.1, charakteryzującym się wysoką temperaturą wrzenia.',
  },
  {
    q: 'Jak wygląda darmowa wysyłka i czas dostawy?',
    a: 'Wysyłka jest w 100% bezpłatna na terenie całej Polski. Zamówienia nadajemy w ciągu 24 godzin kurierem lub do wskazanego Paczkomatu InPost.',
  },
  {
    q: 'Do jakich dokładnie modeli motocykli ten układ pasuje Plug & Play?',
    a: 'Układ jest fabrycznie przygotowany pod montaż Plug & Play (bez żadnych przeróbek, spawania ani dorabiania tulejek) do: Surron LBX & LBS, 79 Bike Falcon Pro & Falcon GT/Lite, E-Ride Pro S & Pro SS / 3.0, motocykli Ventus oraz Talaria XXX / MX4. Wszystkie otwory montażowe, offset tarczy 240 mm i adapter pasują idealnie w fabryczne punkty.',
  },
  {
    q: 'Co jeśli układ mi nie podpasuje? Jak wygląda zwrot?',
    a: 'Jesteśmy w 100% pewni jakości wykonania i idealnego dopasowania do wymienionych modeli, dlatego dajemy Ci pełne 14 dni na bezproblemowy zwrot. Możesz na spokojnie przymierzyć zestaw do motocykla – jeśli cokolwiek nie spełni Twoich oczekiwań, odsyłasz go i otrzymujesz natychmiastowy zwrot wpłaty.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-[#060608] border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-2">
            Częste pytania
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Najczęściej zadawane pytania
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-zinc-900/40 border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
