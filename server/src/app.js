import Fastify           from 'fastify'
import { env }           from './config/env.js'
import { connectDatabase } from './config/database.js'
import { redis, connectRedis, createSubscriber } from './config/redis.js'
import { logger }        from './lib/logger.js'
import { corsPlugin }    from './plugins/cors.js'
import { jwtPlugin }     from './plugins/jwt.js'
import { rateLimitPlugin } from './plugins/rate-limit.js'
import { websocketPlugin } from './plugins/websocket.js'

import { authRoutes }         from './modules/auth/auth.routes.js'
import { fleetRoutes }        from './modules/fleets/fleets.routes.js'
import { investmentRoutes }   from './modules/investments/investments.routes.js'
import { distributionRoutes } from './modules/distributions/distributions.routes.js'
import { inviteRoutes }       from './modules/invite-codes/invite.routes.js'
import { userRoutes }         from './modules/users/users.routes.js'
import { notifRoutes }        from './modules/notifications/notifications.routes.js'

const fastify = Fastify({
  logger:     false,
  trustProxy: true
})

async function bootstrap() {
  try {
    await connectDatabase()
    await connectRedis()

    await fastify.register(corsPlugin)
    await fastify.register(jwtPlugin)
    await fastify.register(rateLimitPlugin)
    await fastify.register(websocketPlugin)

    fastify.get('/health', async () => ({
      status: 'ok',
      env:    env.nodeEnv,
      ts:     new Date().toISOString()
    }))

    fastify.register(authRoutes,         { prefix: '/api/auth'          })
    fastify.register(fleetRoutes,        { prefix: '/api/fleets'        })
    fastify.register(investmentRoutes,   { prefix: '/api/investments'   })
    fastify.register(distributionRoutes, { prefix: '/api/distributions' })
    fastify.register(inviteRoutes,       { prefix: '/api/invite-codes'  })
    fastify.register(userRoutes,         { prefix: '/api/users'         })
    fastify.register(notifRoutes,        { prefix: '/api/notifications' })

    // ── WebSocket real-time handler ──────────────────────────────────────
    fastify.register(async function wsHandler(fastify) {
      fastify.get('/ws', { websocket: true }, (socket) => {
        let userId     = null
        let subscriber = null

        socket.on('message', async (raw) => {
          try {
            const msg = JSON.parse(raw.toString())

            if (msg.type === 'auth' && !userId) {
              try {
                const decoded = fastify.jwt.verify(msg.token)
                userId = decoded.id

                // Dedicated ioredis subscriber for this socket connection
                subscriber = createSubscriber()

                await subscriber.subscribe(
                  `notif:${userId}`,
                  'fleet:distribution'
                )

                subscriber.on('message', (channel, message) => {
                  if (socket.readyState !== 1) return // 1 = OPEN

                  if (channel === `notif:${userId}`) {
                    socket.send(message)
                    return
                  }

                  if (channel === 'fleet:distribution') {
                    try {
                      const event = JSON.parse(message)
                      const mine  = event.breakdown?.find(b => b.userId === userId)
                      if (mine) {
                        socket.send(JSON.stringify({
                          type:        'distribution',
                          fleetName:   event.fleetName,
                          earningDate: event.earningDate,
                          myCredit:    mine.grossCredit
                        }))
                      }
                    } catch { /* ignore parse errors */ }
                  }
                })

                socket.send(JSON.stringify({ type: 'connected', userId }))

              } catch {
                socket.send(JSON.stringify({
                  type:    'error',
                  message: 'Invalid token'
                }))
              }
            }
          } catch { /* ignore malformed messages */ }
        })

        const cleanup = () => {
          if (subscriber) {
            subscriber.disconnect()
            subscriber = null
          }
        }

        socket.on('close', cleanup)
        socket.on('error', cleanup)
      })
    })

    await fastify.listen({ port: env.port, host: '0.0.0.0' })
    logger.info(`JFI server running on port ${env.port}`)

  } catch (err) {
    logger.error('Server failed to start', { err: err.message })
    process.exit(1)
  }
}

bootstrap()