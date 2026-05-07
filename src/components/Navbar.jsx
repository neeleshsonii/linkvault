import { useState } from 'react'
import { Vault, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ linkCount }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // User model stores displayName, not name
  const displayName = user?.displayName || user?.name || ''
  const initial     = displayName.charAt(0).toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-50 bg-ink-950/80 backdrop-blur-xl border-b border-ink-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-volt rounded-lg flex items-center justify-center">
            <Vault size={15} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-base text-ink-50">LinkVault</span>
          {linkCount > 0 && (
            <span className="text-xs bg-ink-800 border border-ink-700 text-ink-400 px-2 py-0.5 rounded-full font-body ml-1">
              {linkCount}
            </span>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-ink-800 transition-colors"
          >
            {/* Avatar: photo if available, else initial */}
            {user?.photo ? (
              <img
                src={user.photo}
                alt={displayName}
                className="w-6 h-6 rounded-full object-cover border border-volt/30"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-volt/20 border border-volt/30 flex items-center justify-center">
                <span className="text-xs font-display font-700 text-volt">{initial}</span>
              </div>
            )}
            <span className="text-sm text-ink-200 font-body hidden sm:block">{displayName}</span>
            <ChevronDown size={14} className={`text-ink-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-ink-900 border border-ink-700 rounded-xl shadow-xl overflow-hidden animate-scale-in">
              <div className="px-4 py-3 border-b border-ink-800">
                {user?.photo && (
                  <img
                    src={user.photo}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover mb-2 border border-ink-700"
                  />
                )}
                <p className="text-sm font-display font-600 text-ink-100">{displayName}</p>
                <p className="text-xs text-ink-500 font-body mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink-300 hover:text-red-400 hover:bg-red-400/5 transition-colors font-body"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}