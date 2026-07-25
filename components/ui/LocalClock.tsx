'use client'

import { useEffect, useState } from 'react'

/**
 * Renders nothing until mounted — the server has no idea what time it is in
 * the visitor's world, and a mismatch here is a hydration error.
 */
export function LocalClock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date())

    setTime(format())
    const t = setInterval(() => setTime(format()), 10_000)
    return () => clearInterval(t)
  }, [timeZone])

  return (
    <span suppressHydrationWarning>
      {time ?? '--:--'}
      {time && <span className="ml-1 animate-blink text-dim">:</span>}
    </span>
  )
}
