-- =============================================================================
-- Perfume Zone (perfumezone.uk) - PostgreSQL Database Schema
-- =============================================================================
-- Instructions:
--   1. Create the database (run once as superuser if it doesn't exist):
--        CREATE DATABASE perfumezone;
--   2. Connect to the database (\c perfumezone) and execute this script:
--        psql -U postgres -d perfumezone -f server/schema.sql
-- =============================================================================

-- Trigger helper to automatically keep updated_at timestamps current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Collections Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
  id          SERIAL PRIMARY KEY,
  handle      VARCHAR(190) UNIQUE NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_handle ON collections(handle);

-- -----------------------------------------------------------------------------
-- 2. Products Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  handle           VARCHAR(190) UNIQUE NOT NULL,
  title            VARCHAR(255) NOT NULL,
  brand            VARCHAR(100),
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) NULL CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  image_url        VARCHAR(500),
  image_url_2      VARCHAR(500),
  description      TEXT,
  size             VARCHAR(100) DEFAULT '100ml Eau De Parfum',
  collections      TEXT,
  notes            JSONB NOT NULL DEFAULT '{}'::jsonb,
  in_stock         SMALLINT NOT NULL DEFAULT 1 CHECK (in_stock IN (0, 1)),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Product <-> Collections Pivot Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_collections (
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_collection_id ON product_collections(collection_id);

-- -----------------------------------------------------------------------------
-- 4. Users / Customers Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(150),
  phone         VARCHAR(50),
  address       VARCHAR(255),
  apartment     VARCHAR(100),
  city          VARCHAR(100),
  postcode      VARCHAR(30),
  country       VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
  password_hash VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. Orders Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(50) PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email           VARCHAR(255) NOT NULL,
  customer_name   VARCHAR(150) NOT NULL,
  phone           VARCHAR(50),
  address         VARCHAR(255) NOT NULL,
  apartment       VARCHAR(100),
  city            VARCHAR(100) NOT NULL,
  postcode        VARCHAR(30) NOT NULL,
  country         VARCHAR(100) NOT NULL DEFAULT 'United Kingdom',
  subtotal        NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost   NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_cost >= 0),
  discount        NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  coupon_code     VARCHAR(50),
  total           NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  shipping_method VARCHAR(100) NOT NULL DEFAULT 'standard',
  payment_method  VARCHAR(50) NOT NULL DEFAULT 'card',
  order_note      TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. Order Items Table (Relational Line Items)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_handle VARCHAR(190),
  title          VARCHAR(255) NOT NULL,
  brand          VARCHAR(100),
  size           VARCHAR(100),
  unit_price     NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total     NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  image_url      VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- -----------------------------------------------------------------------------
-- 7. Subscribers Table (Newsletter & Checkout Opt-ins)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  source        VARCHAR(50) NOT NULL DEFAULT 'footer',
  status        VARCHAR(30) NOT NULL DEFAULT 'subscribed',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(LOWER(email));
