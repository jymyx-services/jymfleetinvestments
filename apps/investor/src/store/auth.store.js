import { create }           from 'zustand'
import { setAccessToken, clearAccessToken } from '@/services/api'

export const useAuthStore = create((set) => ({
  user:        null,
  accessToken: null,
  isLoading:   true,

  setAuth: (user, accessToken) => {
    setAccessToken(accessToken)
    set({ user, accessToken, isLoading: false })
  },

  clearAuth: () => {
    clearAccessToken()
    set({ user: null, accessToken: null, isLoading: false })
  },

  setLoading: (isLoading) => set({ isLoading })
}))