import { query } from '../../config/database.js'

export async function getInvestmentById(investmentId, userId) {
  const result = await query(
    `SELECT
       i.*,
       f.name             AS fleet_name,
       f.equipment_type,
       f.model,
       f.status           AS fleet_status,
       f.minimum_deposit,
       f.company_cut_percent,
       COALESCE(SUM(dl.gross_credit), 0) AS total_earned,
       COALESCE(
         SUM(CASE WHEN dl.earning_date = CURRENT_DATE
             THEN dl.gross_credit ELSE 0 END), 0
       ) AS today_earned
     FROM investments i
     JOIN fleets f ON f.id = i.fleet_id
     LEFT JOIN distribution_logs dl ON dl.investment_id = i.id
     WHERE i.id = $1 AND i.user_id = $2
     GROUP BY i.id, f.id`,
    [investmentId, userId]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Investment not found' }
  }
  return result.rows[0]
}

export async function getInvestmentEarningsHistory(investmentId, userId, limit = 30) {
  // Verify ownership first
  const own = await query(
    `SELECT id FROM investments WHERE id = $1 AND user_id = $2`,
    [investmentId, userId]
  )
  if (own.rows.length === 0) throw { status: 404, message: 'Investment not found' }

  const result = await query(
    `SELECT
       dl.earning_date,
       dl.gross_credit,
       dl.unit_value,
       dl.units,
       dl.referral_credit,
       fe.gross_amount   AS fleet_gross,
       fe.distributable  AS fleet_distributable
     FROM distribution_logs dl
     JOIN fleet_earnings fe ON fe.id = dl.fleet_earning_id
     WHERE dl.investment_id = $1
     ORDER BY dl.earning_date DESC
     LIMIT $2`,
    [investmentId, limit]
  )
  return result.rows
}