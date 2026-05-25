import * as FleetService from './fleets.service.js'
import { logger } from '../../lib/logger.js'

export async function createFleet(request, reply) {
  try {
    const fleet = await FleetService.createFleet(request.body, request.user.id)
    return reply.status(201).send({ success: true, data: fleet })
  } catch (err) {
    logger.error('Create fleet failed', { err: err.message })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function getAllFleets(request, reply) {
  try {
    const fleets = await FleetService.getAllFleets()
    return reply.status(200).send({ success: true, data: fleets })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getFleetById(request, reply) {
  try {
    const fleet = await FleetService.getFleetById(request.params.id)
    return reply.status(200).send({ success: true, data: fleet })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function updateFleet(request, reply) {
  try {
    const fleet = await FleetService.updateFleet(request.params.id, request.body)
    return reply.status(200).send({ success: true, data: fleet })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function getFleetEarningsHistory(request, reply) {
  try {
    const history = await FleetService.getFleetEarningsHistory(request.params.id)
    return reply.status(200).send({ success: true, data: history })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function getMyFleets(request, reply) {
  try {
    const fleets = await FleetService.getInvestorFleets(request.user.id)
    return reply.status(200).send({ success: true, data: fleets })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}