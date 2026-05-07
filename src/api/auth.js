import axios from 'axios'

const BASE_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'lv_token'
const USER_KEY  = 'lv_user'

export const getToken     = () => localStorage.getItem(TOKEN_KEY)
export const getUser      = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null')
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Google login — plain fetch, no axios needed here ─────────────────────────
export const googleLogin = async (firebaseToken) => {
  console.log('googleLogin called, sending to backend...')

  const res = await fetch(`${BASE_URL}/api/auth/google-login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token: firebaseToken }),
  })

  console.log('Backend response status:', res.status)
  const data = await res.json()
  console.log('Backend response data:', data)

  if (!res.ok) {
    const err = new Error(data.error || 'Google login failed')
    err.serverError = data.error
    throw err
  }

  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY,  JSON.stringify(data.user))

  console.log('Saved to localStorage OK')
  return data
}

export const logout = () => clearSession()

// ── Axios instance with JWT — used by api/links.js ───────────────────────────
export const authAPI = axios.create({ baseURL: BASE_URL })

authAPI.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

authAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearSession()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)