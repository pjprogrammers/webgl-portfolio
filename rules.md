# Rules — Creative Development (Animaciones, Scroll, Motion)

Reglas permanentes para proyectos con el lineamiento motion de **ricardochance.com**. Solo creative development: animaciones, scroll, cursor, WebGL/R3F y motion UX.

---

## Stack de motion

| Área                    | Tecnología                                            |
| ----------------------- | ----------------------------------------------------- |
| Animaciones             | GSAP + ScrollTrigger + SplitText                      |
| Scroll suave            | Lenis                                                 |
| Loop RAF                | Ticker unificado vía `gsap.ticker`                    |
| 3D / shaders (opcional) | React Three Fiber + Three.js                          |
| Estado de motion        | Zustand (solo flags de animación/scroll/cursor/WebGL) |

Evitar CSS transitions para transiciones de página o storytelling complejo. Usar GSAP timelines.

---

## Dónde vive cada cosa

```
lib/
  gsap/
    registerPlugin.ts       ← único punto de import GSAP
    scrollAnimations.ts     ← animaciones genéricas js-s-*
    scrollTriggerFromDataset.ts
    connectScrollTrigger.ts
  scroll/
    resetScrollToTop.ts
    nativeScrollLock.ts
  ticker/
    index.ts                ← RAF compartido Lenis + R3F + cursor
  hooks/
    useFontsReady.ts
  webgl/                    ← transiciones, features por ruta (si hay canvas)

components/
  providers/
    lenis-provider.tsx
    scroll-animations-provider.tsx
  webgl/                    ← escenas R3F lazy-loaded
```

### Reglas de separación

- **Genérica y repetible** → clase `js-s-*` + registro en `scrollAnimations.ts`.
- **Específica de una sección** → hook `useXAnimation.ts` colocalizado en la carpeta del componente.
- **Acoplada a WebGL** → data attributes semánticos + mapa de features por ruta + store de sync.
- **Nunca** importar `gsap` directo en componentes; siempre `@/lib/gsap/registerPlugin`.
- Objetivo ~400 líneas por archivo de animación; extraer helpers si crece.

---

## GSAP — reglas obligatorias

### Registro centralizado

```ts
gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
gsap.ticker.lagSmoothing(0);
```

### Propiedades animables

- ✅ `transform`, `opacity`, `filter`, `clip-path`, `stroke-dashoffset`
- ❌ `width`, `height`, `top`, `left`, `margin`, `padding`

### Cleanup en todo hook de animación

1. Guard `if (!fontsLoaded) return`
2. `gsap.context()` para agrupar tweens
3. `split.revert()` por cada SplitText
4. Matar timelines / ScrollTriggers en return
5. `ScrollTrigger.refresh()` al montar y al cambiar ruta (`pathname` en deps)

### Scrub vs reveal

| Modo       | Uso                               | Config                        |
| ---------- | --------------------------------- | ----------------------------- |
| **Reveal** | UI, textos sueltos                | Sin scrub; trigger ~`top 90%` |
| **Scrub**  | Storytelling, secciones pin, hero | `scrub: true` o `scrub: 1`    |

No usar scrub en micro-interacciones UI.

---

## Sistema declarativo `js-s-*`

Animaciones de scroll genéricas se declaran en markup, no se repiten en cada página:

| Clase                 | Efecto                                                          |
| --------------------- | --------------------------------------------------------------- |
| `.js-s-lines`         | Líneas enmascaradas desde abajo (`yPercent: 320`, `rotate: 10`) |
| `.js-s-fade-in`       | Fade + scale in                                                 |
| `.js-s-fade-out`      | Fade + scale out                                                |
| `.js-s-print-opacity` | Chars con keyframes de opacidad                                 |
| `.js-s-print-blur`    | Chars blur in + hold                                            |
| `.js-s-blur`          | Words blur reveal                                               |
| `.js-s-fade-in-out`   | Fade in → hold → fade out (scrub)                               |

### Data attributes (ScrollTrigger)

Resueltos por `scrollTriggerFromDataset()`:

| Attribute                       | Propósito                                  |
| ------------------------------- | ------------------------------------------ |
| `data-start` / `data-end`       | Posiciones del trigger                     |
| `data-scrub`                    | `true`, `1`, o `false`/`0` para desactivar |
| `data-trigger`                  | Selector de otro elemento como trigger     |
| `data-delay`                    | Delay en timeline                          |
| `data-scale`                    | Scale inicial (`0` = desde 0)              |
| `data-markers`                  | Debug                                      |
| `data-pin` / `data-pin-spacing` | Pin de sección                             |

---

## Fuentes antes de SplitText

**Nunca** partir texto ni medir líneas antes de que carguen las fuentes.

- `useFontsReady()` → `fontsLoaded` en store + clase `fonts-loaded` en body
- Fallback 800ms para iOS Safari
- Todo hook de animación espera `fontsLoaded`

---

## Lenis + ScrollTrigger

- Lenis: `autoRaf: false` — el RAF viene del ticker GSAP
- `connectScrollTrigger(lenis)` — proxy de scroll obligatorio
- `resetScrollToTop()` al navegar (Lenis + DOM + `ScrollTrigger.update()`)
- `stopScroll()` / `startScroll()` durante loader, transiciones y overlays
- Scroll interno: `data-lenis-prevent` en el contenedor
- `history.scrollRestoration = 'manual'` para evitar saltos post-navegación

---

## Ticker unificado

Un solo loop para evitar RAFs compitiendo:

| Consumidor      | Usar      |
| --------------- | --------- |
| Lenis           | `timeMs`  |
| R3F `advance()` | `timeSec` |
| Cursor lerp     | `deltaMs` |

Limitar FPS vía `getGraphicsProfile()` cuando aplique.

---

## Cursor custom

- `cursor: none` en body solo con `(pointer: fine)`
- Elementos interactivos: `data-event`

| Valor          | Efecto                    |
| -------------- | ------------------------- |
| `hover`        | Cursor expandido          |
| `simple-hover` | Hover sutil               |
| `text`         | Modo texto                |
| `drag`         | Arrastre                  |
| `hide`         | Ocultar (inputs, modales) |

Re-enganchar listeners con `MutationObserver` tras navegación client-side.

---

## SVG animado (botones, bordes)

- SVG inline en JSX, no `<img>`
- `vectorEffect="non-scaling-stroke"` en strokes
- Borde animado: `strokeDasharray` + `strokeDashoffset`
- Sincronizar tamaño con `ResizeObserver` + `syncButtonSvg()`
- Prop `noAnimation` cuando otro hook controla el reveal del botón

---

## WebGL / R3F (opcional)

- Escenas en `components/webgl/`, lazy-loaded
- Features por ruta: `particleRouteFeatures.ts`, `rigRouteFeatures.ts`
- Sync en `useLayoutEffect` (antes del paint)
- Estado tweeneado por GSAP fuera de React (`particleScrollState`) cuando R3F lo lee a 60fps
- GSAP puede controlar cámara, uniforms o dissolve
- Dispose geometrías/materiales en unmount
- Touch devices: fallback `.gl-img-fallback` sin canvas

Data attributes para acoplar DOM ↔ canvas:

```tsx
<section data-geometry="star" data-dissolve="in" data-home-hero />
```

---

## Transiciones de página

- GSAP timeline, no CSS-only
- Bloquear scroll durante la transición
- Patrón async: tween de salida → callback `navigate()` → tween de entrada
- Loader solo en primera visita, no en cada navegación SPA

---

## Providers de motion (orden)

```tsx
<LenisProvider>
  <ScrollAnimationsProvider>
    {" "}
    {/* useFontsReady + useScrollAnimations */}
    <ScrollToTopOnNavigate />
    {children}
  </ScrollAnimationsProvider>
</LenisProvider>
```

Importar `@/lib/gsap/registerPlugin` al inicio del provider raíz.

---

## Performance de motion

- Animar transform/opacity, no layout
- Batch ScrollTriggers cuando sea posible
- `ScrollTrigger.refresh()` tras resize o cambio de layout
- Dynamic import de escenas WebGL
- Respetar `prefers-reduced-motion` donde aplique

---

## Anti-patterns

- Importar GSAP sin `registerPlugin`
- SplitText antes de `fontsLoaded`
- SplitText sobre `[data-proximity-text]`
- ScrollTrigger sin cleanup al desmontar / cambiar ruta
- Múltiples `requestAnimationFrame` independientes (usar ticker)
- Scrub en elementos UI pequeños
- Estado React para valores que GSAP/R3F mutan cada frame
- Hardcodear selectores de sección en hooks globales (usar data attributes semánticos)
