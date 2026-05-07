import { createContext, useContext, useState } from 'react'
import { googleLogin as apiGoogleLogin, logout as apiLogout, getToken, getUser } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getUser)
  const [token, setToken] = useState(getToken)

  const loginWithGoogle = async (firebaseToken) => {
    try {
      const data = await apiGoogleLogin(firebaseToken)
      setUser(data.user)
      setToken(data.token)
      return { success: true }
    } catch (err) {
      // err is a plain Error (from fetch), so read err.serverError or err.message
      const message = err.serverError || err.message || 'Google login failed'
      console.error('loginWithGoogle failed:', message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)