import { products } from './catalog.js';

export const store = {
  products,
  orders: [],
  notifications: [],
  invoices: [],
  customers: new Map()
};

export const createId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
export function notify(customerId, type, title, body) {
  const item = { id: createId('notif'), customerId, type, title, body, read: false, createdAt: new Date().toISOString() };
  store.notifications.unshift(item);
  return item;
}
