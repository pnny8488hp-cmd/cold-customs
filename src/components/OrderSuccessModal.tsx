import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Package, ShieldCheck, MapPin, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { useProductImages } from '../context/ImageContext';

export interface OrderSuccessData {
  orderNumber: string;
  totalPrice: number;
  quantity: number;
  paymentMethod: 'cod' | 'blik_phone' | 'transfer';
  deliveryMethod: 'paczkomat' | 'courier';
  addressOrLocker: string;
  paczkomatName?: string;
  customerName?: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderSuccessData | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderData,
}) => {
  const { images } = useProductImages();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !orderData) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Centered Modal Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0c0d14] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 z-10 my-8 overflow-hidden"
      >
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close (X) button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Badge */}
        <div className="text-center relative z-10">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
            <Check className="w-10 h-10 stroke-[2.5]" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute -top-1 -right-1 p-1 bg-emerald-500 text-black rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          <span className="inline-block px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Zamówienie przyjęte do realizacji!
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dziękujemy za zamówienie!
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto mt-2 leading-relaxed">
            Zapisaliśmy Twoje zamówienie w systemie Cold Customs. Zestaw zostanie skompletowany i bezpiecznie spakowany.
          </p>

          {/* Order number copy box */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border border-white/10 rounded-2xl">
            <span className="text-xs text-zinc-400">Numer zamówienia:</span>
            <span className="text-sm font-bold text-white font-mono">{orderData.orderNumber}</span>
            <button
              onClick={handleCopyOrderNumber}
              className="p-1 text-zinc-400 hover:text-emerald-400 transition-colors ml-1 cursor-pointer"
              title="Skopiuj numer zamówienia"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Payment Instructions Card */}
        <div className="mt-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 relative z-10 text-left">
          {orderData.paymentMethod === 'cod' && (
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <span>💵</span>
                <span>Płatność za pobraniem (0 zł dopłaty)</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Kwotę <strong className="text-white">{orderData.totalPrice} zł</strong> zapłacisz dopiero przy odbiorze:
                kartą lub kodem BLIK w ekranie Paczkomatu (lub u kuriera).
              </p>
            </div>
          )}

          {orderData.paymentMethod === 'blik_phone' && (
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <span>📱</span>
                <span>Płatność BLIK na telefon</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Wyślij szybki przelew BLIK na numer telefonu:{' '}
                <span className="inline-flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/30 text-white font-mono font-bold">
                  +48 534 396 429
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText('534396429')}
                    title="Kopiuj numer telefonu"
                    className="p-1 hover:text-amber-400 text-zinc-400 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                W tytule przelewu podaj koniecznie numer: <strong className="text-white font-mono bg-zinc-800 px-1.5 py-0.5 rounded">{orderData.orderNumber}</strong>.
              </p>
            </div>
          )}

          {orderData.paymentMethod === 'transfer' && (
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                <span>🏦</span>
                <span>Dane do przelewu bankowego</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Numer rachunku bankowego:</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5 bg-black/50 p-2.5 rounded-xl border border-white/10">
                    <span className="text-white font-mono font-bold text-xs tracking-wider">
                      77 1050 1894 1000 0097 9386 1098
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText('77105018941000009793861098')}
                      title="Skopiuj numer konta"
                      className="p-1 hover:text-blue-400 text-zinc-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Odbiorca:</span>
                    <span className="text-zinc-200 font-medium">Cold Customs</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Kwota:</span>
                    <span className="text-white font-bold">{orderData.totalPrice} zł</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-zinc-500 block text-[11px]">Tytuł przelewu:</span>
                  <span className="text-white font-mono font-bold bg-zinc-800 px-2 py-0.5 rounded text-xs inline-block mt-0.5">
                    {orderData.orderNumber}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details List */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-2.5 text-xs text-left relative z-10">
          <div className="flex justify-between text-zinc-400">
            <span>Produkt:</span>
            <span className="text-white font-medium text-right">
              Ultra Bee Brakes ({orderData.quantity} szt.)
            </span>
          </div>

          <div className="flex justify-between text-zinc-400">
            <span>Dostawa:</span>
            <span className="text-emerald-400 font-medium">0 zł (Darmowa wysyłka)</span>
          </div>

          <div className="flex justify-between text-zinc-400">
            <span>Punkt odbioru:</span>
            <span className="text-white font-medium text-right truncate max-w-[240px]">
              {orderData.deliveryMethod === 'paczkomat'
                ? orderData.paczkomatName ? `Paczkomat ${orderData.paczkomatName}` : orderData.addressOrLocker
                : 'Kurier (pod wskazany adres)'}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-white/5 text-sm">
            <span className="font-semibold text-zinc-300">Łącznie do zapłaty:</span>
            <span className="font-extrabold text-white text-base tabular-nums">
              {orderData.totalPrice} zł
            </span>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-6 relative z-10">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all shadow-lg shadow-white/10 cursor-pointer"
          >
            Świetnie, wróć do sklepu
          </button>
        </div>
      </motion.div>
    </div>
  );
};
