CREATE TABLE IF NOT EXISTS brand_assets (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  asset_data BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
