DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_role_check') THEN ALTER TABLE customers ADD CONSTRAINT customers_role_check CHECK (role IN ('customer', 'operator', 'admin')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('draft', 'submitted', 'adjusted', 'accepted', 'paid', 'delivered', 'cancelled')); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_amount_check') THEN ALTER TABLE invoices ADD CONSTRAINT invoices_amount_check CHECK (amount > 0); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_currency_check') THEN ALTER TABLE invoices ADD CONSTRAINT invoices_currency_check CHECK (currency = 'XOF'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check') THEN ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending_manual_issue', 'issued_manual', 'shared_whatsapp')); END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_customer_created_at_idx ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS invoices_customer_created_at_idx ON invoices(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_customer_created_at_idx ON notifications(customer_id, created_at DESC);
