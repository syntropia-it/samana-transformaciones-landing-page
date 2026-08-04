# Proyectos/Blog index — el título de fondo se suelta al terminar el scroll (spec corta)

## Contexto

`src/pages/proyectos/index.astro` y `src/pages/blog/index.astro` comparten la misma estructura: una sección con scroll horizontal pineado (GSAP ScrollTrigger, `pin:true`, `scrub`) donde el usuario recorre las cards arrastrando horizontalmente con el scroll vertical. Por fuera de ese pin, un `<header class="fixed top-30 ...">` muestra el título gigante de fondo ("Proyectos" / "Articulos") y un `<footer class="fixed bottom-2 ...">` local muestra el indicador "Desplácese hacia abajo X%". Ambos son `position:fixed` **permanente** — nunca se sueltan.

## Diagnóstico confirmado

No existe ni existió un mecanismo que "suelte" estos elementos al terminar el scroll horizontal. Se verificó contra un deploy anterior de Vercel (que la usuaria recordaba con este comportamiento resuelto): ahí el mismo header es `position:fixed` sin excepción durante todo el scroll. Lo que pasaba es que el footer real de esa versión era corto (592px) y sin watermark propio, así que el texto fijo (siempre a 120px del top) nunca llegaba a tocarlo — pura coincidencia geométrica, no un comportamiento a restaurar.

Ahora que el footer real tiene su propio watermark "SAMANA" grande ocupando pantalla completa en desktop, el header fijo y el indicador fijo quedan flotando sobre ese contenido de forma permanente, en cualquier punto del scroll posterior a la galería.

## Diseño aprobado

Envolver header + sección de scroll horizontal + indicador en un único contenedor, y pinear **ese contenedor completo** con el mismo `ScrollTrigger` que hoy pinea solo la galería (mismo `start`/`end`/`scrub`).

- El header y el indicador pasan de `position:fixed` (relativo al viewport) a `position:absolute` dentro de ese contenedor (relativo a él).
- Mientras dura el pin (0% a 100% del scroll horizontal), se comportan visualmente igual que hoy — nada cambia en esa fase.
- Al llegar al 100%, el pin se libera (mecanismo nativo de GSAP, el mismo que ya libera la galería) y el contenedor completo pasa a flujo normal del documento. Header e indicador, al ya no ser `fixed`, se asientan un instante ahí y luego se van scrolleando hacia arriba como contenido normal a medida que se sigue bajando — nunca vuelven a aparecer una vez que el footer real ocupa la pantalla.

## Alcance

Se aplica igual en ambas páginas (misma estructura, mismo fix, aplicado dos veces). No toca `Footer.astro` ni su lógica de `preFooter`.
