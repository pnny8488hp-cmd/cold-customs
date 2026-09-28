import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function saveOriginalImagesPlugin() {
  return {
    name: 'save-original-images-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/save-original-images', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { slot, base64, ext = 'jpg' } = JSON.parse(body);
              const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const publicDir = path.resolve(import.meta.dirname, 'public/images');
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              }
              // Clean up previous files for this slot with any extension
              const existingFiles = fs.readdirSync(publicDir);
              for (const f of existingFiles) {
                if (f.startsWith(`${slot}.`)) {
                  try { fs.unlinkSync(path.join(publicDir, f)); } catch {}
                }
              }
              const filename = `${slot}.${ext}`;
              const filePath = path.join(publicDir, filename);
              fs.writeFileSync(filePath, buffer);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, url: `/images/${filename}?t=${Date.now()}` }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else if (req.method === 'GET') {
          try {
            const publicDir = path.resolve(import.meta.dirname, 'public/images');
            const found: Record<string, string> = {};
            if (fs.existsSync(publicDir)) {
              const files = fs.readdirSync(publicDir);
              for (const file of files) {
                const [slot] = file.split('.');
                const filePath = path.join(publicDir, file);
                try {
                  const stat = fs.statSync(filePath);
                  found[slot] = `/images/${file}?t=${stat.mtimeMs}`;
                } catch {
                  found[slot] = `/images/${file}?t=${Date.now()}`;
                }
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, images: found }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        } else if (req.method === 'DELETE') {
          try {
            const publicDir = path.resolve(import.meta.dirname, 'public/images');
            if (fs.existsSync(publicDir)) {
              const files = fs.readdirSync(publicDir);
              for (const file of files) {
                fs.unlinkSync(path.join(publicDir, file));
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        } else {
          res.writeHead(404);
          res.end();
        }
      });
    },
  };
}

function stripeCheckoutPlugin() {
  return {
    name: 'stripe-checkout-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/create-checkout-session', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const stripeKey = process.env.STRIPE_SECRET_KEY;

            if (!stripeKey || stripeKey.trim() === '' || !stripeKey.startsWith('sk_')) {
              // Return informational fallback when key is not configured yet
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({
                mock: true,
                message: 'Płatność symulowana (brak klucza STRIPE_SECRET_KEY w .env.local). Wpisz swój klucz testowy sk_test_... ze stripe.com, aby uruchomić prawdziwy BLIK / karty.',
              }));
            }

            const { default: Stripe } = await import('stripe');
            const stripe = new Stripe(stripeKey);
            const origin = req.headers.origin || 'http://localhost:3000';
            const { quantity = 1, formData = {}, deliveryMethod = 'paczkomat' } = data;
            const priceInGrosze = 79900; // 799.00 PLN

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card', 'blik', 'p24'],
              line_items: [
                {
                  price_data: {
                    currency: 'pln',
                    product_data: {
                      name: 'Ultra Bee Brakes - Tylny Układ Hamulcowy',
                      description: `Plug & Play | Dostawa: ${deliveryMethod === 'paczkomat' ? 'Paczkomat InPost' : 'Kurier'} | Punkt: ${formData.addressOrLocker || '-'}`,
                    },
                    unit_amount: priceInGrosze,
                  },
                  quantity: Number(quantity) || 1,
                },
              ],
              mode: 'payment',
              customer_email: formData.email || undefined,
              metadata: {
                fullName: formData.fullName || '',
                phone: formData.phone || '',
                deliveryMethod: deliveryMethod,
                addressOrLocker: formData.addressOrLocker || '',
                city: formData.city || '',
                postalCode: formData.postalCode || '',
              },
              success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${origin}/?payment=cancelled`,
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ url: session.url }));
          } catch (err: any) {
            console.error('Błąd Stripe:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

function ordersManagementPlugin() {
  const dataDir = path.resolve(import.meta.dirname, 'data');
  const ordersFile = path.join(dataDir, 'orders.json');

  function readOrders(): any[] {
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, '[]', 'utf-8');
      const content = fs.readFileSync(ordersFile, 'utf-8');
      return JSON.parse(content || '[]');
    } catch {
      return [];
    }
  }

  function writeOrders(orders: any[]) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');
  }

  const stockFile = path.join(dataDir, 'stock.json');

  function readStock(): { stock: number; updatedAt: string } {
    try {
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(stockFile)) {
        const initial = { stock: 10, updatedAt: new Date().toISOString() };
        fs.writeFileSync(stockFile, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
      }
      const content = fs.readFileSync(stockFile, 'utf-8');
      return JSON.parse(content || '{"stock": 10}');
    } catch {
      return { stock: 10, updatedAt: new Date().toISOString() };
    }
  }

  function writeStock(count: number): { stock: number; updatedAt: string } {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const data = {
      stock: Math.max(0, parseInt(String(count), 10) || 0),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(stockFile, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }

  async function sendOrderNotificationEmail(order: any) {
    const notificationEmail = process.env.NOTIFICATION_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    console.log(`\n======================================================`);
    console.log(`📦 NOWE ZAMÓWIENIE W SKLEPIE: ${order.id}`);
    console.log(`👤 Klient: ${order.customer?.fullName} | Tel: ${order.customer?.phone} | Email: ${order.customer?.email}`);
    console.log(`📍 Dostawa: ${order.delivery?.method === 'paczkomat' ? 'Paczkomat InPost' : 'Kurier'} - ${order.delivery?.addressOrLocker}`);
    console.log(`💰 Kwota: ${order.items?.totalPrice} zł (${order.items?.quantity} szt.) | Płatność: ${order.payment?.method}`);
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
          text: `Nowe zamówienie w sklepie Cold Customs!
Numer: ${order.id}
Klient: ${order.customer?.fullName}
Telefon: ${order.customer?.phone}
Email: ${order.customer?.email}
Dostawa: ${order.delivery?.method === 'paczkomat' ? 'Paczkomat: ' + (order.delivery?.paczkomatName || '') : 'Kurier'}
Adres/Punkt: ${order.delivery?.addressOrLocker}, ${order.delivery?.postalCode} ${order.delivery?.city}
Produkt: Ultra Bee Brakes x ${order.items?.quantity} szt.
Kwota do zapłaty: ${order.items?.totalPrice} zł
Forma płatności: ${order.payment?.method}
Status: ${order.payment?.status}`,
        });
        console.log(`✉️ Wysłano e-mail z powiadomieniem na: ${notificationEmail}`);
      } catch (err: any) {
        console.error('Błąd wysyłki e-mail:', err.message);
      }
    }
  }

  async function sendToGoogleSheets(order: any) {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.startsWith('http')) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
        redirect: 'follow',
      });
      console.log(`📊 Zapisano zamówienie ${order.id} w prywatnym Arkuszu Google!`);
    } catch (err: any) {
      console.error('Błąd zapisu w Google Sheets:', err.message);
    }
  }

  const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

  function isRateLimited(ip: string): boolean {
    const record = failedAttempts.get(ip);
    if (!record) return false;
    if (Date.now() < record.lockedUntil) return true;
    failedAttempts.delete(ip);
    return false;
  }

  function recordFailedAttempt(ip: string) {
    const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minut blokady po 5 błędach
    }
    failedAttempts.set(ip, record);
  }

  function getExpectedSecret(): string {
    return process.env.ADMIN_PASSWORD || process.env.ADMIN_PIN || 'MojeHasloUBB2026!';
  }

  return {
    name: 'orders-management-plugin',
    configureServer(server: any) {
      // Public anonymized recent sales for 100% legal & RODO-compliant live social proof
      server.middlewares.use('/api/recent-sales', (req: any, res: any) => {
        if (req.method !== 'GET') {
          res.writeHead(405);
          return res.end();
        }

        try {
          const orders = readOrders();
          const recent = orders.slice(0, 6).map((o: any) => {
            const date = new Date(o.createdAt);
            const now = new Date();
            const diffMs = Math.max(0, now.getTime() - date.getTime());
            const diffMin = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = 'przed chwilą';
            if (diffMin >= 1 && diffMin < 60) {
              timeAgo = `${diffMin} min temu`;
            } else if (diffHours >= 1 && diffHours < 24) {
              timeAgo = `${diffHours} godz. temu`;
            } else if (diffDays === 1) {
              timeAgo = 'wczoraj';
            } else if (diffDays > 1) {
              timeAgo = `${diffDays} dni temu`;
            }

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

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ sales: recent }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ sales: [] }));
        }
      });

      // API: Stock count
      server.middlewares.use('/api/stock', (req: any, res: any) => {
        if (req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify(readStock()));
        }

        if (req.method === 'POST') {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || parsedUrl.searchParams.get('pin') || parsedUrl.searchParams.get('password');
          const expected = getExpectedSecret().trim();

          if (submitted !== expected) {
            res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: 'Brak uprawnień. Nieprawidłowe hasło.' }));
          }

          let body = '';
          req.on('data', (c: any) => { body += c; });
          req.on('end', () => {
            try {
              const { stock } = JSON.parse(body || '{}');
              if (stock === undefined || isNaN(Number(stock))) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Nieprawidłowa liczba sztuk' }));
              }
              const updated = writeStock(Number(stock));
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ success: true, ...updated }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.writeHead(405);
        res.end();
      });

      // Verify admin Password with rate-limiting
      server.middlewares.use('/api/orders/verify-pin', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          return res.end();
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        if (isRateLimited(ip)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            valid: false, 
            error: 'Zbyt wiele nieudanych prób logowania. Dostęp zablokowany na 15 minut.' 
          }));
        }

        let body = '';
        req.on('data', (c: any) => { body += c; });
        req.on('end', () => {
          try {
            const { pin, password } = JSON.parse(body || '{}');
            const submitted = (password || pin || '').trim();
            const expected = getExpectedSecret().trim();

            if (submitted && submitted === expected) {
              failedAttempts.delete(ip);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ valid: true }));
            }

            recordFailedAttempt(ip);
            const currentRecord = failedAttempts.get(ip);
            const remainingTries = Math.max(0, 5 - (currentRecord?.count || 0));

            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              valid: false, 
              error: remainingTries > 0 
                ? `Nieprawidłowe hasło. Pozostało prób: ${remainingTries}` 
                : 'Zbyt wiele prób. Panel zablokowany na 15 minut.' 
            }));
          } catch {
            res.writeHead(400);
            res.end();
          }
        });
      });

      // Export CSV
      server.middlewares.use('/api/orders/export-csv', (req: any, res: any) => {
        const parsedUrl = new URL(req.url, 'http://localhost');
        const submitted = parsedUrl.searchParams.get('pin') || parsedUrl.searchParams.get('password') || req.headers['x-admin-pin'] || req.headers['x-admin-password'];
        const expected = getExpectedSecret().trim();

        if (submitted !== expected) {
          res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Brak uprawnień. Nieprawidłowe hasło.');
        }

        const orders = readOrders();
        let csv = '\uFEFFNumer zamówienia;Data;Klient;Telefon;Email;Dostawa;Paczkomat / Adres;Ilość;Kwota PLN;Płatność;Status;Nr przesyłki\n';
        for (const o of orders) {
          csv += `"${o.id}";"${new Date(o.createdAt).toLocaleString('pl-PL')}";"${o.customer?.fullName || ''}";"${o.customer?.phone || ''}";"${o.customer?.email || ''}";"${o.delivery?.method || ''}";"${o.delivery?.addressOrLocker || ''}";"${o.items?.quantity || 1}";"${o.items?.totalPrice || 799}";"${o.payment?.method || ''}";"${o.fulfillment?.status || ''}";"${o.fulfillment?.trackingNumber || ''}"\n`;
        }
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="zamowienia_cold_customs.csv"',
        });
        res.end(csv);
      });

      // GET /api/orders & POST /api/orders
      server.middlewares.use('/api/orders', (req: any, res: any) => {
        const parsedUrl = new URL(req.url, 'http://localhost');
        const urlParts = parsedUrl.pathname.split('/').filter(Boolean);
        const orderId = urlParts[0];

        // Public order submission
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c: any) => { body += c; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const orders = readOrders();
              const newOrder = {
                id: data.id || `UBB-${Math.floor(10000 + Math.random() * 90000)}`,
                createdAt: new Date().toISOString(),
                customer: data.customer || {},
                delivery: data.delivery || {},
                items: data.items || { title: 'Ultra Bee Brakes', quantity: 1, pricePerUnit: 799, totalPrice: 799 },
                payment: data.payment || { method: 'cod', status: 'Za pobraniem' },
                fulfillment: {
                  status: 'Nowe',
                  trackingNumber: '',
                  notes: '',
                },
              };

              orders.unshift(newOrder);
              writeOrders(orders);

              try {
                const orderQty = Number(newOrder.items?.quantity) || 1;
                const currentStock = readStock();
                writeStock(Math.max(0, currentStock.stock - orderQty));
              } catch {}

              sendOrderNotificationEmail(newOrder).catch(() => {});
              sendToGoogleSheets(newOrder).catch(() => {});

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, order: newOrder }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // Protected routes: GET and PATCH require Password
        const submitted = req.headers['x-admin-password'] || req.headers['x-admin-pin'] || parsedUrl.searchParams.get('pin') || parsedUrl.searchParams.get('password');
        const expected = getExpectedSecret().trim();
        if (submitted !== expected) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Dostęp chroniony hasłem' }));
        }

        if (req.method === 'GET' && !orderId) {
          const orders = readOrders();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, orders }));
        }

        if (req.method === 'PATCH' && orderId) {
          let body = '';
          req.on('data', (c: any) => { body += c; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const orders = readOrders();
              const idx = orders.findIndex((o: any) => o.id === orderId);
              if (idx !== -1) {
                if (data.fulfillmentStatus) orders[idx].fulfillment.status = data.fulfillmentStatus;
                if (data.trackingNumber !== undefined) orders[idx].fulfillment.trackingNumber = data.trackingNumber;
                if (data.notes !== undefined) orders[idx].fulfillment.notes = data.notes;
                writeOrders(orders);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, order: orders[idx] }));
              }
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Nie znaleziono zamówienia' }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === 'DELETE' && orderId) {
          try {
            const orders = readOrders();
            const filtered = orders.filter((o: any) => o.id !== orderId);
            if (filtered.length !== orders.length) {
              writeOrders(filtered);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              return res.end(JSON.stringify({ success: true, deletedId: orderId }));
            }
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: 'Nie znaleziono zamówienia do usunięcia' }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        res.writeHead(404);
        res.end();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), saveOriginalImagesPlugin(), stripeCheckoutPlugin(), ordersManagementPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/data/**',
          '**/data/orders.json',
          '**/public/images/**',
          '**/*.json',
          '**/.git/**',
        ],
      },
    },
  };
});
