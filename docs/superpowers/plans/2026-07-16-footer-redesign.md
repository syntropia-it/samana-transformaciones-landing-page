# Footer Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar Footer.astro con diseño email-CTA + SAMANA watermark; modos completo/condensado según contexto de página vía `preFooter` prop en Layout.

**Architecture:** Layout recibe `preFooter?: 'cta'` y lo expone como `data-pre-footer` en `<body>`. Footer lee ese atributo en `astro:page-load` y oculta la zona SAMANA cuando vale `'cta'`. Footer permanece con `transition:persist` para no romper transiciones SPA.

**Tech Stack:** Astro v5, Tailwind v4, `lucide-astro`, ClientRouter (SPA). Font Inter 700 cargada globalmente vía Google Fonts.

## Global Constraints

- Commits: una línea, inglés, sin Co-Authored-By
- `font-sans` = Inter (definida en `@theme` del global.css — es la fuente heredada por defecto en el body)
- `--color-samana-1: #ffd700` (gold) — usar clase `text-samana-1`
- Usar clase `hoverable` en links interactivos (custom cursor del sitio)
- Newsletter: comentado en HTML, no eliminado
- No usar `overflow:hidden` en el footer principal — interfiere con el SAMANA
- `transition:persist` en el Footer NO se toca

---

### Task 1: Reescribir Footer.astro

**Files:**
- Modify: `src/components/layout/Footer.astro` (reemplazo completo)

**Interfaces:**
- Produce: elemento `<footer>` con `.samana-zone` que el JS oculta si `body[data-pre-footer="cta"]`

- [ ] **Step 1: Reemplazar Footer.astro con el nuevo diseño**

Contenido completo del archivo:

```astro
---
import { Instagram, Phone } from "lucide-astro";

const currentYear = new Date().getFullYear();

const footerLinks = {
  servicios: [
    { name: "Reformas Integrales", href: "/servicios/reformas-integrales" },
    { name: "Proyectos Inmobiliarios", href: "/servicios/proyectos-inmobiliarios" },
    { name: "Diseño y Renderizado", href: "/servicios/diseno-renderizado" },
    { name: "Provisión de Materiales", href: "/servicios/venta-materiales" },
  ],
  empresa: [
    { name: "Sobre Nosotros", href: "/nosotros" },
    { name: "Proyectos", href: "/proyectos" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contacto", href: "/contacto" },
  ],
  legal: [
    { name: "Aviso Legal", href: "/legal" },
    { name: "Privacidad", href: "/privacidad" },
    { name: "Términos", href: "/terminos" },
  ],
};

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/samanatransformaciones_/",
    icon: Instagram,
  },
];
---

<footer
  class="bg-black text-gray-400 relative z-30 border-t border-dashed border-white/15"
>
  <!-- Amber glow — top edge only -->
  <div
    class="absolute inset-0 bg-linear-to-b from-amber-900/15 to-transparent pointer-events-none z-0"
    aria-hidden="true"
  ></div>

  <!-- Main content -->
  <div class="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-0">

    <!-- Brand label -->
    <p class="text-xs font-bold tracking-[0.3em] text-samana-1/60 uppercase mb-3">
      Samana Transformaciones
    </p>

    <!-- Email — hero tipográfico -->
    <a
      href="mailto:samanatransformaciones@gmail.com"
      class="block text-xl md:text-4xl font-bold text-white hover:text-samana-1 transition-colors duration-500 leading-none hoverable mb-4 break-all md:break-normal"
      data-cta="footer-email"
    >
      samanatransformaciones@gmail.com
    </a>

    <!-- Contacts secundarios -->
    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 mb-10 text-sm text-gray-500">
      <a
        href="tel:+541179982004"
        class="flex items-center gap-1.5 hover:text-white transition-colors hoverable"
      >
        <Phone size={14} aria-hidden="true" />
        +54 11 7998-2004
      </a>
      <span class="hidden md:inline mx-3 text-gray-700" aria-hidden="true">·</span>
      {socialLinks.map((s) => (
        <a
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 hover:text-white transition-colors hoverable"
          aria-label={`Visitar ${s.name} de Samana`}
        >
          <s.icon size={14} aria-hidden="true" />
          {s.name}
        </a>
      ))}
    </div>

    <!-- Nav grid: 2 cols mobile / 3 cols desktop -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-8 pb-10">

      <!-- Servicios -->
      <div>
        <h3 class="text-white font-bold text-xs tracking-[0.22em] uppercase mb-4">
          Servicios
        </h3>
        <ul class="space-y-2">
          {footerLinks.servicios.map((link) => (
            <li>
              <a href={link.href} class="text-sm hover:text-white transition-colors hoverable">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <!-- Empresa -->
      <div>
        <h3 class="text-white font-bold text-xs tracking-[0.22em] uppercase mb-4">
          Empresa
        </h3>
        <ul class="space-y-2">
          {footerLinks.empresa.map((link) => (
            <li>
              <a href={link.href} class="text-sm hover:text-white transition-colors hoverable">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <!-- Legal — desktop: 3.ª col; mobile: fila horizontal debajo -->
      <div class="col-span-2 md:col-span-1">
        <h3 class="text-white font-bold text-xs tracking-[0.22em] uppercase mb-3 md:mb-4">
          Legal
        </h3>
        <ul class="flex flex-wrap gap-x-4 gap-y-1 md:flex-col md:space-y-2 md:gap-0">
          {footerLinks.legal.map((link) => (
            <li>
              <a href={link.href} class="text-sm hover:text-white transition-colors hoverable">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Newsletter — comentado, listo para activar con integración futura */}
    {/*
    <div>
      <h3 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h3>
      <p class="text-sm mb-4">Recibe tendencias y tips de diseño.</p>
      <form class="flex flex-col gap-4" aria-label="Suscripción al newsletter">
        <input type="email" placeholder="Tu email" class="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-samana-1 text-white transition-colors rounded" required />
        <button type="submit" class="bg-samana-1 text-black px-4 py-2 text-sm font-bold hover:bg-samana-1/80 transition-colors rounded">Suscribirse</button>
      </form>
    </div>
    */}

  </div>

  <!-- SAMANA watermark — fuera del contenedor con padding para ir de borde a borde -->
  <div class="samana-zone relative z-0 overflow-hidden" aria-hidden="true">
    <span class="samana-text font-bold uppercase whitespace-nowrap inline-block text-white/10">
      Samana
    </span>
  </div>

  <!-- Bottom bar -->
  <div class="relative z-10 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <span class="text-xs font-mono tracking-[0.12em] uppercase text-gray-700">
      © {currentYear} Samana Transformaciones. Buenos Aires, Argentina.
    </span>
    <div class="flex gap-3">
      {socialLinks.map((s) => (
        <a
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-700 hover:text-white transition-colors"
          aria-label={`Visitar ${s.name} de Samana`}
        >
          <s.icon size={22} aria-hidden="true" />
        </a>
      ))}
    </div>
  </div>
</footer>

<style>
  .samana-text {
    font-size: 10vw; /* fallback — JS override en astro:page-load */
    letter-spacing: -0.03em;
    line-height: 0.82;
  }
</style>

<script>
  function fitSamana() {
    const zone = document.querySelector('.samana-zone') as HTMLElement | null;
    const text = document.querySelector('.samana-text') as HTMLElement | null;
    if (!zone || !text) return;

    const containerW = zone.getBoundingClientRect().width;
    if (containerW === 0) return;

    // inline-block: evita que scrollWidth quede capeado por overflow del padre
    text.style.display   = 'inline-block';
    text.style.fontSize  = '200px';
    text.style.whiteSpace = 'nowrap';

    const textW = text.getBoundingClientRect().width;
    if (textW === 0) return;

    // 0.99 safety margin → evita clip subpixel; redondear al px → render parejo
    text.style.fontSize = Math.round((containerW / textW) * 200 * 0.99) + 'px';
  }

  function applyMode() {
    const zone = document.querySelector('.samana-zone') as HTMLElement | null;
    if (!zone) return;

    const isCondensed = document.body.getAttribute('data-pre-footer') === 'cta';
    zone.style.display = isCondensed ? 'none' : '';

    if (!isCondensed) {
      requestAnimationFrame(fitSamana);
    }
  }

  document.addEventListener('astro:page-load', applyMode);
  window.addEventListener('resize', () => {
    const zone = document.querySelector('.samana-zone') as HTMLElement | null;
    if (zone && zone.style.display !== 'none') fitSamana();
  });
</script>
```

- [ ] **Step 2: Verificar en localhost**

```bash
npm run dev
```

Abrir `http://localhost:4321`. Verificar:
- Email grande visible arriba
- Teléfono e Instagram debajo en la misma fila (desktop) / columna (mobile)
- 3 columnas nav en desktop, 2 columnas en mobile con Legal en fila horizontal
- SAMANA ocupa todo el ancho en la parte inferior
- SAMANA no se corta por ningún lado

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.astro
git commit -m "feat: new footer — email CTA hero, SAMANA watermark, adaptive mode"
```

---

### Task 2: Layout.astro — exponer preFooter en body

**Files:**
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Consume: nada nuevo
- Produce: `document.body.getAttribute('data-pre-footer')` === `'cta'` en páginas que lo pasan; atributo ausente en el resto

- [ ] **Step 1: Agregar prop al interface y destructuring**

En `src/layouts/Layout.astro`, dentro del frontmatter (`---`):

Buscar el bloque `interface Props {` y agregar `preFooter?: 'cta';` al final:

```typescript
interface Props {
  title: string;
  description?: string;
  image?: string;
  schemaType?: "home" | "projects" | "service" | "faq" | "blog"| "about";
  canonical?: string;
  alternates?: Record<string, string>;
  additionalSchema?: Array<Record<string, any>>;
  ratings?: { ratingValue: number; ratingCount: number } | null;
  // Blog-specific props
  publishDate?: Date;
  author?: string;
  tags?: string[];
  preFooter?: 'cta';
}
```

En el bloque `const { ... } = Astro.props;` agregar `preFooter,` al destructuring:

```typescript
const {
  title,
  description = "Samana Transformaciones - Reformas integrales y construcción de alta gama.",
  image = "/og-image.png",
  schemaType = "home",
  canonical,
  alternates,
  additionalSchema,
  publishDate,
  author,
  tags,
  preFooter,
} = Astro.props;
```

- [ ] **Step 2: Añadir data-pre-footer al body**

En el template de Layout.astro, buscar la etiqueta `<body` y agregar el atributo:

```astro
<body
  class="bg-black min-h-screen text-white selection:bg-[rgb(255,215,0)] selection:text-black overflow-x-hidden"
  data-pre-footer={preFooter}
>
```

Cuando `preFooter` es `undefined`, Astro omite el atributo — comportamiento correcto.

- [ ] **Step 3: Verificar TypeScript limpio**

```bash
npx astro check
```

Esperado: 0 errores en Layout.astro.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: Layout exposes preFooter prop as data-pre-footer on body"
```

---

### Task 3: Taggear las 4 páginas con preFooter="cta"

**Files:**
- Modify: `src/pages/nosotros.astro`
- Modify: `src/pages/faq.astro`
- Modify: `src/pages/proyectos/[slug].astro`
- Modify: `src/pages/servicios/[slug].astro`

**Interfaces:**
- Consume: `preFooter?: 'cta'` de Layout (Task 2)
- Produce: footer sin SAMANA en estas 4 rutas; SAMANA visible en todas las demás

- [ ] **Step 1: nosotros.astro**

Buscar `<Layout` (línea ~30) y agregar `preFooter="cta"`:

```astro
<Layout
  title={title}
  description={description}
  additionalSchema={[breadcrumbSchema]}
  schemaType="about"
  preFooter="cta"
>
```

- [ ] **Step 2: faq.astro**

Buscar `<Layout` (línea ~84) y agregar `preFooter="cta"`:

```astro
<Layout
  title={title}
  description={description}
  canonical={canonicalURL}
  additionalSchema={[faqSchema, breadcrumbSchema]}
  preFooter="cta"
>
```

- [ ] **Step 3: proyectos/[slug].astro**

Buscar `<BaseLayout` (línea ~53) y agregar `preFooter="cta"`:

```astro
<BaseLayout
  title={`${title} — Samana`}
  description={description}
  schemaType="projects"
  canonical={canonicalURL}
  additionalSchema={additionalSchema}
  preFooter="cta"
>
```

- [ ] **Step 4: servicios/[slug].astro**

Buscar `<Layout` (línea ~40) y agregar `preFooter="cta"`:

```astro
<Layout
  title={`${title} | Samana Transformaciones`}
  description={description}
  schemaType="service"
  canonical={canonicalURL}
  additionalSchema={additionalSchema}
  preFooter="cta"
>
```

- [ ] **Step 5: Verificar en localhost — ambos modos**

```bash
npm run dev
```

Verificar modo **condensado** (sin SAMANA):
- `http://localhost:4321/nosotros` → footer sin SAMANA al pie
- `http://localhost:4321/faq` → igual
- `http://localhost:4321/proyectos/<cualquier-slug>` → igual
- `http://localhost:4321/servicios/<cualquier-slug>` → igual

Verificar modo **completo** (con SAMANA):
- `http://localhost:4321/` → SAMANA visible en footer
- `http://localhost:4321/proyectos` → igual
- `http://localhost:4321/contacto` → igual

Verificar **navegación SPA**: ir de `/` a `/nosotros` y volver — el SAMANA debe aparecer/desaparecer correctamente en cada navegación sin reload.

- [ ] **Step 6: Commit**

```bash
git add src/pages/nosotros.astro src/pages/faq.astro \
        "src/pages/proyectos/[slug].astro" "src/pages/servicios/[slug].astro"
git commit -m "feat: tag CTA pages with preFooter=cta to hide footer SAMANA"
```
