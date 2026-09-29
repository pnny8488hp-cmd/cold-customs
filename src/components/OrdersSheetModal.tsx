import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Search, CheckCircle2, Clock, Truck, 
  Package, RefreshCw, Save, ExternalLink, ShieldAlert,
  Lock, KeyRound, LogOut, Eye, EyeOff, Trash2,
  Bell, Play, Sparkles, Plus, Check, Upload, Image as ImageIcon,
  Sliders, Crosshair, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut
} from 'lucide-react';
import { Order } from '../types/order';

interface OrdersSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockChange?: () => void;
}

export const OrdersSheetModal: React.FC<OrdersSheetModalProps> = ({ isOpen, onClose, onStockChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingTracking, setEditingTracking] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Deletion states (in-UI confirmation without blocking window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Admin Tab: 'orders' | 'shipping' | 'notifications' | 'branding'
  const [adminTab, setAdminTab] = useState<'orders' | 'shipping' | 'notifications' | 'branding'>('orders');

  // Same-day shipping management state
  const [sameDayShippingEnabled, setSameDayShippingEnabled] = useState(true);
  const [shippingCutoffHour, setShippingCutoffHour] = useState(16);
  const [shippingCustomNotice, setShippingCustomNotice] = useState('');
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingSavedMsg, setShippingSavedMsg] = useState(false);

  // Logo upload & adjustment state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoSuccessNotice, setLogoSuccessNotice] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState<number>(Date.now());
  const [logoOffsetX, setLogoOffsetX] = useState(0); // in px (-150 to +150)
  const [logoOffsetY, setLogoOffsetY] = useState(0); // in px (-150 to +150)
  const [logoScale, setLogoScale] = useState(100); // in percent (50 to 160)
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [savingAdjustedLogo, setSavingAdjustedLogo] = useState(false);

  // Stock inventory management (separate for brakes and plates)
  const [stockBrakes, setStockBrakes] = useState<number | string>(10);
  const [stockPlates, setStockPlates] = useState<number | string>(15);
  const [savingStock, setSavingStock] = useState(false);
  const [stockSavedMessage, setStockSavedMessage] = useState(false);

  // Notification settings management state
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifInterval, setNotifInterval] = useState(25);
  const [notifMode, setNotifMode] = useState<'smart' | 'real_only' | 'custom_only'>('smart');
  const [customSales, setCustomSales] = useState<any[]>([]);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  // New notification draft form fields
  const [newCity, setNewCity] = useState('');
  const [newProduct, setNewProduct] = useState('Vented Plate (Z okleiną #1)');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newDelivery, setNewDelivery] = useState('Paczkomat InPost');
  const [newPaczkomat, setNewPaczkomat] = useState('');
  const [newTimeAgo, setNewTimeAgo] = useState('przed chwilą');

  // Authentication Password state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Monthly revenue limit for Działalność Nierejestrowana (2025/2026: ~3500 zł)
  const MONTHLY_LIMIT = 3500;

  const getSavedPin = () => sessionStorage.getItem('ubb_admin_pin') || '';

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      if (res.ok) {
        const data = await res.json();
        setStockBrakes(data.brakes ?? data.stock ?? 10);
        setStockPlates(data.plates ?? 15);
      }
    } catch (e) {
      console.error('Błąd pobierania stanu magazynowego:', e);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch('/api/notifications/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setNotifEnabled(data.settings.enabled ?? true);
          setNotifInterval(data.settings.intervalSeconds ?? 25);
          setNotifMode(data.settings.mode ?? 'smart');
          setCustomSales(data.settings.customSales ?? []);
        }
      }
    } catch (e) {
      console.error('Błąd pobierania ustawień powiadomień:', e);
    }
  };

  const fetchShippingSettings = async () => {
    try {
      const res = await fetch('/api/shipping-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSameDayShippingEnabled(data.settings.sameDayShippingEnabled ?? true);
          setShippingCutoffHour(data.settings.cutoffHour ?? 16);
          setShippingCustomNotice(data.settings.customNotice ?? '');
        }
      }
    } catch (e) {
      console.error('Błąd pobierania ustawień wysyłki:', e);
    }
  };

  const handleSaveShippingSettings = async (overrideEnabled?: boolean) => {
    const pin = getSavedPin();
    if (!pin) return;

    setSavingShipping(true);
    try {
      const targetEnabled = overrideEnabled !== undefined ? overrideEnabled : sameDayShippingEnabled;
      const payload = {
        sameDayShippingEnabled: targetEnabled,
        cutoffHour: Number(shippingCutoffHour),
        customNotice: shippingCustomNotice,
      };

      const res = await fetch('/api/shipping-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSameDayShippingEnabled(data.settings.sameDayShippingEnabled);
          setShippingCutoffHour(data.settings.cutoffHour);
          setShippingCustomNotice(data.settings.customNotice);
          try {
            localStorage.setItem('cc_shipping_settings', JSON.stringify(data.settings));
          } catch {}
        }
        setShippingSavedMsg(true);
        setTimeout(() => setShippingSavedMsg(false), 2500);
      } else {
        alert('Nie udało się zapisać ustawień wysyłki.');
      }
    } catch {
      alert('Błąd połączenia podczas zapisu ustawień wysyłki.');
    } finally {
      setSavingShipping(false);
    }
  };

  const handleSaveNotifications = async (overrideCustomSales?: any[]) => {
    const pin = getSavedPin();
    if (!pin) return;

    setSavingNotif(true);
    try {
      const payload = {
        enabled: notifEnabled,
        intervalSeconds: Number(notifInterval),
        mode: notifMode,
        customSales: overrideCustomSales || customSales,
      };

      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setNotifEnabled(data.settings.enabled);
          setNotifInterval(data.settings.intervalSeconds);
          setNotifMode(data.settings.mode);
          setCustomSales(data.settings.customSales);
        }
        setNotifSavedMsg(true);
        setTimeout(() => setNotifSavedMsg(false), 2500);
      } else {
        alert('Nie udało się zapisać ustawień powiadomień.');
      }
    } catch {
      alert('Błąd połączenia podczas zapisu powiadomień.');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleAddCustomSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) {
      alert('Wpisz miasto.');
      return;
    }

    const isPlate = newProduct.toLowerCase().includes('plate') || newProduct.toLowerCase().includes('vented');
    const newEntry = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      city: newCity.trim(),
      productName: newProduct,
      productId: isPlate ? 'front-plate-cold-customs' : 'ultra-bee-brakes',
      quantity: Number(newQuantity) || 1,
      deliveryMethod: newDelivery,
      paczkomat: newPaczkomat.trim(),
      timeAgo: newTimeAgo.trim() || 'przed chwilą',
    };

    const updated = [newEntry, ...customSales];
    setCustomSales(updated);
    setNewCity('');
    setNewPaczkomat('');

    handleSaveNotifications(updated);
  };

  const handleDeleteCustomSale = (id: string) => {
    const updated = customSales.filter((s) => s.id !== id);
    setCustomSales(updated);
    handleSaveNotifications(updated);
  };

  const handleTestNotification = (sale: any) => {
    window.dispatchEvent(
      new CustomEvent('ubb-test-toast', {
        detail: {
          ...sale,
          timeAgo: 'przed chwilą',
        },
      })
    );
  };

  const fetchOrders = async (overridePin?: string) => {
    const currentPin = overridePin || getSavedPin();
    if (!currentPin) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'x-admin-pin': currentPin,
          'x-admin-password': currentPin,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setIsAuthenticated(true);
        fetchStock();
        fetchNotificationSettings();
        fetchShippingSettings();
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('ubb_admin_pin');
      }
    } catch (e) {
      console.error('Błąd pobierania zamówień:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedPin();
      if (saved) {
        fetchOrders(saved);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [isOpen]);

  const handleVerifyPassword = async (e?: React.FormEvent, customPass?: string) => {
    if (e) e.preventDefault();
    const passToTest = (customPass !== undefined ? customPass : password).trim();
    if (!passToTest) return;

    setVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/orders/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passToTest }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        sessionStorage.setItem('ubb_admin_pin', passToTest);
        setPassword(passToTest);
        setIsAuthenticated(true);
        fetchOrders(passToTest);
      } else {
        setAuthError(data.error || 'Nieprawidłowe hasło dostępu. Sprawdź wielkość liter lub użyj: MojeHasloUBB2026!');
      }
    } catch {
      setAuthError('Błąd połączenia z serwerem.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ubb_admin_pin');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['fulfillment']['status']) => {
    try {
      const pin = getSavedPin();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, fulfillment: { ...o.fulfillment, status: newStatus } }
              : o
          )
        );
      }
    } catch (e) {
      console.error('Błąd zmiany statusu:', e);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const tracking = editingTracking[orderId];
    if (tracking === undefined) return;
    setSavingId(orderId);
    try {
      const pin = getSavedPin();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify({ trackingNumber: tracking }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, fulfillment: { ...o.fulfillment, trackingNumber: tracking } }
              : o
          )
        );
      }
    } catch (e) {
      console.error('Błąd zapisu numeru paczki:', e);
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    const pin = getSavedPin();
    window.open(`/api/orders/export-csv?pin=${encodeURIComponent(pin)}`, '_blank');
  };

  const handleSaveStock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = getSavedPin();
    if (!pin) return;

    const parsedBrakes = parseInt(String(stockBrakes), 10);
    const parsedPlates = parseInt(String(stockPlates), 10);
    if (isNaN(parsedBrakes) || parsedBrakes < 0 || isNaN(parsedPlates) || parsedPlates < 0) {
      alert('Podaj prawidłową liczbę sztuk (0 lub więcej) dla obu produktów.');
      return;
    }

    setSavingStock(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify({ brakes: parsedBrakes, plates: parsedPlates }),
      });

      if (res.ok) {
        const data = await res.json();
        setStockBrakes(data.brakes ?? parsedBrakes);
        setStockPlates(data.plates ?? parsedPlates);
        setStockSavedMessage(true);
        onStockChange?.();
        setTimeout(() => setStockSavedMessage(false), 2500);
      } else {
        alert('Nie udało się zapisać stanu magazynowego.');
      }
    } catch {
      alert('Błąd połączenia podczas zapisu stanu magazynowego.');
    } finally {
      setSavingStock(false);
    }
  };

  const handleConfirmDelete = async (orderId: string) => {
    setDeletingId(orderId);
    try {
      const pin = getSavedPin();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': pin,
          'x-admin-pin': pin,
        },
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setDeleteNotice(`Pomyślnie usunięto zamówienie ${orderId}`);
        setTimeout(() => setDeleteNotice(null), 3500);
      } else {
        setDeleteNotice('Nie udało się usunąć zamówienia. Sprawdź uprawnienia.');
        setTimeout(() => setDeleteNotice(null), 3500);
      }
    } catch (e) {
      console.error('Błąd usuwania:', e);
      setDeleteNotice('Błąd połączenia podczas usuwania zamówienia.');
      setTimeout(() => setDeleteNotice(null), 3500);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleClearAllOrders = async () => {
    setDeletingId('all');
    try {
      const pin = getSavedPin();
      const res = await fetch(`/api/orders/all`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': pin,
          'x-admin-pin': pin,
        },
      });

      if (res.ok) {
        setOrders([]);
        setDeleteNotice('Wszystkie zamówienia zostały trwale usunięte z bazy.');
        setTimeout(() => setDeleteNotice(null), 3500);
      } else {
        setDeleteNotice('Nie udało się wyczyścić bazy zamówień.');
        setTimeout(() => setDeleteNotice(null), 3500);
      }
    } catch {
      setDeleteNotice('Błąd połączenia podczas usuwania zamówień.');
      setTimeout(() => setDeleteNotice(null), 3500);
    } finally {
      setDeletingId(null);
      setIsConfirmClearAll(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rawBase64 = reader.result as string;
      // Optimize image via HTML5 Canvas so even large phone photos upload smoothly without exceeding payload limits
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.94);
          setLogoPreview(optimized);
        } else {
          setLogoPreview(rawBase64);
        }
        setLogoSuccessNotice(null);
      };
      img.onerror = () => {
        setLogoPreview(rawBase64);
        setLogoSuccessNotice(null);
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async () => {
    if (!logoPreview) return;
    setUploadingLogo(true);
    setLogoSuccessNotice(null);
    try {
      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: logoPreview }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Serwer nie zwrócił poprawnego JSON' };
      }
      if (res.ok && data.success) {
        setLogoSuccessNotice('✓ Oryginalne logo zostało pomyślnie zapisane! Zaktualizowano logo strony oraz ikony dla wyszukiwarki Google.');
        const newVer = Date.now();
        setLogoVersion(newVer);
        window.dispatchEvent(new CustomEvent('cc-logo-updated', { detail: newVer }));
        setLogoPreview(null);
      } else {
        setLogoSuccessNotice(`Błąd zapisu logo: ${data.error || 'Serwer odrzucił żądanie'}`);
      }
    } catch (e: any) {
      setLogoSuccessNotice(`Błąd połączenia podczas wysyłania: ${e?.message || 'Spróbuj ponownie'}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveAdjustedLogo = async () => {
    setSavingAdjustedLogo(true);
    setLogoSuccessNotice(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Nie można utworzyć kontekstu canvas');

      // Tło czarne
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1000, 1000);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = logoPreview || `/logo.jpg?t=${logoVersion}`;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Nie udało się załadować obrazu logo'));
      });

      // Rysujemy logo z przesunięciem i skalą
      const scaleFactor = logoScale / 100;
      const baseW = img.width || 800;
      const baseH = img.height || 800;
      const maxDim = 850;
      const fitScale = Math.min(maxDim / baseW, maxDim / baseH);
      const drawW = baseW * fitScale * scaleFactor;
      const drawH = baseH * fitScale * scaleFactor;

      // Środek to (500, 500)
      const posX = 500 - (drawW / 2) + (logoOffsetX * 3.125);
      const posY = 500 - (drawH / 2) + (logoOffsetY * 3.125);

      ctx.drawImage(img, posX, posY, drawW, drawH);

      const base64Data = canvas.toDataURL('image/jpeg', 0.95);

      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: base64Data }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Serwer nie zwrócił poprawnego JSON' };
      }

      if (res.ok && data.success) {
        setLogoSuccessNotice('✓ Logo zostało pomyślnie wycentrowane i zaktualizowane na całej stronie oraz w Google!');
        const newVer = Date.now();
        setLogoVersion(newVer);
        window.dispatchEvent(new CustomEvent('cc-logo-updated', { detail: newVer }));
        setLogoOffsetX(0);
        setLogoOffsetY(0);
        setLogoScale(100);
        setLogoPreview(null);
      } else {
        setLogoSuccessNotice(`Błąd zapisu logo: ${data.error || 'Serwer odrzucił żądanie'}`);
      }
    } catch (e: any) {
      console.error('Błąd centrowania:', e);
      setLogoSuccessNotice(`Błąd podczas wyśrodkowywania: ${e?.message || 'Spróbuj ponownie'}`);
    } finally {
      setSavingAdjustedLogo(false);
    }
  };

  // Calculations for current month
  const now = new Date();
  const currentMonthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const currentMonthTotal = currentMonthOrders.reduce((sum, o) => sum + (o.items?.totalPrice || 799), 0);
  const remainingLimit = Math.max(0, MONTHLY_LIMIT - currentMonthTotal);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search) ||
      o.delivery.addressOrLocker.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return o.fulfillment.status === statusFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#0c0c11] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden"
      >
        {/* Lock Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="relative p-6 sm:p-10 text-center max-w-md mx-auto my-auto space-y-6">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Zamknij panel"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/15 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Panel Właściciela Sklepu
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Dostęp wyłącznie dla autoryzowanego administratora sklepu.
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Hasło administratora"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-zinc-950 border border-white/15 text-white placeholder-zinc-500 text-sm tracking-normal focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-lg text-left">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {verifying ? 'Weryfikacja...' : 'Zaloguj się'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Authenticated Header */}
            <div className="p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Package className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Arkusz Zamówień & Paczek
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Ewidencja sprzedaży bez firmy (Działalność nierejestrowana) · Powiadomienia: <span className="text-zinc-200 font-mono">mieciotatk@gmail.com</span>
                </p>
              </div>

              {/* Quick stats and Limit badge */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {/* Stock management input for Brakes & Plates */}
                <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-3">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                      Hamulce:
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        min="0"
                        value={stockBrakes}
                        onChange={(e) => setStockBrakes(e.target.value)}
                        className="w-12 px-1.5 py-0.5 bg-zinc-950 border border-white/15 rounded-lg text-xs font-bold text-white text-center tabular-nums focus:outline-none focus:border-emerald-500"
                        title="Dostępne sztuki układu hamulcowego Ultra Bee"
                      />
                      <span className="text-[11px] text-zinc-400">szt.</span>
                    </div>
                  </div>

                  <div className="border-l border-white/10 pl-3">
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                      Vented Plate:
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        min="0"
                        value={stockPlates}
                        onChange={(e) => setStockPlates(e.target.value)}
                        className="w-12 px-1.5 py-0.5 bg-zinc-950 border border-white/15 rounded-lg text-xs font-bold text-white text-center tabular-nums focus:outline-none focus:border-emerald-500"
                        title="Dostępne sztuki tablic Vented Plate"
                      />
                      <span className="text-[11px] text-zinc-400">szt.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveStock()}
                    disabled={savingStock}
                    className={`px-2.5 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm self-end mb-0.5 ${
                      stockSavedMessage
                        ? 'bg-emerald-500 text-black font-extrabold'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 hover:border-emerald-500/50'
                    } disabled:opacity-50`}
                    title="Zapisz stany magazynowe"
                  >
                    {savingStock ? '...' : stockSavedMessage ? '✓ Zapisano' : 'Zapisz'}
                  </button>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Suma w tym miesiącu:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-white tabular-nums text-sm">
                      {currentMonthTotal} zł
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      / max {MONTHLY_LIMIT} zł
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Eksportuj do Excel / CSV</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Zablokuj panel"
                  className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Sub-navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-2.5 pb-0 bg-zinc-950/90 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setAdminTab('orders')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  adminTab === 'orders'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Zamówienia & Magazyn ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('shipping')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  adminTab === 'shipping'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Wysyłka (Przed 16:00)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  sameDayShippingEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {sameDayShippingEnabled ? 'Włączona (do 16:00)' : 'Wyłączona (poza domem)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('notifications')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  adminTab === 'notifications'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Powiadomienia o Zakupach (Live Toast)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  notifEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-white/5'
                }`}>
                  {notifEnabled ? 'Włączone' : 'Wyłączone'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('branding')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  adminTab === 'branding'
                    ? 'border-emerald-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Ikonka Google</span>
              </button>
            </div>

            {adminTab === 'shipping' ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Status Notice */}
                {shippingSavedMsg && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Ustawienia wysyłki zostały pomyślnie zapisane i wdrożone na stronie!
                    </span>
                    <button
                      type="button"
                      onClick={() => setShippingSavedMsg(false)}
                      className="text-emerald-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Master Switch & Settings Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Truck className="w-4 h-4" />
                        </span>
                        <h3 className="text-base font-bold text-white">
                          Wysyłka tego samego dnia (Przed 16:00)
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                        Gdy jesteś w domu i możesz nadać paczkę dzisiaj, włącz tę opcję. Klienci zobaczą licznik odliczający do 16:00. Jeśli wyjeżdżasz lub nie ma Cię w domu, po prostu wyłącz ten przełącznik – klienci zobaczą bezpieczny komunikat o wysyłce w 24-48h.
                      </p>
                    </div>

                    {/* Master Switch Toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-300">
                        {sameDayShippingEnabled ? 'WŁĄCZONA' : 'WYŁĄCZONA'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !sameDayShippingEnabled;
                          setSameDayShippingEnabled(nextVal);
                          handleSaveShippingSettings(nextVal);
                        }}
                        className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer border ${
                          sameDayShippingEnabled
                            ? 'bg-emerald-500 border-emerald-400'
                            : 'bg-zinc-800 border-white/20'
                        }`}
                      >
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-md absolute top-0.5 left-1"
                          animate={{ x: sameDayShippingEnabled ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Settings Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-200 mb-2">
                        Godzina graniczna nadania (domyślnie 16:00):
                      </label>
                      <select
                        value={shippingCutoffHour}
                        onChange={(e) => setShippingCutoffHour(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="12">12:00 (Południe)</option>
                        <option value="14">14:00</option>
                        <option value="15">15:00</option>
                        <option value="16">16:00 (Rekomendowana dla InPost)</option>
                        <option value="17">17:00</option>
                        <option value="18">18:00</option>
                      </select>
                      <span className="text-[11px] text-zinc-500 mt-1.5 block">
                        Do tej godziny klienci widzą odliczanie „Wysyłka dzisiaj”. Po tej godzinie licznik automatycznie przełącza się na informację o wysyłce w kolejny dzień roboczy.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-200 mb-2">
                        Komunikat, gdy wyłączone (np. jesteś poza domem):
                      </label>
                      <input
                        type="text"
                        placeholder="np. Błyskawiczna wysyłka w 24-48h"
                        value={shippingCustomNotice}
                        onChange={(e) => setShippingCustomNotice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
                      />
                      <span className="text-[11px] text-zinc-500 mt-1.5 block">
                        Pozostaw puste, aby wyświetlać standardowe: „Błyskawiczna wysyłka w 24-48h”.
                      </span>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-zinc-400">
                      Zmiany zostaną natychmiast zastosowane na Twojej stronie bez konieczności restartu serwera.
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSaveShippingSettings()}
                      disabled={savingShipping}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingShipping ? 'Zapisywanie...' : 'Zapisz ustawienia wysyłki'}</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                      Podgląd na żywo (jak widzi to klient na stronie):
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Aktualny stan: {sameDayShippingEnabled ? '🟢 Aktywna' : '🔴 Wyłączona'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-white/15 flex items-center justify-center">
                    {sameDayShippingEnabled ? (
                      <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                          <Truck className="w-4 h-4 text-emerald-400" />
                          Wysyłka DZISIAJ:
                        </span>
                        <span className="text-zinc-200">
                          Zamów przed <strong className="text-white">{shippingCutoffHour}:00</strong>, a paczkę wyślemy jeszcze dzisiaj!
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-white">
                          {shippingCustomNotice || 'Błyskawiczna wysyłka w 24-48h'}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400">Paczkomaty InPost & Kurier</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-emerald-400 font-semibold">Darmowa dostawa od 399 zł</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : adminTab === 'notifications' ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Master Switch & Settings Card */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Bell className="w-4 h-4" />
                        </span>
                        <h3 className="text-base font-bold text-white">
                          Zarządzanie Powiadomieniami dla Klientów (Social Proof)
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                        Powiadomienia w lewym dolnym rogu ekranu („Ktoś z Warszawy kupił Vented Plate”) budują zaufanie, potwierdzają autentyczność i drastycznie zwiększają sprzedaż.
                      </p>
                    </div>

                    {/* Master Toggle */}
                    <button
                      type="button"
                      onClick={() => setNotifEnabled(!notifEnabled)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md ${
                        notifEnabled
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white border border-white/10'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${notifEnabled ? 'bg-black animate-pulse' : 'bg-zinc-500'}`} />
                      <span>{notifEnabled ? 'Powiadomienia: WŁĄCZONE' : 'Powiadomienia: WYŁĄCZONE'}</span>
                    </button>
                  </div>

                  {/* Settings Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    {/* Interval selector */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/10">
                      <label className="block text-xs font-semibold text-zinc-300 mb-2">
                        ⏱️ Częstotliwość wyświetlania:
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { sec: 15, label: 'Co 15s' },
                          { sec: 25, label: 'Co 25s' },
                          { sec: 40, label: 'Co 40s' },
                          { sec: 60, label: 'Co 60s' },
                        ].map((item) => (
                          <button
                            key={item.sec}
                            type="button"
                            onClick={() => setNotifInterval(item.sec)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              notifInterval === item.sec
                                ? 'bg-white text-black font-bold shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500 mt-2 block">
                        Zalecane: 25s (pozwala klientowi spokojnie zapoznać się z produktem).
                      </span>
                    </div>

                    {/* Mode selector */}
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/10">
                      <label className="block text-xs font-semibold text-zinc-300 mb-2">
                        🎯 Tryb źródła powiadomień:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { mode: 'smart', label: 'Inteligentny', tip: 'Z bazy + Lista' },
                          { mode: 'real_only', label: 'Tylko z bazy', tip: 'Realne zamówienia' },
                          { mode: 'custom_only', label: 'Tylko własne', tip: 'Z poniższej listy' },
                        ].map((m) => (
                          <button
                            key={m.mode}
                            type="button"
                            onClick={() => setNotifMode(m.mode as any)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center ${
                              notifMode === m.mode
                                ? 'bg-emerald-500 text-black font-bold shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                            }`}
                            title={m.tip}
                          >
                            <span>{m.label}</span>
                            <span className="text-[9px] opacity-75">{m.tip}</span>
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500 mt-2 block">
                        W trybie Inteligentnym powiadomienia wyświetlają się zawsze, zapewniając aktywność sklepu.
                      </span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSaveNotifications()}
                      disabled={savingNotif}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                        notifSavedMsg
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white hover:bg-zinc-200 text-black'
                      } disabled:opacity-50`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNotif ? 'Zapisywanie...' : notifSavedMsg ? '✓ Ustawienia zapisane!' : 'Zapisz ustawienia powiadomień'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleTestNotification(
                          customSales[0] || {
                            city: 'Warszawa',
                            productName: 'Vented Plate (Z okleiną #1)',
                            quantity: 1,
                            deliveryMethod: 'Paczkomat InPost',
                            paczkomat: 'WAW04M',
                          }
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>Przetestuj powiadomienie na ekranie</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Notification Form */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Dodaj nowe powiadomienie do listy</span>
                  </h4>

                  <form onSubmit={handleAddCustomSale} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Miasto:</label>
                      <input
                        type="text"
                        placeholder="np. Warszawa"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Produkt:</label>
                      <select
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Vented Plate (Z okleiną #1)">Vented Plate (Z okleiną #1)</option>
                        <option value="Vented Plate (Bez naklejki)">Vented Plate (Bez naklejki)</option>
                        <option value="Vented Plate Cold Customs">Vented Plate Cold Customs</option>
                        <option value="Ultra Bee Brakes">Ultra Bee Brakes (Tylny układ)</option>
                        <option value="Ultra Bee Brakes + Vented Plate">Zestaw: Ultra Bee + Vented Plate</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Ilość sztuk:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Dostawa:</label>
                      <select
                        value={newDelivery}
                        onChange={(e) => setNewDelivery(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Paczkomat InPost">Paczkomat InPost</option>
                        <option value="Kurier InPost">Kurier InPost</option>
                        <option value="Kurier pobranie">Kurier pobranie</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="submit"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Dodaj</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notifications Queue List */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Powiadomienia w rotacji ({customSales.length})</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Powiadomienia są wyświetlane klientom na bieżąco w wybranym interwale ({notifInterval}s).
                      </p>
                    </div>

                    <span className="text-xs text-zinc-400 font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-white/5">
                      Interwał: {notifInterval}s
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/10 flex items-center justify-between gap-3 group hover:border-emerald-500/30 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white truncate">
                              Ktoś z {sale.city}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                              {sale.timeAgo || 'niedawno'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 font-medium truncate">
                            {sale.productName || 'Ultra Bee Brakes'} ({sale.quantity || 1} szt.)
                          </p>
                          <span className="text-[11px] text-zinc-500 block truncate mt-0.5">
                            {sale.deliveryMethod} {sale.paczkomat ? `(${sale.paczkomat})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTestNotification(sale)}
                            title="Przetestuj powiadomienie na ekranie"
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 border border-white/10 transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSale(sale.id)}
                            title="Usuń z listy powiadomień"
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : adminTab === 'branding' ? (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Header info */}
                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Oficjalne Logo Sklepu & Ikonka (Favicon) dla Google
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    Tutaj możesz wgrać dokładnie swój oryginalny plik graficzny (np. <span className="text-white font-mono font-semibold">un0T6.jpg</span>). Plik zostanie natychmiast zapisany na serwerze w formacie 1:1 bez żadnego generowania AI, a system automatycznie utworzy z niego ikony favicon dla wyszukiwarki Google i przeglądarek.
                  </p>
                </div>

                {logoSuccessNotice && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
                    <span>{logoSuccessNotice}</span>
                    <button
                      type="button"
                      onClick={() => setLogoSuccessNotice(null)}
                      className="text-emerald-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Centering and Calibration Studio */}
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Sliders className="w-4 h-4" />
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Studio Wyśrodkowania & Dopasowania Loga
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Przesuwaj suwakami lub przyciskami mikro-korekt, aby znak graficzny był w 100% równo wycentrowany w kwadracie 1:1.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCrosshairs(!showCrosshairs)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          showCrosshairs
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>{showCrosshairs ? 'Celownik: Włączony' : 'Celownik: Wyłączony'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLogoOffsetX(0);
                          setLogoOffsetY(0);
                          setLogoScale(100);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Zresetuj przesunięcie i skalę"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Wycentruj (Reset)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Studio Viewport with Crosshairs */}
                    <div className="lg:col-span-6 space-y-4">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                        Obszar roboczy (Kwadrat 1:1):
                      </span>

                      {/* 1:1 Viewport container */}
                      <div className="w-full max-w-[320px] aspect-square mx-auto rounded-2xl bg-black border-2 border-white/20 relative overflow-hidden flex items-center justify-center shadow-2xl">
                        {/* The Logo Image being adjusted */}
                        <div
                          className="w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-75"
                          style={{
                            transform: `translate(${logoOffsetX}px, ${logoOffsetY}px) scale(${logoScale / 100})`,
                          }}
                        >
                          <img
                            src={logoPreview || `/logo.jpg?t=${logoVersion}`}
                            alt="Cold Customs Logo"
                            className="max-w-[85%] max-h-[85%] object-contain select-none"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/favicon.svg';
                            }}
                          />
                        </div>

                        {/* Centering Crosshairs Guidelines */}
                        {showCrosshairs && (
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Vertical center line */}
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-red-500/60 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                            {/* Horizontal center line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-500/60 shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
                            {/* Central alignment circle */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.3)] pointer-events-none" />
                            {/* Center dot */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-md" />
                          </div>
                        )}

                        <span className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-white/10">
                          X: {logoOffsetX > 0 ? `+${logoOffsetX}` : logoOffsetX}px · Y: {logoOffsetY > 0 ? `+${logoOffsetY}` : logoOffsetY}px · {logoScale}%
                        </span>
                      </div>

                      {/* Real Previews on Website and Google */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                          Podgląd w rzeczywistych miejscach na stronie:
                        </span>

                        {/* Navbar Preview */}
                        <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {/* Logo in Navbar size */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center p-0.5 relative shrink-0 shadow-md">
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                  transform: `translate(${Math.round(logoOffsetX * 0.12)}px, ${Math.round(logoOffsetY * 0.12)}px) scale(${logoScale / 100})`,
                                }}
                              >
                                <img
                                  src={logoPreview || `/logo.jpg?t=${logoVersion}`}
                                  alt="Logo"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display font-black tracking-wider text-white text-xs leading-tight">
                                COLD CUSTOMS
                              </span>
                              <span className="text-[9px] text-zinc-400 font-medium">
                                Części Motocyklowe
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                            Pasek menu (Navbar)
                          </span>
                        </div>

                        {/* Google Favicon Preview */}
                        <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md overflow-hidden bg-black border border-white/15 flex items-center justify-center shrink-0">
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                  transform: `translate(${Math.round(logoOffsetX * 0.08)}px, ${Math.round(logoOffsetY * 0.08)}px) scale(${logoScale / 100})`,
                                }}
                              >
                                <img
                                  src={logoPreview || `/logo.jpg?t=${logoVersion}`}
                                  alt="Logo"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-white block">coldcustoms.pl</span>
                              <span className="text-[10px] text-zinc-500 block">Wynik wyszukiwania Google</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                            Google Favicon
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Fine-tuning sliders and D-Pad Controls */}
                    <div className="lg:col-span-6 space-y-6">
                      <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">
                          Precyzyjne suwaki przesunięcia & skali:
                        </span>

                        {/* Horizontal Offset (X) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <label className="text-zinc-300 font-medium">
                              Przesunięcie w poziomie (Oś X):
                            </label>
                            <span className="font-mono text-emerald-400 font-bold tabular-nums">
                              {logoOffsetX > 0 ? `+${logoOffsetX}` : logoOffsetX} px
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setLogoOffsetX((x) => x - 5)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="-5px w lewo"
                            >
                              -5px
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoOffsetX((x) => x - 1)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="-1px w lewo"
                            >
                              -1px
                            </button>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={logoOffsetX}
                              onChange={(e) => setLogoOffsetX(parseInt(e.target.value, 10))}
                              className="flex-1 accent-emerald-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setLogoOffsetX((x) => x + 1)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="+1px w prawo"
                            >
                              +1px
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoOffsetX((x) => x + 5)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="+5px w prawo"
                            >
                              +5px
                            </button>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>← W lewo</span>
                            <span>Środek (0)</span>
                            <span>W prawo →</span>
                          </div>
                        </div>

                        {/* Vertical Offset (Y) */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-xs">
                            <label className="text-zinc-300 font-medium">
                              Przesunięcie w pionie (Oś Y):
                            </label>
                            <span className="font-mono text-emerald-400 font-bold tabular-nums">
                              {logoOffsetY > 0 ? `+${logoOffsetY}` : logoOffsetY} px
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setLogoOffsetY((y) => y - 5)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="-5px w górę"
                            >
                              -5px
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoOffsetY((y) => y - 1)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="-1px w górę"
                            >
                              -1px
                            </button>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={logoOffsetY}
                              onChange={(e) => setLogoOffsetY(parseInt(e.target.value, 10))}
                              className="flex-1 accent-emerald-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setLogoOffsetY((y) => y + 1)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="+1px w dół"
                            >
                              +1px
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogoOffsetY((y) => y + 5)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                              title="+5px w dół"
                            >
                              +5px
                            </button>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>↑ W górę</span>
                            <span>Środek (0)</span>
                            <span>W dół ↓</span>
                          </div>
                        </div>

                        {/* Zoom / Scale */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-xs">
                            <label className="text-zinc-300 font-medium">
                              Rozmiar / Powiększenie znaku:
                            </label>
                            <span className="font-mono text-emerald-400 font-bold tabular-nums">
                              {logoScale}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setLogoScale((s) => Math.max(50, s - 5))}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                            >
                              -5%
                            </button>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={logoScale}
                              onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                              className="flex-1 accent-emerald-500 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setLogoScale((s) => Math.min(150, s + 5))}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-white/10 cursor-pointer"
                            >
                              +5%
                            </button>
                          </div>
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            <span>50% (Mniejsze)</span>
                            <span>100% (Standard)</span>
                            <span>150% (Większe)</span>
                          </div>
                        </div>
                      </div>

                      {/* Directional D-Pad for Instant Nudging */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 flex flex-col items-center justify-center space-y-2">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block text-center mb-1">
                          Szybkie przesuwanie strzałkami (D-Pad):
                        </span>

                        <div className="grid grid-cols-3 gap-1.5 w-36">
                          <div />
                          <button
                            type="button"
                            onClick={() => setLogoOffsetY((y) => y - 3)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500/20 text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                            title="Przesuń w górę"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <div />

                          <button
                            type="button"
                            onClick={() => setLogoOffsetX((x) => x - 3)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500/20 text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                            title="Przesuń w lewo"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoOffsetX(0);
                              setLogoOffsetY(0);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all"
                            title="Środek (0,0)"
                          >
                            (0,0)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoOffsetX((x) => x + 3)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500/20 text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                            title="Przesuń w prawo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <div />
                          <button
                            type="button"
                            onClick={() => setLogoOffsetY((y) => y + 3)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:bg-emerald-500/20 text-white border border-white/10 flex items-center justify-center cursor-pointer transition-all shadow-sm"
                            title="Przesuń w dół"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div />
                        </div>
                      </div>

                      {/* Main Save Action Button */}
                      <button
                        type="button"
                        onClick={handleSaveAdjustedLogo}
                        disabled={savingAdjustedLogo}
                        className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl cursor-pointer flex items-center justify-center gap-2.5"
                      >
                        {savingAdjustedLogo ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Zapisywanie i generowanie ikon 1:1...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Zastosuj i Zapisz wycentrowane logo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload New Logo Card (Alternative) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/10">
                      <Upload className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lub wgraj zupełnie nowy plik logo:
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Po wybraniu nowego pliku ze smartfona lub komputera, od razu pojawi się on w powyższym oknie centrowania. Będziesz mógł go natychmiast wyśrodkować przed ostatecznym zapisem!
                  </p>

                  <label className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 bg-zinc-950/50 hover:bg-zinc-950/80 group">
                    <Upload className="w-7 h-7 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition-colors">
                        Wybierz plik ze zdjęciem logo
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 block">
                        Formaty: JPG, PNG, WEBP
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct File Instructions */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-mono text-xs">📁</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Alternatywa: Bezpośrednie wrzucenie do plików projektu
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Jeśli wolisz wrzucić plik bezpośrednio do repozytorium GitHub lub folderu projektu na serwerze:
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 font-mono text-xs text-emerald-400 space-y-1">
                    <div>1. Zmień nazwę swojego pliku na: <span className="text-white font-bold">logo.jpg</span></div>
                    <div>2. Umieść go w ścieżce: <span className="text-white font-bold">public/logo.jpg</span></div>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Strona natychmiast zacznie z niego korzystać, a po wejściu w Google Search Console i kliknięciu „Poproś o zaindeksowanie” Twoja własna ikonka pojawi się w wynikach wyszukiwania Google.
                  </p>
                </div>
              </div>
            ) : (
              <>

            {/* Filters and search toolbar */}
            <div className="p-4 border-b border-white/8 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Szukaj po nazwisku, nr zamówienia, telefonie..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="Nowe">Nowe</option>
                  <option value="Przygotowane">Przygotowane</option>
                  <option value="Wysłane">Wysłane</option>
                  <option value="Zrealizowane">Zrealizowane</option>
                </select>

                {orders.length > 0 && (
                  isConfirmClearAll ? (
                    <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-500/40 px-2 py-1 rounded-xl">
                      <span className="text-[11px] text-red-200 font-semibold">Usunąć wszystkie {orders.length} zamówień?</span>
                      <button
                        type="button"
                        onClick={handleClearAllOrders}
                        disabled={deletingId === 'all'}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                      >
                        {deletingId === 'all' ? '...' : 'Tak, usuń wszystkie'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmClearAll(false)}
                        className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors cursor-pointer"
                      >
                        Anuluj
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearAll(true)}
                      title="Wyczyść wszystkie zamówienia z bazy"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-medium transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden sm:inline">Wyczyść listę</span>
                    </button>
                  )
                )}

                <button
                  onClick={() => fetchOrders()}
                  disabled={loading}
                  title="Odśwież"
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Notification Banner after delete / action */}
            {deleteNotice && (
              <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between">
                <span>✓ {deleteNotice}</span>
                <button
                  type="button"
                  onClick={() => setDeleteNotice(null)}
                  className="text-emerald-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Spreadsheet Table */}
            <div className="flex-1 overflow-auto">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>Brak zamówień spełniających kryteria.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-white/10 text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 pl-5">Nr / Data</th>
                      <th className="p-3">Klient</th>
                      <th className="p-3">Dostawa & Adres / Paczkomat</th>
                      <th className="p-3">Płatność</th>
                      <th className="p-3">Kwota</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Nr przesyłki (InPost)</th>
                      <th className="p-3 pr-5 text-right">Usuń</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {filteredOrders.map((order) => {
                      const dateStr = new Date(order.createdAt).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const currentTracking =
                        editingTracking[order.id] !== undefined
                          ? editingTracking[order.id]
                          : order.fulfillment.trackingNumber || '';

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Order ID & Date */}
                          <td className="p-3 pl-5 whitespace-nowrap">
                            <span className="font-mono font-bold text-white text-xs block">
                              {order.id}
                            </span>
                            <span className="text-[10px] text-zinc-500">{dateStr}</span>
                          </td>

                          {/* Customer */}
                          <td className="p-3">
                            <span className="font-semibold text-white block">
                              {order.customer.fullName}
                            </span>
                            <div className="text-[11px] text-zinc-400 flex flex-col">
                              <span>📞 {order.customer.phone}</span>
                              <span className="text-zinc-500 truncate max-w-[180px]">
                                ✉️ {order.customer.email}
                              </span>
                            </div>
                          </td>

                          {/* Delivery */}
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
                              <Truck className="w-3 h-3" />
                              {order.delivery.method === 'paczkomat'
                                ? `Paczkomat ${order.delivery.paczkomatName || ''}`
                                : 'Kurier pod drzwi'}
                            </span>
                            <span className="text-[11px] text-zinc-300 block truncate max-w-[220px]">
                              {order.delivery.addressOrLocker}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              {order.delivery.postalCode} {order.delivery.city}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="p-3 whitespace-nowrap">
                            <span className="text-[11px] font-medium text-zinc-300 block">
                              {order.payment.method === 'cod' && '💵 Za pobraniem'}
                              {order.payment.method === 'blik_phone' && '📱 BLIK na telefon'}
                              {order.payment.method === 'transfer' && '🏦 Przelew bankowy'}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {order.payment.status}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-bold text-white tabular-nums">
                              {order.items.totalPrice} zł
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              {order.items.quantity} szt.
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="p-3 whitespace-nowrap">
                            <select
                              value={order.fulfillment.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  order.id,
                                  e.target.value as Order['fulfillment']['status']
                                )
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                order.fulfillment.status === 'Nowe'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                  : order.fulfillment.status === 'Przygotowane'
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  : order.fulfillment.status === 'Wysłane'
                                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                                  : order.fulfillment.status === 'Zrealizowane'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                              }`}
                            >
                              <option value="Nowe">Nowe</option>
                              <option value="Przygotowane">Przygotowane</option>
                              <option value="Wysłane">Wysłane</option>
                              <option value="Zrealizowane">Zrealizowane</option>
                              <option value="Anulowane">Anulowane</option>
                            </select>
                          </td>

                          {/* Tracking number input + save */}
                          <td className="p-3 pr-5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Wpisz nr paczki (InPost)"
                                value={currentTracking}
                                onChange={(e) =>
                                  setEditingTracking({
                                    ...editingTracking,
                                    [order.id]: e.target.value,
                                  })
                                }
                                className="w-36 px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                              />
                              {editingTracking[order.id] !== undefined &&
                                editingTracking[order.id] !==
                                  (order.fulfillment.trackingNumber || '') && (
                                  <button
                                    onClick={() => handleSaveTracking(order.id)}
                                    disabled={savingId === order.id}
                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors cursor-pointer"
                                    title="Zapisz numer paczki"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                )}
                            </div>
                          </td>

                          {/* Delete Action */}
                          <td className="p-3 pr-5 whitespace-nowrap text-right">
                            {confirmDeleteId === order.id ? (
                              <div className="inline-flex items-center gap-1.5 bg-red-950/90 border border-red-500/40 p-1 rounded-lg">
                                <span className="text-[10px] text-red-200 font-semibold pl-1">Usunąć?</span>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDelete(order.id)}
                                  disabled={deletingId === order.id}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded transition-colors cursor-pointer"
                                >
                                  {deletingId === order.id ? '...' : 'Tak, usuń'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors cursor-pointer"
                                >
                                  Anuluj
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(order.id)}
                                title="Usuń to zamówienie z bazy"
                                className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-red-300 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Usuń</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer info notice */}
            <div className="p-3.5 border-t border-white/8 bg-zinc-950/70 text-[11px] text-zinc-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronizacja z Arkuszami Google & kopia zapasowa na dysku</span>
              </div>
              <div>
                <span>Limit w tym miesiącu (3 500 zł): </span>
                <strong className="text-white">
                  {remainingLimit > 0 ? `Pozostało ${remainingLimit} zł do limitu` : 'Osiągnięto limit'}
                </strong>
              </div>
            </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
