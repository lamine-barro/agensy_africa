import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { products } from '../seed-data/catalog.js';
import { publicConfiguration } from './application-config.js';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required to seed the catalogue');
const { Pool } = pg; const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' } : false });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productDir = path.resolve(__dirname, '../seed-data/products');
const brandingDir = path.resolve(__dirname, '../seed-data/branding');
const retiredProductIds = ['plantain', 'yam', 'fresh-cassava', 'sweet-potato', 'fresh-chili', 'fresh-ginger', 'fresh-pineapple', 'fresh-mango'];

try {
  await pool.query('BEGIN');
  await pool.query('DELETE FROM products WHERE id = ANY($1::text[])', [retiredProductIds]);
  for (const product of products) {
    const filename = product.image.replace('/assets/', ''); const image = await fs.readFile(path.join(productDir, filename));
    await pool.query(`INSERT INTO products (id,name,unit_label,unit_content,unit,min_quantity,max_quantity,origin,regulation,monthly_price_guaranteed,active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,unit_label=EXCLUDED.unit_label,unit_content=EXCLUDED.unit_content,unit=EXCLUDED.unit,min_quantity=EXCLUDED.min_quantity,max_quantity=EXCLUDED.max_quantity,origin=EXCLUDED.origin,regulation=EXCLUDED.regulation,monthly_price_guaranteed=EXCLUDED.monthly_price_guaranteed,updated_at=now()`, [product.id, product.name, product.unitLabel, product.unitContent, product.unit, product.minQuantity, product.maxQuantity, product.origin, product.regulation, product.monthlyPriceGuaranteed]);
    await pool.query(`INSERT INTO product_price_versions (product_id,unit_price,currency,effective_from)
      VALUES ($1,$2,'XOF',now()) ON CONFLICT (product_id) WHERE effective_until IS NULL DO UPDATE SET unit_price=EXCLUDED.unit_price,effective_from=EXCLUDED.effective_from`, [product.id, product.unitPrice]);
    await pool.query(`INSERT INTO product_images (product_id,filename,content_type,image_data)
      VALUES ($1,$2,'image/webp',$3) ON CONFLICT (product_id) DO UPDATE SET filename=EXCLUDED.filename,content_type=EXCLUDED.content_type,image_data=EXCLUDED.image_data,updated_at=now()`, [product.id, filename, image]);
  }
  const logo = await fs.readFile(path.join(brandingDir, 'logo_agensy_africa.png'));
  await pool.query(`INSERT INTO brand_assets (key,content_type,asset_data) VALUES ('logo','image/png',$1)
    ON CONFLICT (key) DO UPDATE SET content_type=EXCLUDED.content_type,asset_data=EXCLUDED.asset_data,updated_at=now()`, [logo]);
  await pool.query("DELETE FROM brand_assets WHERE key='favicon'");
  await pool.query(`INSERT INTO app_configuration (key,value) VALUES ('public',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`, [publicConfiguration]);
  await pool.query('COMMIT'); console.log(`Seeded ${products.length} products and ${products.length} product-image records.`);
} catch (error) { await pool.query('ROLLBACK'); throw error; } finally { await pool.end(); }
