export const generateCodeSchema = {
  body: {
    type: 'object',
    required: ['fleetId', 'investorName', 'amount', 'units', 'expiryDays'],
    properties: {
      fleetId:      { type: 'string', format: 'uuid' },
      investorName: { type: 'string', minLength: 2, maxLength: 200 },
      amount:       { type: 'number', minimum: 1 },
      units:        { type: 'integer', minimum: 1 },
      expiryDays:   { type: 'integer', minimum: 1, maximum: 90 }
    },
    additionalProperties: false
  }
}

export const revokeCodeSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
}