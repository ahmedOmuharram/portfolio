import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/** Redirect /dossier/brochure → /dossier/brochure/ so the correct index.html is served in dev */
function mpaRedirect() {
  return {
    name: 'mpa-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/dossier/brochure') {
          res.writeHead(301, { Location: '/dossier/brochure/' })
          res.end()
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [mpaRedirect(), react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dossierBrochure: resolve(__dirname, 'dossier/brochure/index.html'),
      },
    },
  },
})
