import { api } from './api'

export const fleetService = {
  getMyFleets:    ()         => api.get('/fleets/my'),
  getFleetById:   (id)       => api.get(`/fleets/${id}`),
  getHistory:     (id)       => api.get(`/fleets/${id}/history`)
}