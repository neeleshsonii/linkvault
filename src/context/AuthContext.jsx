import { createContext, useContext, useState, useEffect } from 'react'
import { googleLogin as apiGoogleLogin, logout as apiLogout, getToken, getUser } from '../api/auth'
// 1. Import your redirect checker
import { checkRedirectLogin } from '../firebase' 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(getUser)
  const [token, setToken] = useState(getToken)
  // 2. Add a loading state so the app doesn't kick us out while checking Google
  const [isInitializing, setIsInitializing] = useState(true)

  // 3. The "Catcher": Runs once when the app loads
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const redirectData = await checkRedirectLogin();
        // If we came back from mobile Google Login, we will have a token!
        if (redirectData && redirectData.token) {
          await loginWithGoogle(redirectData.token);
        }
      } catch (err) {
        console.error("Failed to process redirect:", err);
      } finally {
        setIsInitializing(false); // Done checking, safe to render the app
      }
    };
    
    handleRedirect();
  }, []);

  const loginWithGoogle = async (firebaseToken) => {
    try {
      const data = await apiGoogleLogin(firebaseToken)
      setUser(data.user)
      setToken(data.token)
      return { success: true }
    } catch (err) {
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

  // 4. Show a blank screen (or spinner) ONLY while catching the redirect
  if (isInitializing) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, token, loginWithGoogle, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)