import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Shield, RotateCcw, Truck, CheckCircle2 } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[88vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {activeTab === 'terms' ? 'Regulamin Sklepu Internetowego' : 'Polityka Prywatności i Plików Cookies'}
                </h3>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Cold Customs · Obowiązuje od 2026 r.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Zamknij"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-zinc-900/40 px-4 sm:px-6 pt-2 shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Regulamin sklepu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Polityka prywatności (RODO)</span>
            </button>
          </div>

          {/* Notice Callout for Returns */}
          <div className="px-4 sm:px-6 py-2.5 bg-emerald-950/30 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Prawo zwrotu 14 dni:</strong> Kupujący ma 14 dni na odstąpienie od umowy. Zgodnie z art. 34 ust. 2 ustawy, <strong>bezpośredni koszt przesyłki zwrotnej pokrywa Klient</strong>.
            </span>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto text-xs text-zinc-300 leading-relaxed space-y-5 select-text">
            {activeTab === 'terms' ? (
              <div className="space-y-6">
                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 1. Postanowienia Ogólne
                  </h4>
                  <p>
                    1. Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego Cold Customs, składania zamówień na produkty, uiszczania cen oraz realizacji prawa odstąpienia od umowy i procedury reklamacyjnej.
                  </p>
                  <p className="mt-1.5">
                    2. Sprzedaż prowadzona jest za pośrednictwem serwisu internetowego. Oferowane produkty to wyczynowe komponenty motocyklowe (m.in. układy hamulcowe na tył Ultra Bee Brakes) oraz sportowe akcesoria motocyklowe (m.in. przednie tablice Front Plate Cold Customs).
                  </p>
                  <p className="mt-1.5">
                    3. Złożenie zamówienia jest równoznaczne ze zaznajomieniem się z treścią niniejszego Regulaminu i jego pełną akceptacją.
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 2. Zamówienia i Realizacja
                  </h4>
                  <p>
                    1. Zamówienia w sklepie internetowym można składać 24 godziny na dobę, 7 dni w tygodniu poprzez formularz zamówienia (koszyk).
                  </p>
                  <p className="mt-1.5">
                    2. W celu złożenia zamówienia Klient podaje dane niezbędne do dostawy: imię i nazwisko, numer telefonu, adres e-mail oraz adres dostawy (lub oznaczenie Paczkomatu InPost).
                  </p>
                  <p className="mt-1.5">
                    3. Zamówienia realizowane są i nadawane zazwyczaj w ciągu 24–48 godzin roboczych od potwierdzenia zamówienia (w przypadku pobrania) lub od momentu zaksięgowania płatności.
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 3. Ceny, Płatności i Koszty Dostawy
                  </h4>
                  <p>
                    1. Wszystkie ceny w sklepie podawane są w polskich złotych (PLN) i są cenami brutto.
                  </p>
                  <p className="mt-1.5">
                    2. <strong>Darmowa dostawa:</strong> Zamówienia o wartości równej lub przekraczającej <strong>399 zł</strong> są wysyłane bezpłatnie na terenie Polski (koszt dostawy wynosi 0 zł).
                  </p>
                  <p className="mt-1.5">
                    3. Dla zamówień o łącznej wartości poniżej 399 zł standardowy koszt dostawy wynosi <strong>15 zł</strong>.
                  </p>
                  <p className="mt-1.5">
                    4. Dostępne formy płatności:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-zinc-400">
                    <li>Płatność za pobraniem (płatność gotówką lub kartą przy odbiorze u kuriera lub w Paczkomacie),</li>
                    <li>Szybki przelew na numer telefonu BLIK,</li>
                    <li>Tradycyjny przelew bankowy na konto Sprzedawcy,</li>
                    <li>Płatności elektroniczne / bramka płatnicza.</li>
                  </ul>
                </section>

                <section className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    § 4. Prawo Odstąpienia od Umowy (Zwroty)
                  </h4>
                  <p>
                    1. Klient będący Konsumentem ma prawo odstąpić od zawartej na odległość umowy sprzedaży w terminie <strong>14 dni kalendarzowych</strong> od momentu objęcia rzeczy w posiadanie (odebrania przesyłki), bez podania przyczyny.
                  </p>
                  <p className="mt-2 text-white font-medium">
                    2. <strong>Koszty przesyłki zwrotnej:</strong> Zgodnie z art. 34 ust. 2 ustawy z dnia 30 maja 2014 r. o prawach konsumenta, <span className="text-emerald-300 underline font-semibold">bezpośrednie koszty zwrotu rzeczy (odesłania towaru do Sprzedawcy) pokrywa w całości Konsument / Klient</span>. Sprzedawca nie przyjmuje przesyłek odsyłanych za pobraniem.
                  </p>
                  <p className="mt-2">
                    3. Zwracany produkt musi znajdować się w stanie kompletnym, nieuszkodzonym i nienoszącym śladów użytkowania lub montażu (np. zarysowań klamki, montażu zacisku na tarczy, śladów płynu hamulcowego, zerwanych taśm/oklein).
                  </p>
                  <p className="mt-2">
                    4. Sprzedawca dokonuje zwrotu uiszczonej za produkt kwoty niezwłocznie, nie później niż w terminie 14 dni od momentu odebrania i pozytywnej weryfikacji zwracanego towaru.
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 5. Reklamacje i Rękojmia
                  </h4>
                  <p>
                    1. Sprzedawca ma obowiązek dostarczyć Klientowi towar wolny od wad fizycznych i prawnych.
                  </p>
                  <p className="mt-1.5">
                    2. W przypadku stwierdzenia wady fabrycznej towaru Klient ma prawo do złożenia reklamacji drogą elektroniczną na adres e-mail sklepu wraz z opisem wady i zdjęciami.
                  </p>
                  <p className="mt-1.5">
                    3. Reklamacja zostanie rozpatrzona w terminie do 14 dni kalendarzowych od dnia jej doręczenia.
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 6. Montaż Części i Bezpieczeństwo
                  </h4>
                  <p>
                    1. Elementy wyczynowych układów hamulcowych i akcesoriów motocyklowych wymagają poprawnego montażu technicznego. Zaleca się montaż przez wykwalifikowane warsztaty lub osoby posiadające doświadczenie mechaniczne.
                  </p>
                  <p className="mt-1.5">
                    2. Przed każdą jazdą należy upewnić się o poprawnym dokręceniu śrub, szczelności układu hydraulicznego oraz prawidłowym działaniu dźwigni i zacisku.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 1. Administrator Danych Osobowych
                  </h4>
                  <p>
                    1. Administratorem Twoich danych osobowych jest <strong>Cold Customs</strong>.
                  </p>
                  <p className="mt-1.5">
                    2. Przetwarzamy Twoje dane zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (ogólne rozporządzenie o ochronie danych – RODO).
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 2. Zakres i Cele Przetwarzania Danych
                  </h4>
                  <p>
                    Przetwarzamy wyłącznie dane niezbędne do zawarcia i wykonania umowy sprzedaży (art. 6 ust. 1 lit. b RODO):
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-400">
                    <li>Imię i nazwisko – do zaadresowania paczki i identyfikacji kupującego,</li>
                    <li>Numer telefonu komórkowego – niezbędny dla kuriera oraz do powiadomień SMS o odbiorze z Paczkomatu InPost,</li>
                    <li>Adres poczty elektronicznej (e-mail) – do przesłania potwierdzenia zamówienia, numeru listu przewozowego i statusu,</li>
                    <li>Adres zamieszkania lub oznaczenie Paczkomatu odbiorczego.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 3. Odbiorcy Danych
                  </h4>
                  <p>
                    Twoje dane osobowe mogą być przekazywane wyłącznie zaufanym podmiotom uczestniczącym w realizacji zamówienia:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-400">
                    <li>Operatorom logistycznym i kurierskim (m.in. InPost Sp. z o.o.) w celu dostarczenia przesyłki,</li>
                    <li>Operatorom płatności elektronicznych w celu przetworzenia płatności,</li>
                    <li>Dostawcom usług hostingowych i powiadomień e-mail.</li>
                  </ul>
                  <p className="mt-1.5">
                    Nigdy nie sprzedajemy ani nie udostępniamy Twoich danych podmiotom trzecim w celach marketingowych.
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 4. Prawa Osoby, Której Dane Dotyczą
                  </h4>
                  <p>
                    Każdemu Klientowi przysługuje prawo do:
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-400">
                    <li>Dostępu do treści swoich danych oraz otrzymania ich kopii,</li>
                    <li>Sprostowania (poprawiania) swoich danych,</li>
                    <li>Usunięcia danych („prawo do bycia zapomnianym”),</li>
                    <li>Ograniczenia przetwarzania danych osobowych,</li>
                    <li>Wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-emerald-400">
                    § 5. Pliki Cookies i Bezpieczeństwo
                  </h4>
                  <p>
                    1. Serwis wykorzystuje pamięć lokalną przeglądarki (Local Storage) oraz pliki cookies wyłącznie w celach technicznych – m.in. do utrzymania koszyka zakupowego podczas przeglądania witryny.
                  </p>
                  <p className="mt-1.5">
                    2. Komunikacja pomiędzy Twoją przeglądarką a serwerem sklepu jest w pełni szyfrowana bezpiecznym protokołem SSL / TLS.
                  </p>
                </section>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-zinc-500">
              Dokument prawny Cold Customs · Bezpieczne zakupy
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors cursor-pointer"
            >
              Rozumiem i zamykam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
