CREATE TYPE code_status AS ENUM ('available', 'consumed', 'expired', 'revoked');

CREATE TABLE invite_codes (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash      CHAR(64)     NOT NULL UNIQUE,
  fleet_id       UUID         NOT NULL REFERENCES fleets(id),
  investor_name  VARCHAR(200) NOT NULL,
  amount         NUMERIC(20,2) NOT NULL,
  units          INTEGER      NOT NULL DEFAULT 1,
  created_by     UUID         NOT NULL REFERENCES users(id),
  expires_at     TIMESTAMPTZ  NOT NULL,
  status         code_status  NOT NULL DEFAULT 'available',
  consumed_at    TIMESTAMPTZ,
  consumed_by_ip INET,
  user_id        UUID         REFERENCES users(id),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_codes_hash   ON invite_codes(code_hash);
CREATE INDEX idx_invite_codes_status ON invite_codes(status);
CREATE INDEX idx_invite_codes_fleet  ON invite_codes(fleet_id);