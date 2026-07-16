import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

process.env.NODE_ENV = 'test';
process.env.DEMO_OTP = 'true';
process.env.JWT_SECRET = 'a-local-test-secret-with-more-than-thirty-two-characters';
process.env.ADMIN_USERNAME = 'operator';
process.env.ADMIN_PASSWORD = 'strong-local-password';
process.env.JEKO_WEBHOOK_SECRET = 'local-webhook-secret';

const { app } = await import('../src/server.js');
const server = app.listen(0, '127.0.0.1');
const serverReady = await new Promise((resolve) => { server.once('listening', () => resolve(true)); server.once('error', () => resolve(false)); });
const baseUrl = serverReady ? `http://127.0.0.1:${server.address().port}` : null;

const request = async (path, { token, method = 'GET', body, headers = {} } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body });
  const text = await response.text();
  return { response, body: text ? JSON.parse(text) : null };
};

test('mobile profile, order, payment, invoice and delivery flow is coherent', async (t) => {
  if (!serverReady) return t.skip('Local TCP listening is restricted by this environment.');
  t.after(() => server.close());
  const otpRequest = await request('/v1/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone: '+2250700000000' }) });
  assert.equal(otpRequest.response.status, 202);
  assert.equal(otpRequest.body.delivery, 'demo');
  assert.equal(otpRequest.body.demoCode, '0000');

  const verified = await request('/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone: '+2250700000000', code: otpRequest.body.demoCode }) });
  assert.equal(verified.response.status, 200);
  const customerToken = verified.body.accessToken;
  const customerId = verified.body.customer.id;

  const invalidProfile = await request(`/v1/customers/${customerId}/profile`, { token: customerToken, method: 'PUT', body: JSON.stringify({ businessName: 'Awa', businessType: 'shop', country: 'CI', ncc: 'NCC-1' }) });
  assert.equal(invalidProfile.response.status, 422);

  const profile = { businessName: 'Boutique Awa', businessType: 'shop', legalStatus: 'formal', managerName: 'Awa Koné', managerRole: 'Gérante', email: 'awa@example.test', country: 'CI', city: 'Abidjan', deliveryAddress: 'Cocody', landmark: 'Près du marché', ncc: 'NCC-1' };
  const savedProfile = await request(`/v1/customers/${customerId}/profile`, { token: customerToken, method: 'PUT', body: JSON.stringify(profile) });
  assert.equal(savedProfile.response.status, 200);
  assert.equal(savedProfile.body.businessType, 'shop');

  const catalog = await request('/v1/products');
  assert.equal(catalog.response.status, 200);
  assert.equal(catalog.body.length, 20);
  const product = catalog.body[0];

  const invalidSchedule = await request('/v1/orders', { token: customerToken, method: 'POST', body: JSON.stringify({ productId: product.id, quantity: product.minQuantity, deliveryAddress: { label: 'Cocody' }, schedule: { type: 'scheduled', date: '31/02/2026' } }) });
  assert.equal(invalidSchedule.response.status, 422);

  const created = await request('/v1/orders', { token: customerToken, method: 'POST', body: JSON.stringify({ productId: product.id, quantity: product.minQuantity, deliveryAddress: { label: 'Cocody' }, schedule: { type: 'scheduled', date: '25/08/2026' }, instructions: 'Appeler avant livraison' }) });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.schedule.date, '2026-08-25');

  const submitted = await request(`/v1/orders/${created.body.id}/submit`, { token: customerToken, method: 'POST' });
  assert.equal(submitted.response.status, 200);
  assert.equal(submitted.body.status, 'submitted');

  const admin = await request('/v1/admin/auth/login', { method: 'POST', body: JSON.stringify({ username: 'operator', password: 'strong-local-password' }) });
  assert.equal(admin.response.status, 200);
  const adminToken = admin.body.accessToken;

  const adjusted = await request(`/v1/admin/orders/${created.body.id}/adjust`, { token: adminToken, method: 'POST', body: JSON.stringify({ deliveryFee: 500, deliveryDate: '2026-08-26', note: 'Créneau confirmé' }) });
  assert.equal(adjusted.response.status, 200);
  assert.equal(adjusted.body.status, 'adjusted');

  const accepted = await request(`/v1/admin/orders/${created.body.id}/accept`, { token: adminToken, method: 'POST', body: JSON.stringify({ deliveryFee: 500, deliveryDate: '2026-08-26' }) });
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.body.status, 'accepted');
  assert.match(accepted.body.payment.checkoutUrl, /jeko/);

  const webhookBody = JSON.stringify({ orderId: created.body.id });
  const signature = crypto.createHmac('sha256', process.env.JEKO_WEBHOOK_SECRET).update(webhookBody).digest('hex');
  const paid = await request('/v1/webhooks/jeko', { method: 'POST', body: webhookBody, headers: { 'X-Jeko-Signature': signature } });
  assert.equal(paid.response.status, 204);

  const invoices = await request('/v1/invoices', { token: customerToken });
  assert.equal(invoices.response.status, 200);
  assert.equal(invoices.body.length, 1);
  assert.equal(invoices.body[0].status, 'pending_manual_issue');

  const issued = await request(`/v1/admin/invoices/${invoices.body[0].id}/issue`, { token: adminToken, method: 'POST', body: JSON.stringify({ invoiceNumber: 'FAC-2026-001' }) });
  assert.equal(issued.response.status, 200);
  assert.equal(issued.body.status, 'issued_manual');

  const delivered = await request(`/v1/admin/orders/${created.body.id}/deliver`, { token: adminToken, method: 'POST' });
  assert.equal(delivered.response.status, 200);
  assert.equal(delivered.body.status, 'delivered');

  const mobileSource = await fs.readFile(new URL('../../mobile/App.js', import.meta.url), 'utf8');
  assert.match(mobileSource, /const statuses = \['draft', 'submitted', 'adjusted', 'accepted', 'paid', 'delivered', 'cancelled'\]/);
});
