# Proyectos — Mobile Redesign (Option B)

**Status:** Approved for implementation  
**Date:** 2026-07-04  
**Scope:** `/src/pages/proyectos/index.astro` — mobile experience only  
**Desktop:** No changes — existing GSAP horizontal pin remains exactly as-is

---

## 1. Problem

The current `/proyectos` page uses GSAP `pin: true` + horizontal `translateX` to create a cinematic left-to-right card traversal on desktop. On mobile this breaks: GSAP pin intercepts native touch scroll, the horizontal transform doesn't translate to a portrait viewport, and cards render at `85vw` width without an intuitive navigation model.

---

## 2. Solution Overview

**Option B — Texto como horizonte**

"PROYECTOS" stays permanently visible as an atmospheric watermark in the center of the screen throughout the entire section. Cards scroll vertically past it, one at a time, with CSS scroll-snap. After the last card exits, the text drifts down and anchors just above the footer — mirroring the desktop end state. The GSAP horizontal scroll is gated to desktop only via `matchMedia`.

**Core experience:** the user is always inside the word. The cards are events that happen within that ambient space.

---

## 3. Text Behavior

- **Font:** `font-size: 20vw`, `font-weight: 700`, `font-style: italic`, `letter-spacing: -0.05em`, `text-transform: uppercase`
- **Color:** `color: rgba(255,255,255, 0.24)` — matches desktop opacity
- **Position:** `position: absolute`, horizontally centered, `z-index: 5` (always behind cards)
- **Parallax:** driven by GSAP ScrollTrigger `scrub: 1.2`. The text moves at `0.12×` scroll speed — stays near center throughout, creating depth without disorientation
- **Start state:** text centered vertically at `top: calc(50% - 0.5em)`
- **End state:** after the last card exits, ScrollTrigger animates `top` from floating position to `bottom: footer_height + 12px`. Transition: `ease: "power2.out"`, scrubbed

---

## 4. Cards

| Property | Value |
|---|---|
| Width | `calc(100% - 20px)` |
| Height | `52vw` (min `160px`, max `240px`) |
| Border radius | `8px` |
| Snap | `scroll-snap-align: center` on each card |
| Container snap | `scroll-snap-type: y mandatory` |

**Active card (centered in viewport):**
- `filter: none` — full color
- `z-index: 15`
- `box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.35)` — subtle gold border
- `opacity: 1`

**Inactive cards (off-center):**
- `filter: grayscale(100%)` — B&W
- `opacity: 0.30`
- `z-index: 10`

Transitions driven by ScrollTrigger `scrub: 1`. Cards adjacent to the active one are partially visible above/below, creating the same "peripheral awareness" as the desktop blur effect.

---

## 5. Progress Counter

The `XX%` counter from desktop is preserved at `bottom-left` (`position: fixed`, `z-index: 20`). It updates as the user scrolls through cards, reaching `100%` when the last card is centered. This is a brand identity element — identical to desktop.

---

## 6. Layout Structure (mobile)

```
<main>                           <!-- bg: black -->
  <header>                       <!-- position: absolute, z:5 -->
    <h1>PROYECTOS</h1>           <!-- the floating watermark -->
  </header>

  <section id="mobile-cards">    <!-- scroll-snap-type: y mandatory -->
    <article class="card">...</article>  <!-- ×4 -->
  </section>

  <footer>                       <!-- fixed, bottom -->
    <div id="scroll-percentage">00%</div>
  </footer>
</main>
```

---

## 7. GSAP Implementation

All mobile animation is gated with `matchMedia`:

```javascript
const mm = gsap.matchMedia();

mm.add("(max-width: 768px)", () => {
  // Text parallax — floats near center at 0.12× scroll speed
  gsap.to(h1, {
    y: () => -(section.scrollHeight * 0.12),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
    }
  });

  // Text end-state — settles above footer after last card
  // h1 switches to position:fixed so bottom anchoring works correctly
  ScrollTrigger.create({
    trigger: section,
    start: "80% bottom",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      const t = self.progress;
      const targetY = window.innerHeight - footerHeight - h1.offsetHeight - 12;
      const startY  = window.innerHeight / 2 - h1.offsetHeight / 2;
      gsap.set(h1, { position: "fixed", top: startY + (targetY - startY) * t });
    }
  });

  // Card activation (color/grayscale per card)
  cards.forEach(card => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 55%",
      end: "bottom 45%",
      onEnter:      () => activateCard(card),
      onLeave:      () => deactivateCard(card),
      onEnterBack:  () => activateCard(card),
      onLeaveBack:  () => deactivateCard(card),
    });
  });

  return () => { /* cleanup on breakpoint switch */ };
});

mm.add("(min-width: 769px)", () => {
  // existing horizontal GSAP pin — untouched
  initProjectsShowcase();
});
```

---

## 8. CSS Changes (mobile-only)

```css
@media (max-width: 768px) {
  /* Disable horizontal wrapper */
  #horizontal-wrapper {
    height: auto;
    overflow: visible;
  }

  /* Cards: vertical stack with scroll-snap */
  #projects-container {
    flex-direction: column;
    gap: 28px;
    padding: 20vw 10px 32px;   /* top padding = space for text */
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
  }

  .project-item {
    width: 100%;
    scroll-snap-align: center;
    transition: filter 0.4s ease, opacity 0.4s ease;
    filter: grayscale(100%);
    opacity: 0.3;
  }

  .project-item.active {
    filter: none;
    opacity: 1;
    box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.35);
  }

  /* Text stays behind cards */
  header {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
    pointer-events: none;
  }

  h1 {
    font-size: 20vw;
    opacity: 0.24;
    translate-x: 0;           /* reset desktop -5% offset */
  }
}
```

---

## 9. Preserved from Desktop

| Element | Desktop | Mobile |
|---|---|---|
| GSAP horizontal pin | ✓ | ✗ (disabled via matchMedia) |
| "PROYECTOS" watermark | fixed top-30, 20vw | floating center, 20vw |
| `XX%` counter | scroll progress | scroll progress |
| Gold accent `#ffd700` | card hover, cursor | active card border |
| Black background | ✓ | ✓ |
| Full-color active / B&W inactive | hover blur | scroll-snap activation |

---

## 10. Out of Scope

- Desktop changes of any kind
- Navigation or Layout.astro changes
- Tablet breakpoints (768px–1024px handled by existing desktop behavior)
- Animation on the breadcrumb or page title area
