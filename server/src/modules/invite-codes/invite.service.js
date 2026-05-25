import { query }                              from '../../config/database.js'
import { generateInviteCode, hashCode }       from '../../lib/crypto.js'

export async function createInviteCode(data, adminId) {
  const { fleetId, investorName, amount, units, expiryDays } = data

  // Verify fleet exists
  const fleetResult = await query(
    `SELECT id, minimum_deposit FROM fleets WHERE id = $1`,
    [fleetId]
  )
  if (fleetResult.rows.length === 0) {
    throw { status: 404, message: 'Fleet not found' }
  }

  const fleet = fleetResult.rows[0]
  if (amount < parseFloat(fleet.minimum_deposit)) {
    throw {
      status: 400,
      message: `Amount must be at least UGX ${fleet.minimum_deposit} (fleet minimum)`
    }
  }

  const rawCode  = generateInviteCode()
  const codeHash = hashCode(rawCode)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiryDays)

  await query(
    `INSERT INTO invite_codes
       (code_hash, fleet_id, investor_name, amount, units, created_by, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [codeHash, fleetId, investorName, amount, units, adminId, expiresAt]
  )

  // Return raw code ONCE — never stored again
  return {
    code:         rawCode,
    investorName,
    fleetId,
    amount,
    units,
    expiresAt
  }
}

export async function listInviteCodes(fleetId = null) {
  const conditions = fleetId ? 'WHERE ic.fleet_id = $1' : ''
  const params     = fleetId ? [fleetId] : []

  const result = await query(
    `SELECT
       ic.id, ic.investor_name, ic.amount, ic.units,
       ic.expires_at, ic.status, ic.consumed_at,
       ic.consumed_by_ip, ic.created_at,
       f.name  AS fleet_name,
       u.full_name AS created_by_name,
       iu.full_name AS consumed_by_name
     FROM invite_codes ic
     JOIN fleets f ON f.id = ic.fleet_id
     JOIN users  u ON u.id = ic.created_by
     LEFT JOIN users iu ON iu.id = ic.user_id
     ${conditions}
     ORDER BY ic.created_at DESC`,
    params
  )
  return result.rows
}

export async function revokeInviteCode(codeId, adminId) {
  const result = await query(
    `UPDATE invite_codes
     SET status = 'revoked'
     WHERE id = $1 AND status = 'available'
     RETURNING id`,
    [codeId]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Code not found or not revokable' }
  }
}

// Nightly cleanup — called by a scheduled job
export async function expireOldCodes() {
  const result = await query(
    `UPDATE invite_codes SET status = 'expired'
     WHERE status = 'available' AND expires_at < NOW()
     RETURNING id`
  )
  return result.rows.length
}