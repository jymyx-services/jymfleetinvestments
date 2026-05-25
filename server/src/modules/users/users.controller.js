import * as UserService from './users.service.js'

export async function getMe(request, reply) {
  try {
    const user = await UserService.getUserProfile(request.user.id)
    return reply.status(200).send({ success: true, data: user })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function getMyReferrals(request, reply) {
  try {
    const referrals = await UserService.getUserReferrals(request.user.id)
    return reply.status(200).send({ success: true, data: referrals })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getAllUsers(request, reply) {
  try {
    const { search, limit = 50, offset = 0 } = request.query
    const users = await UserService.getAllUsers(search || null, parseInt(limit), parseInt(offset))
    return reply.status(200).send({ success: true, data: users })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function suspendUser(request, reply) {
  try {
    await UserService.suspendUser(request.params.id, request.user.id)
    return reply.status(200).send({ success: true, message: 'User suspended' })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function activateUser(request, reply) {
  try {
    await UserService.activateUser(request.params.id)
    return reply.status(200).send({ success: true, message: 'User activated' })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}