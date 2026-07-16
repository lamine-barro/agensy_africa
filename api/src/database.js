import pg from 'pg';
import { products } from './catalog.js';

const { Pool } = pg;
const memory = { products, orders: [], notifications: [], invoices: [], customers: new Map(), otp: new Map() };
const useDatabase = Boolean(process.env.DATABASE_URL);
const pool = useDatabase ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined }) : null;
const id = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
const normalizeOrder = (row) => row && ({ ...row, product: row.product, deliveryAddress: row.delivery_address, schedule: row.schedule, pricing: row.pricing, payment: row.payment, timeline: row.timeline || [], createdAt: row.created_at, updatedAt: row.updated_at, deliveryDate: row.delivery_date, invoiceId: row.invoice_id });

export const db = {
  async products(query = '') { return products.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase())); },
  async product(idValue) { return products.find((p) => p.id === idValue); },
  async customer(idValue) {
    if (!pool) return memory.customers.get(idValue);
    const { rows } = await pool.query('SELECT id, phone, role, profile, profile_completed FROM customers WHERE id = $1', [idValue]);
    return rows[0] && { ...rows[0], ...(rows[0].profile || {}), profileCompleted: rows[0].profile_completed };
  },
  async upsertCustomer(customer) {
    if (!pool) { memory.customers.set(customer.id, customer); return customer; }
    const { id: customerId, phone, role = 'customer', profileCompleted = false, ...profile } = customer;
    const { rows } = await pool.query(`INSERT INTO customers (id, phone, role, profile, profile_completed) VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET phone=EXCLUDED.phone, role=EXCLUDED.role, profile=EXCLUDED.profile, profile_completed=EXCLUDED.profile_completed, updated_at=now()
      RETURNING id, phone, role, profile, profile_completed`, [customerId, phone, role, profile, profileCompleted]);
    return { ...rows[0], ...rows[0].profile, profileCompleted: rows[0].profile_completed };
  },
  async saveOtp(phone, codeHash) {
    const expiresAt = new Date(Date.now() + 5 * 60_000);
    if (!pool) { memory.otp.set(phone, { codeHash, expiresAt }); return; }
    await pool.query(`INSERT INTO otp_codes (phone, code_hash, expires_at) VALUES ($1,$2,$3)
      ON CONFLICT (phone) DO UPDATE SET code_hash=EXCLUDED.code_hash, expires_at=EXCLUDED.expires_at, attempts=0`, [phone, codeHash, expiresAt]);
  },
  async consumeOtp(phone, codeHash) {
    if (!pool) { const item = memory.otp.get(phone); if (!item || item.expiresAt < new Date() || item.codeHash !== codeHash) return false; memory.otp.delete(phone); return true; }
    const { rows } = await pool.query(`DELETE FROM otp_codes WHERE phone=$1 AND code_hash=$2 AND expires_at > now() AND attempts < 5 RETURNING phone`, [phone, codeHash]);
    if (!rows.length) await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone=$1', [phone]);
    return Boolean(rows.length);
  },
  async orders(customerId) {
    if (!pool) return memory.orders.filter((o) => !customerId || o.customerId === customerId);
    const query = customerId ? ['SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC', [customerId]] : ['SELECT * FROM orders ORDER BY created_at DESC', []];
    const { rows } = await pool.query(...query); return rows.map(normalizeOrder);
  },
  async order(orderId) {
    if (!pool) return memory.orders.find((o) => o.id === orderId);
    const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [orderId]); return normalizeOrder(rows[0]);
  },
  async createOrder(order) {
    if (!pool) { memory.orders.unshift(order); return order; }
    const { rows } = await pool.query(`INSERT INTO orders (id,customer_id,product,quantity,delivery_address,schedule,instructions,status,pricing,timeline,created_at,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [order.id, order.customerId, order.product, order.quantity, order.deliveryAddress, order.schedule, order.instructions, order.status, order.pricing, order.timeline, order.createdAt, order.updatedAt]);
    return normalizeOrder(rows[0]);
  },
  async updateOrder(order) {
    if (!pool) { const i = memory.orders.findIndex((o) => o.id === order.id); memory.orders[i] = order; return order; }
    const { rows } = await pool.query(`UPDATE orders SET status=$2, pricing=$3, payment=$4, timeline=$5, delivery_date=$6, invoice_id=$7, updated_at=$8 WHERE id=$1 RETURNING *`, [order.id, order.status, order.pricing, order.payment || null, order.timeline, order.deliveryDate || null, order.invoiceId || null, order.updatedAt]);
    return normalizeOrder(rows[0]);
  },
  async notifications(customerId) {
    if (!pool) return memory.notifications.filter((n) => !customerId || n.customerId === customerId);
    const { rows } = await pool.query('SELECT id, customer_id AS "customerId", type, title, body, read, created_at AS "createdAt" FROM notifications WHERE customer_id=$1 ORDER BY created_at DESC', [customerId]); return rows;
  },
  async notify(customerId, type, title, body) {
    const notification = { id: id('notif'), customerId, type, title, body, read: false, createdAt: new Date().toISOString() };
    if (!pool) { memory.notifications.unshift(notification); return notification; }
    await pool.query('INSERT INTO notifications (id,customer_id,type,title,body,read,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', Object.values(notification)); return notification;
  },
  async invoices(customerId) {
    if (!pool) return memory.invoices.filter((i) => !customerId || i.customerId === customerId);
    const { rows } = await pool.query('SELECT id, order_id AS "orderId", customer_id AS "customerId", amount, currency, status, created_at AS "createdAt" FROM invoices WHERE customer_id=$1 ORDER BY created_at DESC', [customerId]); return rows;
  },
  async createInvoice(invoice) {
    if (!pool) { memory.invoices.unshift(invoice); return invoice; }
    await pool.query('INSERT INTO invoices (id,order_id,customer_id,amount,currency,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [invoice.id, invoice.orderId, invoice.customerId, invoice.amount, invoice.currency, invoice.status, invoice.createdAt]); return invoice;
  },
  id
};
