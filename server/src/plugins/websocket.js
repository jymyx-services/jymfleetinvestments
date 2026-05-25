import fastifyWs from '@fastify/websocket'
import fp from 'fastify-plugin'

async function _websocketPlugin(fastify) {
  fastify.register(fastifyWs, {
    options: { maxPayload: 1048576 }
  })
}

export const websocketPlugin = fp(_websocketPlugin)