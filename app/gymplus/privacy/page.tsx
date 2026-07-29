import type { Metadata } from 'next'
import Link from 'next/link'
import { profile } from '@/data/profile'
import { SITE_URL } from '@/lib/site'

/**
 * Gym+ privacy policy.
 *
 * Google Play will not accept a listing without a publicly reachable privacy
 * policy URL, and the app's own repo is private — so this page is the canonical
 * public copy. The URL is submitted to Play Console and must stay stable:
 * changing the route breaks the listing until it is resubmitted.
 *
 * The same text lives in PRIVACY.md in the GymPlus repo. If one changes, change
 * the other; they are two copies of one document.
 */

const UPDATED = '28 July 2026'
const CANONICAL = `${SITE_URL}/gymplus/privacy`

export const metadata: Metadata = {
  title: 'Privacy Policy — Gym+',
  description:
    'Gym+ stores your training data on your device and sends it nowhere. No account, no analytics, no network requests.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'Privacy Policy — Gym+',
    description: 'Your training data stays on your phone.',
    url: CANONICAL,
    type: 'article',
  },
  robots: { index: true, follow: true },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-base font-medium tracking-tight text-text">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-muted text-pretty">
        {children}
      </div>
    </section>
  )
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
          <span aria-hidden className="mt-[0.5em] h-px w-3 shrink-0 bg-dim" />
          <span className="text-pretty">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function GymPlusPrivacyPage() {
  return (
    <main className="mx-auto max-w-[68ch] px-6 py-20 sm:py-28">
      <p className="eyebrow">Privacy Policy</p>

      <h1 className="mt-4 text-3xl font-medium tracking-tightest text-text sm:text-4xl">Gym+</h1>

      <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-dim">
        Last updated {UPDATED}
      </p>

      <p className="mt-8 text-[0.9375rem] leading-relaxed text-muted text-pretty">
        Gym+ is a training log for Android and iOS, developed by {profile.name}. This policy
        describes what the app does with your information.
      </p>

      {/* The one sentence a reader actually came for. */}
      <p className="mt-6 border-l-2 border-signal/70 pl-4 text-base leading-relaxed text-text">
        The short version is that your training data stays on your phone.
      </p>

      <Section title="What the app stores">
        <p>Gym+ records the things you enter while training:</p>
        <List
          items={[
            'Workouts: exercises, sets, weights, reps, duration and notes',
            'Training programs you generate or save',
            'Personal records, calculated from the workouts above',
            'Exercises you create yourself, and exercises you mark as favourites',
            'Profile details you choose to enter: a name, bodyweight, height and training goal',
            'Settings: units, bar weight, plate increment, default rest time',
          ]}
        />
        <p className="pt-1">
          All of it is written to storage on your device.{' '}
          <strong className="font-medium text-text">None of it is sent anywhere.</strong> There is
          no account, no login, no server holding your training history, and no sync between
          devices.
        </p>
      </Section>

      <Section title="What the app does not do">
        <List
          items={[
            'It does not collect or transmit your training data',
            'It does not use analytics, advertising, or tracking software',
            'It does not request your location, contacts, camera, microphone or photos',
            'It does not create an account or ask for an email address',
            'It does not sell or share data with anyone, because it does not collect any',
          ]}
        />
      </Section>

      <Section title="Network access">
        <p>
          Gym+ makes no network requests at all. It does not contact any server — not the
          developer&rsquo;s, not a third party&rsquo;s, not for updates, analytics or crash reports.
          The app works identically with the device offline, because being offline makes no
          difference to it.
        </p>
        <p>
          If you inspect the app&rsquo;s permissions on Android you will see internet access listed.
          That is declared by the framework the app is built on, not requested by Gym+, and nothing
          in the app uses it. Over-the-air code updates are disabled.
        </p>
      </Section>

      <Section title="Notifications">
        <p>
          If you allow notifications, the app schedules a local reminder when a rest period ends.
          These are created and delivered entirely on your device. Nothing is sent to a notification
          server, and the app never requests a push token.
        </p>
        <p>
          You can refuse or revoke this permission at any time in your system settings. The rest
          timer continues to work on screen either way.
        </p>
      </Section>

      <Section title="Exporting your data">
        <p>
          The app can export everything it holds to a JSON file. That file is created on your device
          and handed to your system&rsquo;s share sheet, so wherever it goes next is entirely your
          choice — email, cloud storage, another device, or nowhere. The app does not upload it, and
          does not keep a copy elsewhere.
        </p>
        <p>You can import a previously exported file to restore your history.</p>
      </Section>

      <Section title="Deleting your data">
        <p>
          Delete individual workouts and programs inside the app, or uninstall Gym+ to remove
          everything it stored. Because nothing is held on a server, uninstalling is complete
          deletion — there is no copy for anyone to retrieve, including the developer.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Gym+ is not directed at children and collects no personal information from anyone,
          regardless of age.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If this policy changes, the updated version will be published here and the date at the top
          revised.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy:{' '}
          <a
            href={`mailto:${profile.links.email}`}
            className="text-text underline decoration-dim underline-offset-4 transition-colors hover:decoration-signal"
          >
            {profile.links.email}
          </a>
        </p>
      </Section>

      <div className="mt-16 h-px hairline" />

      <Link
        href="/"
        className="mt-8 inline-block font-mono text-2xs uppercase tracking-widest text-dim transition-colors hover:text-text"
      >
        ← {profile.name}
      </Link>
    </main>
  )
}
