import * as InvestmentService from './investments.service.js'

export async function getInvestmentById(request, reply) {
  try {
    const inv = await InvestmentService.getInvestmentById(
      request.params.id, request.user.id
    )
    return reply.status(200).send({ success: true, data: inv })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function getInvestmentHistory(request, reply) {
  try {
    const history = await InvestmentService.getInvestmentEarningsHistory(
      request.params.id, request.user.id
    )
    return reply.status(200).send({ success: true, data: history })
  } catch (err) {
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}