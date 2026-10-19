# Rate My Username — GEO + Programmatic SEO + Growth Blueprint

Grounded in the actual repo: static HTML/CSS/JS, **Cloudflare Pages** (no build step — confirmed by `functions/config.js` comments), **Supabase** for leaderboard/saves, `_redirects` for 301s, and an existing `blog/` folder of 15 platform-specific guide pages. Two things were changed directly in this pass; everything else below is the implementation plan.

## What was already shipped (low-risk, additive only)
- **`/llms.txt`** — new file, root of the site. Machine-readable summary of the product, scoring methodology, and page map, per the emerging llms.txt convention.
- **`index.html` `<head>`** — added `og:*` / `twitter:*` meta tags (there were none before) and a JSON-LD `@graph` with `SoftwareApplication` + `FAQPage` schema. Also added a `<link rel="alternate">` pointer to llms.txt.
- **`robots.txt`** — added a comment pointing crawlers at llms.txt (kept `Allow: /` and the sitemap line untouched).

**Not touched:** `script.js`, `nav.js`, `leaderboard.js`, `auth.js`, `save.js`, `saves.js`, `modals.js`. These are minified single-letter-function bundles with no source map in the repo — editing them blind risks breaking the rating engine, auth, or leaderboard. The changes below that touch runtime behavior are written as a plan for you (or a follow-up session with the unminified source) rather than applied directly.

**`og:image`/`twitter:image` are intentionally left out for now.** They briefly pointed at `/og/default.png`, a dynamic endpoint that doesn't exist yet (Part 3 below) — that's since been reverted so the current `index.html` is safe to deploy with no broken link previews. Once `functions/og/[handle].js` is actually built and deployed, add these two tags back:
```html
<meta property="og:image" content="https://ratemyusername.fun/og/default.png?username=Guest&amp;aura=100&amp;vibe=Aesthetic">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta name="twitter:image" content="https://ratemyusername.fun/og/default.png?username=Guest&amp;aura=100&amp;vibe=Aesthetic">
```
Until then, shared links just show no image, which is the safe default.

---

## Part 1 (remainder): Dynamic AI-summary block on the result screen

Target markup, from `index.html`'s `#view-result`: `#res-comment` (currently a quoted one-liner) and `#res-verdict` are populated by `script.js`. Rather than editing that bundle, add a **new, independent DOM node** that script.js doesn't know about, and populate it from the same score object your existing render call already has in scope — this is additive, so nothing existing can regress even if the new code throws.

```html
<!-- add just above #res-cats, after #res-verdict -->
<p id="res-ai-summary" class="ai-summary" hidden></p>
```

```js
// new file: ai-summary.js, loaded AFTER script.js in index.html
// Listens for the same custom event pattern most of these bundles use;
// if script.js doesn't emit one, poll #res-score via a MutationObserver
// instead (shown below) so you never have to touch script.js.
(function () {
  const scoreEl = document.getElementById('res-score');
  const handleEl = document.getElementById('res-handle');
  const summaryEl = document.getElementById('res-ai-summary');
  if (!scoreEl || !handleEl || !summaryEl) return;

  function render() {
    const score = scoreEl.textContent.trim();
    const handle = handleEl.textContent.trim();
    if (!score || !handle) return;
    // Pull category scores from #res-cats children if present; fall back gracefully.
    const cats = Array.from(document.querySelectorAll('#res-cats [data-cat]'))
      .map(el => `${el.dataset.cat} ${el.dataset.score || ''}`.trim());
    const catLine = cats.length ? ` Strongest on **${cats[0]}**.` : '';
    summaryEl.innerHTML =
      `**${handle}** scored **${score}/100**.${catLine} ` +
      `Fits within the 12-character Xbox Gamertag limit${handle.replace('@','').length <= 12 ? '' : ' — trim it to use on Xbox'}, ` +
      `and reads as ${Number(score) >= 70 ? 'high-aura and memorable' : 'a solid starting point worth iterating on'}.`;
    summaryEl.hidden = false;
  }

  new MutationObserver(render).observe(scoreEl, { childList: true, characterData: true, subtree: true });
})();
```

```css
/* style.css addition */
.ai-summary{font-weight:500;line-height:1.5;margin:12px 0}
.ai-summary strong{font-weight:700}
```

This gives LLM crawlers (and Google's snippet extractor) a dense, quotable 2–3 sentence block per result, without touching the scoring bundle. Swap the `MutationObserver` for a direct function call later once you have the unminified source and can hook the real render function.

---

## Part 2: Long-tail SEO & programmatic pages

### 2.1 Username Picker wizard (`/username-picker`)
Because there's no build step, implement this as a **single static page + client-side filtering**, mirroring the existing `compare.html`/`roast.html` pattern — not a new backend.

- **Niche filters** (Cozy Gamer, Competitive FPS, TikTok Aesthetic, etc.) are just tags on a local JSON array of seed words/patterns bundled in the page (or fetched from a static `/data/picker-seeds.json` you maintain) — no server needed.
- On filter selection, generate candidates client-side, then run each through the **same scoring function** the rating tool already uses (this is the one place touching score logic matters — require it's the actual exported scorer, not a reimplementation, or scores will drift from the main tool and undermine trust).
- Render results as cards with live Aura/Vibe sub-scores, sorted descending, with a one-click "rate full breakdown" link into the main flow.

Content layout for the Featured Snippet target ("how to pick a unique gaming handle"):
```
H1: Username Picker — Find and Score a Unique Handle Instantly
H2: How to pick a unique gaming handle
  H3: 1. Start from a trait, not a dictionary word
  H3: 2. Keep it under 12 characters for cross-platform safety
  H3: 3. Avoid lookalike characters (I vs l, 0 vs O)
  H3: 4. Score it before you commit
H2: Pick by style
  H3: Cozy Gamer names
  H3: Competitive FPS tags
  H3: TikTok-aesthetic handles
H2: FAQ (mirrors the FAQPage JSON-LD already on the homepage, reused here)
```

### 2.2 Platform landing pages (`/xbox-gamertags`, `/tiktok-handles`, `/clean-discord-names`, …)
You already have the right pattern in `blog/` (15 folders, each `index.html`). Extend it rather than inventing a parallel system:

- **No build step = generate once, commit the output.** Write a small Node script (`scripts/build-platform-pages.js`, run locally or in CI before `git push`, not at request time) that takes a `platforms.json` config:
  ```json
  { "xbox": { "charLimit": 12, "label": "Xbox Gamertag", "notes": ["No spaces allowed", "Must start with a letter"] },
    "x":    { "charLimit": 15, "label": "X (Twitter) handle", "notes": [] },
    "discord": { "charLimit": 32, "label": "Discord username", "notes": ["lowercase only, no spaces"] } }
  ```
  and emits `/xbox-gamertags/index.html`, `/tiktok-handles/index.html`, etc. from one template, injecting `charLimit` into both the visible H1/meta description and the client-side validator config — so the "12 characters for Xbox" rule lives in one JSON file, not copy-pasted across pages.
- Each generated page reuses the picker's scoring widget, pre-filtered to that platform's constraints, plus platform-specific copy blocks (H1/H2 per the pattern above) and its own canonical + JSON-LD (`WebPage` + `FAQPage`, same shape as the homepage block already added).
- **Lookalike-character validator**: a small shared function, e.g.
  ```js
  function flagLookalikes(str) {
    const map = { 'I':'uppercase I', 'l':'lowercase l', '0':'zero', 'O':'letter O' };
    return [...str].filter(c => map[c]).map(c => map[c]);
  }
  ```
  surfaced as an inline warning chip next to any flagged character — this is a real UX differentiator worth the authority signal you're after, and it's cheap to ship.
- Add every generated page to `sitemap.xml` and to the `blog/` nav/index so they're discoverable, not orphaned.

---

## Part 3: Growth loops & virality

### 3.1 Dynamic OG images — technical correction
Puppeteer **won't run** on Cloudflare Pages Functions (Workers runtime has no Node/Chromium). Two real options, both Workers-compatible:
1. **Satori + resvg-wasm** (what Vercel's `@vercel/og` uses under the hood) — render JSX-like layout to SVG, rasterize to PNG, all in a Pages Function. This is the standard approach and keeps everything on Cloudflare.
2. **Cloudflare Browser Rendering API** — an actual headless-browser-as-a-service product on Cloudflare if you want real HTML/CSS screenshots instead of Satori's layout subset.

Route: `/og/[handle].png`, where `handle` is either a real username (score recomputed from the real scorer) or the literal string `default` (score comes from the query string instead, so the homepage and any other non-result page always has a branded card to point at — no static fallback image to keep in sync).

```js
// functions/og/[handle].js (Pages Function)
export async function onRequestGet({ params, request }) {
  const { handle } = params; // "default" for the generic/homepage card
  const url = new URL(request.url);

  let username, score, aura, vibe;
  if (handle === 'default') {
    // Generic branded card — values come from the query string, with
    // sane defaults so a bare /og/default.png still renders something.
    username = url.searchParams.get('username') || 'Guest';
    aura     = url.searchParams.get('aura')     || '100';
    vibe     = url.searchParams.get('vibe')     || 'Aesthetic';
    score    = url.searchParams.get('score')    || aura; // default card leads with aura
  } else {
    // Real result — ignore any query string, recompute from the actual scorer
    // (reuse the real scoring logic, exposed as a pure function the Function
    // can import — don't reimplement it) so the image always matches the result.
    username = handle;
    ({ score, aura, vibe } = await scoreUsername(handle));
  }

  const svg = buildCardSVG({ username, score, aura, vibe }); // via satori
  const png = await svgToPng(svg); // via resvg-wasm
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      // Real results are deterministic and immutable; the default card can
      // vary by query string, so give it a short max-age instead of "immutable".
      'Cache-Control': handle === 'default'
        ? 'public, max-age=3600'
        : 'public, max-age=31536000, immutable'
    }
  });
}
```

Point each result share URL's `og:image` at `/og/<handle>.png` (cacheable, since score is deterministic for a given handle). Point every other page's `og:image` (homepage, about, blog posts) at `/og/default.png?username=Guest&aura=100&vibe=Aesthetic`, as already wired into `index.html`.

**OG description copy variants** (rotate or A/B by handle hash):
- `"{handle} scored {score}% on Rate My Username. Think you can beat it?"`
- `"{handle} just got rated {score}/100 — Aura: {aura}, Vibe: {vibe}. Rate yours →"`
- `"{score}/100. {handle} said 'no cap, only vibes.' Prove them wrong."`

### 3.2 Social action triggers
- "Export as story" button on result/roast screens → reuses the existing `html2canvas` dependency already loaded in `index.html` (no new library needed) to render the result card to a 1080×1920 PNG client-side, same approach the GameCard feature already implies.
- One-click "Copy roast" and "Copy score card" buttons with pre-filled share text matching the OG copy variants above, so what's pasted into Discord/Reddit matches what unfurls.
- Leaderboard rank-change notifications ("you dropped to #12 — reclaim it") as a lightweight re-engagement loop, surfaced via the existing leaderboard overlay rather than email/push (no infra for that currently).

---

## Rollout order (lowest risk → highest)
1. Ship the already-made `llms.txt` + JSON-LD + OG meta changes, add the real `og-default.png`.
2. Add `ai-summary.js` as a new, isolated script (zero risk to existing bundles).
3. Build the platform-landing-page generator script and commit its output; wire into sitemap.
4. Build `/username-picker` reusing the real scorer.
5. Build the OG-image Pages Function last — it's the most infrastructure-heavy piece and depends on exposing the scorer as an importable pure function, which is worth doing regardless (it also de-risks step 3/4).
