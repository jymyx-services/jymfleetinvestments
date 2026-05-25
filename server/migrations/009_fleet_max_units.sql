ALTER TABLE fleets ADD COLUMN max_units INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN fleets.max_units IS
  '0 = unlimited. Any positive value caps total investor units on this fleet.';