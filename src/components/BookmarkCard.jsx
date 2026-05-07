import { useState } from 'react'
import { ExternalLink, Trash2, Tag, X, Check, Heart, ShieldCheck, ShieldAlert, Eye, Newspaper } from 'lucide-react'
import { timeAgo, getDomain, trackVisit } from '../api/links'

export default function BookmarkCard({ link, onDelete, onTagUpdate, onToggleFavorite, style }) {
  const [deleting, setDeleting] = useState(false)
  const [editingTags, setEditingTags] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(link.tags || [])
  const [savingTags, setSavingTags] = useState(false)
  const [visits, setVisits] = useState(link.visits || 0)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(link._id)
  }

  const handleOpenLink = () => {
    setVisits(prev => prev + 1)
    trackVisit(link._id) 
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    if(onToggleFavorite) onToggleFavorite(link._id)
  }

  const handleNews = (e) => {
    e.stopPropagation()
    const domainSearch = getDomain(link.url)
    window.open(`https://www.google.com/search?q=${domainSearch}&tbm=nws`, '_blank', 'noopener,noreferrer')
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

  const saveTags = async () => {
    setSavingTags(true)
    await onTagUpdate(link._id, tags)
    setSavingTags(false)
    setEditingTags(false)
  }

  const domain = getDomain(link.url)

  return (
    <div
      style={style}
      className={`card-base relative group flex flex-col animate-fade-up transition-all duration-300 ${deleting ? 'opacity-0 scale-95' : ''} hover:border-volt/30 hover:shadow-lg hover:shadow-volt/5`}
    >
      {/* Absolute Favorite Button */}
      <button 
        onClick={handleFavorite}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-ink-950/60 backdrop-blur-md border border-ink-800 hover:scale-110 transition-transform active:scale-95"
      >
        <Heart size={14} className={link.isFavorite ? "fill-volt text-volt" : "text-ink-400"} />
      </button>

      {/* --- IMAGE SECTION: Snapshot Hero --- */}
      {link.image && (
        <div className="relative h-44 bg-ink-900 overflow-hidden cursor-pointer group/image border-b border-ink-800/50" onClick={handleOpenLink}>
          <img
            src={link.image} alt={link.title}
            className="w-full h-full object-cover opacity-90 group-hover/image:opacity-100 group-hover/image:scale-110 transition-all duration-700 ease-in-out"
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
          {/* Subtle overlay for better text contrast below */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Domain + Safety + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={link.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt="" className="w-4 h-4 rounded-sm shadow-sm"
              onError={e => e.target.style.display='none'}
            />
            <span className="text-[11px] uppercase tracking-wider text-ink-400 font-display font-medium">{domain}</span>
            
            {link.isSafe ? (
              <ShieldCheck size={14} className="text-green-500/60" title="Safe Link" />
            ) : (
              <ShieldAlert size={14} className="text-red-500" title="Warning: Unsafe Link" />
            )}
          </div>
          <span className="text-[11px] text-ink-500 font-body">{timeAgo(link.createdAt)}</span>
        </div>

        {/* --- CONTENT SECTION: Optimized for 5 lines --- */}
        <div className="flex-1 cursor-pointer space-y-2" onClick={handleOpenLink}>
          <h3 className={`font-display font-bold text-[15px] leading-tight transition-colors ${link.isSafe ? 'text-ink-100 group-hover:text-volt' : 'text-red-400'}`}>
            {link.title}
          </h3>
          
          {link.description && (
            <p className="text-[13px] text-ink-300/90 line-clamp-5 font-body leading-relaxed tracking-normal">
              {link.description}
            </p>
          )}
        </div>

        {/* Tags Section */}
        <div className="min-h-[28px]">
          {!editingTags ? (
            <div className="flex items-center flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="tag-pill text-[10px] py-0.5 px-2 bg-ink-800/50 border border-ink-700"># {t}</span>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingTags(true); }}
                className="tag-pill text-[10px] py-0.5 px-2 text-ink-500 hover:text-volt hover:bg-volt/10 transition-all"
              >
                <Tag size={10} className="inline mr-1" /> edit
              </button>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="tag-pill flex items-center gap-1 text-[10px]">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="add tag…"
                  className="flex-1 bg-ink-800 border border-ink-700 rounded-md px-2 py-1 text-xs text-ink-100 placeholder-ink-600 focus:outline-none focus:border-volt/50"
                />
                <button onClick={saveTags} disabled={savingTags} className="px-2 bg-volt text-ink-950 rounded-md font-bold text-[10px] hover:bg-volt-dark transition-colors">
                  {savingTags ? "..." : "SAVE"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-800/60 mt-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleOpenLink}
              className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400 hover:text-volt transition-colors"
            >
              <ExternalLink size={13} /> VISIT
            </button>

            <button
              onClick={handleNews}
              className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400 hover:text-blue-400 transition-colors"
            >
              <Newspaper size={13} /> NEWS
            </button>

            <div className="flex items-center gap-1 text-[11px] text-ink-500 font-mono" title="Visit count">
              <Eye size={13} className="opacity-70" /> {visits}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="p-1 text-ink-500 hover:text-red-400 transition-colors"
          >
            {deleting
              ? <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
              : <Trash2 size={14} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}