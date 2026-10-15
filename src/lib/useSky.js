import { useEffect, useMemo, useState } from 'react'
import { ui } from './store'
import { presetHour, skyState, sunWindow, zonedNow } from './time'

export function useZonedClock(interval = 20000) {
  const [now, setNow] = useState(() => zonedNow())
  useEffect(() => {
    const id = setInterval(() => setNow(zonedNow()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

export function useSky() {
  const now = useZonedClock()
  const mode = ui.use((s) => s.timeMode)
  return useMemo(() => {
    const win = sunWindow(now.doy, now.offset)
    const override = mode === 'live' ? null : presetHour(mode, win)
    const hour = override ?? now.decimal
    return { now, win, hour, mode, state: skyState(hour, win) }
  }, [now, mode])
}
