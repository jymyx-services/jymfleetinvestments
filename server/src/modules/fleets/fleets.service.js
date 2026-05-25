import { query, transaction } from '../../config/database.js'

export async function createFleet(data, adminId) {
  const {
    name, description, equipmentType,
    model, minimumDeposit, companyCutPercent,
    maxUnits = 0
  } = data

  const result = await query(
    `INSERT INTO fleets
       (name, description, equipment_type, model,
        minimum_deposit, company_cut_percent, max_units, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [name, description, equipmentType, model,
     minimumDeposit, companyCutPercent, maxUnits, adminId]
  )
  return result.rows[0]
}

export async function getAllFleets() {
  const result = await query(
    `SELECT
       f.*,
       COUNT(DISTINCT i.id)            AS investor_count,
       COALESCE(SUM(i.units), 0)       AS total_units_sold,
       CASE
         WHEN f.max_units > 0
         THEN f.max_units - COALESCE(SUM(i.units), 0)
         ELSE NULL
       END                             AS units_remaining,
       CASE
         WHEN f.max_units > 0
          AND COALESCE(SUM(i.units), 0) >= f.max_units
         THEN true ELSE false
       END                             AS is_full,
       u.full_name                     AS created_by_name
     FROM fleets f
     LEFT JOIN investments i
       ON i.fleet_id = f.id AND i.status = 'active'
     LEFT JOIN users u ON u.id = f.created_by
     GROUP BY f.id, u.full_name
     ORDER BY f.created_at DESC`
  )
  return result.rows
}

export async function getFleetById(fleetId) {
  const result = await query(
    `SELECT
       f.*,
       COUNT(DISTINCT i.id)            AS investor_count,
       COALESCE(SUM(i.units), 0)       AS total_units_sold,
       CASE
         WHEN f.max_units > 0
         THEN f.max_units - COALESCE(SUM(i.units), 0)
         ELSE NULL
       END                             AS units_remaining,
       CASE
         WHEN f.max_units > 0
          AND COALESCE(SUM(i.units), 0) >= f.max_units
         THEN true ELSE false
       END                             AS is_full,
       u.full_name                     AS created_by_name
     FROM fleets f
     LEFT JOIN investments i
       ON i.fleet_id = f.id AND i.status = 'active'
     LEFT JOIN users u ON u.id = f.created_by
     WHERE f.id = $1
     GROUP BY f.id, u.full_name`,
    [fleetId]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Fleet not found' }
  }
  return result.rows[0]
}

export async function updateFleet(fleetId, data) {
  const fields = []
  const values = []
  let   idx    = 1

  const allowed = {
    name:               'name',
    description:        'description',
    model:              'model',
    companyCutPercent:  'company_cut_percent',
    maxUnits:           'max_units',
    status:             'status'
  }

  for (const [key, col] of Object.entries(allowed)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`)
      values.push(data[key])
    }
  }

  if (fields.length === 0) {
    throw { status: 400, message: 'No valid fields to update' }
  }

  values.push(fleetId)

  const result = await query(
    `UPDATE fleets SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx}
     RETURNING *`,
    values
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'Fleet not found' }
  }
  return result.rows[0]
}

export async function getFleetEarningsHistory(fleetId, limit = 30) {
  const result = await query(
    `SELECT fe.*, u.full_name AS entered_by_name
     FROM fleet_earnings fe
     JOIN users u ON u.id = fe.entered_by
     WHERE fe.fleet_id = $1
     ORDER BY fe.earning_date DESC
     LIMIT $2`,
    [fleetId, limit]
  )
  return result.rows
}

export async function getInvestorFleets(userId) {
  const result = await query(
    `SELECT
       f.id          AS fleet_id,
       f.name        AS fleet_name,
       f.equipment_type,
       f.model,
       f.status      AS fleet_status,
       f.minimum_deposit,
       f.company_cut_percent,
       f.max_units,
       CASE
         WHEN f.max_units > 0
         THEN f.max_units - COALESCE(SUM(i2.units), 0)
         ELSE NULL
       END           AS units_remaining,
       CASE
         WHEN f.max_units > 0
          AND COALESCE(SUM(i2.units), 0) >= f.max_units
         THEN true ELSE false
       END           AS is_full,
       i.id          AS investment_id,
       i.amount      AS invested_amount,
       i.units,
       i.status      AS investment_status,
       i.purchased_at,
       COALESCE(SUM(dl.gross_credit), 0) AS total_earned,
       COALESCE(
         SUM(CASE WHEN dl.earning_date = CURRENT_DATE
             THEN dl.gross_credit ELSE 0 END), 0
       ) AS today_earned
     FROM investments i
     JOIN fleets f ON f.id = i.fleet_id
     LEFT JOIN investments i2
       ON i2.fleet_id = f.id AND i2.status = 'active'
     LEFT JOIN distribution_logs dl ON dl.investment_id = i.id
     WHERE i.user_id = $1 AND i.status = 'active'
     GROUP BY f.id, i.id
     ORDER BY i.purchased_at DESC`,
    [userId]
  )
  return result.rows
}

// Check capacity before allowing a new investment
export async function checkFleetCapacity(fleetId, requestedUnits) {
  const result = await query(
    `SELECT
       f.max_units,
       COALESCE(SUM(i.units), 0) AS total_units_sold
     FROM fleets f
     LEFT JOIN investments i
       ON i.fleet_id = f.id AND i.status = 'active'
     WHERE f.id = $1
     GROUP BY f.id`,
    [fleetId]
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'Fleet not found' }
  }

  const { max_units, total_units_sold } = result.rows[0]

  // 0 = unlimited
  if (Number(max_units) === 0) return true

  const remaining = Number(max_units) - Number(total_units_sold)
  if (remaining < requestedUnits) {
    throw {
      status: 409,
      message: remaining === 0
        ? 'This fleet is full. No more units available.'
        : `Only ${remaining} unit(s) remaining on this fleet.`
    }
  }

  return true
}