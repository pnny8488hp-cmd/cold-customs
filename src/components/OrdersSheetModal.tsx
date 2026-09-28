import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Search, CheckCircle2, Clock, Truck, 
  Package, RefreshCw, Save, ExternalLink, ShieldAlert,
  Lock, KeyRound, LogOut, Eye, EyeOff, Trash2
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

  // Stock inventory management (separate for brakes and plates)
  const [stockBrakes, setStockBrakes] = useState<number | string>(10);
  const [stockPlates, setStockPlates] = useState<number | string>(15);
  const [savingStock, setSavingStock] = useState(false);
  const [stockSavedMessage, setStockSavedMessage] = useState(false);

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

  const fetchOrders = async (overridePin?: string) => {
    const currentPin = overridePin || getSavedPin();
    if (!currentPin) return;

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { 'x-admin-pin': currentPin },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setIsAuthenticated(true);
        fetchStock();
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

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setVerifying(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/orders/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        sessionStorage.setItem('ubb_admin_pin', password.trim());
        setIsAuthenticated(true);
        fetchOrders(password.trim());
      } else {
        setAuthError(data.error || 'Nieprawidłowe hasło dostępu.');
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': getSavedPin(),
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': getSavedPin(),
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Czy na pewno chcesz trwale usunąć zamówienie ${orderId} z bazy?`)) {
      return;
    }

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
      } else {
        alert('Nie udało się usunąć zamówienia. Sprawdź hasło administratora.');
      }
    } catch (e) {
      console.error('Błąd usuwania:', e);
      alert('Błąd połączenia podczas usuwania zamówienia.');
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
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/15 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Panel Właściciela Sklepu
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Arkusz z danymi klientów i adresami Paczkomatów jest chroniony tajnym hasłem oraz blokadą anty-bruteforce (max 5 prób).
              </p>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Wpisz hasło administratora"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-white/15 text-white placeholder-zinc-500 text-sm tracking-normal focus:outline-none focus:border-emerald-500 transition-colors"
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
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {verifying ? 'Weryfikacja...' : 'Odblokuj arkusz'}
              </button>
            </form>

            <div className="text-[11px] text-zinc-500 pt-2 border-t border-white/5">
              Hasło możesz w każdej chwili zmienić w pliku <code className="text-zinc-300">.env.local</code> (<code className="text-emerald-400">ADMIN_PASSWORD</code>).
            </div>
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
                      Platy:
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="number"
                        min="0"
                        value={stockPlates}
                        onChange={(e) => setStockPlates(e.target.value)}
                        className="w-12 px-1.5 py-0.5 bg-zinc-950 border border-white/15 rounded-lg text-xs font-bold text-white text-center tabular-nums focus:outline-none focus:border-emerald-500"
                        title="Dostępne sztuki tablic Front Plate"
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
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Usuń to zamówienie z bazy"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer inline-flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      </motion.div>
    </div>
  );
};
