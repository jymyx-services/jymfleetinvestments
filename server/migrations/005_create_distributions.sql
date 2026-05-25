CREATE TABLE fleet_earnings (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id         UUID          NOT NULL REFERENCES fleets(id),
  gross_amount     NUMERIC(20,2) NOT NULL,
  company_cut      NUMERIC(20,2) NOT NULL,
  distributable    NUMERIC(20,2) NOT NULL,
  per_unit_value   NUMERIC(20,2) NOT NULL,
  total_units      INTEGER       NOT NULL,
  entered_by       UUID          NOT NULL REFERENCES users(id),
  earning_date     DATE          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_gross CHECK (gross_amount > 0),
  -- One entry per fleet per day
  UNIQUE (fleet_id, earning_date)
);

CREATE TABLE distribution_logs (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_earning_id UUID          NOT NULL REFERENCES fleet_earnings(id),
  fleet_id         UUID          NOT NULL REFERENCES fleets(id),
  investment_id    UUID          NOT NULL REFERENCES investments(id),
  user_id          UUID          NOT NULL REFERENCES users(id),
  units            INTEGER       NOT NULL,
  unit_value       NUMERIC(20,2) NOT NULL,
  gross_credit     NUMERIC(20,2) NOT NULL,
  referral_credit  NUMERIC(20,2) NOT NULL DEFAULT 0.00,
  referrer_id      UUID          REFERENCES users(id),
  earning_date     DATE          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Prevent double distribution
  UNIQUE (fleet_earning_id, investment_id)
);

CREATE TABLE unit_sale_requests (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID          NOT NULL REFERENCES investments(id),
  user_id       UUID          NOT NULL REFERENCES users(id),
  fleet_id      UUID          NOT NULL REFERENCES fleets(id),
  units_to_sell INTEGER       NOT NULL,
  gross_value   NUMERIC(20,2) NOT NULL,
  fee_percent   NUMERIC(5,2)  NOT NULL DEFAULT 3.00,
  fee_amount    NUMERIC(20,2) NOT NULL,
  net_value     NUMERIC(20,2) NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
  reviewed_by   UUID          REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_sale_status CHECK (
    status IN ('pending','approved','rejected')
  ),
  CONSTRAINT positive_units CHECK (units_to_sell > 0)
);

CREATE INDEX idx_fleet_earnings_fleet_date
  ON fleet_earnings(fleet_id, earning_date);

CREATE INDEX idx_distribution_logs_user
  ON distribution_logs(user_id, earning_date);

CREATE INDEX idx_distribution_logs_fleet_earning
  ON distribution_logs(fleet_earning_id);

CREATE INDEX idx_unit_sales_status
  ON unit_sale_requests(status);

CREATE INDEX idx_unit_sales_user
  ON unit_sale_requests(user_id);