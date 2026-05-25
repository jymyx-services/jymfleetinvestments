import { api } from './api'

export const tourService = {
  markToured: (screen) => api.patch('/users/me/tour', { screen })
}