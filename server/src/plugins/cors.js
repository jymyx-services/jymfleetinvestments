import fastifyCors from '@fastify/cors'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

const allowedOrigins = env.isDev
  ? ['http://localhost:5173', 'http://localhost:5174']
  : ['https://jfi.jymyxliftsservices.com', 'https://admin.jfi.jymyxliftsservices.com']

async function _corsPlugin(fastify) {
  fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true)
      else cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
}

export const corsPlugin = fp(_corsPlugin)