import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Truck, RotateCcw, ShieldCheck, MapPin } from 'lucide-react';
import { useProductImages } from '../context/ImageContext';
import { PaczkomatMapPicker, InPostPoint } from './PaczkomatMapPicker';
import { OrderSuccessData } from './OrderSuccessModal';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  initialStep?: 'checkout' | 'confirmation';
  onOrderSuccess?: (data: OrderSuccessData) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  quantity,
  setQuantity,
  initialStep = 'checkout',
  onOrderSuccess,
}) => {
  const { images } = useProductImages();
  const drawerScrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'checkout' | 'confirmation'>(initialStep);
  const [deliveryMethod, setDeliveryMethod] = useState<'paczkomat' | 'courier'>('paczkomat');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'blik_phone' | 'transfer'>('cod');
  
  // Customer details
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressOrLocker: '',
    city: '',
    postalCode: '',
  });

  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<InPostPoint | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

  const handleSelectLocker = (locker: InPostPoint) => {
    setSelectedLocker(locker);
    setFormData((prev) => ({
      ...prev,
      addressOrLocker: `Paczkomat ${locker.name} (${locker.address.line1})`,
      city: locker.address_details?.city || prev.city,
      postalCode: locker.address_details?.post_code || prev.postalCode,
    }));
    setFormError(null);
  };

  const pricePerUnit = 799;
  const originalPricePerUnit = 849;
  const totalPrice = pricePerUnit * quantity;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formError) setFormError(null);
  };

  const handleSubmitOrder = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setFormError('Proszę podać imię i nazwisko odbiorcy.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Proszę podać numer telefonu.');
      return;
    }
    if (deliveryMethod === 'paczkomat' && !formData.addressOrLocker.trim()) {
      setFormError('Proszę wybrać Paczkomat InPost z mapy lub wpisać jego kod.');
      return;
    }
    if (deliveryMethod === 'courier' && (!formData.addressOrLocker.trim() || !formData.city.trim() || !formData.postalCode.trim())) {
      setFormError('Proszę uzupełnić pełny adres dla kuriera (ulica, miasto, kod pocztowy).');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNum = `UBB-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderNumber(generatedOrderNum);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedOrderNum,
          customer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
          },
          delivery: {
            method: deliveryMethod,
            paczkomatName: selectedLocker?.name,
            addressOrLocker: formData.addressOrLocker,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          items: {
            title: 'Ultra Bee Brakes - Tylny Układ Hamulcowy Plug & Play',
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            totalPrice: totalPrice,
          },
          payment: {
            method: paymentMethod,
            status: paymentMethod === 'cod' ? 'Za pobraniem' : 'Oczekuje na wpłatę',
          },
        }),
      });
    } catch (err) {
      console.error('Błąd zapisu zamówienia:', err);
    } finally {
      setIsSubmitting(false);

      const successData: OrderSuccessData = {
        orderNumber: generatedOrderNum,
        totalPrice: totalPrice,
        quantity: quantity,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        addressOrLocker: formData.addressOrLocker,
        paczkomatName: selectedLocker?.name,
        customerName: formData.fullName,
      };

      if (onOrderSuccess) {
        onOrderSuccess(successData);
        // Reset form data and close drawer
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          addressOrLocker: '',
          city: '',
          postalCode: '',
        });
        setSelectedLocker(null);
        onClose();
      } else {
        setStep('confirmation');
        setTimeout(() => {
          if (drawerScrollRef.current) {
            drawerScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      }
    }
  };

  const handleReset = () => {
    setStep('checkout');
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      addressOrLocker: '',
      city: '',
      postalCode: '',
    });
    setSelectedLocker(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Drawer Container */}
      <motion.div
        ref={drawerScrollRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="relative w-full max-w-lg bg-[#09090d] border-l border-white/10 h-full overflow-y-auto flex flex-col z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#09090d]/95 backdrop-blur-md z-20">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {step === 'checkout' ? (
                <span>Szybkie zamówienie</span>
              ) : (
                <span className="text-emerald-400">✓ Zamówienie przyjęte</span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="text-white font-bold">{pricePerUnit} zł</span>
              <span className="text-zinc-500 line-through">{originalPricePerUnit} zł</span>
              <span>·</span>
              <span className="text-emerald-400 font-medium">Darmowa wysyłka</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1">
          {step === 'checkout' ? (
            <div className="space-y-6">
              {/* Product Card Summary */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden shrink-0">
                  <img
                    src={images.kit}
                    alt="Ultra Bee Brakes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    Ultra Bee Brakes
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Cold Customs · Plug & Play (Surron / 79 Bike / E-Ride Pro / Ventus / Talaria)
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {pricePerUnit} zł
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-white/15 rounded-lg bg-zinc-950 text-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2 py-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 font-semibold text-white tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-2 py-0.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free shipping highlight */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
                <Truck className="w-4 h-4 shrink-0 text-emerald-400" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">Darmowa wysyłka kurierem / Paczkomat</span>
                  <span className="font-bold text-emerald-400">0 zł</span>
                </div>
              </div>

              {/* Delivery method */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
                  1. Sposób dostawy
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('paczkomat')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMethod === 'paczkomat'
                        ? 'bg-zinc-900 border-white text-white shadow-sm'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Paczkomat InPost</span>
                    <span className="text-[11px] text-emerald-400">Darmowa dostawa · Mapa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('courier')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryMethod === 'courier'
                        ? 'bg-zinc-900 border-white text-white shadow-sm'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Kurier pod drzwi</span>
                    <span className="text-[11px] text-emerald-400">Darmowa dostawa</span>
                  </button>
                </div>
              </div>

              {/* Interactive InPost Paczkomaty Map with auto geolocation */}
              {deliveryMethod === 'paczkomat' && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Wybierz Paczkomat (auto GPS)
                    </label>
                  </div>
                  <PaczkomatMapPicker
                    selectedLocker={selectedLocker}
                    onSelectLocker={handleSelectLocker}
                  />
                </div>
              )}

              {/* Customer Info Form */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  2. Dane odbiorcy
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="Imię i nazwisko"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="Numer telefonu"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="Adres e-mail"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <input
                  type="text"
                  required
                  name="addressOrLocker"
                  placeholder={
                    deliveryMethod === 'paczkomat'
                      ? 'Paczkomat (np. WAW01M) lub adres'
                      : 'Ulica i numer domu'
                  }
                  value={formData.addressOrLocker}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    name="city"
                    placeholder="Miejscowość"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  <input
                    type="text"
                    required
                    name="postalCode"
                    placeholder="Kod pocztowy"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Payment selector */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
                  3. Płatność
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-zinc-900 border-white text-white shadow-sm'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">Za pobraniem</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">0 zł</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">Karta / BLIK w Paczkomacie lub kurierowi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('blik_phone')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'blik_phone'
                        ? 'bg-zinc-900 border-white text-white shadow-sm'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">BLIK na telefon</span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Szybki</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">Przelew BLIK na nr telefonu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'transfer'
                        ? 'bg-zinc-900 border-white text-white shadow-sm'
                        : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">Przelew na konto</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">Tradycyjny przelew bankowy</span>
                  </button>
                </div>
              </div>

              {/* Total Summary & Submit */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <span className="text-xs text-zinc-400 block">Razem do zapłaty:</span>
                    <span className="text-xs text-emerald-400 font-medium">Darmowa wysyłka w cenie</span>
                  </div>
                  <span className="text-2xl font-bold text-white tabular-nums">
                    {totalPrice} zł
                  </span>
                </div>

                {/* Form Error Banner */}
                {formError && (
                  <div className="mb-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 text-sm font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Zapisywanie zamówienia...</span>
                  ) : (
                    <span>Zamawiam i płacę · {totalPrice} zł</span>
                  )}
                </motion.button>

                {/* 14-day return reassurance */}
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Objęte 14-dniowym prawem do zwrotu</span>
                  <span className="text-zinc-600">·</span>
                  <span>Pełne wsparcie sklepu</span>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block mb-1">
                  Zamówienie przyjęte
                </span>
                <h4 className="text-2xl font-bold text-white mb-2">
                  Dziękujemy za zamówienie!
                </h4>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                  Numer Twojego zamówienia:{' '}
                  <strong className="text-white font-mono text-sm">{orderNumber}</strong>.
                  Zapisaliśmy je w systemie i przystępujemy do kompletacji.
                </p>
              </div>

              {/* Payment instructions callout */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-left text-xs max-w-sm mx-auto space-y-2">
                {paymentMethod === 'cod' && (
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">💵 Płatność za pobraniem (0 zł dopłaty)</span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Kwotę <strong>{totalPrice} zł</strong> zapłacisz wygodnie przy odbiorze w Paczkomacie InPost (kartą lub BLIK-iem w aplikacji) lub u kuriera.
                    </p>
                  </div>
                )}

                {paymentMethod === 'blik_phone' && (
                  <div>
                    <span className="text-amber-400 font-bold block mb-1">📱 Płatność BLIK na telefon</span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Zrób szybki przelew BLIK na telefon na numer:{' '}
                      <strong className="text-white font-mono text-xs block mt-1">+48 534 396 429</strong>
                      <span className="text-zinc-400 block mt-1">
                        W tytule przelewu podaj numer: <strong className="text-white">{orderNumber}</strong>.
                      </span>
                    </p>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div>
                    <span className="text-blue-400 font-bold block mb-1">🏦 Przelew bankowy</span>
                    <div className="text-zinc-300 text-[11px] leading-relaxed space-y-1">
                      <span className="text-zinc-400 block text-[10px]">Numer konta:</span>
                      <strong className="text-white font-mono text-xs block bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                        77 1050 1894 1000 0097 9386 1098
                      </strong>
                      <span>Odbiorca: <strong>Cold Customs</strong></span><br />
                      <span>Tytuł: <strong>Zamówienie {orderNumber}</strong></span><br />
                      <span>Kwota: <strong className="text-white font-bold">{totalPrice} zł</strong></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between text-zinc-400">
                  <span>Produkt:</span>
                  <span className="text-white font-medium">Ultra Bee Brakes ({quantity} szt.)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Kwota:</span>
                  <span className="text-white font-bold tabular-nums">{totalPrice} zł</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Dostawa:</span>
                  <span className="text-emerald-400 font-medium">0 zł (Darmowa wysyłka)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Punkt odbioru:</span>
                  <span className="text-white font-medium truncate max-w-[200px] text-right">
                    {deliveryMethod === 'paczkomat'
                      ? selectedLocker ? `Paczkomat ${selectedLocker.name}` : formData.addressOrLocker || 'Paczkomat InPost'
                      : 'Kurier (adres domowy)'}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-medium">Przyjęte do realizacji</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full max-w-sm mx-auto py-3 px-4 text-xs font-semibold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all cursor-pointer shadow-md block"
              >
                Wróć do sklepu
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
