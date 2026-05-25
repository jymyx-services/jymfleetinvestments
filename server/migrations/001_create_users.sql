CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('investor', 'admin', 'superadmin');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'pending');

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         VARCHAR(200)    NOT NULL,
  email             VARCHAR(255)    NOT NULL UNIQUE,
  phone             VARCHAR(20)     NOT NULL UNIQUE,
  password_hash     VARCHAR(255)    NOT NULL,
  role              user_role       NOT NULL DEFAULT 'investor',
  status            account_status  NOT NULL DEFAULT 'active',
  referrer_id       UUID            REFERENCES users(id) ON DELETE SET NULL,
  push_subscription JSONB,
  investor_code     VARCHAR(20)     UNIQUE,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_phone       ON users(phone);
CREATE INDEX idx_users_referrer_id ON users(referrer_id);
CREATE INDEX idx_users_role        ON users(role);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();