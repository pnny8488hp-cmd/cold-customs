import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Truck, RotateCcw, ShieldCheck, MapPin, Trash2, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { PaczkomatMapPicker, InPostPoint } from './PaczkomatMapPicker';
import { OrderSuccessData } from './OrderSuccessModal';
import { CartItem } from '../types/cart';
import { PRODUCTS, ProductItem, ProductVariant, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../data/productData';
import { useShipping } from '../context/ShippingContext';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onAddToCart?: (rect: DOMRect, product: ProductItem, variant?: ProductVariant) => void;
  initialStep?: 'checkout' | 'confirmation';
  onOrderSuccess?: (data: OrderSuccessData) => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  initialStep = 'checkout',
  onOrderSuccess,
  onOpenLegal,
}) => {
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
  const { settings, isSameDayActiveNow } = useShipping();

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

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const totalPrice = subtotal + shippingFee;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

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

    if (cartItems.length === 0) {
      setFormError('Twój koszyk jest pusty. Dodaj produkt przed złożeniem zamówienia.');
      return;
    }

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

    const itemsSummaryTitle = cartItems
      .map((i) => `${i.title}${i.variantName ? ` [${i.variantName}]` : ''} (${i.quantity}x)`)
      .join(', ');

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
            title: itemsSummaryTitle,
            quantity: totalQuantity,
            pricePerUnit: totalQuantity > 0 ? Math.round(totalPrice / totalQuantity) : totalPrice,
            subtotal: subtotal,
            shippingFee: shippingFee,
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
        quantity: totalQuantity,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        addressOrLocker: formData.addressOrLocker,
        paczkomatName: selectedLocker?.name,
        customerName: formData.fullName,
      };

      if (onOrderSuccess) {
        onOrderSuccess(successData);
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
        try {
          window.history.pushState(null, '', `/#zamowienie-zlozone?nr=${generatedOrderNum}&kwota=${totalPrice}`);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch {}
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Drawer */}
      <motion.div
        ref={drawerScrollRef}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="relative w-full max-w-lg bg-[#09090d] border-l border-white/10 h-full overflow-y-auto flex flex-col z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#09090d] z-30 shadow-md">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {step === 'checkout' ? (
                <span>Koszyk & Zamówienie</span>
              ) : (
                <span className="text-emerald-400">✓ Zamówienie przyjęte</span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="text-white font-bold tabular-nums">{totalPrice} zł</span>
              <span>·</span>
              <span>{totalQuantity} {totalQuantity === 1 ? 'przedmiot' : 'przedmioty'}</span>
              <span>·</span>
              <span className={isFreeShipping ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>
                {isFreeShipping ? 'Darmowa wysyłka' : 'Wysyłka 15 zł (od 399 zł gratis)'}
              </span>
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
              {/* Free shipping threshold progress bar */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-white/10">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                    <Truck className={`w-4 h-4 ${isFreeShipping ? 'text-emerald-400' : 'text-amber-400'}`} />
                    {isFreeShipping ? (
                      <span className="text-emerald-400 font-bold">Darmowa wysyłka aktywna! (próg 399 zł)</span>
                    ) : (
                      <span>
                        Brakuje <strong className="text-white font-bold tabular-nums">{amountToFreeShipping} zł</strong> do darmowej wysyłki!
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-400 tabular-nums">
                    {subtotal} / {FREE_SHIPPING_THRESHOLD} zł
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFreeShipping ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Product Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Twoje produkty</span>
                  <span className="tabular-nums">{cartItems.length} pozycji</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/10 text-center">
                    <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-300 font-medium mb-1">Twój koszyk jest pusty</p>
                    <p className="text-xs text-zinc-500 mb-4">Wybierz produkty z oferty Cold Customs</p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-black bg-white rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Przeglądaj ofertę
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex gap-3.5 items-center"
                    >
                      <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-white/10 overflow-hidden shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white truncate">
                              {item.title}
                            </h4>
                            {item.variantName && (
                              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">
                                {item.variantName}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                            title="Usuń z koszyka"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-white tabular-nums">
                            {item.price * item.quantity} zł
                            {item.quantity > 1 && (
                              <span className="text-[11px] font-normal text-zinc-500 ml-1">
                                ({item.price} zł/szt.)
                              </span>
                            )}
                          </span>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-white/15 rounded-lg bg-zinc-950 text-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="px-2 py-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-semibold text-white tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="px-2 py-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add Companion Product */}
              {onAddToCart && (
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Dobierz do zamówienia
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {PRODUCTS.filter((p) => !cartItems.some((ci) => ci.productId === p.id)).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-zinc-900/50 border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-zinc-950 shrink-0 overflow-hidden border border-white/10">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {p.name}
                            </span>
                            <span className="text-xs text-zinc-400 tabular-nums">
                              {p.price} zł
                              {p.variants ? ' · opcja z okleiną gratis' : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const defaultVariant = p.variants ? p.variants[0] : undefined;
                            onAddToCart(rect, p, defaultVariant);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Dodaj</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Dispatch Promise */}
              <div>
                {isSameDayActiveNow ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="leading-snug">
                      <strong className="text-white">Wysyłka DZISIAJ!</strong> Zamów przed {settings.cutoffHour}:00, a paczkę wyślemy jeszcze dzisiaj Paczkomatem InPost.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-2 text-xs text-zinc-300">
                    <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{settings.customNotice || `Zamów przed ${settings.cutoffHour}:00, a paczkę wyślemy jeszcze dzisiaj!`} · Paczkomaty InPost & Kurier</span>
                  </div>
                )}
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
                    <span className={`text-[11px] ${isFreeShipping ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {isFreeShipping ? 'Darmowa dostawa (0 zł)' : '15 zł (od 399 zł gratis)'}
                    </span>
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
                    <span className={`text-[11px] ${isFreeShipping ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {isFreeShipping ? 'Darmowa dostawa (0 zł)' : '15 zł (od 399 zł gratis)'}
                    </span>
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
                      <span className="text-xs font-bold block">Tradycyjny przelew</span>
                      <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">Konto</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">Dane do wpłaty po złożeniu</span>
                  </button>
                </div>
              </div>

              {/* Validation Error Message */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Order total & Submit Button */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span>Produkty</span>
                    <span className="text-white font-semibold tabular-nums">{subtotal} zł</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dostawa ({deliveryMethod === 'paczkomat' ? 'Paczkomat InPost' : 'Kurier'})</span>
                    <span className={`font-semibold tabular-nums ${isFreeShipping ? 'text-emerald-400' : 'text-white'}`}>
                      {isFreeShipping ? '0 zł (Darmowa)' : `${shippingFee} zł`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-white font-semibold">Do zapłaty łącznie</span>
                  <span className="text-2xl font-extrabold text-white tabular-nums">
                    {totalPrice} zł
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || cartItems.length === 0}
                  onClick={handleSubmitOrder}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span>Przetwarzanie...</span>
                  ) : (
                    <span>Potwierdź zamówienie ({totalPrice} zł)</span>
                  )}
                </button>

                {/* Direct support reassurance */}
                <div className="py-2.5 px-3 rounded-xl bg-zinc-900/60 border border-white/5 text-[11px] text-zinc-400 text-center space-y-1">
                  <span className="text-zinc-300 font-semibold block">Masz pytania przed zakupem? Jesteśmy dostępni:</span>
                  <div className="flex items-center justify-center gap-2.5 flex-wrap">
                    <a href="tel:+48534396429" className="text-emerald-400 hover:underline font-mono font-bold">
                      📞 +48 534 396 429
                    </a>
                    <span>·</span>
                    <a href="mailto:coldcustoms.contact@gmail.com" className="text-zinc-300 hover:text-white hover:underline">
                      ✉️ coldcustoms.contact@gmail.com
                    </a>
                  </div>
                </div>

                <div className="pt-2 text-center text-[11px] text-zinc-500 space-y-1.5">
                  <div className="flex items-center justify-center gap-3">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Bezpieczne zakupy
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      14 dni na bezproblemowy zwrot
                    </span>
                  </div>
                  {onOpenLegal && (
                    <div className="text-[10px] text-zinc-500">
                      Składając zamówienie akceptujesz{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('terms')}
                        className="text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Regulamin
                      </button>{' '}
                      oraz{' '}
                      <button
                        type="button"
                        onClick={() => onOpenLegal('privacy')}
                        className="text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Politykę prywatności
                      </button>
                      .
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Confirmation Step */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">Dziękujemy za zamówienie!</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Numer zamówienia: <strong className="text-white font-mono">{orderNumber}</strong>. Potwierdzenie zostało wysłane. Nadamy paczkę w ciągu 24h.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                Zamknij okno
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
