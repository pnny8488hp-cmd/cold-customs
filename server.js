// server.js – Production Express server for Cold Customs sklep
// Serves the built React app + all /api/* endpoints
// Run: node server.js

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Data helpers ───────────────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
const ordersFile = path.join(dataDir, 'orders.json');

function readOrders() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, '[]', 'utf-8');
    const content = fs.readFileSync(ordersFile, 'utf-8');
    return JSON.parse(content || '[]');
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');
}

const stockFile = path.join(dataDir, 'stock.json');

function readStock() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(stockFile)) {
      const initial = { brakes: 10, plates: 15, stock: 10, updatedAt: new Date().toISOString() };
      fs.writeFileSync(stockFile, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(stockFile, 'utf-8');
    const parsed = JSON.parse(content || '{}');
    const brakes = parsed.brakes !== undefined ? parsed.brakes : (parsed.stock !== undefined ? parsed.stock : 10);
    const plates = parsed.plates !== undefined ? parsed.plates : 15;
    return {
      brakes: Math.max(0, parseInt(brakes, 10) || 0),
      plates: Math.max(0, parseInt(plates, 10) || 0),
      stock: Math.max(0, parseInt(brakes, 10) || 0),
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch {
    return { brakes: 10, plates: 15, stock: 10, updatedAt: new Date().toISOString() };
  }
}

function writeStock(stockUpdate) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const current = readStock();
  let brakes = current.brakes;
  let plates = current.plates;

  if (typeof stockUpdate === 'object' && stockUpdate !== null) {
    if (stockUpdate.brakes !== undefined) brakes = Math.max(0, parseInt(stockUpdate.brakes, 10) || 0);
    if (stockUpdate.plates !== undefined) plates = Math.max(0, parseInt(stockUpdate.plates, 10) || 0);
    if (stockUpdate.stock !== undefined && stockUpdate.brakes === undefined) {
      brakes = Math.max(0, parseInt(stockUpdate.stock, 10) || 0);
    }
  } else if (!isNaN(Number(stockUpdate))) {
    brakes = Math.max(0, parseInt(stockUpdate, 10) || 0);
  }

  const data = { 
    brakes,
    plates,
    stock: brakes,
    updatedAt: new Date().toISOString() 
  };
  fs.writeFileSync(stockFile, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

function getExpectedSecret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN || 'MojeHasloUBB2026!';
}

// ─── Rate limiting dla /api/orders/verify-pin ────────────────────────────────
const failedAttempts = new Map();

function isRateLimited(ip) {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() < record.lockedUntil) return true;
  failedAttempts.delete(ip);
  return false;
}

function recordFailedAttempt(ip) {
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedAttempts.set(ip, record);
}

// ─── E-mail notification ─────────────────────────────────────────────────────
async function sendOrderNotificationEmail(order) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  console.log(`\n======================================================`);
  console.log(`📦 NOWE ZAMÓWIENIE: ${order.id}`);
  console.log(`👤 Klient: ${order.customer?.fullName} | Tel: ${order.customer?.phone} | Email: ${order.customer?.email}`);
  console.log(`📍 Dostawa: ${order.delivery?.method === 'paczkomat' ? 'Paczkomat InPost' : 'Kurier'} - ${order.delivery?.addressOrLocker}`);
  console.log(`💰 Kwota: ${order.items?.totalPrice} zł | Płatność: ${order.payment?.method}`);
  console.log(`======================================================\n`);

  if (notificationEmail && smtpUser && smtpPass) {
    try {
      const { default: nodemailer } = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"Ultra Bee Brakes" <${smtpUser}>`,
        to: notificationEmail,
        subject: `🔥 Nowe zamówienie ${order.id} - ${order.items?.totalPrice} zł (${order.customer?.fullName})`,
        text: `Nowe zamówienie w sklepie Cold Customs!\nNumer: ${order.id}\nKlient: ${order.customer?.fullName}\nTelefon: ${order.customer?.phone}\nEmail: ${order.customer?.email}\nDostawa: ${order.delivery?.method === 'paczkomat' ? 'Paczkomat: ' + (order.delivery?.paczkomatName || '') : 'Kurier'}\nAdres/Punkt: ${order.delivery?.addressOrLocker}, ${order.delivery?.postalCode} ${order.delivery?.city}\nProdukt: Ultra Bee Brakes x ${order.items?.quantity} szt.\nKwota do zapłaty: ${order.items?.totalPrice} zł\nForma płatności: ${order.payment?.method}\nStatus: ${order.payment?.status}`,
      });
      console.log(`✉️ E-mail wysłany na: ${notificationEmail}`);
    } catch (err) {
      console.error('Błąd wysyłki e-mail:', err.message);
    }
  }
}

async function sendToGoogleSheets(order) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('http')) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    console.log(`📊 Zapisano zamówienie ${order.id} w Google Sheets!`);
  } catch (err) {
    console.error('Błąd Google Sheets:', err.message);
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─── API: Recent sales (publiczny) ───────────────────────────────────────────
app.get('/api/recent-sales', (req, res) => {
  try {
    const orders = readOrders();
    const recent = orders.slice(0, 6).map((o) => {
      const date = new Date(o.createdAt);
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - date.getTime());
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = 'przed chwilą';
      if (diffMin >= 1 && diffMin < 60) timeAgo = `${diffMin} min temu`;
      else if (diffHours >= 1 && diffHours < 24) timeAgo = `${diffHours} godz. temu`;
      else if (diffDays === 1) timeAgo = 'wczoraj';
      else if (diffDays > 1) timeAgo = `${diffDays} dni temu`;

      return {
        id: o.id,
        city: o.delivery?.city || 'Polska',
        paczkomat: o.delivery?.paczkomatName || '',
        deliveryMethod: o.delivery?.method === 'paczkomat' ? 'Paczkomat InPost' : 'Kurier',
        payment: o.payment?.method === 'cod' ? 'Płatność za pobraniem' : (o.payment?.method === 'blik_phone' ? 'BLIK na telefon' : 'Przelew bankowy'),
        quantity: o.items?.quantity || 1,
        timeAgo,
      };
    });
    res.json({ sales: recent });
  } catch {
    res.json({ sales: [] });
  }
});

// ─── API: Verify admin pin ────────────────────────────────────────────────────
app.post('/api/orders/verify-pin', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ valid: false, error: 'Zbyt wiele nieudanych prób logowania. Dostęp zablokowany na 15 minut.' });
  }

  const { pin, password } = req.body || {};
  const submitted = (password || pin || '').trim();
  const expected = getExpectedSecret().trim();

  if (submitted && submitted === expected) {
    failedAttempts.delete(ip);
    return res.json({ valid: true });
  }

  recordFailedAttempt(ip);
  const currentRecord = failedAttempts.get(ip);
  const remainingTries = Math.max(0, 5 - (currentRecord?.count || 0));
  res.status(401).json({
    valid: false,
    error: remainingTries > 0
      ? `Nieprawidłowe hasło. Pozostało prób: ${remainingTries}`
      : 'Zbyt wiele prób. Panel zablokowany na 15 minut.',
  });
});

// ─── API: Export CSV ──────────────────────────────────────────────────────────
app.get('/api/orders/export-csv', (req, res) => {
  const submitted = req.query.pin || req.query.password || req.headers['x-admin-pin'] || req.headers['x-admin-password'];
  const expected = getExpectedSecret().trim();

  if (submitted !== expected) {
    return res.status(401).type('text').send('Brak uprawnień. Nieprawidłowe hasło.');
  }

  const orders = readOrders();
  let csv = '\uFEFFNumer zamówienia;Data;Klient;Telefon;Email;Dostawa;Paczkomat / Adres;Ilość;Kwota PLN;Płatność;Status;Nr przesyłki\n';
  for (const o of orders) {
    csv += `"${o.id}";"${new Date(o.createdAt).toLocaleString('pl-PL')}";"${o.customer?.fullName || ''}";"${o.customer?.phone || ''}";"${o.customer?.email || ''}";"${o.delivery?.method || ''}";"${o.delivery?.addressOrLocker || ''}";"${o.items?.quantity || 1}";"${o.items?.totalPrice || 799}";"${o.payment?.method || ''}";"${o.fulfillment?.status || ''}";"${o.fulfillment?.trackingNumber || ''}"\n`;
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="zamowienia_cold_customs.csv"');
  res.send(csv);
});

// ─── API: Orders CRUD ─────────────────────────────────────────────────────────
// POST /api/orders – publiczny zapis zamówienia
app.post('/api/orders', async (req, res) => {
  try {
    const data = req.body || {};
    const orders = readOrders();
    const newOrder = {
      id: data.id || `UBB-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      customer: data.customer || {},
      delivery: data.delivery || {},
      items: data.items || { title: 'Ultra Bee Brakes', quantity: 1, pricePerUnit: 799, totalPrice: 799 },
      payment: data.payment || { method: 'cod', status: 'Za pobraniem' },
      fulfillment: { status: 'Nowe', trackingNumber: '', notes: '' },
    };
    orders.unshift(newOrder);
    writeOrders(orders);

    // Automatycznie zaktualizuj stan magazynowy po złożeniu zamówienia
    try {
      const currentStock = readStock();
      let newBrakes = currentStock.brakes;
      let newPlates = currentStock.plates;

      if (Array.isArray(newOrder.items?.list) && newOrder.items.list.length > 0) {
        for (const item of newOrder.items.list) {
          const qty = Number(item.quantity) || 1;
          if (item.productId === 'front-plate-cold-customs' || (item.id && item.id.includes('plate'))) {
            newPlates = Math.max(0, newPlates - qty);
          } else {
            newBrakes = Math.max(0, newBrakes - qty);
          }
        }
      } else {
        const orderQty = Number(newOrder.items?.quantity) || 1;
        newBrakes = Math.max(0, newBrakes - orderQty);
      }
      writeStock({ brakes: newBrakes, plates: newPlates });
    } catch {}

    sendOrderNotificationEmail(newOrder).catch(() => {});
    sendToGoogleSheets(newOrder).catch(() => {});
    res.json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Stock (Stan magazynowy) ───────────────────────────────────────────
// GET /api/stock – publiczny stan magazynowy (brakes & plates)
app.get('/api/stock', (req, res) => {
  try {
    const data = readStock();
    res.json(data);
  } catch {
    res.json({ brakes: 10, plates: 15, stock: 10 });
  }
});

// POST /api/stock – zmiana stanu magazynowego z panelu admina (chroniona)
app.post('/api/stock', (req, res) => {
  const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || req.query.pin || req.query.password;
  const expected = getExpectedSecret().trim();
  if (submitted !== expected) {
    return res.status(401).json({ error: 'Dostęp chroniony hasłem' });
  }

  const { stock, brakes, plates } = req.body || {};
  if (brakes === undefined && plates === undefined && stock === undefined) {
    return res.status(400).json({ error: 'Podaj liczbę sztuk dla hamulców lub platów' });
  }

  const updated = writeStock({ brakes, plates, stock });
  res.json({ success: true, ...updated });
});

// GET /api/orders – chroniony hasłem
app.get('/api/orders', (req, res) => {
  const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || req.query.pin || req.query.password;
  const expected = getExpectedSecret().trim();
  if (submitted !== expected) {
    return res.status(401).json({ error: 'Dostęp chroniony hasłem' });
  }
  const orders = readOrders();
  res.json({ success: true, orders });
});

// PATCH /api/orders/:id – zmiana statusu
app.patch('/api/orders/:id', (req, res) => {
  const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || req.query.pin || req.query.password;
  const expected = getExpectedSecret().trim();
  if (submitted !== expected) {
    return res.status(401).json({ error: 'Dostęp chroniony hasłem' });
  }

  const { id } = req.params;
  const data = req.body || {};
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Nie znaleziono zamówienia' });

  if (data.fulfillmentStatus) orders[idx].fulfillment.status = data.fulfillmentStatus;
  if (data.trackingNumber !== undefined) orders[idx].fulfillment.trackingNumber = data.trackingNumber;
  if (data.notes !== undefined) orders[idx].fulfillment.notes = data.notes;
  writeOrders(orders);
  res.json({ success: true, order: orders[idx] });
});

// DELETE /api/orders/:id – usuwanie zamówienia
app.delete('/api/orders/:id', (req, res) => {
  const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || req.query.pin || req.query.password;
  const expected = getExpectedSecret().trim();
  if (submitted !== expected) {
    return res.status(401).json({ error: 'Dostęp chroniony hasłem' });
  }

  const { id } = req.params;
  const orders = readOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) {
    return res.status(404).json({ error: 'Nie znaleziono zamówienia do usunięcia' });
  }
  writeOrders(filtered);
  res.json({ success: true, deletedId: id });
});

// ─── API: Save original images ────────────────────────────────────────────────
app.post('/api/save-original-images', (req, res) => {
  try {
    const { slot, base64, ext = 'jpg' } = req.body || {};
    if (!slot || !base64) return res.status(400).json({ error: 'Brak parametrów' });
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const publicDir = path.join(__dirname, 'public/images');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const existingFiles = fs.readdirSync(publicDir);
    for (const f of existingFiles) {
      if (f.startsWith(`${slot}.`)) {
        try { fs.unlinkSync(path.join(publicDir, f)); } catch {}
      }
    }
    const filename = `${slot}.${ext}`;
    fs.writeFileSync(path.join(publicDir, filename), buffer);
    res.json({ success: true, url: `/images/${filename}?t=${Date.now()}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/save-original-images', (req, res) => {
  try {
    const publicDir = path.join(__dirname, 'public/images');
    const found = {};
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        const [slot] = file.split('.');
        const stat = fs.statSync(path.join(publicDir, file));
        found[slot] = `/images/${file}?t=${stat.mtimeMs}`;
      }
    }
    res.json({ success: true, images: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serwuj zbudowanego Reacta ────────────────────────────────────────────────
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// SPA fallback – wszystkie inne ścieżki → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Cold Customs sklep uruchomiony na porcie ${PORT} (0.0.0.0)`);
  console.log(`🌐 Otwórz: http://localhost:${PORT}`);
  console.log(`🔐 Panel admina: Ctrl+Shift+O (hasło: ${getExpectedSecret()})\n`);
});

