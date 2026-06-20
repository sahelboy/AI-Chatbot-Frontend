import { useEffect, useState } from 'react'

// Phones get the dedicated mobile UI; everything wider keeps the desktop UI.
// 600px matches the design's mobile breakpoint (and the responsive rules in
// padvinder.css), so the two never overlap.
const QUERY = '(max-width: 600px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}
