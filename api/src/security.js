import crypto from 'node:crypto';

const enc = (value) => Buffer.from(value).toString('base64url');
const dec = (value) => Buffer.from(value, 'base64url').toString('utf8');

export function assertProductionConfiguration() {
  if (process.env.NODE_ENV !== 'production') return;
  const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGINS', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JEKO_WEBHOOK_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
}

export function signToken(payload, ttlSeconds = 60 * 60 * 8) {
  const body = enc(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'development-only-secret').update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyToken(token) {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) return null;
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET || 'development-only-secret').update(body).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(dec(body));
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

export const hashOtp = (phone, code) => crypto.createHash('sha256').update(`${phone}:${code}`).digest('hex');
export const secureCode = () => crypto.randomInt(1000, 10000).toString();

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.JEKO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function createRateLimiter({ windowMs = 60_000, limit = 60 } = {}) {
  const buckets = new Map();
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`; const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, startedAt: now };
    if (now - bucket.startedAt >= windowMs) { bucket.count = 0; bucket.startedAt = now; }
    bucket.count += 1; buckets.set(key, bucket);
    if (bucket.count > limit) return res.status(429).json({ error: 'RATE_LIMITED' });
    next();
  };
}
