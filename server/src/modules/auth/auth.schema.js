export const registerSchema = {
  body: {
    type: 'object',
    required: ['inviteCode', 'fullName', 'email', 'phone', 'password'],
    properties: {
      inviteCode:   { type: 'string', minLength: 15, maxLength: 20 },
      fullName:     { type: 'string', minLength: 2,  maxLength: 200 },
      email:        { type: 'string', format: 'email' },
      phone:        { type: 'string', minLength: 9,  maxLength: 20 },
      password:     { type: 'string', minLength: 8,  maxLength: 72 },
      referralCode: { type: 'string', maxLength: 20 }
    },
    additionalProperties: false
  }
}

export const loginSchema = {
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 }
        },
        additionalProperties: false
    }
}

export const validateCodeSchema = {
    body: {
        type: 'object',
        required: ['inviteCode'],
        properties: {
            inviteCode: { type: 'string', minLength: 15, maxLength: 20 }
        },
        additionalProperties: false
    }
}

export const refreshSchema = {
    body: {
        type: 'object',
        properties: {},
        additionalProperties: false
    }
}