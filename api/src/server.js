import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { integrations } from './integrations.js';
import { db } from './database.js';
import { assertProductionConfiguration, createRateLimiter, hashOtp, secureCode, signToken, verifyToken, verifyWebhookSignature } from './security.js';

assertProductionConfiguration();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((x) => x.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use((req, res, next) => { res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' }); next(); });
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed')); }, methods: ['GET', 'POST', 'PUT'], allowedHeaders: ['Authorization', 'Content-Type', 'X-Jeko-Signature'] }));
app.use(express.json({ limit: '100kb', verify: (req, _res, buffer) => { req.rawBody = buffer.toString('utf8'); } }));
app.use(createRateLimiter());
app.get('/assets/:filename', async (req, res, next) => { try { const image = await db.productImage(req.params.filename); if (!image) return next(); res.type(image.content_type).send(image.image_data); } catch (error) { next(error); } });
app.get('/assets/branding/:key', async (req, res, next) => { try { const asset = await db.brandAsset(req.params.key); if (!asset) return next(); res.type(asset.content_type).send(asset.asset_data); } catch (error) { next(error); } });
app.get('/v1/config', async (_req, res, next) => { try { const config = await db.configuration(); if (!config) return res.status(503).json({ error: 'CONFIGURATION_UNAVAILABLE' }); res.json(config); } catch (error) { next(error); } });
app.get('/v1/branding', async (_req, res, next) => { try { const config = await db.configuration(); res.json({ logoUrl: '/assets/branding/logo', faviconUrl: '/assets/branding/logo', ...(config?.branding || {}) }); } catch (error) { next(error); } });
app.use(express.static(path.resolve(__dirname, '../../web/dist'), { index: 'index.html', maxAge: '1h', etag: true }));

const calculate = (product, quantity, deliveryFee = 0, serviceFee = 2000) => { const productSubtotal = product.unitPrice * product.unitContent * quantity; return { productSubtotal, deliveryFee, serviceFee, taxes: 0, total: productSubtotal + deliveryFee + serviceFee }; };
const normalizeSchedule = (schedule = {}, commerce) => {
  if (!commerce.scheduleTypes.includes(schedule.type)) return null;
  if (schedule.type === 'scheduled') { const raw = String(schedule.date || ''); const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : (() => { const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; })(); if (!iso || Number.isNaN(Date.parse(`${iso}T00:00:00Z`))) return null; return { ...schedule, date: iso }; }
  if (schedule.type === 'recurring' && !commerce.recurringFrequencies.includes(schedule.frequency)) return null;
  return schedule;
};
const isProduction = process.env.NODE_ENV === 'production';
const auth = (req, res, next) => { const payload = verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i, '')); if (!payload) return res.status(401).json({ error: 'UNAUTHENTICATED' }); req.user = payload; next(); };
const role = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'FORBIDDEN' });
const ownership = (order, user) => ['operator', 'admin'].includes(user.role) || order.customerId === user.sub;
const notify = (customerId, type, title, body) => db.notify(customerId, type, title, body);
const safeEqual = (provided, expected) => { const a = Buffer.from(String(provided || '')); const b = Buffer.from(String(expected || '')); return a.length === b.length && crypto.timingSafeEqual(a, b); };

app.get('/health', async (_req, res) => res.json({ status: 'ok', service: 'agensy-api', persistence: process.env.DATABASE_URL ? 'postgresql' : 'development-memory' }));
app.get('/v1/products', async (req, res, next) => { try { res.json(await db.products(String(req.query.q || ''))); } catch (error) { next(error); } });
app.get('/v1/products/:id', async (req, res, next) => { try { const product = await db.product(req.params.id); if (!product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' }); res.json(product); } catch (error) { next(error); } });

app.post('/v1/auth/request-otp', createRateLimiter({ windowMs: 10 * 60_000, limit: 5 }), async (req, res, next) => {
  try {
    const phone = String(req.body.phone || '').replace(/\s/g, '');
    if (!/^\+?[0-9]{8,16}$/.test(phone)) return res.status(422).json({ error: 'PHONE_REQUIRED' });
    const code = secureCode(); await db.saveOtp(phone, hashOtp(phone, code));
    if (isProduction) await integrations.sendOtp({ phone, code });
    res.status(202).json({ delivery: isProduction ? 'whatsapp' : 'development', expiresInSeconds: 300, ...(!isProduction && process.env.ALLOW_DEMO_OTP === 'true' ? { demoCode: code } : {}) });
  } catch (error) { next(error); }
});
app.post('/v1/auth/verify-otp', createRateLimiter({ windowMs: 10 * 60_000, limit: 10 }), async (req, res, next) => {
  try {
    const phone = String(req.body.phone || '').replace(/\s/g, ''); const code = String(req.body.code || '');
    if (!(await db.consumeOtp(phone, hashOtp(phone, code)))) return res.status(401).json({ error: 'INVALID_OTP' });
    const id = `customer_${phone.replace(/\D/g, '')}`; const existing = await db.customer(id);
    const customer = existing || await db.upsertCustomer({ id, phone, role: 'customer', profileCompleted: false });
    res.json({ accessToken: signToken({ sub: customer.id, role: 'customer' }), customer });
  } catch (error) { next(error); }
});
app.post('/v1/admin/auth/login', createRateLimiter({ windowMs: 10 * 60_000, limit: 5 }), (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.ADMIN_USERNAME; const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword || !safeEqual(username, expectedUser) || !safeEqual(password, expectedPassword)) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  res.json({ accessToken: signToken({ sub: `operator_${expectedUser}`, role: 'operator' }, 60 * 60) });
});

app.put('/v1/customers/:id/profile', auth, async (req, res, next) => { try {
  if (req.user.sub !== req.params.id && !['operator', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'FORBIDDEN' });
  const profile = req.body || {}; if (!profile.businessName || !profile.managerName || !profile.businessType || !profile.country) return res.status(422).json({ error: 'INCOMPLETE_PROFILE' }); if (profile.country === 'CI' && !profile.ncc) return res.status(422).json({ error: 'NCC_REQUIRED_FOR_CI' });
  const existing = await db.customer(req.params.id); if (!existing) return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND' });
  res.json(await db.upsertCustomer({ ...existing, ...profile, profileCompleted: true }));
} catch (error) { next(error); } });

app.get('/v1/orders', auth, async (req, res, next) => { try { const customerId = ['operator', 'admin'].includes(req.user.role) ? req.query.customerId : req.user.sub; res.json(await db.orders(customerId)); } catch (error) { next(error); } });
app.get('/v1/orders/:id', auth, async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' }); if (!ownership(order, req.user)) return res.status(403).json({ error: 'FORBIDDEN' }); res.json(order); } catch (error) { next(error); } });
app.post('/v1/orders', auth, role('customer'), async (req, res, next) => { try {
  const { productId, quantity, deliveryAddress, schedule = { type: 'asap' }, instructions = '' } = req.body || {}; const product = await db.product(productId); const config = await db.configuration(); const normalizedSchedule = normalizeSchedule(schedule, config.commerce);
  if (!product || !Number.isInteger(quantity) || !deliveryAddress?.label || !normalizedSchedule) return res.status(422).json({ error: 'INVALID_ORDER' }); if (quantity < product.minQuantity || quantity > product.maxQuantity) return res.status(422).json({ error: 'QUANTITY_OUT_OF_RANGE', min: product.minQuantity, max: product.maxQuantity });
  const now = new Date().toISOString(); const order = { id: db.id('ord'), customerId: req.user.sub, product, quantity, deliveryAddress, schedule: normalizedSchedule, instructions: String(instructions).slice(0, 1000), status: 'draft', pricing: calculate(product, quantity, config.commerce.delivery.defaultFee, config.commerce.serviceFee), createdAt: now, updatedAt: now, timeline: [] }; res.status(201).json(await db.createOrder(order));
} catch (error) { next(error); } });
app.post('/v1/orders/:id/submit', auth, async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order || order.status !== 'draft') return res.status(409).json({ error: 'ORDER_CANNOT_BE_SUBMITTED' }); if (!ownership(order, req.user)) return res.status(403).json({ error: 'FORBIDDEN' }); order.status = 'submitted'; order.validationExpiresAt = new Date(Date.now() + 86400000).toISOString(); order.updatedAt = new Date().toISOString(); order.timeline.push({ status: 'submitted', at: order.updatedAt }); await db.updateOrder(order); await notify(order.customerId, 'order_submitted', 'Commande envoyée', 'Votre commande est en attente de validation Agensy.'); await integrations.notifyWhatsApp({ event: 'order_submitted', orderId: order.id }); res.json(order); } catch (error) { next(error); } });
app.post('/v1/admin/orders/:id/accept', auth, role('operator', 'admin'), async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order || !['submitted', 'adjusted'].includes(order.status)) return res.status(409).json({ error: 'ORDER_CANNOT_BE_ACCEPTED' }); if (order.validationExpiresAt && new Date(order.validationExpiresAt) < new Date()) return res.status(409).json({ error: 'ORDER_VALIDATION_EXPIRED' }); const deliveryFee = Number(req.body.deliveryFee ?? order.pricing.deliveryFee); if (!Number.isFinite(deliveryFee) || deliveryFee < 0) return res.status(422).json({ error: 'INVALID_DELIVERY_FEE' }); order.pricing = calculate(order.product, order.quantity, deliveryFee); order.deliveryDate = req.body.deliveryDate || order.deliveryDate; order.status = 'accepted'; order.updatedAt = new Date().toISOString(); order.timeline.push({ status: 'accepted', at: order.updatedAt }); order.payment = await integrations.createJekoPayment({ orderId: order.id, amount: order.pricing.total }); await db.updateOrder(order); await notify(order.customerId, 'order_accepted', 'Commande acceptée', 'Votre lien de paiement est disponible.'); res.json(order); } catch (error) { next(error); } });
app.post('/v1/admin/orders/:id/adjust', auth, role('operator', 'admin'), async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order || order.status !== 'submitted') return res.status(409).json({ error: 'ORDER_CANNOT_BE_ADJUSTED' }); const deliveryFee = Number(req.body.deliveryFee); if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || !req.body.deliveryDate || !req.body.note) return res.status(422).json({ error: 'INVALID_ADJUSTMENT' }); order.pricing = calculate(order.product, order.quantity, deliveryFee); order.deliveryDate = req.body.deliveryDate; order.adjustment = { note: String(req.body.note).slice(0, 500), proposedAt: new Date().toISOString() }; order.status = 'adjusted'; order.validationExpiresAt = new Date(Date.now() + 86400000).toISOString(); order.updatedAt = order.adjustment.proposedAt; order.timeline.push({ status: 'adjusted', at: order.updatedAt, note: order.adjustment.note }); await db.updateOrder(order); await notify(order.customerId, 'order_adjusted', 'Commande à confirmer', 'Agensy a proposé un ajustement de transport ou de date.'); res.json(order); } catch (error) { next(error); } });
app.post('/v1/webhooks/jeko', async (req, res, next) => { try { if (!verifyWebhookSignature(req.rawBody, req.headers['x-jeko-signature'])) return res.status(401).json({ error: 'INVALID_WEBHOOK_SIGNATURE' }); const { orderId } = req.body || {}; const order = await db.order(orderId); if (!order || order.status !== 'accepted') return res.status(409).json({ error: 'ORDER_CANNOT_BE_PAID' }); order.status = 'paid'; order.updatedAt = new Date().toISOString(); order.timeline.push({ status: 'paid', at: order.updatedAt }); const invoice = { id: db.id('inv'), orderId: order.id, customerId: order.customerId, amount: order.pricing.total, currency: 'XOF', status: 'pending_manual_issue', createdAt: order.updatedAt }; order.invoiceId = invoice.id; await db.createInvoice(invoice); await db.updateOrder(order); await notify(order.customerId, 'payment_confirmed', 'Paiement confirmé', 'Votre paiement est confirmé. Votre facture sera transmise manuellement par Agensy.'); res.status(204).end(); } catch (error) { next(error); } });
app.post('/v1/admin/invoices/:id/issue', auth, role('operator', 'admin'), async (req, res, next) => { try { const invoice = await db.invoice(req.params.id); if (!invoice || invoice.status !== 'pending_manual_issue') return res.status(409).json({ error: 'INVOICE_CANNOT_BE_ISSUED' }); if (!req.body.invoiceNumber) return res.status(422).json({ error: 'INVOICE_NUMBER_REQUIRED' }); invoice.status = 'issued_manual'; invoice.invoiceNumber = String(req.body.invoiceNumber).slice(0, 100); invoice.pdfUrl = req.body.pdfUrl ? String(req.body.pdfUrl).slice(0, 2000) : null; invoice.issuedAt = new Date().toISOString(); const saved = await db.updateInvoice(invoice); await notify(invoice.customerId, 'invoice_issued', 'Facture disponible', 'Votre facture a été émise par Agensy.'); res.json(saved); } catch (error) { next(error); } });
app.post('/v1/admin/invoices/:id/whatsapp-share', auth, role('operator', 'admin'), async (req, res, next) => { try { const invoice = await db.invoice(req.params.id); if (!invoice || invoice.status !== 'issued_manual') return res.status(409).json({ error: 'INVOICE_CANNOT_BE_SHARED' }); const customer = await db.customer(invoice.customerId); const message = `Agensy Africa : votre facture ${invoice.invoiceNumber}${invoice.pdfUrl ? ` est disponible ici : ${invoice.pdfUrl}` : ' est disponible.'}`; invoice.whatsAppSharedAt = new Date().toISOString(); invoice.status = 'shared_whatsapp'; const saved = await db.updateInvoice(invoice); await notify(invoice.customerId, 'invoice_shared', 'Facture envoyée', 'Votre facture a été partagée sur WhatsApp.'); const phone = String(customer?.phone || '').replace(/\D/g, ''); res.json({ invoice: saved, whatsAppUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}` }); } catch (error) { next(error); } });
app.post('/v1/admin/orders/:id/deliver', auth, role('operator', 'admin'), async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order || order.status !== 'paid') return res.status(409).json({ error: 'ORDER_CANNOT_BE_DELIVERED' }); order.status = 'delivered'; order.updatedAt = new Date().toISOString(); order.timeline.push({ status: 'delivered', at: order.updatedAt }); await db.updateOrder(order); await notify(order.customerId, 'order_delivered', 'Commande livrée', 'Votre livraison Agensy est marquée comme effectuée.'); res.json(order); } catch (error) { next(error); } });
app.post('/v1/orders/:id/cancel', auth, async (req, res, next) => { try { const order = await db.order(req.params.id); if (!order || ['paid', 'delivered', 'cancelled'].includes(order.status)) return res.status(409).json({ error: 'ORDER_CANNOT_BE_CANCELLED' }); if (!ownership(order, req.user)) return res.status(403).json({ error: 'FORBIDDEN' }); order.status = 'cancelled'; order.updatedAt = new Date().toISOString(); order.timeline.push({ status: 'cancelled', at: order.updatedAt }); await db.updateOrder(order); await notify(order.customerId, 'order_cancelled', 'Commande annulée', 'Votre commande a été annulée.'); res.json(order); } catch (error) { next(error); } });
app.get('/v1/invoices', auth, async (req, res, next) => { try { const customerId = ['operator', 'admin'].includes(req.user.role) ? req.query.customerId : req.user.sub; res.json(await db.invoices(customerId)); } catch (error) { next(error); } });
app.get('/v1/notifications', auth, async (req, res, next) => { try { const customerId = ['operator', 'admin'].includes(req.user.role) ? req.query.customerId : req.user.sub; res.json(await db.notifications(customerId)); } catch (error) { next(error); } });
app.use((error, _req, res, _next) => { console.error(error); res.status(error.message === 'Origin not allowed' ? 403 : 500).json({ error: error.message === 'Origin not allowed' ? 'ORIGIN_NOT_ALLOWED' : 'INTERNAL_ERROR' }); });
app.listen(PORT, () => console.log(`Agensy API listening on :${PORT}`));
