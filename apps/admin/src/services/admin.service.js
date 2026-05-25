import { api } from './api'

export const adminService = {
  // Auth
  login:          (email, password) => api.post('/auth/login', { email, password }),
  refresh:        ()                => api.post('/auth/refresh', {}),
  me:             ()                => api.get('/auth/me'),
  logout:         ()                => api.post('/auth/logout'),

  // Fleets
  getAllFleets:   ()                => api.get('/fleets'),
  createFleet:   (body)            => api.post('/fleets', body),
  updateFleet:   (id, body)        => api.patch(`/fleets/${id}`, body),
  getFleetHistory: (id)            => api.get(`/fleets/${id}/history`),

  // Distributions
  previewEarnings: (body)          => api.post('/distributions/preview', body),
  enterEarnings:   (body)          => api.post('/distributions/enter', body),
  getPendingSales: ()              => api.get('/distributions/sales/pending'),
  approveSale:    (id)             => api.patch(`/distributions/sales/${id}/approve`),
  rejectSale:     (id, notes)      => api.patch(`/distributions/sales/${id}/reject`, { notes }),

  // Investors
  getAllUsers:    (search, limit, offset) =>
    api.get(`/users?search=${search || ''}&limit=${limit || 50}&offset=${offset || 0}`),
  suspendUser:   (id)             => api.patch(`/users/${id}/suspend`),
  activateUser:  (id)             => api.patch(`/users/${id}/activate`),

  // Invite codes
  generateCode:  (body)           => api.post('/invite-codes', body),
  listCodes:     (fleetId)        =>
    api.get(`/invite-codes${fleetId ? `?fleetId=${fleetId}` : ''}`),
  revokeCode:    (id)             => api.patch(`/invite-codes/${id}/revoke`)
}