import { query }    from '../config/database.js'
import { redis }    from '../config/redis.js'
import { sendPush } from './push.js'
import { logger }   from './logger.js'

/**
 * Master notification sender.
 * Writes to DB + broadcasts WebSocket + sends Web Push.
 *
 * @param {string}   userId
 * @param {string}   type   - matches notif_type enum
 * @param {string}   title
 * @param {string}   body
 * @param {object}   data   - any extra JSON payload
 */
export async function notify(userId, type, title, body, data = {}) {
  try {
    // 1. Persist notification to DB
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, body, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [userId, type, title, body, JSON.stringify(data)]
    )

    const notif = {
      id:         result.rows[0].id,
      userId,
      type,
      title,
      body,
      data,
      isRead:     false,
      createdAt:  result.rows[0].created_at
    }

    // 2. Broadcast to WebSocket via Redis pub/sub
    // WebSocket server subscribes to this channel
    await redis.publish(`notif:${userId}`, JSON.stringify(notif))

    // 3. Send Web Push (out-of-app / background)
    const subResult = await query(
      `SELECT push_subscription FROM users WHERE id = $1`,
      [userId]
    )

    const subscription = subResult.rows[0]?.push_subscription
    if (subscription) {
      try {
        await sendPush(subscription, {
          title,
          body,
          data,
          badge: '/icons/badge-72.png',
          icon:  '/icons/icon-192.png'
        })
      } catch (pushErr) {
        if (pushErr.expired) {
          // Subscription expired — clear it from DB
          await query(
            `UPDATE users SET push_subscription = NULL WHERE id = $1`,
            [userId]
          )
          logger.warn('Push subscription expired, cleared', { userId })
        }
      }
    }

    return notif
  } catch (err) {
    // Notifications must never crash the caller
    logger.error('notify() failed', { err: err.message, userId, type })
  }
}

/**
 * Notify multiple users at once — used by distribution engine.
 */
export async function notifyMany(userIds, type, title, body, data = {}) {
  await Promise.allSettled(
    userIds.map(uid => notify(uid, type, title, body, data))
  )
}