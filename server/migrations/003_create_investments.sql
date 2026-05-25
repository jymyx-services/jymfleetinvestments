CREATE TYPE investment_status AS ENUM ('active', 'sold', 'pending_sale');

CREATE TABLE investments (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  fleet_id      UUID              NOT NULL REFERENCES fleets(id) ON DELETE RESTRICT,
  amount        NUMERIC(20,2)     NOT NULL,
  units         INTEGER           NOT NULL DEFAULT 1,
  status        investment_status NOT NULL DEFAULT 'active',
  purchased_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  sold_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT positive_units  CHECK (units  > 0)
);

CREATE INDEX idx_investments_user_id  ON investments(user_id);
CREATE INDEX idx_investments_fleet_id ON investments(fleet_id);
CREATE INDEX idx_investments_status   ON investments(status);

-- Fast lookup: all active investors on a fleet (used by distribution engine)
CREATE INDEX idx_investments_fleet_active
  ON investments(fleet_id, status)
  WHERE status = 'active';

CREATE TRIGGER trg_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();