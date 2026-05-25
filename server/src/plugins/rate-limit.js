import fastifyRateLimit from '@fastify/rate-limit'
import fp from 'fastify-plugin'
import { redis } from '../config/redis.js'

async function _rateLimitPlugin(fastify) {
  fastify.register(fastifyRateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    redis,
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      error: 'Too many requests. Please slow down.'
    })
  })
}

export const rateLimitPlugin = fp(_rateLimitPlugin)