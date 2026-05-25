import { query } from '../../config/database.js'

export async function getUserProfile(userId) {
  const result = await query(
    `SELECT
       u.id, u.full_name, u.email, u.phone,
       u.role, u.status, u.investor_code,
       u.created_at,
       ref.full_name  AS referrer_name,
       ref.investor_code AS referrer_code
     FROM users u
     LEFT JOIN users ref ON ref.id = u.referrer_id
     WHERE u.id = $1`,
    [userId]
  )
  if (result.rows.length === 0) throw { status: 404, message: 'User not found' }
  return result.rows[0]
}

export async function getUserReferrals(userId) {
  const result = await query(
    `SELECT
       u.id, u.full_name, u.investor_code,
       u.status, u.created_at,
       COALESCE(SUM(le.amount), 0) AS total_earned
     FROM users u
     LEFT JOIN investments i  ON i.user_id = u.id AND i.status = 'active'
     LEFT JOIN ledger_entries le
       ON le.user_id = $1 AND le.type = 'referral_bonus'
     WHERE u.referrer_id = $1
     GROUP BY u.id
     ORDER BY u.created_at DESC`,
    [userId]
  )
  return result.rows
}

export async function getAllUsers(search = null, limit = 50, offset = 0) {
  const whereClause = search
    ? `WHERE u.full_name ILIKE $3
       OR u.email ILIKE $3
       OR u.investor_code ILIKE $3
       OR u.phone ILIKE $3`
    : ''
  const params = search
    ? [`%${search}%`, limit, offset]
    : [limit, offset]

  // Adjust param indices when search is present
  const limitIdx  = search ? '$2' : '$1'
  const offsetIdx = search ? '$3' : '$2'

  // Rebuild cleanly
  const searchParam = search ? [`%${search}%`] : []
  const finalParams = [...searchParam, limit, offset]

  const result = await query(
    `SELECT
       u.id, u.full_name, u.email, u.phone,
       u.role, u.status, u.investor_code, u.created_at,
       COUNT(DISTINCT i.id) AS investment_count,
       COALESCE(SUM(i.amount), 0) AS total_invested
     FROM users u
     LEFT JOIN investments i ON i.user_id = u.id AND i.status = 'active'
     ${search ? `WHERE u.full_name ILIKE $1
                 OR u.email ILIKE $1
                 OR u.investor_code ILIKE $1
                 OR u.phone ILIKE $1` : ''}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ${search ? '$2' : '$1'}
     OFFSET ${search ? '$3' : '$2'}`,
    finalParams
  )
  return result.rows
}

export async function suspendUser(userId, adminId) {
  const result = await query(
    `UPDATE users SET status = 'suspended', updated_at = NOW()
     WHERE id = $1 AND id != $2
     RETURNING id`,
    [userId, adminId]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'User not found or cannot suspend yourself' }
  }
}

export async function activateUser(userId) {
  await query(
    `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`,
    [userId]
  )
}