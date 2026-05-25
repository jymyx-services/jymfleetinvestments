import { api } from './api'

export const authService = {
  validateCode:  (inviteCode)         => api.post('/auth/validate-code', { inviteCode }),
  register:      (body)               => api.post('/auth/register', body),
  login:         (email, password)    => api.post('/auth/login', { email, password }),
  refresh:       ()                   => api.post('/auth/refresh', {}),
  logout:        ()                   => api.post('/auth/logout'),
  me:            ()                   => api.get('/auth/me')
}