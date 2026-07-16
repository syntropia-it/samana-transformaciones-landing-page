# Footer Redesign — Spec

## Objetivo

Reemplazar el footer actual (genérico, pesado en mobile) por un diseño con SAMANA como protagonista visual en la parte inferior, adaptando su comportamiento según el contexto de cada página.

## Diseño aprobado

### Estructura visual (ambos modos)

```
[SAMANA TRANSFORMACIONES]           ← label pequeño, dorado, uppercase mono
samanatransformaciones@gmail.com    ← héroe tipográfico, text-3xl desktop / text-xl mobile
+54 11 7998-2004  ·  Instagram      ← misma línea, gris, text-sm

Servicios       Empresa         Legal
Reformas Int.   Sobre Nosotros  Aviso Legal
Proy. Inmobi.   Proyectos       Privacidad
Diseño y Rend.  Blog            Términos
Materiales      FAQ
                Contacto

          S  A  M  A  N  A          ← solo en modo completo
© 2025 Samana...        [IG icon]
```

### Modo completo (SAMANA visible)
Páginas sin CTA previo: `/`, `/proyectos`, `/blog/*`, `/contacto`, `/gracias`, `/legal`, `/privacidad`, `/terminos`.

### Modo condensado (SAMANA oculto)
Páginas que ya tienen `FinalCTA` o `CTAServices` antes del footer — el SAMANA ya apareció arriba, no se duplica:
- `/nosotros` (usa FinalCTA)
- `/faq` (usa FinalCTA)
- `/proyectos/[slug]` (usa FinalCTA)
- `/servicios/[slug]` (usa CTAServices)

## Arquitectura — Opción A (señal via Layout prop)

### Mecanismo
1. `Layout.astro` recibe prop opcional `preFooter?: 'cta'`
2. Layout lo expone como `data-pre-footer` en el elemento `<body>`
3. `Footer.astro` lee `document.body.dataset.preFooter` en `astro:page-load`
4. Si vale `'cta'`, aplica clase que oculta `.samana-zone` via CSS

### Por qué esto y no alternativas
- Footer permanece en Layout con `transition:persist` → sin flashes de navegación SPA
- Un solo archivo Footer.astro, una sola fuente de verdad
- Prop simple, sin signals reactivos ni stores

## SAMANA watermark — detalles técnicos

- Font: Inter 700 (ya cargada globalmente via Google Fonts en Layout.astro)
- Technique: JS `fitSamana()` — pone el texto en `inline-block` a 200px, mide `getBoundingClientRect().width`, escala al 99% del ancho del contenedor, redondea al px entero
- Se ejecuta en `astro:page-load` + `resize`
- `letter-spacing: -0.03em`, `opacity: 0.10`, `line-height: 0.82`
- Mobile: el JS mide el contenedor real (misma lógica, distinto ancho)

## Newsletter

Comentado en el HTML pero no eliminado (listo para activar con integración futura).

## Mobile

- Email: `text-xl` (completo en una línea)
- Nav: grid 2 columnas (Servicios + Empresa), Legal como fila horizontal al pie
- Contactos: columna vertical con íconos
- SAMANA: JS fitSamana mide el contenedor mobile, misma lógica

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/layout/Footer.astro` | Reescritura completa |
| `src/layouts/Layout.astro` | Agregar prop `preFooter?: 'cta'`, `data-pre-footer` en body |
| `src/pages/nosotros.astro` | `<Layout preFooter="cta">` |
| `src/pages/faq.astro` | `<Layout preFooter="cta">` |
| `src/pages/proyectos/[slug].astro` | `<Layout preFooter="cta">` |
| `src/pages/servicios/[slug].astro` | `<Layout preFooter="cta">` |
