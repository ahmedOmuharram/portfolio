import { useSyncExternalStore } from 'react'

const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit)
}

export function navigate(path, { replace = false } = {}) {
  if (path === window.location.pathname + window.location.hash) return
  if (replace) window.history.replaceState(null, '', path)
  else window.history.pushState(null, '', path)
  emit()
}

export function usePath() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => window.location.pathname,
    () => '/',
  )
}

export function postSlugFromPath(path) {
  const m = path.match(/^\/writing\/([^/]+)\/?$/)
  return m ? decodeURIComponent(m[1]) : null
}
