import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/** Redirect bare paths → trailing slash so the correct index.html is served in dev */
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [mpaRedirect(), react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dossierHome: resolve(__dirname, 'dossier/index.html'),
        dossierBrochure: resolve(__dirname, 'dossier/brochure/index.html'),
      },
    },
  },
})
