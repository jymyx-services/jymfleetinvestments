import * as NotifService from './notifications.service.js'

export async function getNotifications(request, reply) {
  try {
    const { limit = 30, offset = 0 } = request.query
    const notifs = await NotifService.getUserNotifications(
      request.user.id, parseInt(limit), parseInt(offset)
    )
    return reply.status(200).send({ success: true, data: notifs })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getUnreadCount(request, reply) {
  try {
    const count = await NotifService.getUnreadCount(request.user.id)
    return reply.status(200).send({ success: true, data: { count } })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function markAllRead(request, reply) {
  try {
    await NotifService.markAllRead(request.user.id)
    return reply.status(200).send({ success: true })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function markOneRead(request, reply) {
  try {
    await NotifService.markOneRead(request.params.id, request.user.id)
    return reply.status(200).send({ success: true })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function subscribePush(request, reply) {
  try {
    await NotifService.savePushSubscription(request.user.id, request.body.subscription)
    return reply.status(200).send({ success: true })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function unsubscribePush(request, reply) {
  try {
    await NotifService.deletePushSubscription(request.user.id)
    return reply.status(200).send({ success: true })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}