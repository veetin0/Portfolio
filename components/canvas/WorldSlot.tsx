import { cn } from '@/lib/utils'

/**
 * Places a child at a world coordinate, centred on it.
 * Only meaningful inside <Surface>.
 */
export function WorldSlot({
  x,
  y,
  width,
  className,
  children,
}: {
  x: number
  y: number
  width?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn('absolute -translate-x-1/2 -translate-y-1/2', className)}
      style={{ left: x, top: y, width }}
    >
      {children}
    </div>
  )
}
