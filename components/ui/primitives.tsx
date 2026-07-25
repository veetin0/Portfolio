import { cn } from '@/lib/utils'
import type { Status } from '@/data/types'

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-line bg-raised px-1 font-mono text-[10px] leading-none text-muted">
      {children}
    </kbd>
  )
}

export function Tag({
  children,
  active,
  muted,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  muted?: boolean
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      data-interactive={onClick ? '' : undefined}
      className={cn(
        'rounded-full border px-2 py-[3px] font-mono text-[10px] uppercase tracking-wider transition-colors duration-200',
        active
          ? 'border-signal/40 bg-signal/10 text-signal'
          : muted
            ? 'border-line/60 text-dim'
            : 'border-line text-muted',
        onClick && 'hover:border-signal/40 hover:text-signal'
      )}
    >
      {children}
    </Comp>
  )
}

const STATUS_STYLE: Record<Status, { dot: string; label: string }> = {
  live: { dot: 'bg-signal', label: 'text-signal' },
  active: { dot: 'bg-signal/60', label: 'text-muted' },
  prototype: { dot: 'bg-muted', label: 'text-muted' },
  archived: { dot: 'bg-dim', label: 'text-dim' },
}

export function StatusChip({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider', s.label)}>
      <span className={cn('h-1 w-1 rounded-full', s.dot)}>
        {status === 'live' && (
          <span className="block h-1 w-1 animate-ping rounded-full bg-signal opacity-75" />
        )}
      </span>
      {status}
    </span>
  )
}

/** Section marker used at the top of every sector. */
export function SectorMark({ ord, label }: { ord: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="font-mono text-2xs text-signal">{ord}</span>
      <span className="eyebrow text-muted">{label}</span>
      <span className="h-px flex-1 hairline" />
    </div>
  )
}
