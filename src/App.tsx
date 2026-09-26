import React, { useState } from 'react';
import { ImageProvider, useProductImages } from './context/ImageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { KitContents } from './components/KitContents';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { FlyingCartAnimation, FlyingItem } from './components/FlyingCartAnimation';
import { OriginalImageDropzone } from './components/OriginalImageDropzone';
import { CountdownBanner } from './components/CountdownBanner';
import { OrdersSheetModal } from './components/OrdersSheetModal';
import { LiveSalesToast } from './components/LiveSalesToast';
import { OrderSuccessModal, OrderSuccessData } from './components/OrderSuccessModal';

function StoreContent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isOrdersSheetOpen, setIsOrdersSheetOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [initialCheckoutStep, setInitialCheckoutStep] = useState<'checkout' | 'confirmation'>('checkout');
  const { images } = useProductImages();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setInitialCheckoutStep('confirmation');
      setIsCheckoutOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Shortcut Ctrl + Shift + O or hash #orders to open Orders sheet
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        setIsOrdersSheetOpen((prev) => !prev);
      }
    };
    if (window.location.hash === '#orders' || window.location.hash === '#arkusz') {
      setIsOrdersSheetOpen(true);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenCheckout = () => {
    setInitialCheckoutStep('checkout');
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOrderSuccess = (data: OrderSuccessData) => {
    setOrderSuccessData(data);
    setIsSuccessModalOpen(true);
  };

  const handleOpenUploader = () => {
    setIsUploaderOpen(true);
  };

  const handleCloseUploader = () => {
    setIsUploaderOpen(false);
  };

  const handleAddToCart = (rect: DOMRect, image?: string) => {
    const cartBtn = document.getElementById('navbar-cart-btn');
    if (cartBtn) {
      const targetRect = cartBtn.getBoundingClientRect();
      const newItem: FlyingItem = {
        id: `fly-${Date.now()}-${Math.random()}`,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        targetX: targetRect.left + targetRect.width / 2,
        targetY: targetRect.top + targetRect.height / 2,
        image: image || images.kit,
      };

      setFlyingItems((prev) => [...prev, newItem]);
    } else {
      setQuantity((q) => q + 1);
      triggerCartBounce();
    }
  };

  const triggerCartBounce = () => {
    setIsCartBouncing(true);
    setTimeout(() => {
      setIsCartBouncing(false);
    }, 600);
  };

  const handleFlyingComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    setQuantity((q) => q + 1);
    triggerCartBounce();
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f6] selection:bg-white/20 selection:text-white relative">
      {/* Countdown Promo Banner */}
      <CountdownBanner />

      {/* Navigation */}
      <Navbar
        onOpenCheckout={handleOpenCheckout}
        onOpenUploader={handleOpenUploader}
        cartCount={quantity}
        isCartBouncing={isCartBouncing}
      />

      {/* Main Content Sections */}
      <main>
        <Hero
          onOpenCheckout={handleOpenCheckout}
          onOpenUploader={handleOpenUploader}
          onAddToCart={handleAddToCart}
        />
        <KitContents
          onOpenCheckout={handleOpenCheckout}
          onAddToCart={handleAddToCart}
        />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenOrdersSheet={() => setIsOrdersSheetOpen(true)} />

      {/* Orders & Package Tracking Spreadsheet Modal */}
      <OrdersSheetModal
        isOpen={isOrdersSheetOpen}
        onClose={() => setIsOrdersSheetOpen(false)}
      />

      {/* Flying to Cart Framer Motion Animation */}
      <FlyingCartAnimation
        flyingItems={flyingItems}
        onComplete={handleFlyingComplete}
      />

      {/* Live Sales Social Proof Toast */}
      <LiveSalesToast
        onOpenCheckout={handleOpenCheckout}
        isCheckoutOpen={isCheckoutOpen}
      />

      {/* Slide-out Simplified Checkout Drawer */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        quantity={quantity}
        setQuantity={setQuantity}
        initialStep={initialCheckoutStep}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Prominent Centered Order Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderData={orderSuccessData}
      />

      {/* Original Image Chroma Key Modal & Global Drag-Drop */}
      <OriginalImageDropzone
        isOpen={isUploaderOpen}
        onClose={handleCloseUploader}
      />
    </div>
  );
}

export default function App() {
  return (
    <ImageProvider>
      <StoreContent />
    </ImageProvider>
  );
}
