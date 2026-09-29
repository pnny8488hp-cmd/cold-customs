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
    a: 'Darmowa wysyłka przysługuje dla wszystkich zamówień od kwoty 399 zł (np. układ Ultra Bee Brakes ma wysyłkę 0 zł). Dla zamówień poniżej 399 zł (np. pojedynczy Vented Plate za 149 zł) koszt wysyłki wynosi 15 zł. Zamówienia nadajemy błyskawicznie w 24h do Paczkomatu InPost lub kurierem.',
  },
  {
    q: 'Czym różnią się wersje Vented Plate i co zawiera zestaw?',
    a: 'Vented Plate jest dostępny w wersji gładkiej czarnej lub z nałożoną okleiną wyścigową Cold Customs #1. W zestawie otrzymujesz tablicę ze zintegrowanymi siatkami wentylacyjnymi oraz 4 wzmocnione opaski zaciskowe (zip-ties) do montażu na lagach.',
  },
  {
    q: 'Co jeśli zestaw mi nie podpasuje? Jak wygląda zwrot?',
    a: 'Oferujemy 14 dni na odstąpienie od umowy i bezproblemowy zwrot. Jeśli produkt jest kompletny i nie nosi śladów montażu ani uszkodzeń, odsyłasz go i otrzymujesz natychmiastowy zwrot wpłaty. Dokładną procedurę zwrotu znajdziesz w Regulaminie sklepu.',
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
