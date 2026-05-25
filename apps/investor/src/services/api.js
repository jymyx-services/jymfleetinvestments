import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) throw new Error('VITE_API_URL is not defined in environment')

let _accessToken = null

export const setAccessToken   = (token) => { _accessToken = token }
export const clearAccessToken = ()      => { _accessToken = null  }

export const api = axios.create({
  baseURL:         BASE_URL,
  timeout:         15000,
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error)    => Promise.reject(error)
)