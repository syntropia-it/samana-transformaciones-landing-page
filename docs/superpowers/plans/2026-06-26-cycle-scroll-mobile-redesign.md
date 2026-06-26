# Cycle Scroll Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile scroll experience in `Cycle.astro` with a CSS scroll-snap mandatory container and cinematic reveal animations, while polishing the desktop scrub smoothness with a single-line change.

**Architecture:** The component renders two layout variants in HTML — a mobile scroll-snap container and the existing desktop GSAP layout. CSS media queries (`hover: none and pointer: coarse`) show/hide the appropriate variant. JavaScript branches at runtime with `matchMedia` to initialize either IntersectionObserver (mobile) or GSAP ScrollTrigger (desktop).

**Tech Stack:** Astro, GSAP + ScrollTrigger (desktop only), CSS scroll-snap, IntersectionObserver API, Tailwind CSS v4.

## Global Constraints

- Brand gold color: `var(--color-samana-1)` = `#ffd700`
- Touch breakpoint: `(hover: none) and (pointer: coarse)` — used in both CSS and JS
- Grain overlay is global (Layout.astro fixed div) — do NOT add grain to this component
- Lenis is already disabled on touch devices — `data-lenis-prevent` is defensive only
- GSAP import must come from `gsap` package directly (not gsapSetup.ts — that file only exports gsap + ScrollTrigger, no need to change it)
- All image imports already exist in the frontmatter — do not add new imports
- `astro:page-load` event wraps all JS initialization (already pattern in codebase)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/sections/home/Cycle.astro` | Modify | All changes live here — HTML, CSS, JS |

No new files. No other files touched.

---

### Task 1: Desktop scrub polish

**Files:**
- Modify: `src/components/sections/home/Cycle.astro:112`

**Interfaces:**
- Produces: GSAP timeline with `scrub: 1.5` instead of `scrub: true`

- [ ] **Step 1: Open the file and locate the scrub line**

In `src/components/sections/home/Cycle.astro`, find the `scrollTrigger` config block (around line 107–116):

```javascript
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * totalItems}`,
        scrub: true,       // ← this line
        pin: true,
        anticipatePin: 1,
    },
});
```

- [ ] **Step 2: Change `scrub: true` to `scrub: 1.5`**

```javascript
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * totalItems}`,
        scrub: 1.5,        // ← changed
        pin: true,
        anticipatePin: 1,
    },
});
```

- [ ] **Step 3: Verify on desktop**

Run: `npm run dev` (or the existing dev server if already running)

Open `http://localhost:4321` (or whichever port). Scroll through the Cycle section on a desktop browser. The text and image transitions should feel slightly smoother — they chase the scroll position with a brief lag rather than mirroring it instantly. Scrolling fast should produce a graceful catch-up animation.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/home/Cycle.astro
git commit -m "perf: smooth desktop Cycle scrub from instant to 1.5s lag"
```

---

### Task 2: Add title-split helper and mobile HTML structure

**Files:**
- Modify: `src/components/sections/home/Cycle.astro` — frontmatter + HTML

**Interfaces:**
- Produces:
  - `splitTitle(title: string): [string, string]` — splits a title string at the midpoint for two-line clip-path reveal
  - `.cycle-mobile` div — mobile scroll container (hidden on desktop via CSS)
  - `.cycle-desktop` div — wraps existing desktop layout (hidden on mobile via CSS)
  - `.cycle-mobile-panel[data-panel-index]` — one per service
  - `.cycle-progress-fill` — progress bar fill element

- [ ] **Step 1: Add `splitTitle` helper to the frontmatter**

At the top of the `---` frontmatter block, after the existing imports, add:

```typescript
function splitTitle(title: string): [string, string] {
  const words = title.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
```

Verification — the three titles split as:
- "Diseño y Renderizado" → `["Diseño y", "Renderizado"]`
- "Reformas y Proyectos" → `["Reformas y", "Proyectos"]`
- "Provisión de Materiales" → `["Provisión de", "Materiales"]`

- [ ] **Step 2: Wrap existing desktop HTML in `.cycle-desktop`**

The current `<section>` body starts with:
```html
<div class="relative w-full h-screen scroll-container">
```

Wrap it:
```html
<div class="cycle-desktop">
  <div class="relative w-full h-screen scroll-container">
    ... (all existing desktop HTML unchanged) ...
  </div>
</div>
```

- [ ] **Step 3: Add mobile HTML block before `.cycle-desktop`**

Inside `<section id="ciclo-maestria" ...>`, before the `.cycle-desktop` div, insert:

```html
<div class="cycle-mobile" data-lenis-prevent>
  {cycleData.map((item, i) => {
    const [line1, line2] = splitTitle(item.title);
    return (
      <div class="cycle-mobile-panel" data-panel-index={i}>
        <Image
          src={item.img}
          alt={item.title}
          width={900}
          height={1200}
          format="webp"
          quality="mid"
          class="cycle-mobile-bg"
          loading={i === 0 ? 'eager' : 'lazy'}
        />
        <div class="cycle-mobile-overlay"></div>
        <div class="cycle-mobile-content">
          <span class="cycle-mobile-num">{item.id} / Solución Integral</span>
          <div class="cycle-mobile-title">
            <div class="clip-wrap"><span class="clip-inner">{line1}</span></div>
            <div class="clip-wrap"><span class="clip-inner">{line2}</span></div>
          </div>
          <p class="cycle-mobile-desc">{item.desc}</p>
        </div>
        {i < cycleData.length - 1 && (
          <div class="cycle-mobile-peek">
            <span>{cycleData[i + 1].id} próximo ↓</span>
          </div>
        )}
      </div>
    );
  })}
  <div class="cycle-progress-bar">
    <div class="cycle-progress-fill"></div>
  </div>
</div>
```

- [ ] **Step 4: Verify HTML renders without errors**

Run: `npm run dev`

Check browser console for errors. The page should not crash. On desktop, you'll see both layouts stacked (CSS not yet applied). That's expected at this step.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/home/Cycle.astro
git commit -m "feat: add mobile HTML structure and splitTitle helper to Cycle"
```

---

### Task 3: CSS — show/hide layout variants and mobile scroll-snap

**Files:**
- Modify: `src/components/sections/home/Cycle.astro` — `<style>` block

**Interfaces:**
- Consumes: `.cycle-mobile`, `.cycle-desktop`, `.cycle-mobile-panel`, `.cycle-progress-bar`, `.cycle-progress-fill`
- Produces: correct layout on each device type; scroll-snap container on touch

- [ ] **Step 1: Add layout show/hide CSS**

In the existing `<style>` block (at the bottom of Cycle.astro), append:

```css
/* ── Layout switching ── */
.cycle-mobile  { display: none; }
.cycle-desktop { display: block; }

@media (hover: none) and (pointer: coarse) {
  .cycle-mobile  { display: flex; }
  .cycle-desktop { display: none; }
}
```

- [ ] **Step 2: Add scroll-snap container CSS**

```css
/* ── Mobile scroll-snap container ── */
.cycle-mobile {
  flex-direction: column;
  height: 100svh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: relative;
}
.cycle-mobile::-webkit-scrollbar { display: none; }
```

Note: `100svh` (small viewport height) avoids the iOS Safari address bar overlap bug that `100vh` causes on mobile.

- [ ] **Step 3: Add panel base CSS**

```css
/* ── Panels ── */
.cycle-mobile-panel {
  flex-shrink: 0;
  width: 100%;
  height: 100svh;
  scroll-snap-align: start;
  position: relative;
  overflow: hidden;
}

.cycle-mobile-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.08);
  transition: transform 5s ease-out;
  will-change: transform;
}

.cycle-mobile-panel.panel-active .cycle-mobile-bg {
  transform: scale(1.0);
}

.cycle-mobile-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 28%,
    rgba(0, 0, 0, 0.35) 65%,
    rgba(0, 0, 0, 0.12) 100%
  );
}

.cycle-mobile-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28px 24px 48px;
  z-index: 2;
}
```

- [ ] **Step 4: Add text animation CSS**

```css
/* ── Text animations ── */
.cycle-mobile-num {
  display: block;
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-samana-1);
  margin-bottom: 12px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.clip-wrap {
  overflow: hidden;
  line-height: 1.1;
}

.clip-inner {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 9vw, 3rem);
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  transform: translateY(110%);
  transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.cycle-mobile-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.7;
  font-weight: 300;
  margin-top: 14px;
  opacity: 0;
  transition: opacity 0.6s ease 0.38s;
}

/* Active state — all text reveals */
.cycle-mobile-panel.panel-active .cycle-mobile-num {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0s;
}

.cycle-mobile-panel.panel-active .clip-wrap:nth-child(1) .clip-inner {
  transform: translateY(0);
  transition-delay: 0.1s;
}

.cycle-mobile-panel.panel-active .clip-wrap:nth-child(2) .clip-inner {
  transform: translateY(0);
  transition-delay: 0.22s;
}

.cycle-mobile-panel.panel-active .cycle-mobile-desc {
  opacity: 0.45;
}
```

- [ ] **Step 5: Add peek hint and progress bar CSS**

```css
/* ── Next-service peek ── */
.cycle-mobile-peek {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  z-index: 3;
  pointer-events: none;
}

.cycle-mobile-peek span {
  font-family: 'Space Mono', monospace;
  font-size: 0.5rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.22);
  animation: peekBob 2.2s ease-in-out infinite;
}

@keyframes peekBob {
  0%, 100% { transform: translateY(0);   opacity: 0.3; }
  50%       { transform: translateY(-3px); opacity: 0.7; }
}

/* ── Gold progress bar ── */
.cycle-progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  z-index: 100;
  pointer-events: none;
  /* Only visible while cycle-mobile is in the viewport */
  display: none;
}

@media (hover: none) and (pointer: coarse) {
  .cycle-progress-bar {
    display: block;
  }
}

.cycle-progress-fill {
  height: 100%;
  width: 33.3%;
  background: linear-gradient(
    to right,
    var(--color-samana-1),
    rgba(255, 215, 0, 0.15)
  );
  transition: width 0.45s ease;
}
```

- [ ] **Step 6: Verify CSS in browser**

On a desktop browser: only the desktop two-column layout is visible. Mobile panels are hidden.

To simulate mobile: open DevTools → toggle device toolbar → select any mobile device → reload. You should see stacked panels (scroll-snap not yet working — JS not initialized). No layout breakage.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/home/Cycle.astro
git commit -m "feat: add mobile CSS layout, scroll-snap container, and cinematic animation states"
```

---

### Task 4: JavaScript — runtime branching and mobile IntersectionObserver

**Files:**
- Modify: `src/components/sections/home/Cycle.astro` — `<script>` block

**Interfaces:**
- Consumes: `.cycle-mobile`, `.cycle-mobile-panel[data-panel-index]`, `.cycle-progress-fill`
- Consumes: `.scroll-container`, `.cycle-text-item`, `.cycle-img` (desktop — unchanged)
- Produces: `initCycleScroll()` split into `initDesktopCycle()` and `initMobileCycle()`

- [ ] **Step 1: Replace the existing `<script>` block entirely**

Replace the full `<script>` block in Cycle.astro with:

```javascript
<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  const MOBILE_QUERY = '(hover: none) and (pointer: coarse)';

  function initMobileCycle() {
    const container = document.querySelector('.cycle-mobile') as HTMLElement | null;
    const panels = document.querySelectorAll('.cycle-mobile-panel');
    const progressFill = document.querySelector('.cycle-progress-fill') as HTMLElement | null;

    if (!container || !panels.length) return;

    const progressSteps = [33.3, 66.6, 100];

    // Reset all panels on re-init (Astro View Transitions)
    panels.forEach(p => p.classList.remove('panel-active'));
    if (progressFill) progressFill.style.width = '33.3%';

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          entry.target.classList.add('panel-active');
          const idx = parseInt((entry.target as HTMLElement).dataset.panelIndex ?? '0');
          if (progressFill) progressFill.style.width = `${progressSteps[idx]}%`;
        } else if (entry.intersectionRatio < 0.2) {
          entry.target.classList.remove('panel-active');
        }
      });
    }, { root: container, threshold: [0.2, 0.5] });

    panels.forEach(p => obs.observe(p));

    // Activate first panel immediately on load
    if (panels[0]) panels[0].classList.add('panel-active');
  }

  function initDesktopCycle() {
    const container = document.querySelector('.scroll-container');
    const textItems = gsap.utils.toArray('.cycle-text-item');
    const imgItems = gsap.utils.toArray('.cycle-img');

    if (!container || !textItems.length) return;

    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === container) st.kill();
    });

    const totalItems = textItems.length;

    gsap.set(textItems, { opacity: 0, y: 40 });
    gsap.set(imgItems, { opacity: 0, scale: 1.1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${window.innerHeight * totalItems}`,
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
      },
    });

    textItems.forEach((text: any, i: number) => {
      const img = imgItems[i];
      if (!text || !img) return;

      tl.to(text, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, i);
      tl.to(img, { opacity: 0.6, scale: 1, duration: 0.2, ease: 'power2.out' }, i);

      if (i < totalItems - 1) {
        tl.to(text, { opacity: 0, y: -40, duration: 0.2, ease: 'power2.in' }, i + 0.7);
        tl.to(img, { opacity: 0, scale: 1.1, duration: 0.2, ease: 'power2.in' }, i + 0.7);
      }
    });

    ScrollTrigger.refresh();
  }

  function initCycleScroll() {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      initMobileCycle();
    } else {
      initDesktopCycle();
    }
  }

  document.addEventListener('astro:page-load', () => {
    requestAnimationFrame(initCycleScroll);
  });
</script>
```

- [ ] **Step 2: Verify mobile behavior in DevTools**

Open DevTools → device toolbar → iPhone 14 Pro (or any mobile preset) → reload.

Expected:
- First panel visible, text animated in (number, title lines, description)
- Scroll down: second panel snaps into place, text reveals cinematically
- Scroll down again: third panel snaps, progress bar fills to 100%
- After third panel: page continues scrolling to next section (Philosophy)
- Progress bar fills correctly: 33% → 66% → 100%

- [ ] **Step 3: Verify desktop behavior is unchanged**

Switch DevTools to desktop (disable device toolbar) → reload.

Expected:
- Two-column layout (text left, image right) with sticky panel
- Scrolling triggers GSAP pin, text and images fade in/out
- Transitions feel slightly smoother than before (scrub: 1.5 lag)

- [ ] **Step 4: Verify Astro View Transitions work**

Navigate away from home page (e.g., click a project) and navigate back. The Cycle section should re-initialize correctly — no stuck animations, no double GSAP instances.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/home/Cycle.astro
git commit -m "feat: initialize mobile IntersectionObserver and desktop GSAP via runtime matchMedia branch"
```

---

### Task 5: Final integration check

**Files:**
- No changes — verification only

- [ ] **Step 1: Run full page scroll on mobile emulation**

In DevTools mobile emulation (iPhone 14 Pro, 393×852):

- [ ] Hero section visible and animates on load
- [ ] Scroll to Cycle section — first panel fills screen, Ken Burns starts, text reveals
- [ ] Swipe to second service — snap is clean, text resets and re-reveals
- [ ] Swipe to third service — same, progress bar at 100%
- [ ] Swipe past third service — page continues to Philosophy section naturally
- [ ] Scroll back up through Cycle — panels re-enter view, animations re-trigger cleanly

- [ ] **Step 2: Confirm no console errors**

Open DevTools console. No `TypeError`, no GSAP warnings, no `IntersectionObserver` errors.

- [ ] **Step 3: Run on real mobile if available**

Connect a phone (iOS or Android) and open the local network URL (`npm run dev -- --host`, then use the Network URL). Verify the snap behavior feels native — no rubber-banding conflicts, no lag.

- [ ] **Step 4: Confirm grain is visible on mobile**

The grain overlay from Layout.astro (`fixed inset-0 z-9999 opacity-[0.04]`) sits above the Cycle section. Confirm it's visible on mobile panels — it should be automatic since it's a fixed global overlay.

- [ ] **Step 5: Remove temporary mockup file**

```bash
rm public/cycle-mockups.html
git add public/cycle-mockups.html
git commit -m "chore: remove temporary scroll comparison mockup"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| `scroll-snap-type: y mandatory` on mobile | Task 3, Step 2 |
| 3 panels `100svh` with `scroll-snap-align: start` | Task 3, Step 3 |
| Must pass all 3 to continue scrolling | Achieved by mandatory snap + container height = 100svh |
| Ken Burns on panel entry | Task 3, Step 3 (`.cycle-mobile-bg` scale transition) |
| Clip-path title reveal, line by line | Task 3, Step 4 (`.clip-inner` translateY) |
| Number fade-in | Task 3, Step 4 |
| Description fade-in last | Task 3, Step 4 |
| Gold progress bar at bottom | Task 3, Step 5 |
| No depth bars, no dots | Not added anywhere |
| `data-lenis-prevent` | Task 2, Step 3 |
| Desktop `scrub: 1.5` | Task 1 |
| Desktop layout unchanged | Task 4 (desktop branch identical to original) |
| Grain inherited globally | Task 5, Step 4 (verification) |
| `astro:page-load` lifecycle | Task 4, Step 1 |
| Cleanup of mockup file | Task 5, Step 5 |

All spec requirements covered. No gaps.
