# Cycle Section — Scroll Redesign (Mobile + Desktop Polish)

## Goal

Fix the mobile scroll experience in the Ciclo de Maestría section. The current GSAP scrub+pin approach feels forced and oversensitive on touch devices. Replace it with a CSS scroll-snap mandatory container with cinematic reveal animations, while keeping the desktop experience structurally intact and adding one smoothing improvement.

---

## Context

**File:** `src/components/sections/home/Cycle.astro`

**Current problems on mobile:**
- `scrub: true` directly mirrors scroll position → animation feels mechanical and too sensitive to finger speed
- `pin: true` creates a "locked" sensation that makes users feel they've lost control
- Short transition durations (`0.2`) in a long timeline produce abrupt, barely-visible transitions

**Infrastructure already in place:**
- Lenis smooth scroll is already disabled on touch devices (`isTouchDevice` check in Layout.astro) — no conflict with CSS scroll-snap
- A global grain overlay (`opacity: 0.04`, SVG fractalNoise) is fixed in Layout.astro — mobile inherits it automatically, no extra work needed
- GSAP + ScrollTrigger setup is centralized in `src/scripts/gsapSetup.ts`

---

## Mobile Redesign

### Structure

The section becomes a `100vh` container on the page. Inside it, a scroll-snap container holds the 3 panels. The user scrolls within this container — the page-level scroll is captured until the inner container is exhausted (native browser behavior). After the 3rd panel, scroll events bubble back to the page.

```
<section id="ciclo-maestria" height: 100vh, overflow: hidden>
  <div class="cycle-mobile-scroll" overflow-y: scroll, scroll-snap-type: y mandatory, height: 100%, data-lenis-prevent>
    <div class="cycle-panel" height: 100vh, scroll-snap-align: start> ... </div>  ← Service 01
    <div class="cycle-panel" height: 100vh, scroll-snap-align: start> ... </div>  ← Service 02
    <div class="cycle-panel" height: 100vh, scroll-snap-align: start> ... </div>  ← Service 03
  </div>
</section>
```

`data-lenis-prevent` is added as a defensive measure even though Lenis is already disabled on touch.

### Animations (per panel, triggered by IntersectionObserver)

IntersectionObserver root = the scroll container. Fires at 50% visibility threshold.

On panel entry:
1. **Background** — Ken Burns: `scale(1.08) → scale(1.0)` over 5s `ease-out`. Creates a slow drift sensation as the panel settles.
2. **Service number** (`01 / Solución integral`) — `opacity: 0 → 0.9`, `translateY(6px) → 0`, delay `0s`
3. **Title line 1** — clip-path reveal: inner span goes from `translateY(110%) → 0` over `0.75s cubic-bezier(0.16, 1, 0.3, 1)`, delay `0.1s`
4. **Title line 2** — same as line 1, delay `0.2s`
5. **Description** — `opacity: 0 → 0.45`, delay `0.35s`

On panel exit (leaves observer root): classes removed, state resets for clean re-entry when scrolling back up.

### Progress bar

A `2px` absolute bar at the very bottom of the scroll container. No text, no dots, no numbers.

- Panel 1 active → width `33.3%`
- Panel 2 active → width `66.6%`
- Panel 3 active → width `100%`
- Color: `var(--color-samana-1)` (`#ffd700`), fades to transparent at the right edge
- Width transitions with `transition: width 0.4s ease`

### What is removed from mobile

- Depth bar group (1/3, 2/3, 3/3 indicator) — removed
- Snap dots — not included
- GSAP ScrollTrigger pin+scrub — not used on mobile

### Breakpoint strategy

Use `window.matchMedia('(hover: none) and (pointer: coarse)')` in JavaScript to detect touch devices and branch initialization:
- Touch → initialize IntersectionObserver + progress bar logic
- Non-touch → initialize existing GSAP ScrollTrigger logic

CSS scroll-snap styles are applied via `@media (hover: none) and (pointer: coarse)` to avoid layout conflicts on desktop.

---

## Desktop Polish

**One change only:** `scrub: true` → `scrub: 1.5`

This adds a 1.5-second lag between scroll position and animation progress. The animation chases the scroll rather than mirroring it instantly. Effect: transitions feel like they have inertia — smoother and more cinematic, especially when scrolling at varying speeds.

Everything else on desktop is unchanged:
- Two-column layout (text left, image right) — unchanged
- GSAP pin — unchanged
- Scroll distance (`window.innerHeight * totalItems`) — unchanged
- Text fade + slide animation — unchanged
- Image scale + fade — unchanged

---

## What does not change

- HTML structure of the desktop layout (`.cycle-text-item`, `.cycle-img`, two-column flex)
- Tailwind classes on existing elements
- The content data (`cycleData` array)
- Image imports
- Global grain overlay (already inherited)
- Any other section on the page

---

## Success criteria

- On mobile: scrolling through the Cycle section feels natural — the user is never pinned or fighting the scroll
- On mobile: each service reveals with a visible cinematic animation (clip-path title rise + Ken Burns)
- On mobile: the user must scroll through all 3 services to reach the next section
- On desktop: scrub transition feels slightly smoother than before, no other behavioral change
- No regressions in other sections (Hero, Philosophy, GalleryProjects)
