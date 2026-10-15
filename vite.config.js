import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'

const SITE = 'https://muharram.dev'

function mpaRedirect() {
  const redirects = ['/dossier', '/dossier/brochure']
  return {
    name: 'mpa-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (redirects.includes(req.url)) {
          res.writeHead(301, { Location: req.url + '/' })
          res.end()
          return
        }
        next()
      })
    },
  }
}

function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const data = {}
  if (!match) return data
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (m) data[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return data
}

function escape(text) {
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function writingPages() {
  return {
    name: 'writing-pages',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const dir = resolve(__dirname, 'src/content/writing')
      const shell = readFileSync(resolve(dist, 'index.html'), 'utf8')
      writeFileSync(resolve(dist, '404.html'), shell)
      if (!existsSync(dir)) return
      const posts = readdirSync(dir)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
        .map((f) => ({ slug: f.replace(/\.md$/, ''), ...frontmatter(readFileSync(resolve(dir, f), 'utf8')) }))
        .filter((p) => p.draft !== 'true')
      for (const post of posts) {
        const url = `${SITE}/writing/${post.slug}/`
        const title = `${post.title || post.slug} · Ahmed Muharram`
        const description = post.summary || `Writing by Ahmed Muharram.`
        const html = shell
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${escape(description)}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${escape(description)}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
          .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${escape(description)}$2`)
        const out = resolve(dist, 'writing', post.slug)
        mkdirSync(out, { recursive: true })
        writeFileSync(resolve(out, 'index.html'), html)
      }
      const sitemapPath = resolve(dist, 'sitemap.xml')
      if (existsSync(sitemapPath) && posts.length) {
        const entries = posts
          .map((p) => `  <url>\n    <loc>${SITE}/writing/${p.slug}/</loc>${p.date ? `\n    <lastmod>${p.date}</lastmod>` : ''}\n  </url>`)
          .join('\n')
        const sitemap = readFileSync(sitemapPath, 'utf8').replace('</urlset>', `${entries}\n</urlset>`)
        writeFileSync(sitemapPath, sitemap)
      }
    },
  }
}

export default defineConfig({
  plugins: [mpaRedirect(), react(), writingPages()],
  base: '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dossierHome: resolve(__dirname, 'dossier/index.html'),
        dossierBrochure: resolve(__dirname, 'dossier/brochure/index.html'),
      },
    },
  },
})
