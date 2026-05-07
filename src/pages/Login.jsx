import { useState, useEffect }  from 'react'
import { useNavigate }          from 'react-router-dom'
import { useAuth }              from '../context/AuthContext'
import { Vault }                from 'lucide-react'
import { loginWithGoogle as firebaseLogin } from '../firebase'

export default function Login() {
  const { isAuth } = useAuth()
  const navigate   = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [error,   setError]         = useState('')

  // ── Redirect AFTER render, not during it ─────────────────────────────────
  useEffect(() => {
    if (isAuth) {
      console.log('[Login] isAuth=true, redirecting to /')
      navigate('/', { replace: true })
    }
  }, [isAuth, navigate])

  const handleClick = async () => {
    setError('')
    setLoading(true)
    try {
      // Step 1 — Firebase Google popup
      console.log('[Login] Opening Google popup...')
      const { token } = await firebaseLogin()
      console.log('[Login] Got Firebase token, length:', token?.length)

      // Step 2 — Send token to backend directly
      console.log('[Login] Sending token to backend...')
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        throw new Error("Backend login failed")
      }

      const data = await response.json()
      console.log('[Login] Backend result success')

      // Step 3 — Save the backend JWT and the rich user object (with the name!)
      localStorage.setItem('lv_token', data.token)
      localStorage.setItem('lv_user', JSON.stringify({
        username: data.user.username,
        name: data.user.name,   // This ensures the top section shows the name
        email: data.user.email,
        photo: data.user.photo
      }))

      // Step 4 — Force redirect to reload AuthContext with the new user data
      window.location.href = '/'

    } catch (err) {
      console.error('[Login] Exception:', err.message)
      setError('Google sign-in failed: ' + err.message)
      setLoading(false)
    }
  }

  // Don't render form if already authed (avoids flash)
  if (isAuth) return null

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-volt/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-volt/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-up text-center">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-12 h-12 bg-volt rounded-xl flex items-center justify-center">
            <Vault size={24} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-2xl text-ink-50">LinkVault</span>
        </div>

        <h1 className="font-display font-700 text-3xl text-ink-50 mb-3">
          Your links, secured.
        </h1>
        <p className="text-ink-500 text-sm mb-10 font-body leading-relaxed">
          Save, organize and access your bookmarks<br />from anywhere. Sign in to get started.
        </p>

        <button
          onClick={handleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-500 py-3 rounded-xl transition-all border border-gray-200 disabled:opacity-50"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          }
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <p className="mt-4 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 animate-fade-in">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-ink-600 font-body">
          Your bookmarks are saved securely in the cloud.
        </p>
      </div>
    </div>
  )
}