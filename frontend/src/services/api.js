import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication API calls
 */
export const authAPI = {
  register: (email, username, password) =>
    api.post('/auth/register', { email, username, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  profile: () =>
    api.get('/auth/profile'),

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

/**
 * Compiler API calls
 */
export const compilerAPI = {
  run: (problemSlug, code) =>
    api.post('/compiler/run', { problem_slug: problemSlug, code }),

  submit: (problemSlug, code) =>
    api.post('/compiler/submit', { problem_slug: problemSlug, code }),

  getSubmissions: (problemSlug) =>
    api.get(`/compiler/submissions/${problemSlug}`),
}

export default api
