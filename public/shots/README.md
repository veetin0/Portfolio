Screenshots.

Drop a full-resolution PNG or JPG here, then run:

    npm run shots

That writes an optimised `.webp` beside each one (max 1600px, ~96% smaller) —
point the `media` entry in `data/projects.ts` at the `.webp`, not the original.

The originals are gitignored on purpose. They are typically 1–2 MB each off a
retina display, the site renders them in a 460px box, and anything committed to
git stays in history forever. Keep them locally so you can re-run the optimiser
after changing settings.

    media: [{ src: '/shots/lyvo.webp', alt: 'Lyvo home screen' }]

The panel header crops to roughly 3.7:1 from the centre, so favour shots where
the interesting part is vertically centred.
