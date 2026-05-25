import { query, transaction } from '../../config/database.js'
import { redis }              from '../../config/redis.js'
import { logger }             from '../../lib/logger.js'
import { notifyAllAdmins } from '../notifications/notifications.service.js'
import { notify, notifyMany } from '../../lib/notify.js'

/**
 * PREVIEW — runs the distribution math without writing anything.
 * Used by the admin UI to show the breakdown before confirming.
 */
export async function previewDistribution(fleetId, grossAmount) {
  // Fetch fleet to get company cut
  const fleetResult = await query(
    `SELECT id, name, company_cut_percent, status FROM fleets WHERE id = $1`,
    [fleetId]
  )

  if (fleetResult.rows.length === 0) {
    throw { status: 404, message: 'Fleet not found' }
  }

  const fleet = fleetResult.rows[0]

  if (fleet.status !== 'active') {
    throw { status: 400, message: 'Fleet is not active. Set it to active before entering earnings.' }
  }

  // Fetch all active investments on this fleet
  const investmentsResult = await query(
    `SELECT
       i.id, i.user_id, i.units, i.amount,
       u.full_name, u.referrer_id
     FROM investments i
     JOIN users u ON u.id = i.user_id
     WHERE i.fleet_id = $1 AND i.status = 'active'`,
    [fleetId]
  )

  if (investmentsResult.rows.length === 0) {
    throw { status: 400, message: 'No active investors on this fleet' }
  }

  const investments = investmentsResult.rows

  // Core distribution math
  const companyCutPercent = parseFloat(fleet.company_cut_percent)
  const companyCut        = round(grossAmount * (companyCutPercent / 100))
  const distributable     = round(grossAmount - companyCut)

  // Total units across ALL active investments on this fleet
  const totalUnits        = investments.reduce((sum, inv) => sum + inv.units, 0)
  const perUnitValue      = round(distributable / totalUnits)

  // Build per-investor breakdown
  const breakdown = investments.map(inv => {
    const grossCredit   = round(inv.units * perUnitValue)
    const referralCredit = inv.referrer_id ? round(grossCredit * 0.10) : 0
    return {
      investmentId:   inv.id,
      userId:         inv.user_id,
      fullName:       inv.full_name,
      units:          inv.units,
      grossCredit,
      referralCredit,
      referrerId:     inv.referrer_id || null
    }
  })

  // Total referral payouts
  const totalReferralPayout = round(
    breakdown.reduce((sum, b) => sum + b.referralCredit, 0)
  )

  return {
    fleetId,
    fleetName:         fleet.name,
    grossAmount:       round(grossAmount),
    companyCutPercent,
    companyCut,
    distributable,
    totalUnits,
    perUnitValue,
    totalInvestors:    investments.length,
    totalReferralPayout,
    breakdown
  }
}

/**
 * DISTRIBUTE — the real engine.
 * Runs inside a single serializable transaction.
 * Either ALL investors are credited or NONE are.
 */
export async function distributeEarnings(fleetId, grossAmount, earningDate, adminId) {
  const preview = await previewDistribution(fleetId, grossAmount)

  return await transaction(async (trx) => {
    // ── Guard: prevent double distribution for same fleet + date ──────────
    const existing = await trx.query(
      `SELECT id FROM fleet_earnings
       WHERE fleet_id = $1 AND earning_date = $2`,
      [fleetId, earningDate]
    )

    if (existing.rows.length > 0) {
      throw {
        status: 409,
        message: `Earnings for this fleet on ${earningDate} have already been entered`
      }
    }

    // ── Step 1: Record the fleet earning ─────────────────────────────────
    const earningResult = await trx.query(
      `INSERT INTO fleet_earnings
         (fleet_id, gross_amount, company_cut, distributable,
          per_unit_value, total_units, entered_by, earning_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        fleetId,
        preview.grossAmount,
        preview.companyCut,
        preview.distributable,
        preview.perUnitValue,
        preview.totalUnits,
        adminId,
        earningDate
      ]
    )

    const fleetEarningId = earningResult.rows[0].id

    // ── Step 2: Credit each investor + handle referrals ──────────────────
    const referrerCredits = {}  // accumulate referral credits per referrer

    for (const inv of preview.breakdown) {
      // Insert distribution log for this investor
      await trx.query(
        `INSERT INTO distribution_logs
           (fleet_earning_id, fleet_id, investment_id, user_id,
            units, unit_value, gross_credit, referral_credit,
            referrer_id, earning_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          fleetEarningId,
          fleetId,
          inv.investmentId,
          inv.userId,
          inv.units,
          preview.perUnitValue,
          inv.grossCredit,
          inv.referralCredit,
          inv.referrerId,
          earningDate
        ]
      )

      // Write to investor's ledger — fleet earning credit
      await trx.query(
        `INSERT INTO ledger_entries
           (user_id, type, amount, reference_id, description)
         VALUES ($1,'fleet_earning',$2,$3,$4)`,
        [
          inv.userId,
          inv.grossCredit,
          fleetEarningId,
          `Fleet earning: ${preview.fleetName} — ${earningDate}`
        ]
      )

      // Accumulate referral credit for this investor's referrer
      if (inv.referrerId && inv.referralCredit > 0) {
        referrerCredits[inv.referrerId] = round(
          (referrerCredits[inv.referrerId] || 0) + inv.referralCredit
        )
      }
    }

    // ── Step 3: Write referral credits to referrers' ledgers ─────────────
    for (const [referrerId, creditAmount] of Object.entries(referrerCredits)) {
      await trx.query(
        `INSERT INTO ledger_entries
           (user_id, type, amount, reference_id, description)
         VALUES ($1,'referral_bonus',$2,$3,$4)`,
        [
          referrerId,
          creditAmount,
          fleetEarningId,
          `Referral bonus: ${preview.fleetName} — ${earningDate}`
        ]
      )
    }

    // ── Step 4: Publish real-time event to Redis pub/sub ─────────────────
    // WebSocket service listens to this channel and fans out to clients
await redis.publish('fleet:distribution', JSON.stringify({
  fleetId,
  fleetName:      preview.fleetName,
  earningDate,
  grossAmount:    preview.grossAmount,
  distributable:  preview.distributable,
  perUnitValue:   preview.perUnitValue,
  totalInvestors: preview.totalInvestors,
  breakdown:      preview.breakdown.map(b => ({
    userId:      b.userId,
    grossCredit: b.grossCredit
  }))
}))

    logger.info('Distribution complete', {
      fleetId,
      earningDate,
      totalInvestors: preview.totalInvestors,
      distributable:  preview.distributable
    })

// Write notification records to DB for each investorso they appear in the notifications page
const userIds = preview.breakdown.map(b => b.userId)
await notifyMany(
  userIds,
  'earnings_credited',
  `Crane earnings credited`,
  `${preview.fleetName} made UGX ${preview.grossAmount.toLocaleString()} today. Your credit has been added.`,
  {
    fleetId,
    fleetName:   preview.fleetName,
    earningDate,
    perUnitValue: preview.perUnitValue
  }
).catch(() => {})

// Notify referrers separately
for (const [referrerId, creditAmount] of Object.entries(referrerCredits)) {
  await notify(
    referrerId,
    'referral_bonus',
    'Referral bonus credited',
    `You earned UGX ${creditAmount.toLocaleString()} in referral bonuses today.`,
    { fleetId, fleetName: preview.fleetName, earningDate, amount: creditAmount }
  ).catch(() => {})
}

    return {
      fleetEarningId,
      ...preview
    }
  })
}

/**
 * UNIT SALE REQUEST — investor requests to sell units.
 * Admin approves or rejects separately.
 */
export async function requestUnitSale(investmentId, unitsTosell, userId) {
  // Verify investment belongs to this user and is active
const invResult = await query(
  `SELECT i.*, f.minimum_deposit, u.full_name AS investor_name
   FROM investments i
   JOIN fleets f ON f.id = i.fleet_id
   JOIN users u  ON u.id = i.user_id
   WHERE i.id = $1 AND i.user_id = $2 AND i.status = 'active'`,
  [investmentId, userId]
)

  if (invResult.rows.length === 0) {
    throw { status: 404, message: 'Investment not found or not active' }
  }

  const investment = invResult.rows[0]

  if (unitsTosell > investment.units) {
    throw { status: 400, message: `Cannot sell more units than you own (${investment.units})` }
  }

  if (unitsTosell < 1) {
    throw { status: 400, message: 'Must sell at least 1 unit' }
  }

  // Check no pending sale already exists for this investment
  const pendingResult = await query(
    `SELECT id FROM unit_sale_requests
     WHERE investment_id = $1 AND status = 'pending'`,
    [investmentId]
  )

  if (pendingResult.rows.length > 0) {
    throw { status: 409, message: 'A pending sale request already exists for this investment' }
  }

  // Calculate sale amounts
  const grossValue = round(
    (investment.amount / investment.units) * unitsTosell
  )
  const feePercent = 3.00
  const feeAmount  = round(grossValue * (feePercent / 100))
  const netValue   = round(grossValue - feeAmount)

  const result = await query(
    `INSERT INTO unit_sale_requests
       (investment_id, user_id, fleet_id, units_to_sell,
        gross_value, fee_percent, fee_amount, net_value)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      investmentId,
      userId,
      investment.fleet_id,
      unitsTosell,
      grossValue,
      feePercent,
      feeAmount,
      netValue
    ]
  )

await notifyAllAdmins(
  'Unit sale request',
  `${investment.investor_name} wants to sell ${unitsTosell} unit(s). Tap to review.`,
  { type: 'unit_sale_request', saleRequestId: result.rows[0].id }
).catch(() => {})

  return result.rows[0]
}

/**
 * APPROVE UNIT SALE — admin approves a pending sale request.
 */
export async function approveUnitSale(saleRequestId, adminId) {
  return await transaction(async (trx) => {
    // Lock the sale request row
    const saleResult = await trx.query(
      `SELECT * FROM unit_sale_requests
       WHERE id = $1 AND status = 'pending'
       FOR UPDATE`,
      [saleRequestId]
    )

    if (saleResult.rows.length === 0) {
      throw { status: 404, message: 'Sale request not found or already processed' }
    }

    const sale = saleResult.rows[0]

    // Reduce units on investment
    const invResult = await trx.query(
      `UPDATE investments
       SET units      = units - $1,
           status     = CASE WHEN units - $1 = 0 THEN 'sold' ELSE status END,
           sold_at    = CASE WHEN units - $1 = 0 THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING units`,
      [sale.units_to_sell, sale.investment_id]
    )

    // Update fleet total units
    await trx.query(
      `UPDATE fleets
       SET total_units = total_units - $1
       WHERE id = $2`,
      [sale.units_to_sell, sale.fleet_id]
    )

    // Write to ledger — record gross, fee, and net separately for full audit
    await trx.query(
      `INSERT INTO ledger_entries (user_id, type, amount, reference_id, description)
       VALUES
         ($1, 'unit_sale_gross', $2, $3, 'Unit sale gross value'),
         ($1, 'unit_sale_fee',  -$4, $3, 'Unit sale company fee (3%)'),
         ($1, 'unit_sale_net',   $5, $3, 'Unit sale net payout')`,
      [
        sale.user_id,
        sale.gross_value,
        saleRequestId,
        sale.fee_amount,
        sale.net_value
      ]
    )

    // Mark sale request approved
    await trx.query(
      `UPDATE unit_sale_requests
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2`,
      [adminId, saleRequestId]
    )

    // Notify investor via Redis pub/sub
    await redis.publish('unit:sale:approved', JSON.stringify({
      userId:        sale.user_id,
      saleRequestId,
      netValue:      sale.net_value,
      unitsRemaining: invResult.rows[0].units
    }))

    return sale
  })
}

/**
 * REJECT UNIT SALE — admin rejects a pending sale request.
 */
export async function rejectUnitSale(saleRequestId, adminId, notes) {
  const result = await query(
    `UPDATE unit_sale_requests
     SET status = 'rejected', reviewed_by = $1,
         reviewed_at = NOW(), notes = $2
     WHERE id = $3 AND status = 'pending'
     RETURNING *`,
    [adminId, notes || null, saleRequestId]
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'Sale request not found or already processed' }
  }

  return result.rows[0]
}

/**
 * GET pending sale requests — admin view.
 */
export async function getPendingSaleRequests() {
  const result = await query(
    `SELECT
       sr.*,
       u.full_name, u.investor_code,
       f.name AS fleet_name
     FROM unit_sale_requests sr
     JOIN users  u ON u.id = sr.user_id
     JOIN fleets f ON f.id = sr.fleet_id
     WHERE sr.status = 'pending'
     ORDER BY sr.created_at ASC`
  )
  return result.rows
}

/**
 * GET investor's ledger — full earnings history.
 */
export async function getInvestorLedger(userId, limit = 50, offset = 0) {
  const result = await query(
    `SELECT * FROM ledger_entries
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )
  return result.rows
}

/**
 * GET investor's balance summary.
 */
export async function getInvestorBalance(userId) {
  const result = await query(
    `SELECT * FROM user_balances WHERE user_id = $1`,
    [userId]
  )
  return result.rows[0] || {
    user_id:          userId,
    total_balance:    0,
    fleet_earnings:   0,
    referral_earnings: 0,
    sale_proceeds:    0
  }
}

// ── Utility ──────────────────────────────────────────────────────────────────
// NUMERIC(20,2) precision — never use floating point for money
function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}