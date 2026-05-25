import { api } from './api'

export const investmentService = {
  getById:        (id)                      => api.get(`/investments/${id}`),
  getHistory:     (id)                      => api.get(`/investments/${id}/history`),
  requestSale:    (investmentId, unitsToSell) =>
    api.post('/distributions/sale/request', { investmentId, unitsToSell }),
  getBalance:     ()                        => api.get('/distributions/my/balance'),
  getLedger:      (limit = 30, offset = 0)  =>
    api.get(`/distributions/my/ledger?limit=${limit}&offset=${offset}`),
  getNotifications: (limit = 30)            =>
    api.get(`/notifications?limit=${limit}`),
  getUnreadCount:   ()                      => api.get('/notifications/unread-count'),
  markAllRead:      ()                      => api.patch('/notifications/read-all'),
  markOneRead:      (id)                    => api.patch(`/notifications/${id}/read`),
  subscribePush:    (subscription)          =>
    api.post('/notifications/push/subscribe', { subscription }),
  getProfile:       ()                      => api.get('/users/me'),
  getReferrals:     ()                      => api.get('/users/me/referrals')
}