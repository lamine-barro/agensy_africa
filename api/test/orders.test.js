import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/catalog.js';

test('catalogue has every specified launch product', () => assert.equal(products.length, 28));
test('every product has valid order bounds and pricing', () => products.forEach((p) => {
  assert.ok(p.minQuantity >= 1 && p.maxQuantity >= p.minQuantity);
  assert.ok(p.unitPrice > 0 && p.unitContent > 0);
}));
