import { getInvestmentById, getInvestmentHistory } from './investments.controller.js'
import { investmentParamSchema, investmentHistorySchema } from './investments.schema.js'

export async function investmentRoutes(fastify) {
  const auth = { preHandler: [fastify.authenticate] }

  fastify.get('/:id',         { ...auth, schema: investmentParamSchema },   getInvestmentById)
  fastify.get('/:id/history', { ...auth, schema: investmentHistorySchema }, getInvestmentHistory)
}