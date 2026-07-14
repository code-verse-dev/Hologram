# Assets

The photographic assets for this landing page are AI-generated (Higgsfield Soul v2)
and served from the generation CDN — see the URLs referenced in `index.html` and
`css/style.css`. The remote-session network policy blocks downloading them into the
repo, so they are hotlinked.

To make the site fully self-contained, download each URL referenced in
`index.html`/`css/style.css` into this directory with the matching filename
(e.g. `hero-hologram.png`) and switch the references back to `assets/<name>`.

| Asset | Purpose |
| --- | --- |
| hero-hologram | Hero holographic head |
| persona-doctor / ceo / scientist / teacher / historical / coach | Section 02 persona cards (also reused in section 09) |
| fob | Section 03 portable AI fob |
| rooms-a / rooms-b | Section 04 — 2×2 sprite sheets, sliced via CSS `background-position` |
| robot-hand | Section 10 |
