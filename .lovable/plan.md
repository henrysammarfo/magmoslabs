# MAGMOS / AURUM Landing Page

A premium, fintech-style single-page landing rebranded from the "Halo" template using content from the MAGMOS bible. Built on the existing TanStack Start + Tailwind v4 stack (not bare Vite + React Router as the template assumes — I'll adapt the conventions).

## Brand & Design Tokens

- **Name:** MAGMOS · Product: AURUM (composable $1 dollar) + sAURUM (yield-accruing index)
- **Background:** `#F5F5F5` page, white/near-white surfaces
- **Accent:** molten gold `#C8A04A` (used sparingly for chart line, sAURUM index, hover accents) — keeps the page premium and on-theme ("magma creates gold") without going kitsch
- **Text:** near-black `#0A0A0A`, secondary `#0A0A0A/70`
- **Radius:** `rounded-2xl` cards, `rounded-full` pills
- **Font:** Figtree (geometric sans, close to TT Norms Pro) via `@fontsource-variable/figtree`. Set `--font-sans` in `@theme` and apply globally.
- **Icons:** lucide-react only

## Sections

1. **Navbar** (absolute, transparent over hero)
   - Left: custom `LogoIcon` (the interlocking-squares halo SVG from the prompt) + wordmark "Magmos"
   - Center (md+): Protocol · AURUM · sAURUM · Reserves · Docs
   - Right: black pill "Launch App"

2. **Hero** (full-viewport rounded card)
   - Background: the provided CloudFront mp4, autoplay/muted/loop/playsInline, `object-cover`
   - Headline: "Your Dollar\nEarns Itself." (`-0.04em` tracking, 5xl/6xl, medium)
   - Sub: "AURUM is a unit-stable digital dollar on Sui. Stake it for sAURUM and watch the accumulation index rise daily — yield from Scallop, DeepBook, and Aftermath, compounded on-chain."
   - CTA pill "Get AURUM" with white ArrowRight circle
   - **Brand marquee** below CTA: infinite horizontal scroll of partner names — Sui · Scallop · DeepBook · Aftermath · Cetus · Walrus · Nautilus TEE — scoped `<style>` with `@keyframes marquee` and edge fade mask

3. **Two-token explainer** (`AURUM` vs `sAURUM`)
   - Two large cards side-by-side on md+, stacked on mobile
   - AURUM card: "Always $1", bullet list (Move object, composable, mint 1:1 from USDC)
   - sAURUM card: rising-index visual (simple SVG line chart 1.00 → 1.12), bullets (compounds daily, unstake anytime, longer hold = more AURUM)

4. **How it works** — 4 numbered steps with lucide icons
   Forge (deposit USDC) → Smelt (stake to sAURUM) → Compound (daily yield) → Refine (unstake at higher index)

5. **Why Sui** — feature comparison grid (6 rows from the bible: Move objects, atomic PTBs, TEE privacy, on-chain reserves, gasless transfers, native composability). Two-column "Other chains / MAGMOS on Sui" layout.

6. **Reserves / Proof strip** — large stat block: "100% on-chain reserves · verified via Walrus MemWal" with three live-feel stats (TVL, current index, APY) as static placeholders.

7. **CTA band** — "Your USDC, working for you. Always." + dual pill buttons (Launch App / Read Docs)

8. **Footer** — logo + tagline, link columns (Protocol / Developers / Community / Legal), small print "Sui Overflow 2026 · DeFi & Payments"

## Technical Notes

- Stack is TanStack Start (already scaffolded). Edits go in `src/routes/index.tsx`, `src/routes/__root.tsx` (head/meta + font import via `@fontsource-variable/figtree`), `src/styles.css` (theme tokens, marquee keyframes via `@utility`).
- Replace the placeholder index page entirely.
- Components in `src/components/landing/`: `Navbar.tsx`, `Hero.tsx`, `LogoIcon.tsx`, `Marquee.tsx`, `TokenCards.tsx`, `HowItWorks.tsx`, `WhySui.tsx`, `Reserves.tsx`, `CtaBand.tsx`, `Footer.tsx`.
- SEO via root `head()`: title "Magmos — Composable Yield Dollar on Sui", description from the bible's one-sentence pitch, og/twitter tags.
- No backend, no Lovable Cloud — pure presentational landing.
- All colors via theme tokens; no hardcoded hex inside components except `#F5F5F5` page bg as the prompt explicitly requires.

## Out of scope

- Wallet connection, real on-chain data, app routes (/forge, /smelt, /reserves, /refine) — landing only.
