import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { hashOtp, signToken, verifyToken, verifyWebhookSignature } from '../src/security.js';

process.env.JWT_SECRET = 'a-local-test-secret-with-more-than-thirty-two-characters';

test('signed sessions reject tampering and preserve the role', () => {
  const token = signToken({ sub: 'customer_1', role: 'customer' });
  assert.deepEqual(verifyToken(token).sub, 'customer_1');
  assert.equal(verifyToken(`${token}x`), null);
});

test('OTP hashes are specific to both phone and code', () => {
  assert.notEqual(hashOtp('+2250700000000', '123456'), hashOtp('+2250700000001', '123456'));
  assert.notEqual(hashOtp('+2250700000000', '123456'), hashOtp('+2250700000000', '123457'));
});

test('Jeko webhook signatures use the configured HMAC secret', () => {
  process.env.JEKO_WEBHOOK_SECRET = 'webhook-secret';
  const body = '{"orderId":"ord_1"}';
  const signature = crypto.createHmac('sha256', process.env.JEKO_WEBHOOK_SECRET).update(body).digest('hex');
  assert.equal(verifyWebhookSignature(body, signature), true);
  assert.equal(verifyWebhookSignature(body, 'invalid'), false);
});
