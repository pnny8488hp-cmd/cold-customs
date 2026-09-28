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
    q: 'Jak działa darmowa wysyłka i ile kosztuje dostawa?',
    a: 'Darmowa wysyłka przysługuje dla wszystkich zamówień od kwoty 399 zł (np. układ Ultra Bee Brakes ma wysyłkę 0 zł). Dla zamówień poniżej 399 zł (np. pojedynczy Front Plate za 119 zł) koszt wysyłki wynosi 15 zł. Zamówienia nadajemy błyskawicznie w 24h do Paczkomatu InPost lub kurierem.',
  },
  {
    q: 'Czym różnią się opcje Front Plate i co dokładnie znajduje się w zestawie?',
    a: 'Front Plate Cold Customs kosztuje 119 zł w obu wersjach. Do wyboru są 2 opcje: czysta bez naklejki oraz wersja z okleiną Cold Customs #1 w tej samej cenie (naklejka GRATIS!). W wersji z grafiką naklejka jest już fabrycznie naklejona na tablicę. W komplecie znajdują się dokładnie 2 przedmioty: przygotowana tablica z siatkami oraz 4 wzmocnione opaski montażowe (zip-ties).',
  },
  {
    q: 'Co jeśli zestaw mi nie podpasuje? Jak wygląda zwrot?',
    a: 'Jesteśmy w 100% pewni jakości wykonania naszych komponentów, dlatego oferujemy 14 dni na bezproblemowy zwrot. Jeśli produkt nie spełni Twoich oczekiwań, odsyłasz go i otrzymujesz natychmiastowy zwrot wpłaty.',
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
