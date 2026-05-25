import {
  previewEarnings,
  enterEarnings,
  requestSale,
  approveSale,
  rejectSale,
  getPendingSales,
  getMyLedger,
  getMyBalance
} from './distributions.controller.js'

import {
  enterEarningsSchema,
  previewEarningsSchema,
  fleetEarningParamSchema
} from './distributions.schema.js'

export async function distributionRoutes(fastify) {
  const adminOnly     = { preHandler: [fastify.authorize(['admin', 'superadmin'])] }
  const authenticated = { preHandler: [fastify.authenticate] }

  // ── Investor routes ──────────────────────────────────────────────────────
  fastify.get('/my/ledger',   authenticated, getMyLedger)
  fastify.get('/my/balance',  authenticated, getMyBalance)

  fastify.post('/sale/request', {
    ...authenticated,
    schema: {
      body: {
        type: 'object',
        required: ['investmentId', 'unitsToSell'],
        properties: {
          investmentId: { type: 'string', format: 'uuid' },
          unitsToSell:  { type: 'integer', minimum: 1 }
        },
        additionalProperties: false
      }
    }
  }, requestSale)

  // ── Admin routes ─────────────────────────────────────────────────────────
  fastify.post('/preview',        { ...adminOnly, schema: previewEarningsSchema }, previewEarnings)
  fastify.post('/enter',          { ...adminOnly, schema: enterEarningsSchema },   enterEarnings)
  fastify.get('/sales/pending',   adminOnly,                                        getPendingSales)
  fastify.patch('/sales/:id/approve', adminOnly,                                    approveSale)
  fastify.patch('/sales/:id/reject', {
    ...adminOnly,
    schema: {
      body: {
        type: 'object',
        properties: {
          notes: { type: 'string', maxLength: 500 }
        },
        additionalProperties: false
      }
    }
  }, rejectSale)
}