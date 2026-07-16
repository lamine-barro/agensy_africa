CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_label TEXT NOT NULL,
  unit_content NUMERIC NOT NULL CHECK (unit_content > 0),
  unit TEXT NOT NULL,
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  max_quantity INTEGER NOT NULL CHECK (max_quantity >= min_quantity),
  origin TEXT NOT NULL,
  regulation TEXT NOT NULL,
  monthly_price_guaranteed BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_price_versions (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_price INTEGER NOT NULL CHECK (unit_price > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_until TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS product_price_current_idx ON product_price_versions(product_id) WHERE effective_until IS NULL;
CREATE TABLE IF NOT EXISTS product_images (
  product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  image_data BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_filename_idx ON product_images(filename);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS validation_expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS adjustment JSONB;
CREATE TABLE IF NOT EXISTS order_delivery_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
