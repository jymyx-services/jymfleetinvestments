export const createFleetSchema = {
  body: {
    type: 'object',
    required: ['name', 'equipmentType', 'minimumDeposit', 'companyCutPercent'],
    properties: {
      name:              { type: 'string', minLength: 2, maxLength: 200 },
      description:       { type: 'string', maxLength: 1000 },
      equipmentType:     { type: 'string', minLength: 2, maxLength: 100 },
      model:             { type: 'string', maxLength: 100 },
      minimumDeposit:    { type: 'number', minimum: 1 },
      companyCutPercent: { type: 'number', minimum: 0, maximum: 100 },
      maxUnits:          { type: 'integer', minimum: 0, default: 0 }
    },
    additionalProperties: false
  }
}

export const updateFleetSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name:              { type: 'string', minLength: 2, maxLength: 200 },
      description:       { type: 'string', maxLength: 1000 },
      model:             { type: 'string', maxLength: 100 },
      companyCutPercent: { type: 'number', minimum: 0, maximum: 100 },
      maxUnits:          { type: 'integer', minimum: 0 },
      status:            { type: 'string', enum: ['active', 'idle', 'retired'] }
    },
    additionalProperties: false
  }
}

export const fleetParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
}