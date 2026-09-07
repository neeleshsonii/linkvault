import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            "AIzaSyCY6dWqOPw7lAyQNvakne0To_Emfb6BbW8",
  authDomain:        "linkvault-e9700.firebaseapp.com",
  projectId:         "linkvault-e9700",
  storageBucket:     "linkvault-e9700.firebasestorage.app",
  messagingSenderId: "1039076139240",
  appId:             "1:1039076139240:web:1242e8e41f522bf91ca95d",
  measurementId:     "G-MJ2939DG2H"
}

const app = initializeApp(firebaseConfig)
export const auth           = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// 1. Function called when clicking the Login button
export const loginWithGoogle = async () => {
  const isMobileApp = typeof navigator !== 'undefined' && navigator.userAgent.includes("LinkVaultMobileApp")

  if (isMobileApp) {
    // On mobile app: Navigate away to Google
    await signInWithRedirect(auth, googleProvider)
    return null
  } else {
    // On web browser: Open popup and return user + token immediately
    const result = await signInWithPopup(auth, googleProvider)
    const token  = await result.user.getIdToken(true)
    console.log('Firebase token obtained, length:', token.length)
    return { user: result.user, token }
  }
}

// 2. Helper to catch the user when they return from the mobile redirect
export const checkRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth)
    if (result && result.user) {
      const token = await result.user.getIdToken(true)
      return { user: result.user, token }
    }
  } catch (error) {
    console.error("Redirect login error:", error)
  }
  return null
}