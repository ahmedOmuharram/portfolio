import { useSyncExternalStore } from 'react'

export function createStore(initial) {
  let state = initial
  const listeners = new Set()
  const get = () => state
  const set = (patch) => {
    const next = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...next }
    listeners.forEach((l) => l())
  }
  const subscribe = (l) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }
  const use = (selector = (s) => s) =>
    useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
  return { get, set, subscribe, use }
}

export const ui = createStore({
  section: 0,
  hovered: null,
  radio: false,
  station: 0,
  timeMode: 'live',
  ready: false,
  purr: 0,
  strum: 0,
})
