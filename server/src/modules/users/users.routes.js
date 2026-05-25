import {
  getMe, getMyReferrals,
  getAllUsers, suspendUser, activateUser
} from './users.controller.js'
import { userParamSchema, getUsersQuerySchema } from './users.schema.js'
import { query } from '../../config/database.js'

export async function userRoutes(fastify) {
  const auth      = { preHandler: [fastify.authenticate] }
  const adminOnly = { preHandler: [fastify.authorize(['admin', 'superadmin'])] }

  fastify.get('/me',             auth,                                           getMe)
  fastify.get('/me/referrals',   auth,                                           getMyReferrals)
  fastify.get('/',               { ...adminOnly, schema: getUsersQuerySchema },  getAllUsers)
  fastify.patch('/:id/suspend',  { ...adminOnly, schema: userParamSchema },      suspendUser)
  fastify.patch('/:id/activate', { ...adminOnly, schema: userParamSchema },      activateUser)

  // Mark a screen as toured — called once per screen per user
  fastify.patch('/me/tour', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['screen'],
        properties: {
          screen: {
            type: 'string',
            enum: ['dashboard','investments','fleet_detail','notifications','profile']
          }
        },
        additionalProperties: false
      }
    }
  }, async (request, reply) => {
    const { screen } = request.body
    await query(
      `UPDATE users
       SET toured_screens = toured_screens || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify({ [screen]: true }), request.user.id]
    )
    return reply.status(200).send({ success: true })
  })
}