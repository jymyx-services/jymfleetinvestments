import {
  getNotifications, getUnreadCount,
  markAllRead, markOneRead,
  subscribePush, unsubscribePush
} from './notifications.controller.js'

import {
  saveAdminPushSubscription
} from './notifications.service.js'

export async function notifRoutes(fastify) {
  const auth      = { preHandler: [fastify.authenticate] }
  const adminOnly = { preHandler: [fastify.authorize(['admin', 'superadmin'])] }

  // Investor routes
  fastify.get('/',             auth, getNotifications)
  fastify.get('/unread-count', auth, getUnreadCount)
  fastify.patch('/read-all',   auth, markAllRead)
  fastify.patch('/:id/read',   auth, markOneRead)
  fastify.post('/push/subscribe',     auth, subscribePush)
  fastify.delete('/push/unsubscribe', auth, unsubscribePush)

  // Admin push subscription
  fastify.post('/admin/push/subscribe', {
    preHandler: [fastify.authorize(['admin', 'superadmin'])],
    schema: {
      body: {
        type: 'object',
        required: ['subscription'],
        properties: {
          subscription: { type: 'object' }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    try {
      await saveAdminPushSubscription(request.user.id, request.body.subscription)
      return reply.status(200).send({ success: true })
    } catch (err) {
      return reply.status(500).send({ success: false, error: err.message })
    }
  })
}