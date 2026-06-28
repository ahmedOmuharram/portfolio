import { useEffect, useState } from 'react'

// Single source of truth for "is this a phone-sized / touch screen". Used to
// switch off the wheel-hijack scroll and the heavy WebGL/CRT on small screens.
const QUERY = '(max-width: 820px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
