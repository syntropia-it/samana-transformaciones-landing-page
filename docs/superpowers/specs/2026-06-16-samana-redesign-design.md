# Samana Transformaciones — Rediseño Visual Completo
**Fecha:** 2026-06-16  
**Estado:** Aprobado por stakeholder — listo para implementación  
**Stack:** Astro 5.18 · Tailwind 4 · GSAP 3.14 · Lenis 1.3 · TypeScript strict

---

## 1. Contexto y reencuadre

Samana Transformaciones es una **empresa de reformas y construcciones integrales de alta gama en CABA** (Palermo). No es una firma de autor ni un atelier — es un equipo profesional con proceso, capacidad y resultados documentados. El rediseño debe representar esto con precisión: confianza constructiva, acabado de lujo, proceso transparente.

**Lo que NO cambia del sitio actual:**
- Paleta base oscura + dorado (se formaliza)
- Mecánica de servicios con scroll-pin (se refina visualmente)
- Gallery horizontal de proyectos (se refina)
- Arquitectura de página: Hero → Filosofía → Servicios → Proyectos → Contacto

**Lo que SÍ cambia:**
- Sistema tipográfico (se establece con roles fijos)
- Hero (de nombre-solo a tesis completa)
- Signature element del cursor (de figura dorada → sistema de partículas)
- Decoraciones genéricas eliminadas (triángulo amarillo, sidebar "01" global)
- Preloader (de estático → animación constructiva 5 actos)

---

## 2. Dirección visual — C1+C2 Brutalismo Editorial de Alta Gama

La tensión entre dos registros opuestos **es** el concepto:

| Rol | Fuente | Voz |
|-----|--------|-----|
| Barlow Condensed Black 900 | Fuerza constructiva, arquitectura, escala | Grita la tesis |
| Cormorant Garamond Light Italic 300 | Acabado fino, detalle, elegancia | Susurra la promesa |
| Inter 300 | Claridad funcional, información | Informa sin decorar |

El Barlow no es suave. El Cormorant no es estructural. La colisión entre los dos es Samana: empresa que construye con músculo y termina con precisión.

---

## 3. Sistema de tokens

### Color
```
--color-void:    #050505   /* Fondo base — negro casi absoluto */
--color-brut:    #0d0c0a   /* Fondo alternativo — negro cálido */
--color-saffron: #b8860b   /* Dorado primario — acento, CTA, énfasis */
--color-gold:    #b8a070   /* Dorado secundario — Cormorant, taglines */
--color-ivoire:  #ede8e0   /* Blanco cálido — texto principal */
--color-stone:   #3a3028   /* Texto cuerpo apagado */
--color-ash:     #1a1612   /* Bordes, detalles sutiles */
```

### Tipografía
```
--font-display:  'Barlow Condensed', sans-serif   /* 900, uppercase */
--font-accent:   'Cormorant Garamond', serif       /* 300, italic */
--font-body:     'Inter', sans-serif               /* 300 */
```

### Escala tipográfica
```
display-xl:   clamp(4rem, 8vw, 8rem)    /* Hero headline */
display-lg:   clamp(2.5rem, 5vw, 5rem)  /* Section headlines */
display-md:   clamp(1.8rem, 3vw, 3rem)  /* Subsection headlines */
accent-lg:    clamp(1.4rem, 2.5vw, 2.5rem) /* Cormorant tagline en hero */
accent-md:    clamp(1rem, 1.8vw, 1.8rem)   /* Cormorant secundario */
body:         0.875rem / 1.7              /* Inter body */
label:        0.625rem / letter-spacing 0.2em uppercase /* Eyebrows */
```

---

## 4. Copy del sitio — mapa completo

| Sección | Texto | Fuente tipográfica |
|---------|-------|--------------------|
| Hero headline | **"HABITÁ LO QUE SOS"** | Barlow Black, display-xl, blanco |
| Hero tagline | *"la obra sin el caos, el resultado que merecés"* | Cormorant italic, accent-lg, gold |
| Hero body | "Reformas y construcciones integrales en CABA. Diseño, ejecución y provisión de materiales bajo una sola firma." | Inter 300, stone |
| Hero CTAs | "Ver proyectos" (primary) · "¿Cómo trabajamos? →" (secondary) | Label, saffron/ash |
| Filosofía headline | **"TU VISIÓN."** | Barlow Black, display-lg |
| Filosofía serif | *"nuestra obra."* | Cormorant italic, saffron |
| Proyectos intro | "Obras que hablan por sí solas" | Barlow, display-md |
| Contacto CTA | **"¿Listo para habitar lo que sos?"** | Barlow, display-md |

**Regla de copy:** los textos en Barlow son siempre afirmaciones o llamados directos. Los textos en Cormorant son siempre promesas o matices que suavizan. No se intercambian roles.

---

## 5. Signature element — Sistema de partículas (cursor + fondo)

### Concepto
Las partículas doradas son el cursor Y el elemento de fondo en el hero — un único sistema con dos estados:

**Estado reposo** (mouse quieto o ausente):  
Las partículas se organizan en líneas que trazan un plano arquitectónico abstracto — reminiscente de un plano técnico de obra. Movimiento mínimo, respiración lenta.

**Estado activo** (mouse en movimiento):  
Las partículas cercanas al cursor se dispersan con física de resorte. Las que forman el racimo-cursor persiguen el mouse con stagger individual (cada partícula tiene su propio delay). Al detenerse, vuelven gradualmente al plano.

### Especificación técnica
- **Canvas 2D** sobre el hero — no Three.js (innecesario para 2D, menor bundle)
- ~90 partículas totales: 12 forman el racimo-cursor + 78 forman el plano
- El racimo-cursor reemplaza al `CustomCursor` existente en el hero; fuera del hero el cursor vuelve a ser un crosshair CSS simple
- Plano base: rectángulos y divisiones que evocan habitaciones — sin texto, solo geometría
- Partículas: círculos de 0.5–2px, opacidad 0.2–0.6, color `#b8860b`
- Glow suave (radialGradient) en el racimo-cursor
- **`prefers-reduced-motion`:** canvas oculto, cursor CSS simple
- **Touch devices:** canvas desactivado (ya existe lógica en el proyecto para esto)

### Implementación
```
src/components/effects/SignatureParticles.astro
  → <canvas> con client:only="vanilla"
  → Exporta cleanup function para View Transitions
  → Se monta solo en el hero (no global)
```

---

## 6. Preloader — Animación constructiva 5 actos

El logo (iso.png) surge como si se construyera — torre por torre, piso a piso. El logo patentado no se modifica; solo se anima su construcción.

| Acto | Tiempo | Qué ocurre |
|------|--------|------------|
| 1 | 0s | Void negro. Aparece una retícula de plano muy tenue (líneas #1a1510) |
| 2 | 0.8s | Las líneas del plano se trazan con stroke-dashoffset (GSAP SVG) |
| 3 | 1.8s | Los volúmenes del logo suben desde abajo con stagger — cada rectángulo/torre aparece de abajo hacia arriba con `fromY(40)` |
| 4 | 3.0s | El iso.png completo aparece con fade + ligero scale. Glow dorado sutil |
| 5 | 4.0s | "SAMANA" en Barlow aparece debajo. 0.8s de pausa. Fade out a negro → entra el sitio |

**Duración total:** ~5.2s  
**Implementación:** GSAP timeline en `src/components/core/LoadingScreen.astro` (componente ya existente, se reemplaza el contenido)  
**SVG:** Forma simplificada del iso (3 rectángulos de distintas alturas + techo triangular) como SVG inline animable. El iso.png real aparece en el acto 4 sobre el SVG.

---

## 7. Estructura de secciones

### 7.1 Hero
- Full viewport height
- Imagen de proyecto real como fondo (dark overlay 85%)
- Sidebar izquierda: 36px, solo en hero — contiene año y ciudad en vertical, sin número "01"
- Navbar: logo iso.png + "SAMANA" + links + "Cotizá" (CTA outline)
- Canvas de partículas como layer sobre la imagen
- Copy stack: eyebrow → headline Barlow → tagline Cormorant → body Inter → CTAs
- Grain texture overlay (ya existe en Layout.astro, se mantiene)

### 7.2 Filosofía
- Background: `--color-brut`
- Grid 2 columnas: izquierda headline "TU VISIÓN. / nuestra obra." · derecha body + lista de proceso
- Sin número de sección
- Lista del proceso (4 items con `—` en dorado):
  1. Planificación integral antes de arrancar
  2. Un referente durante toda la obra
  3. Materiales seleccionados, no improvisados
  4. Plazo y presupuesto acordado de antemano

### 7.3 Servicios (scroll-pin, se refina)
- Mecánica existente se mantiene: 4 servicios que ciclan con scroll
- **Eliminar:** triángulo amarillo decorativo → reemplazar por bracket arquitectónico `[` en `--color-ash`
- Número de servicio (01/02/03/04) solo en esta sección — el proceso SÍ es secuencial
- Layout por servicio: número + nombre (Barlow) + descripción (Inter) + imagen derecha

### 7.4 Proyectos destacados
- Scroll horizontal existente se mantiene
- Header de sección: "OBRAS QUE HABLAN / POR SÍ SOLAS" (Barlow) + eyebrow "Portafolio"
- Cards: imagen + ciudad + año + tipo de reforma — sin precio, sin métricas
- Hover: ligero scale de imagen (1.02) + overlay con nombre completo del proyecto

### 7.5 Contacto / CTA final
- Fondo: `--color-void`
- Headline: "¿LISTO PARA / HABITAR LO QUE SOS?" — Barlow, grande
- Mantener segmentación "Quiero remodelar / Quiero construir" como opciones (concepto correcto)
- Rediseño visual de los botones de segmentación: de genérico → estilo consistente con el sistema

### 7.6 Footer
- Estructura existente se mantiene (email, links, newsletter)
- Refinamiento tipográfico: todo en Inter 300 con jerarquía clara
- Logo + "SAMANA TRANSFORMACIONES" como cierre visual

---

## 8. Componentes a modificar / crear

| Componente | Acción | Notas |
|-----------|--------|-------|
| `LoadingScreen.astro` | Reescribir | 5-act GSAP animation |
| `CustomCursor.astro` | Modificar | Solo activo fuera del hero (crosshair CSS simple) |
| `SignatureParticles.astro` | Crear nuevo | Canvas 2D, solo en hero |
| `Hero.astro` (o equivalente en index) | Refactorizar | Nuevo copy, canvas layer, sin sidebar numérica global |
| `global.css` | Actualizar tokens | Formalizar variables con nombres de spec |
| Sección servicios | Refinar | Quitar triángulo, añadir brackets, actualizar tipografía |
| Sección proyectos | Refinar | Header copy, hover treatment |
| Sección contacto | Refinar | Nuevo headline CTA, botones rediseñados |
| Footer | Refinar | Tipografía consistente |

---

## 9. Animaciones y motion

- **GSAP ScrollTrigger** para scroll-pin de servicios (ya implementado, se mantiene)
- **Lenis** para smooth scroll (ya implementado, se mantiene)
- **GSAP timeline** para preloader
- **Canvas requestAnimationFrame** para partículas
- **CSS transitions** para hover states (no GSAP — innecesario para hovers simples)
- **Duración estándar:** 300ms ease-out para micro-interacciones · 600ms para sección transitions
- **`prefers-reduced-motion`:** desactiva partículas y preloader animation (fade directo al logo)

---

## 10. Lo que no se toca

- Schema.org SEO (`SEO.astro`) — no hay cambios de contenido estructural
- Content collections (projects, services, blog) — esquemas y datos intactos
- Astro config (chunking, sitemap, etc.) — no se modifica
- Lenis init en Layout.astro — se mantiene
- View Transitions (ClientRouter + persist) — se mantiene
- hreflang, OG, Twitter meta — se mantiene

---

## 11. Preguntas abiertas (no bloquean implementación)

- **Imagen del hero:** ¿cuál de los proyectos existentes va como imagen de fondo? (puede ser una decisión posterior — en desarrollo se usa un placeholder oscuro)
- **Textos de servicios:** los 4 servicios tienen copy existente — ¿se ajusta o se mantiene?

---

## Aprobaciones registradas

| Decisión | Aprobado |
|----------|----------|
| Dirección C1+C2 (Brutalismo Editorial de Alta Gama) | ✓ |
| Reencuadre: constructora de alta gama (no firma de autor) | ✓ |
| Paleta de tokens (#050505 + dorados) | ✓ |
| Sistema tipográfico Barlow + Cormorant + Inter | ✓ |
| Hero copy: "Habitá lo que sos" + Cormorant tagline | ✓ |
| Mapa de copy completo | ✓ |
| Preloader 5 actos constructivos | ✓ |
| Logo iso.png: mantener sin modificar, solo animar | ✓ |
| Sidebar "01": eliminada como global, solo en sección proceso | ✓ |
| Signature element: partículas = cursor + plano en reposo | ✓ |
