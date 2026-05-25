import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
if (!BASE_URL) throw new Error('VITE_API_URL not defined')

let _accessToken = null
export const setAccessToken   = (t) => { _accessToken = t }
export const clearAccessToken = ()  => { _accessToken = null }

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
  (r) => r,
  (e) => Promise.reject(e)
)