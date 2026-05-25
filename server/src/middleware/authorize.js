export function authorize(...roles) {
  return async function (request, reply) {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  }
}