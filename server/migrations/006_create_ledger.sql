CREATE TYPE ledger_type AS ENUM (
  'fleet_earning',
  'referral_bonus',
  'unit_sale_gross',
  'unit_sale_fee',
  'unit_sale_net',
  'adjustment'
);

CREATE TABLE ledger_entries (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id),
  type         ledger_type   NOT NULL,
  amount       NUMERIC(20,2) NOT NULL,
  reference_id UUID,
  description  TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Running balance view per user (computed on the fly)
CREATE VIEW user_balances AS
SELECT
  user_id,
  SUM(amount) AS total_balance,
  SUM(CASE WHEN type = 'fleet_earning'  THEN amount ELSE 0 END) AS fleet_earnings,
  SUM(CASE WHEN type = 'referral_bonus' THEN amount ELSE 0 END) AS referral_earnings,
  SUM(CASE WHEN type IN ('unit_sale_net','unit_sale_fee','unit_sale_gross')
           THEN amount ELSE 0 END) AS sale_proceeds
FROM ledger_entries
GROUP BY user_id;

CREATE INDEX idx_ledger_user_id    ON ledger_entries(user_id);
CREATE INDEX idx_ledger_type       ON ledger_entries(type);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);