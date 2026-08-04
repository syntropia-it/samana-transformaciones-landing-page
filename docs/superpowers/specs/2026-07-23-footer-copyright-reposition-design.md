# Footer — reposición de copyright y ajuste de navgrid (spec corta)

## Contexto

Ajuste sobre el footer ya implementado en `docs/superpowers/specs/2026-07-16-footer-redesign.md`. Dos problemas detectados al revisar en vivo:

1. El copyright (bottom-bar) quedaba superpuesto arriba de las letras grandes del watermark "SAMANA" en desktop.
2. El bloque de navgrid (Servicios/Empresa/Legal) no tenía el mismo ancho que el divisor (`border-b`) del bloque de email — se veía descalzado respecto a esa línea.

## Diseño aprobado (Opción B, de las 3 presentadas en el mockup)

### Reposición de copyright + SAMANA

- El copyright **sube**: pasa a ubicarse justo después del navgrid (con un divisor sutil `border-t border-white/[0.06]`, consistente con el que ya separa email-cta de navgrid).
- El **SAMANA** watermark vuelve a ser el **último elemento de la página** — ocupa todo el espacio restante (`flex-1` real, ya no necesita el truco de posición absoluta a nivel de todo el footer) y sangra/se recorta contra el borde real de la pantalla, ancho completo, sin nada superpuesto.
- Nada cambia del tratamiento visual del watermark en sí (tamaño `25vw`, opacity 0.1, mismo reveal). Solo cambia qué hay *antes* de él en el documento.

### Navgrid contenido

- Se saca el `w-full` que se le había agregado al wrapper del navgrid. Sin esa clase, el bloque vuelve a su ancho natural (contenido por su propio contenido) igual que ya hace el bloque de email — quedando dentro del ancho de la línea divisoria de arriba, centrado.

## Por qué esta opción y no las otras dos descartadas

- Se descartó "copyright en una esquina conviviendo con las letras" — la usuaria prefiere separación limpia, no superposición en ningún grado.
- Se descartó "SAMANA recortado en su propia zona intermedia" (mi recomendación original) — la usuaria prefiere que el SAMANA sea literalmente lo último de la página con sangrado real, no una franja intermedia.

## Alcance

Solo `src/components/layout/Footer.astro`. No afecta la lógica de `preFooter` (páginas con FinalCTA siguen ocultando el watermark y quedando compactas, sin cambios ahí).
