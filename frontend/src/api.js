import axios from 'axios'

const defaultApiUrl = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl
let unauthorizedHandler = null

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof unauthorizedHandler === 'function') {
      unauthorizedHandler()
    }
    return Promise.reject(error)
  },
)

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

export default api
