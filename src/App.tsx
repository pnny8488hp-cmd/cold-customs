import React, { useState } from 'react';
import { ImageProvider, useProductImages } from './context/ImageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { KitContents } from './components/KitContents';
import { SpecsTable } from './components/SpecsTable';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { FlyingCartAnimation, FlyingItem } from './components/FlyingCartAnimation';
import { OriginalImageDropzone } from './components/OriginalImageDropzone';
import { CountdownBanner } from './components/CountdownBanner';
import { OrdersSheetModal } from './components/OrdersSheetModal';
import { LiveSalesToast } from './components/LiveSalesToast';
import { OrderSuccessModal, OrderSuccessData } from './components/OrderSuccessModal';
import { PRODUCTS, ProductItem, ProductVariant } from './data/productData';
import { CartItem } from './types/cart';

function StoreContent() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isOrdersSheetOpen, setIsOrdersSheetOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);

  // Multi-product and Multi-item Cart state
  const [activeProduct, setActiveProduct] = useState<ProductItem>(PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: PRODUCTS[0].id,
      productId: PRODUCTS[0].id,
      title: PRODUCTS[0].name,
      price: PRODUCTS[0].price,
      quantity: 1,
      image: PRODUCTS[0].image,
      category: PRODUCTS[0].category,
    },
  ]);

  const [stock, setStock] = useState<number | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [initialCheckoutStep, setInitialCheckoutStep] = useState<'checkout' | 'confirmation'>('checkout');
  const { images } = useProductImages();

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      if (res.ok) {
        const data = await res.json();
        if (data.stock !== undefined) {
          setStock(data.stock);
        }
      }
    } catch {}
  };

  React.useEffect(() => {
    fetchStock();
    const interval = setInterval(fetchStock, 20000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSelectProduct = (product: ProductItem) => {
    setActiveProduct(product);
  };

  const handleAddToCart = (rect: DOMRect, product: ProductItem, variant?: ProductVariant) => {
    const cartBtn = document.getElementById('navbar-cart-btn');
    const targetImg = variant
      ? variant.id === 'without-sticker'
        ? images.plateClean || variant.image
        : variant.id === 'with-sticker'
        ? images.plateSticker || variant.image
        : variant.image
      : product.id === 'ultra-bee-brakes'
      ? images.kit
      : product.image;

    const itemId = variant ? `${product.id}-${variant.id}` : product.id;
    const itemPrice = variant ? variant.price : product.price;
    const variantLabel = variant ? variant.shortName : undefined;

    if (cartBtn) {
      const targetRect = cartBtn.getBoundingClientRect();
      const newItem: FlyingItem = {
        id: `fly-${Date.now()}-${Math.random()}`,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        targetX: targetRect.left + targetRect.width / 2,
        targetY: targetRect.top + targetRect.height / 2,
        image: targetImg,
      };

      setFlyingItems((prev) => [...prev, newItem]);
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          variantId: variant?.id,
          variantName: variantLabel,
          title: product.name,
          price: itemPrice,
          quantity: 1,
          image: targetImg,
          category: product.category,
        },
      ];
    });

    triggerCartBounce();
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerCartBounce = () => {
    setIsCartBouncing(true);
    setTimeout(() => {
      setIsCartBouncing(false);
    }, 600);
  };

  const handleFlyingComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
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
        cartCount={totalCartQuantity}
        totalCartPrice={totalCartPrice}
        isCartBouncing={isCartBouncing}
      />

      {/* Main Content Sections */}
      <main>
        <Hero
          activeProduct={activeProduct}
          products={PRODUCTS}
          onSelectProduct={handleSelectProduct}
          onOpenCheckout={handleOpenCheckout}
          onOpenUploader={handleOpenUploader}
          onAddToCart={handleAddToCart}
          stock={stock}
        />
        <ProductCatalog
          activeProductId={activeProduct.id}
          onSelectProduct={(p) => {
            handleSelectProduct(p);
            const el = document.getElementById('overview');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onAddToCart={handleAddToCart}
          onOpenCheckout={handleOpenCheckout}
        />
        <KitContents
          activeProduct={activeProduct}
          onOpenCheckout={handleOpenCheckout}
          onAddToCart={handleAddToCart}
        />
        <SpecsTable
          activeProduct={activeProduct}
          onOpenCheckout={handleOpenCheckout}
          onAddToCart={(rect) => handleAddToCart(rect, activeProduct)}
        />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenOrdersSheet={() => setIsOrdersSheetOpen(true)} />

      {/* Orders & Package Tracking Spreadsheet Modal */}
      <OrdersSheetModal
        isOpen={isOrdersSheetOpen}
        onClose={() => setIsOrdersSheetOpen(false)}
        onStockChange={fetchStock}
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

      {/* Slide-out Simplified Checkout Drawer with Multi-item Support */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
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
