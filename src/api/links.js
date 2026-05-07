import { authAPI } from './auth'

export const getLinks  = ()           => authAPI.get('/api/links').then(r => r.data)
export const saveLink  = (url, tags)  => authAPI.post('/api/links', { url, tags }).then(r => r.data)
export const deleteLink = (id)        => authAPI.delete(`/api/links/${id}`).then(r => r.data)
export const updateTags = (id, tags)  => authAPI.patch(`/api/links/${id}/tags`, { tags }).then(r => r.data)
export const toggleFavorite = (id)    => authAPI.patch(`/api/links/${id}/favorite`).then(r => r.data)
export const trackVisit = (id)        => authAPI.patch(`/api/links/${id}/visit`).then(r => r.data)

// --- Utility Functions (Keep these for the UI) ---

export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const getDomain = (url) => {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
};