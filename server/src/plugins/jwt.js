import fastifyJwt    from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import fp            from 'fastify-plugin'
import { env }       from '../config/env.js'

async function _jwtPlugin(fastify) {
  await fastify.register(fastifyCookie, {
    secret: env.jwtAccessSecret // signs cookies
  })

  await fastify.register(fastifyJwt, {
    secret: env.jwtAccessSecret,
    sign:   { expiresIn: env.jwtAccessExpires }
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  fastify.decorate('authorize', function (roles) {
    return async function (request, reply) {
      await request.jwtVerify()
      if (!roles.includes(request.user.role)) {
        reply.status(403).send({ error: 'Forbidden' })
      }
    }
  })
}

export const jwtPlugin = fp(_jwtPlugin)