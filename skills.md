# Skills — Creative Development (Animaciones, Scroll, Motion)

Guía procedimental con ejemplos de **ricardochance.com**. Solo motion: GSAP, Lenis, cursor, WebGL/R3F, transiciones.

---

## Índice

1. [Setup de motion](#1-setup-de-motion)
2. [Ticker unificado](#2-ticker-unificado)
3. [Fuentes antes de animar](#3-fuentes-antes-de-animar)
4. [Lenis + ScrollTrigger](#4-lenis--scrolltrigger)
5. [Animaciones genéricas `js-s-*`](#5-animaciones-genéricas-js-s-)
6. [`scrollTriggerFromDataset`](#6-scrolltriggerfromdataset)
7. [SplitText — líneas enmascaradas](#7-splittext--líneas-enmascaradas)
8. [Botón SVG animado](#8-botón-svg-animado)
9. [Entrada por timeline (sin scroll)](#9-entrada-por-timeline-sin-scroll)
10. [Cursor custom](#10-cursor-custom)
11. [VariableProximity](#11-variableproximity)
12. [WebGL / R3F](#12-webgl--r3f)
13. [Animaciones específicas — consideraciones](#13-animaciones-específicas--consideraciones)
14. [Checklist al añadir motion](#14-checklist-al-añadir-motion)

---

## 1. Setup de motion

### Providers

```tsx
// components/providers/app-providers.tsx
"use client";

import "@/lib/gsap/registerPlugin";
import { LenisProvider } from "./lenis-provider";
import { ScrollAnimationsProvider } from "./scroll-animations-provider";
import { ScrollToTopOnNavigate } from "./scroll-to-top-on-navigate";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <ScrollAnimationsProvider>
        <ScrollToTopOnNavigate />
        {children}
      </ScrollAnimationsProvider>
    </LenisProvider>
  );
}
```

```tsx
// components/providers/scroll-animations-provider.tsx
"use client";

import useFontsReady from "@/lib/hooks/useFontsReady";
import { useScrollAnimations } from "@/lib/gsap/scrollAnimations";

export function ScrollAnimationsProvider({ children }: { children: React.ReactNode }) {
  useFontsReady();
  useScrollAnimations();
  return children;
}
```

### Registro GSAP + SplitText con ignore

```ts
// lib/gsap/registerPlugin.ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);
gsap.ticker.lagSmoothing(0);

const PROXIMITY_IGNORE_SELECTOR = "[data-proximity-text]";

class SplitText extends GSAPSplitText {
  constructor(target: ConstructorParameters<typeof GSAPSplitText>[0], vars?: SplitTextVars) {
    super(target, {
      ...vars,
      ignore: vars?.ignore ?? PROXIMITY_IGNORE_SELECTOR,
    } as SplitTextVars);
  }
}

export { gsap, ScrollTrigger, SplitText };
```

---

## 2. Ticker unificado

Evita Lenis, R3F y cursor corriendo RAFs separados.

```tsx
// components/providers/lenis-provider.tsx
const unregisterTicker = registerTickerCallback(({ timeMs }) => {
  lenis.raf(timeMs);
});
```

```ts
// lib/ticker/index.ts
export type TickerFrame = {
  timeSec: number;   // R3F advance()
  timeMs: number;    // Lenis raf()
  deltaMs: number;   // lerp cursor, parallax manual
};
```

---

## 3. Fuentes antes de animar

SplitText depende de métricas reales de fuente.

```ts
// lib/hooks/useFontsReady.ts — patrón esencial
useEffect(() => {
  const handleFontsLoaded = () => {
    setFontsLoaded(true);
    document.body.classList.add("fonts-loaded");
  };

  if (!document.fonts || document.fonts.status === "loaded") {
    handleFontsLoaded();
    return;
  }

  const fallback = setTimeout(handleFontsLoaded, 800);
  const onDone = () => { clearTimeout(fallback); handleFontsLoaded(); };

  document.fonts.ready.then(onDone);
  document.fonts.addEventListener("loadingdone", onDone);
  return () => {
    clearTimeout(fallback);
    document.fonts.removeEventListener("loadingdone", onDone);
  };
}, [setFontsLoaded]);
```

**En cualquier hook de animación:**

```ts
const { fontsLoaded } = useGlobalStore();

useEffect(() => {
  if (!fontsLoaded) return;
  // …
}, [fontsLoaded, pathname]);
```

---

## 4. Lenis + ScrollTrigger

### Conectar proxy

```ts
// lib/gsap/connectScrollTrigger.ts
export function connectScrollTrigger(lenis: Lenis) {
  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length && value !== undefined) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.documentElement.style.transform ? "transform" : "fixed",
  });

  const onRefresh = () => lenis.resize();
  ScrollTrigger.addEventListener("refresh", onRefresh);
  ScrollTrigger.refresh();

  return () => {
    lenis.off("scroll", ScrollTrigger.update);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    ScrollTrigger.scrollerProxy(document.documentElement, {});
  };
}
```

### Reset y bloqueo

```ts
// lib/scroll/resetScrollToTop.ts
export function resetScrollToTop() {
  useScrollMotionStore.getState().setVelocity(0);
  const lenis = useScrollStore.getState().lenis;
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
  ScrollTrigger.update();
}
```

Usar `stopScroll()` en loader, transiciones de página y overlays fullscreen.
Contenedores con scroll propio: `data-lenis-prevent`.

### Lenis provider — scroll condicional

```tsx
// Bloquear durante loader o menú abierto
const shouldAllowScroll = enabled && !menuOpen && !isLoading;
if (shouldAllowScroll) lenisRef.current.start();
else lenisRef.current.stop();
```

---

## 5. Animaciones genéricas `js-s-*`

Centralizadas en `lib/gsap/scrollAnimations.ts`. El JSX solo declara clase + data attrs.

### `.js-s-lines` — la más repetida

**Markup:**

```tsx
<span className="js-s-lines w-full text-center">{line1}</span>
<p className="js-s-lines body-sm">{description}</p>
```

**Implementación:**

```ts
document.querySelectorAll<HTMLElement>(".js-s-lines").forEach((el) => {
  const split = new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });
  splits.push(split);

  const scale = Number(el.dataset.scale) || 1;

  gsap.fromTo(
    split.lines,
    { yPercent: 320, scale, rotate: 10 },
    {
      yPercent: 0,
      scale: 1,
      rotate: 0,
      stagger: 0.07,
      duration: 0.4,
      ease: "power3.out",
      scrollTrigger: scrollTriggerFromDataset(el, {
        start: "90%",
        scrub: 1,
        end: "bottom 60%",
      }),
    },
  );
});
```

**CSS requerido:**

```css
.js-s-lines .overflow-hidden,
.s-split-lines .overflow-hidden {
  display: block;
  overflow: hidden;
}
```

---

### `.js-s-fade-in`

```tsx
<div className="js-s-fade-in" data-start="top 80%" data-scrub={1} />
```

```ts
const scale = Number(el.dataset.scale) === 0 ? 0 : 1;

const tl = gsap.timeline({
  scrollTrigger: scrollTriggerFromDataset(el, {
    start: "80%",
    scrub: el.dataset.scrub ? Number(el.dataset.scrub) : 1,
    start: el.dataset.start ?? "top 80%",
    end: el.dataset.end ?? "bottom 80%",
  }),
});

tl.fromTo(
  el,
  { opacity: 0, scale },
  { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
  Number(el.dataset.delay || 0),
);
```

---

### `.js-s-print-opacity`

```tsx
<h2 className="js-s-print-opacity heading-2" data-start-from-zero={true}>
  {title}
</h2>
```

```ts
const startFromZero = el.dataset.startFromZero === "true";

gsap.fromTo(
  split.chars,
  { opacity: startFromZero ? 0 : 0.1 },
  {
    keyframes: [{ opacity: 0.4 }, { opacity: 0.6 }, { opacity: 0.8 }, { opacity: 1 }],
    stagger: 0.02,
    ease: "power1.inOut",
    duration: 0.2,
    scrollTrigger: scrollTriggerFromDataset(el, {
      scrub: 1,
      start: "top 90%",
      end: "bottom 70%",
    }),
  },
);
```

---

### `.js-s-blur`

```ts
gsap.from(split.words, {
  opacity: 0,
  filter: "blur(15px)",
  duration: 0.4,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: scrollTriggerFromDataset(el, { start: "90%" }),
});
```

---

### `.js-s-fade-in-out` (storytelling)

```ts
const tl = gsap.timeline({
  defaults: {
    duration: 2,
    scrollTrigger: scrollTriggerFromDataset(el, {
      scrub: true,
      start: "top 70%",
      end: "bottom 30%",
    }),
  },
});

tl.fromTo(el, { opacity: 0 }, { opacity: 1 });
tl.to({}, { duration: 2 });
tl.to(el, { opacity: 0 });
```

---

### Hook global — cleanup

```ts
export function useScrollAnimations() {
  const { fontsLoaded } = useGlobalStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!fontsLoaded) return;

    const splits: SplitText[] = [];
    const ctx = gsap.context(() => { /* …selectores js-s-* */ });

    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [fontsLoaded, pathname]);
}
```

---

## 6. `scrollTriggerFromDataset`

Lee `data-*` del elemento y normaliza posiciones:

```tsx
{/* Trigger externo + scrub */}
<p
  className="js-s-print-opacity"
  data-start="top center+=20px"
  data-trigger="#process-step-1"
  data-scrub={true}
/>
```

```ts
export function scrollTriggerFromDataset(el: HTMLElement, defaults = {}): ScrollTrigger.Vars {
  const start = normalizePosition(el.dataset.start ?? defaults.start ?? "top 90%", "top");
  const trigger = el.dataset.trigger
    ? document.querySelector(el.dataset.trigger) ?? el
    : el;
  // … end, scrub, markers, pin
  return { trigger, start, /* … */ };
}
```

---

## 7. SplitText — líneas enmascaradas

Config estándar del proyecto (botones, headers, secciones):

```ts
const split = new SplitText(textEl, {
  type: "lines",
  mask: "lines",
  linesClass: "overflow-hidden",
  tag: "div",
});

gsap.set(split.lines, { yPercent: 320, rotate: 10 });

gsap.to(split.lines, {
  yPercent: 0,
  rotate: 0,
  stagger: 0.07,   // reveal one-shot
  duration: 0.4,
  ease: "power3.out",
});
```

**Valores de referencia:**

| Propiedad | From | To | Notas |
|-----------|------|-----|-------|
| `yPercent` | `320` | `0` | Entrada desde abajo |
| `rotate` | `10` | `0` | Inclinación sutil |
| `ease` | — | `power3.out` | Estándar del sitio |
| `duration` | — | `0.4` | |
| `stagger` reveal | — | `0.07` | Timeline one-shot |
| `stagger` scrub | — | `1` | Storytelling secuencial |

Para chars (print, títulos dramáticos):

```ts
new SplitText(el, { type: "chars,words,lines", tag: "span" });
```

---

## 8. Botón SVG animado

Borde con `strokeDashoffset` + texto con líneas enmascaradas, scrubbed al scroll.

```tsx
<button data-event="hover" className="relative h-10 …">
  <svg className="absolute inset-0 …" aria-hidden="true">
    <rect ref={rectRef} stroke="currentColor" vectorEffect="non-scaling-stroke" />
  </svg>
  <span ref={textRef}>{children}</span>
</button>
```

```ts
const tl = gsap.timeline({
  scrollTrigger: { trigger: button, start: "top 90%", end: "bottom 80%", scrub: 1 },
});

tl.to(rect, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" });
tl.fromTo(button, { backgroundColor: "rgba(255,255,255,0)" }, { backgroundColor: "rgba(255,255,255,0.04)" });
tl.to(split.lines, { yPercent: 0, rotate: 0, duration: 0.4, ease: "power3.out" }, "-=0.25");
```

```ts
// syncButtonSvg.ts — resize-safe
const r = height / 2;
const perimeter = 2 * (width - 2 * r) + 2 * Math.PI * r;
gsap.set(rect, {
  strokeDasharray: perimeter,
  strokeDashoffset: preserveProgress ? perimeter * (1 - visibleProgress) : perimeter,
});
```

`noAnimation` cuando un hook de sección (hero, process) controla el reveal.

---

## 9. Entrada por timeline (sin scroll)

Para contenido post-loader que no debe depender de ScrollTrigger:

```ts
// useWorksHeaderEntry.ts
useEffect(() => {
  if (!fontsLoaded || isLoading) return;

  const ctx = gsap.context(() => {
    const lines: Element[] = [];

    container.querySelectorAll("[data-works-line]").forEach((el) => {
      const split = new SplitText(el, { type: "lines", mask: "lines", linesClass: "overflow-hidden", tag: "div" });
      gsap.set(split.lines, { yPercent: 320, rotate: 10 });
      lines.push(...split.lines);
    });

    const blocks = container.querySelectorAll("[data-works-block]");
    gsap.set(blocks, { yPercent: 320 });

    gsap.to([...lines, ...blocks], {
      yPercent: 0,
      rotate: 0,
      stagger: 0.07,
      duration: 0.4,
      ease: "power3.out",
      delay: 0.2,
    });
  }, container);

  return () => ctx.revert();
}, [fontsLoaded, isLoading]);
```

- `data-works-line` → SplitText
- `data-works-block` → bloque entero sin split (evita romper layout interno)

---

## 10. Cursor custom

Solo en `(pointer: fine)`. Movimiento con lerp en el ticker.

```ts
const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;
```

```tsx
// Escuchar data-event en el DOM
document.querySelectorAll("[data-event]").forEach((evt) => {
  const type = evt.dataset.event?.toLowerCase();
  if (type === "hover") {
    evt.addEventListener("mouseover", () => setCursorType("hover"));
    evt.addEventListener("mouseleave", () => setCursorType("default"));
  }
  // simple-hover | text | drag | hide
});
```

`MutationObserver` con debounce para nodos que entran por navegación SPA.

WebGL hover grid también consulta `[data-event]` para saber si el pointer está sobre UI interactiva.

---

## 11. VariableProximity

Hover tipográfico con font variations. **No** pasar por SplitText.

```tsx
<span ref={containerRef} data-proximity-text className="inline">
  <VariableProximity
    label={text}
    containerRef={containerRef}
    fromFontVariationSettings="'wght' 400"
    toFontVariationSettings="'wght' 900"
    radius={80}
    falloff="exponential"
  />
</span>
```

El wrapper `SplitText` en `registerPlugin.ts` ignora `[data-proximity-text]` automáticamente.

---

## 12. WebGL / R3F

### Features por ruta

```ts
// lib/webgl/particleRouteFeatures.ts
const ROUTE_PARTICLE_FEATURES: Record<string, ParticleRouteFeatures> = {
  "/": { geometryParticles: true, footerRParticles: true },
  "/about": { geometryParticles: true, footerRParticles: true },
};
```

```ts
// hooks/useParticleRouteFeatures.ts
useLayoutEffect(() => {
  useParticleFeaturesStore.getState().syncFromPathname(pathname);
}, [pathname]);
```

`useLayoutEffect` — el canvas lee flags correctos antes del paint.

### Acoplar DOM ↔ canvas

```tsx
<section
  data-home-hero
  data-geometry="star"
  data-geometry-entry-animation={false}
>
  <p data-home-hero-label className="js-s-lines opacity-0">…</p>
</section>

<footer data-dissolve="in">…</footer>
```

### Estado fuera de React (GSAP ↔ R3F)

```ts
// Objeto plain tweeneado por GSAP, leído por el shader/canvas cada frame
export const particleScrollState = { dissolve: 0 };

gsap.to(particleScrollState, {
  dissolve: 1,
  scrollTrigger: { /* … */ },
});
```

### Transición de página con partículas

```ts
// lib/webgl/particlePageTransition.ts — flujo
stopScroll();
gsap.to(particleScrollState, { dissolve: 1, onComplete: () => navigate() });
// Paralelo: animatePageExitFade()
```

Sin WebGL → timeline fade out → `router.push` → fade in.

### Touch fallback

```css
@media (hover: hover) and (pointer: fine) {
  .gl-img-fallback {
    opacity: 0;
    pointer-events: none;
  }
}
```

---

## 13. Animaciones específicas — consideraciones

Referencia de decisiones, no código para copiar tal cual.

### Loader (`components/organisms/Loader`)

- Solo primera visita (`hasClientNavigatedOnce()`)
- Timeline con `clipPath`: línea central → split paneles
- `stopScroll()` hasta `onComplete`, luego `startScroll()`
- Coordina con `isLoading` en store

### Work reveal (`useWorkRevealAnimation`)

- Scrub bidireccional: entrada (`top 50%` → `top 10%`) y salida (`bottom 70%` → `bottom 30%`)
- `immediateRender: false` en salida para no aplicar estado al montar
- Preferir scrub sobre `onEnter`/`onLeaveBack` cuando el scroll debe revertir la animación

### Process desktop (`useProcessScrollAnimation`)

- Pin + timeline largo, múltiples SplitText (chars + lines)
- CTA oculto con `process-cta-pending` hasta el punto de scroll correcto
- Cuando hay 5+ elementos sincronizados → hook dedicado con refs, no `js-s-*`

### Hero + partículas

- Elementos empiezan `opacity-0` / `invisible`
- CTAs con `noAnimation` — el hero hook controla su reveal
- `data-geometry` activa morph en canvas vía route features

### Footer dissolve

- `[data-dissolve="in"]` en footer
- `particleScrollState.dissolve` tweeneado por ScrollTrigger al entrar/salir del footer

### Grid hover WebGL (RigCanvas, CarouselCanvas)

- Raycast / grid consulta `[data-event]` para no capturar hover sobre UI
- Scroll velocity desde `scroll-motion-store` para parallax reactivo

---

## 14. Checklist al añadir motion

| Pregunta | Acción |
|----------|--------|
| ¿Se repite en muchas páginas? | Clase `js-s-*` en `scrollAnimations.ts` |
| ¿Es de una sección concreta? | `useXAnimation.ts` en la carpeta del componente |
| ¿Acoplada a canvas o ruta? | Data attributes + route features + store sync |
| ¿Texto partido? | Esperar `fontsLoaded` |
| ¿Hover tipográfico? | `data-proximity-text`, no SplitText |
| ¿Transición de página? | Bloquear scroll + GSAP timeline + navigate callback |

**Siempre en cleanup:**

1. `split.revert()` por cada SplitText
2. `ctx.revert()` o kill de timelines/triggers
3. `ScrollTrigger.refresh()` tras montar
4. Re-ejecutar effect en cambio de `pathname` si aplica
