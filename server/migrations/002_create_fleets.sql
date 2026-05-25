CREATE TYPE fleet_status AS ENUM ('active', 'idle', 'retired');

CREATE TABLE fleets (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(200)  NOT NULL,
  description         TEXT,
  equipment_type      VARCHAR(100)  NOT NULL,
  model               VARCHAR(100),
  minimum_deposit     NUMERIC(20,2) NOT NULL,
  company_cut_percent NUMERIC(5,2)  NOT NULL DEFAULT 20.00,
  total_units         INTEGER       NOT NULL DEFAULT 0,
  status              fleet_status  NOT NULL DEFAULT 'idle',
  created_by          UUID          NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleets_status ON fleets(status);

CREATE TRIGGER trg_fleets_updated_at
  BEFORE UPDATE ON fleets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();