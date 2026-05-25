export const userParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' }
    }
  }
}

export const getUsersQuerySchema = {
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string', maxLength: 100 },
      limit:  { type: 'integer', minimum: 1, maximum: 100, default: 50 },
      offset: { type: 'integer', minimum: 0, default: 0 }
    }
  }
}