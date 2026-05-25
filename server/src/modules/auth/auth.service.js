import bcrypt from 'bcrypt'
import { query, transaction } from '../../config/database.js'
import { redis } from '../../config/redis.js'
import { hashCode, generateInvestorCode } from '../../lib/crypto.js'
import { checkFleetCapacity } from '../fleets/fleets.service.js'

const SALT_ROUNDS = 12

// ─── Invite code

export async function validateInviteCode(rawCode) {
    const codeHash = hashCode(rawCode)

    const result = await query(
        `SELECT id, fleet_id, investor_name, amount, units, expires_at, status
     FROM invite_codes
     WHERE code_hash = $1`,
        [codeHash]
    )

    if (result.rows.length === 0) throw { status: 404, message: 'Invalid invite code' }

    const code = result.rows[0]

    if (code.status === 'consumed') throw { status: 409, message: 'This invite code has already been used' }
    if (code.status === 'revoked') throw { status: 410, message: 'This invite code has been revoked' }
    if (code.status === 'expired'
        || new Date() > new Date(code.expires_at))
        throw { status: 410, message: 'This invite code has expired' }

    return {
        codeId: code.id,
        fleetId: code.fleet_id,
        investorName: code.investor_name,
        amount: code.amount,
        units: code.units
    }
}

// ─── Registration 

export async function registerInvestor(codeId, body, requestIp) {
  const { fullName, email, phone, password, referralCode } = body

  const existing = await query(
    `SELECT id FROM users WHERE email = $1 OR phone = $2 LIMIT 1`,
    [email, phone]
  )
  if (existing.rows.length > 0) {
    throw { status: 409, message: 'Email or phone already registered' }
  }

  // Resolve referrer if code provided
  let referrerId = null
  if (referralCode) {
    const refResult = await query(
      `SELECT id FROM users WHERE investor_code = $1 AND status = 'active'`,
      [referralCode.trim().toUpperCase()]
    )
    if (refResult.rows.length > 0) {
      referrerId = refResult.rows[0].id
    }
    // If code not found — silent. Don't block registration.
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  return await transaction(async (trx) => {
    const codeRow = await trx.query(
      `SELECT id, fleet_id, amount, units, status
       FROM invite_codes WHERE id = $1 FOR UPDATE`,
      [codeId]
    )

    if (!codeRow.rows[0] || codeRow.rows[0].status !== 'available') {
      throw { status: 409, message: 'Invite code is no longer available' }
    }

    const { fleet_id, amount, units } = codeRow.rows[0]

    const countResult = await trx.query(
      `SELECT COUNT(*) FROM users WHERE role = 'investor'`
    )
    const sequence     = parseInt(countResult.rows[0].count) + 1
    const investorCode = generateInvestorCode(sequence)
    await checkFleetCapacity(fleet_id, units)

    const userResult = await trx.query(
      `INSERT INTO users
         (full_name, email, phone, password_hash, role, investor_code, referrer_id)
       VALUES ($1,$2,$3,$4,'investor',$5,$6)
       RETURNING id, full_name, email, role, investor_code`,
      [fullName, email, phone, passwordHash, investorCode, referrerId]
    )
    const user = userResult.rows[0]

    await trx.query(
      `INSERT INTO investments (user_id, fleet_id, amount, units)
       VALUES ($1,$2,$3,$4)`,
      [user.id, fleet_id, amount, units]
    )

    await trx.query(
      `UPDATE fleets SET total_units = total_units + $1 WHERE id = $2`,
      [units, fleet_id]
    )

    await trx.query(
      `UPDATE invite_codes
       SET status = 'consumed', consumed_at = NOW(),
           consumed_by_ip = $1, user_id = $2
       WHERE id = $3`,
      [requestIp, user.id, codeId]
    )

    // Notify referrer if one exists
    if (referrerId) {
      await import('../../lib/notify.js').then(({ notify }) =>
        notify(
          referrerId,
          'referral_bonus',
          'New referral registered!',
          `${fullName} registered using your referral code. You will earn 10% of their daily credits.`,
          { newUserId: user.id, newUserName: fullName }
        ).catch(() => {})
      )
    }

    return user
  })
}

// ─── Login 

export async function loginUser(email, password) {
    const result = await query(
        `SELECT id, full_name, email, role, status, password_hash
     FROM users WHERE email = $1`,
        [email]
    )

    const user = result.rows[0]

    // Constant-time comparison regardless of whether user exists
    const hash = user?.password_hash || '$2b$12$invalidhashpadding000000000000000000000000000000000000000'
    const match = await bcrypt.compare(password, hash)

    if (!user || !match) {
        throw { status: 401, message: 'Invalid email or password' }
    }

    if (user.status === 'suspended') {
        throw { status: 403, message: 'Account suspended. Contact support.' }
    }

    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
    }
}

// ─── Token management 

export async function storeRefreshToken(userId, token) {
    // TTL matches JWT_REFRESH_EXPIRES (30 days in seconds)
    await redis.set(`refresh:${userId}`, token, 'EX', 60 * 60 * 24 * 30)
}

export async function revokeRefreshToken(userId) {
    await redis.del(`refresh:${userId}`)
}

export async function verifyRefreshToken(userId, token) {
    const stored = await redis.get(`refresh:${userId}`)
    return stored === token
}