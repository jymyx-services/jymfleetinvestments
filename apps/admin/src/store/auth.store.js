import { create }                           from 'zustand'
import { setAccessToken, clearAccessToken } from '../services/api'

export const useAuthStore = create((set) => ({
  user:      null,
  isLoading: true,

  setAuth: (user, token) => {
    setAccessToken(token)   
    set({ user, isLoading: false })
  },

  clearAuth: () => {
    clearAccessToken()     
    set({ user: null, isLoading: false })
  }
}))