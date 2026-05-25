import * as AuthService from './auth.service.js'
import { logger }       from '../../lib/logger.js'

function setRefreshCookie(reply, refreshToken) {
  reply.setCookie('jfi_refresh', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/api/auth',
    maxAge:   60 * 60 * 24 * 30
  })
}

function setAdminRefreshCookie(reply, refreshToken) {
  reply.setCookie('jfi_admin_refresh', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/api/auth',
    maxAge:   60 * 60 * 24 * 30
  })
}

export async function validateCode(request, reply) {
  try {
    const data = await AuthService.validateInviteCode(request.body.inviteCode)
    return reply.status(200).send({ success: true, data })
  } catch (err) {
    logger.warn('Invite code validation failed', { err: err.message })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function register(request, reply) {
  try {
    const { inviteCode, ...rest } = request.body
    const codeData = await AuthService.validateInviteCode(inviteCode)
    const user     = await AuthService.registerInvestor(codeData.codeId, rest, request.ip)

    const accessToken  = await request.server.jwt.sign({ id: user.id, role: user.role })
    const refreshToken = await request.server.jwt.sign(
      { id: user.id, type: 'refresh' },
      { sign: { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' } }
    )

    await AuthService.storeRefreshToken(user.id, refreshToken)
    setRefreshCookie(reply, refreshToken)

    return reply.status(201).send({
      success: true,
      data: {
        user: {
          id:           user.id,
          fullName:     user.full_name,
          email:        user.email,
          role:         user.role,
          investorCode: user.investor_code
        },
        accessToken
      }
    })
  } catch (err) {
    logger.error('Registration failed', { err: err.message })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}

export async function login(request, reply) {
  try {
    const { email, password } = request.body
    const user = await AuthService.loginUser(email, password)

    const accessToken  = await request.server.jwt.sign({ id: user.id, role: user.role })
    const refreshToken = await request.server.jwt.sign(
      { id: user.id, type: 'refresh' },
      { sign: { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' } }
    )

    await AuthService.storeRefreshToken(user.id, refreshToken)

    // Admin and superadmin get a separate cookie
    if (user.role === 'admin' || user.role === 'superadmin') {
      setAdminRefreshCookie(reply, refreshToken)
    } else {
      setRefreshCookie(reply, refreshToken)
    }

    return reply.status(200).send({
      success: true,
      data: { user, accessToken }
    })
  } catch (err) {
    logger.warn('Login failed', { email: request.body.email })
    return reply.status(err.status || 500).send({ success: false, error: err.message })
  }
}


export async function refresh(request, reply) {
  try {
    // Try investor cookie first, then admin cookie
    const refreshToken =
      request.cookies?.jfi_refresh ||
      request.cookies?.jfi_admin_refresh

    if (!refreshToken) {
      return reply.status(401).send({ success: false, error: 'No refresh token' })
    }

    let decoded
    try {
      decoded = request.server.jwt.verify(refreshToken)
    } catch {
      return reply.status(401).send({ success: false, error: 'Invalid refresh token' })
    }

    const valid = await AuthService.verifyRefreshToken(decoded.id, refreshToken)
    if (!valid) {
      return reply.status(401).send({ success: false, error: 'Session expired' })
    }

    const accessToken = await request.server.jwt.sign({
      id:   decoded.id,
      role: decoded.role
    })

    return reply.status(200).send({ success: true, data: { accessToken } })
  } catch {
    return reply.status(401).send({ success: false, error: 'Authentication failed' })
  }
}


export async function me(request, reply) {
  try {
    return reply.status(200).send({ success: true, data: { user: request.user } })
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message })
  }
}

export async function logout(request, reply) {
  try {
    await request.jwtVerify()
    await AuthService.revokeRefreshToken(request.user.id)
  } catch { /* clear cookies regardless */ }

  reply.clearCookie('jfi_refresh',       { path: '/api/auth' })
  reply.clearCookie('jfi_admin_refresh', { path: '/api/auth' })
  return reply.status(200).send({ success: true, message: 'Logged out' })
}