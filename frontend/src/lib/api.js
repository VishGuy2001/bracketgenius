const API_BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  })
  return res
}