import { useState } from 'react'
import { Link2, Plus, X, Loader2 } from 'lucide-react'

export default function AddLinkForm({ onSave }) {
  const [url, setUrl] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

  const isValidUrl = (str) => {
    try { new URL(str); return true } catch { return false }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = url.trim()
    const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    if (!isValidUrl(withProtocol)) { setError('Enter a valid URL'); return }
    setError('')
    setLoading(true)
    await onSave(withProtocol, tags)
    setLoading(false)
    setUrl('')
    setTags([])
    setTagInput('')
    setExpanded(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ink-900 border border-ink-700 rounded-2xl p-5 space-y-4">
      {/* URL input row */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Paste any URL to save…"
            className="input-base pl-10"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(''); if (!expanded && e.target.value) setExpanded(true) }}
            onFocus={() => url && setExpanded(true)}
          />
        </div>
        <button type="submit" disabled={loading || !url.trim()} className="btn-primary shrink-0">
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
            : <><Plus size={15} /> Save</>
          }
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs animate-fade-in">{error}</p>
      )}

      {/* Tag section — shows when URL is typed */}
      {expanded && (
        <div className="animate-fade-up space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } if (e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder="Add tags (press Enter or comma)"
              className="input-base py-2 text-xs"
            />
            <button type="button" onClick={addTag}
              className="shrink-0 px-3 py-2 bg-ink-800 border border-ink-600 rounded-xl text-ink-300 hover:text-volt hover:border-volt text-xs transition-colors">
              + Tag
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 animate-fade-in">
              {tags.map(t => (
                <span key={t} className="tag-pill flex items-center gap-1">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  )
}