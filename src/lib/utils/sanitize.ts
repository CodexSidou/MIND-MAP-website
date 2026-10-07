export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`
  if (/^mailto:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
