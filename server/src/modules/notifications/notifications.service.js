import { query } from '../../config/database.js'

export async function getUserNotifications(userId, limit = 30, offset = 0) {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )
  return result.rows
}

export async function getUnreadCount(userId) {
  const result = await query(
    `SELECT COUNT(*) FROM notifications
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  )
  return parseInt(result.rows[0].count)
}

export async function markAllRead(userId) {
  await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  )
}

export async function markOneRead(notifId, userId) {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notifId, userId]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Notification not found' }
  }
}

export async function savePushSubscription(userId, subscription) {
  await query(
    `UPDATE users SET push_subscription = $1 WHERE id = $2`,
    [JSON.stringify(subscription), userId]
  )
}

export async function deletePushSubscription(userId) {
  await query(
    `UPDATE users SET push_subscription = NULL WHERE id = $1`,
    [userId]
  )
}

export async function saveAdminPushSubscription(userId, subscription) {
  await query(
    `INSERT INTO admin_push_subscriptions (user_id, subscription)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET subscription = $2, updated_at = NOW()`,
    [userId, JSON.stringify(subscription)]
  )
}

export async function notifyAllAdmins(title, body, data = {}) {
  const result = await query(
    `SELECT aps.subscription
     FROM admin_push_subscriptions aps
     JOIN users u ON u.id = aps.user_id
     WHERE u.role IN ('admin','superadmin')
       AND u.status = 'active'`
  )

  const { sendPush } = await import('../../lib/push.js')

  await Promise.allSettled(
    result.rows.map(async row => {
      try {
        await sendPush(row.subscription, { title, body, data,
          icon:  '/icons/icon-192.png',
          badge: '/icons/badge-72.png'
        })
      } catch (err) {
        if (err.expired) {
          await query(
            `DELETE FROM admin_push_subscriptions
             WHERE subscription = $1`,
            [JSON.stringify(row.subscription)]
          )
        }
      }
    })
  )
}