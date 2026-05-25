import {
    validateCode,
    register,
    login,
    refresh,
    logout,
    me
} from './auth.controller.js'

import {
    validateCodeSchema,
    registerSchema,
    loginSchema,
    refreshSchema
} from './auth.schema.js'

export async function authRoutes(fastify) {
    // Rate limit auth endpoints aggressively
    const strictLimit = {
        config: {
            rateLimit: { max: 5, timeWindow: '15 minutes' }
        }
    }

    // Public routes
    fastify.post('/validate-code', { ...strictLimit, schema: validateCodeSchema }, validateCode)
    fastify.post('/register', { ...strictLimit, schema: registerSchema }, register)
    fastify.post('/login', { ...strictLimit, schema: loginSchema }, login)
    fastify.post('/refresh', { schema: refreshSchema }, refresh)

    // Protected routes
    fastify.post('/logout', { preHandler: [fastify.authenticate] }, logout)
    fastify.get('/me', { preHandler: [fastify.authenticate] }, me)
}