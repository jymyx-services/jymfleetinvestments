import * as InviteService from './invite.service.js'
import { logger } from '../../lib/logger.js'

export async function generateCode(request, reply) {
  try {
    const result = await InviteService.createInviteCode(
      request.body, request.user.id
    )
    return reply.status(201).send({ success: true, data: result })
  } catch (err) {
    logger.error('Invite code generation failed', { err: err.message })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function listCodes(request, reply) {
  try {
    const { fleetId } = request.query
    const codes = await InviteService.listInviteCodes(fleetId || null)
    return reply.status(200).send({ success: true, data: codes })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function revokeCode(request, reply) {
  try {
    await InviteService.revokeInviteCode(request.params.id, request.user.id)
    return reply.status(200).send({ success: true, message: 'Code revoked' })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}