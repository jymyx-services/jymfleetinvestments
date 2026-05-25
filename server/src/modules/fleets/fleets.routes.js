import {
  createFleet,
  getAllFleets,
  getFleetById,
  updateFleet,
  getFleetEarningsHistory,
  getMyFleets
} from './fleets.controller.js'

import {
  createFleetSchema,
  updateFleetSchema,
  fleetParamSchema
} from './fleets.schema.js'

export async function fleetRoutes(fastify) {
  const adminOnly     = { preHandler: [fastify.authorize(['admin','superadmin'])] }
  const authenticated = { preHandler: [fastify.authenticate] }

  // Investor routes
  fastify.get('/my',          authenticated,                          getMyFleets)
  fastify.get('/:id',         { ...authenticated, schema: fleetParamSchema },   getFleetById)
  fastify.get('/:id/history', { ...authenticated, schema: fleetParamSchema },   getFleetEarningsHistory)

  // Admin routes
  fastify.get('/',    adminOnly,                                      getAllFleets)
  fastify.post('/',   { ...adminOnly, schema: createFleetSchema },    createFleet)
  fastify.patch('/:id', { ...adminOnly, schema: updateFleetSchema },  updateFleet)
}