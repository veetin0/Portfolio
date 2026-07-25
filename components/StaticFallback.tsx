import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { skillGroups } from '@/data/skills'

/**
 * The whole portfolio as plain, semantic HTML.
 *
 * The canvas is a client-side experience, which would otherwise leave crawlers,
 * link-preview bots, screen readers in odd states, and anyone without JS
 * looking at an empty page. This renders on the server with the real content.
 *
 * It's hidden the instant JS confirms it can take over — see the inline script
 * in app/layout.tsx — so nobody sees it flash.
 */
export function StaticFallback() {
  return (
    <div
      className="static-fallback mx-auto max-w-[620px] px-6 py-20"
      // Once the interactive shell mounts, this is duplicate content.
      aria-hidden="false"
    >
      <header>
        <p className="eyebrow">
          {profile.role} · {profile.location}
        </p>
        <h1 className="mt-4 text-5xl font-medium tracking-tightest">{profile.name}</h1>
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{profile.statement}</p>
      </header>

      {/* The timeline is real content — it carries dates and a judged result —
          so it belongs in the crawlable version too, not just the canvas. */}
      <section className="mt-16">
        <h2 className="eyebrow mb-6">Timeline</h2>
        <ol className="space-y-3">
          {profile.log.map((entry, i) => (
            <li key={i} className="flex gap-4 text-[13px] leading-relaxed">
              <span className="w-12 shrink-0 font-mono text-2xs text-dim">{entry.at}</span>
              <span className={entry.highlight ? 'text-signal' : 'text-muted'}>{entry.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="eyebrow mb-6">Work</h2>
        <ul className="space-y-8">
          {projects.map((p) => (
            <li key={p.id}>
              <h3 className="text-lg font-medium tracking-tight">
                {p.name} <span className="font-mono text-2xs text-dim">{p.year}</span>
              </h3>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              {p.award && (
                <p className="mt-1 font-mono text-2xs text-signal">{p.award}</p>
              )}
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.summary}</p>
              <p className="mt-2 font-mono text-2xs text-dim">{p.stack.join(' · ')}</p>
              {p.links?.map((l) => (
                <a
                  key={l.href + l.label}
                  href={l.href}
                  className="mr-4 mt-2 inline-block font-mono text-2xs text-signal underline"
                >
                  {l.label}
                </a>
              ))}
              {p.downloads?.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  download
                  className="mr-4 mt-2 inline-block font-mono text-2xs text-signal underline"
                >
                  {d.label} ({d.size})
                </a>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="eyebrow mb-6">Stack</h2>
        <ul className="space-y-3">
          {skillGroups.map((g) => (
            <li key={g.id} className="text-[13px]">
              <span className="text-text">{g.label}</span>
              <span className="ml-2 font-mono text-2xs text-muted">
                {g.skills.map((s) => s.tag).join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="eyebrow mb-6">Contact</h2>
        <ul className="space-y-2 font-mono text-[13px]">
          <li>
            <a href={`mailto:${profile.links.email}`} className="text-signal underline">
              {profile.links.email}
            </a>
          </li>
          <li>
            <a href={profile.links.github} className="text-signal underline">
              {profile.links.github}
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
