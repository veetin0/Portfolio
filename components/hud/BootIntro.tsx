'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/data/projects'
import { graphEdges } from '@/lib/graph'
import { useUI } from '@/lib/store'
import { useReducedMotion } from '@/lib/hooks'

const STEPS = [
  'mounting canvas',
  `linking ${projects.length} modules`,
  `resolving ${graphEdges.length} dependencies`,
  'ready',
]

const STEP_MS = 165
const SESSION_KEY = 'portfolio:booted'

/**
 * A ~700ms cold start. Long enough to set the tone, short enough that nobody
 * sits through it twice — it's skipped for the rest of the session, on repeat
 * visits, and entirely under prefers-reduced-motion.
 */
export function BootIntro() {
  const boot = useUI((s) => s.boot)
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)

  // Decide whether to play at all — after mount, so SSR output is stable.
  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY)
    if (seen || reduced) {
      setVisible(false)
      boot()
      return
    }
    setReady(true)
  }, [boot, reduced])

  useEffect(() => {
    if (!ready || !visible) return

    const finish = () => {
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(false)
      boot()
    }

    if (step >= STEPS.length) {
      const t = setTimeout(finish, 140)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS)

    // Any input skips the rest. Never trap someone in an intro.
    window.addEventListener('keydown', finish, { once: true })
    window.addEventListener('pointerdown', finish, { once: true })

    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
    }
  }, [ready, visible, step, boot])

  return (
    <AnimatePresence>
      {ready && visible && (
        <motion.div
          key="boot"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
        >
          <div className="w-[240px] font-mono text-2xs">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className="flex items-center justify-between py-[3px] transition-opacity duration-200"
                style={{ opacity: i < step ? 1 : 0 }}
              >
                <span className="text-dim">{label}</span>
                <span className="text-signal">ok</span>
              </div>
            ))}

            <div className="mt-3 h-px w-full overflow-hidden bg-line">
              <div
                className="h-full bg-signal transition-[width] duration-150 ease-linear"
                style={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }}
              />
            </div>

            <div className="mt-2 text-right text-dim">skip — any key</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
