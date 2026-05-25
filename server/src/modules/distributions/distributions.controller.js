import * as DistService from './distributions.service.js'
import { logger } from '../../lib/logger.js'

export async function previewEarnings(request, reply) {
  try {
    const { fleetId, grossAmount } = request.body
    const preview = await DistService.previewDistribution(fleetId, grossAmount)
    return reply.status(200).send({ success: true, data: preview })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function enterEarnings(request, reply) {
  try {
    const { fleetId, grossAmount, earningDate } = request.body
    const result = await DistService.distributeEarnings(
      fleetId, grossAmount, earningDate, request.user.id
    )
    return reply.status(201).send({ success: true, data: result })
  } catch (err) {
    logger.error('Distribution failed', { err: err.message })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function requestSale(request, reply) {
  try {
    const { investmentId, unitsToSell } = request.body
    const result = await DistService.requestUnitSale(
      investmentId, unitsToSell, request.user.id
    )
    return reply.status(201).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function approveSale(request, reply) {
  try {
    const result = await DistService.approveUnitSale(
      request.params.id, request.user.id
    )
    return reply.status(200).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function rejectSale(request, reply) {
  try {
    const result = await DistService.rejectUnitSale(
      request.params.id, request.user.id, request.body.notes
    )
    return reply.status(200).send({ success: true, data: result })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function getPendingSales(request, reply) {
  try {
    const sales = await DistService.getPendingSaleRequests()
    return reply.status(200).send({ success: true, data: sales })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getMyLedger(request, reply) {
  try {
    const { limit = 50, offset = 0 } = request.query
    const entries = await DistService.getInvestorLedger(
      request.user.id, parseInt(limit), parseInt(offset)
    )
    return reply.status(200).send({ success: true, data: entries })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getMyBalance(request, reply) {
  try {
    const balance = await DistService.getInvestorBalance(request.user.id)
    return reply.status(200).send({ success: true, data: balance })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}