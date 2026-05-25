import { generateCode, listCodes, revokeCode } from './invite.controller.js'
import { generateCodeSchema, revokeCodeSchema } from './invite.schema.js'

export async function inviteRoutes(fastify) {
  const adminOnly = { preHandler: [fastify.authorize(['admin', 'superadmin'])] }

  fastify.post('/',        { ...adminOnly, schema: generateCodeSchema }, generateCode)
  fastify.get('/',         adminOnly,                                     listCodes)
  fastify.patch('/:id/revoke', { ...adminOnly, schema: revokeCodeSchema }, revokeCode)
}