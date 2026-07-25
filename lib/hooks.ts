'use client'

import { useEffect, useState } from 'react'

/** SSR-safe media query. Starts false, resolves after mount. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True when the canvas experience should run. Below this, we stack. */
export function useIsCanvas() {
  return useMediaQuery('(min-width: 900px)')
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Avoids hydration mismatches for anything that reads window/time. */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
