import { initializeApp }        from 'firebase/app'
import { getAuth,
         GoogleAuthProvider,
         signInWithRedirect }      from 'firebase/auth'

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

export const loginWithGoogle = async () => {
  const result = await signInWithRedirect(auth, googleProvider)
  const token  = await result.user.getIdToken(true)
  console.log('Firebase token obtained, length:', token.length)
  return { user: result.user, token }
}