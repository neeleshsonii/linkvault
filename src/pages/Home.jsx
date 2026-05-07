import { useState, useEffect, useMemo } from 'react'
import { Search, X, BookMarked, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import AddLinkForm from '../components/AddLinkForm'
import BookmarkCard from '../components/BookmarkCard'
import { getLinks, saveLink, deleteLink, updateTags, toggleFavorite } from '../api/links'

export default function Home() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    getLinks().then(data => { setLinks(data); setLoading(false) })
  }, [])

  // All unique tags across all links
  const allTags = useMemo(() => {
    const counts = {}
    links.forEach(l => l.tags?.forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
  }, [links])

  // Filtered and SORTED links
  const filtered = useMemo(() => {
    let result = [...links] // Clone so we don't mutate state directly
    
    if (activeTag) result = result.filter(l => l.tags?.includes(activeTag))
    
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.url?.toLowerCase().includes(q) ||
        l.tags?.some(t => t.includes(q))
      )
    }

    // Sort: Favorites first, then newest first
    result.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isFavorite ? -1 : 1;
    });

    return result
  }, [links, search, activeTag])

  const handleSave = async (url, tags) => {
    const newLink = await saveLink(url, tags)
    setLinks(prev => [newLink, ...prev])
  }

  const handleDelete = async (id) => {
    await deleteLink(id)
    setLinks(prev => prev.filter(l => l._id !== id))
  }

  const handleTagUpdate = async (id, tags) => {
    const updated = await updateTags(id, tags)
    setLinks(prev => prev.map(l => l._id === id ? updated : l))
  }

  // Handle Favorite Toggle and update UI instantly
  const handleToggleFavorite = async (id) => {
    const updated = await toggleFavorite(id)
    setLinks(prev => prev.map(l => l._id === id ? updated : l))
  }

  const user = JSON.parse(localStorage.getItem('lv_user') || '{}');
// Get just the first name (e.g., "Neelesh" from "Neelesh Soni")
  const firstName = user.name ? user.name.split(' ')[0] : 'Traveler';

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar linkCount={links.length} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero line */}

        <div className="mb-6 animate-fade-in">
          <h1 className="font-display font-bold text-2xl text-ink-50 mb-3 flex items-center gap-2">
          Welcome, {firstName}.
          </h1>
          <p className="text-ink-400 font-body text-sm leading-relaxed max-w-8xl border-l-4 border-volt pl-4 italic">
          You have unsealed the legendary LinkVault—the sacred, timeless repository of your digital journey. Within these fortified walls, you alone hold the absolute, sovereign power to forge, bind, and sever these ethereal, interconnected threads of human knowledge. Command them as you see fit.
          </p>
        </div>

        <div className="animate-fade-up">
          <h2 className="font-display font-bold text-2xl text-ink-50">
            Your vault
            {links.length > 0 && <span className="text-ink-500 font-normal text-lg ml-2">— {links.length} links saved</span>}
          </h2>
        </div>

        {/* Add link form */}
        <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <AddLinkForm onSave={handleSave} />
        </div>

        {/* Search + tag filters */}
        {links.length > 0 && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {/* Search bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search links, titles, tags…"
                className="input-base pl-10 pr-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Tag filter pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-ink-500 font-body">Filter:</span>
                {allTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(t => t === tag ? null : tag)}
                    className={`tag-pill ${activeTag === tag ? 'tag-pill-active' : ''}`}
                  >
                    #{tag}
                    <span className="ml-1 opacity-50">{count}</span>
                  </button>
                ))}
                {activeTag && (
                  <button onClick={() => setActiveTag(null)}
                    className="text-xs text-ink-400 hover:text-ink-200 flex items-center gap-1 transition-colors">
                    <X size={11} /> clear
                  </button>
                )}
              </div>
            )}
          </div>
          
        )}
        
        {/* Link grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-base h-52 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-36 bg-ink-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-ink-800 rounded w-3/4" />
                  <div className="h-3 bg-ink-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((link, i) => (
              <BookmarkCard
                key={link._id}
                link={link}
                onDelete={handleDelete}
                onTagUpdate={handleTagUpdate}
                onToggleFavorite={handleToggleFavorite}
                style={{ animationDelay: `${i * 0.04}s` }}
              />
            ))}
          </div>
        ) : links.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
            <div className="w-16 h-16 bg-volt/10 border border-volt/20 rounded-2xl flex items-center justify-center mb-5">
              <BookMarked size={28} className="text-volt" />
            </div>
            <h3 className="font-display font-bold text-xl text-ink-200 mb-2">Vault is empty</h3>
            <p className="text-ink-500 text-sm font-body max-w-xs">
              Paste any URL above to save your first link. Titles and descriptions are extracted automatically.
            </p>
          </div>
        ) : (
          /* No search results */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="w-12 h-12 bg-ink-800 rounded-2xl flex items-center justify-center mb-4">
              <Search size={22} className="text-ink-400" />
            </div>
            <h3 className="font-display font-semibold text-lg text-ink-300 mb-1">No results</h3>
            <p className="text-ink-500 text-sm font-body">
              Nothing matched <span className="text-ink-300">"{search || activeTag}"</span>
            </p>
            <button onClick={() => { setSearch(''); setActiveTag(null) }}
              className="mt-4 text-sm text-volt hover:text-volt-dark transition-colors font-body">
              Clear filters
            </button>
          </div>
          
        )}

        <div className="mb-6 animate-fade-in">
          
          <p className="text-ink-400 font-body text-sm leading-relaxed max-w-8xl border-l-4 border-volt pl-4 italic">
          <b>Future enhancements : </b>AI-driven categorization, dead-link resurrection, and advanced cryptographic sorting, google extension of the website.
          </p>
          
        </div>

      </main>
    </div>
  )
}