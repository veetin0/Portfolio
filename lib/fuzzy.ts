/**
 * Subsequence matcher for the command palette. Small enough to read, fast
 * enough for a few hundred entries, and it rewards the two things people
 * actually type: prefixes and word boundaries.
 */
export function score(query: string, target: string): number {
  if (!query) return 1

  const q = query.toLowerCase()
  const t = target.toLowerCase()

  if (t === q) return 1000
  if (t.startsWith(q)) return 500 + (100 - Math.min(100, t.length))

  let qi = 0
  let points = 0
  let streak = 0

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) {
      streak = 0
      continue
    }
    streak++
    points += streak * 2
    // Matching the first letter of a word is a strong signal.
    if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-') points += 8
    qi++
  }

  return qi === q.length ? points : 0
}

export function rank<T>(query: string, items: T[], key: (item: T) => string[]): T[] {
  if (!query.trim()) return items

  return items
    .map((item) => ({
      item,
      s: Math.max(...key(item).map((k) => score(query, k))),
    }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((r) => r.item)
}
