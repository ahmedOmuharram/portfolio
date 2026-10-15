import { marked } from 'marked'

const files = import.meta.glob('../content/writing/*.md', { query: '?raw', import: 'default', eager: true })

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if (/^\[.*\]$/.test(value)) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else if (value === 'true' || value === 'false') {
      value = value === 'true'
    } else {
      value = value.replace(/^['"]|['"]$/g, '')
    }
    data[m[1]] = value
  }
  return { data, body: match[2] }
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export const POSTS = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '')
    const { data, body } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title || slug,
      date: data.date || null,
      summary: data.summary || '',
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      draft: data.draft === true,
      minutes: readingTime(body),
      body,
    }
  })
  .filter((p) => !p.slug.startsWith('_'))
  .filter((p) => import.meta.env.DEV || !p.draft)
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null
}

export function renderPost(post) {
  return marked.parse(post.body, { gfm: true })
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
