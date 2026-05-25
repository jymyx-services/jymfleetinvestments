import webpush  from 'web-push'
import { env }  from '../config/env.js'
import { logger } from './logger.js'

// Only configure if VAPID keys are present
if (env.vapidPublicKey && env.vapidPrivateKey) {
  webpush.setVapidDetails(
    env.vapidEmail,
    env.vapidPublicKey,
    env.vapidPrivateKey
  )
}

/**
 * Send a push notification to a single subscription.
 * Silently handles expired/invalid subscriptions.
 */
export async function sendPush(subscription, payload) {
  if (!env.vapidPublicKey || !env.vapidPrivateKey) {
    logger.warn('VAPID keys not configured — push skipped')
    return
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
  } catch (err) {
    // 410 Gone = subscription expired, caller should delete it
    if (err.statusCode === 410) {
      throw { expired: true, err }
    }
    logger.error('Push send failed', { err: err.message })
  }
}

export function generateVapidKeys() {
  return webpush.generateVAPIDKeys()
}