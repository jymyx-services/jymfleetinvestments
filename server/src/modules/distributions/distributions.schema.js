export const enterEarningsSchema = {
  body: {
    type: 'object',
    required: ['fleetId', 'grossAmount', 'earningDate'],
    properties: {
      fleetId:     { type: 'string', format: 'uuid' },
      grossAmount: { type: 'number', minimum: 1 },
      earningDate: { type: 'string', format: 'date' }
    },
    additionalProperties: false
  }
}

export const previewEarningsSchema = {
  body: {
    type: 'object',
    required: ['fleetId', 'grossAmount'],
    properties: {
      fleetId:     { type: 'string', format: 'uuid' },
      grossAmount: { type: 'number', minimum: 1 }
    },
    additionalProperties: false
  }
}

export const fleetEarningParamSchema = {
  params: {
    type: 'object',
    required: ['fleetId'],
    properties: {
      fleetId: { type: 'string', format: 'uuid' }
    }
  }
}