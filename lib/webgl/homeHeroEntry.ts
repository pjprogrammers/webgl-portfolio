import { copyGeometryVec3 } from "@/components/webgl/FooterRCanvas/geometryTransformFromDataset.js";
import {
  geometryMorphTargetValue,
  readGeometryScrollFromElement,
} from "@/components/webgl/FooterRCanvas/particleGeometryScrollFromDataset.js";
import { regenerateParticleSpawnLayout } from "@/components/webgl/FooterRCanvas/particleFieldRegistry.js";
import { particleScrollState } from "@/components/webgl/FooterRCanvas/particleScrollState.js";
import { gsap, SplitText } from "@/lib/gsap/registerPlugin";
import { syncButtonSvg } from "@/components/atoms/Button/syncButtonSvg";
import { startScroll, stopScroll } from "@/lib/scroll";
import { revealPageContent } from "@/lib/webgl/pageExitFade";
import { normalizeRoutePath } from "@/lib/webgl/particleRouteFeatures";

export const HOME_HERO_DISSOLVE_DURATION = 2;
export const HOME_HERO_ENTRY_DELAY = 0.3;
export const HOME_HERO_SELECTOR = "[data-home-hero]";
export const HOME_HERO_TITLE_SELECTOR = "[data-home-hero-title]";
export const HOME_HERO_LABEL_SELECTOR = "[data-home-hero-label]";
export const HOME_HERO_DESCRIPTION_SELECTOR = "[data-home-hero-description]";
export const HOME_HERO_CTA_SELECTOR = "[data-home-hero-cta]";

const PRINT_OPACITY_KEYFRAMES = [
  { opacity: 0.4 },
  { opacity: 0.6 },
  { opacity: 0.8 },
  { opacity: 1 },
] as const;

let activeTimeline: gsap.core.Timeline | null = null;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function isHomeRoute(pathname: string): boolean {
  return normalizeRoutePath(pathname) === "/";
}

function killHomeHeroEntryTimeline() {
  activeTimeline?.kill();
  activeTimeline = null;
  startScroll();
}

/** Solo detiene la timeline activa; no toca el DOM (evita flash al reiniciar entrada). */
export function killHomeHeroEntryAnimation() {
  killHomeHeroEntryTimeline();
}

function applyHeroGeometryState(heroEl: HTMLElement) {
  const geoScroll = readGeometryScrollFromElement(heroEl);

  particleScrollState.shapeTarget = geoScroll.target;
  particleScrollState.shapeMorph = geometryMorphTargetValue(geoScroll.target);
  particleScrollState.shapeMorphUseFlight = geoScroll.entryAnimation;
  copyGeometryVec3(particleScrollState.geometryScale, geoScroll.geometryScale);
  copyGeometryVec3(
    particleScrollState.geometryPosition,
    geoScroll.geometryPosition,
  );
  copyGeometryVec3(
    particleScrollState.geometryRotation,
    geoScroll.geometryRotation,
  );
}

export function primeHomeHeroParticleState(pathname: string) {
  if (!isHomeRoute(pathname)) return;

  const heroEl = document.querySelector<HTMLElement>(HOME_HERO_SELECTOR);
  if (!heroEl) return;

  applyHeroGeometryState(heroEl);
  particleScrollState.dissolve = 1;
}

function setupButtonHiddenState(button: HTMLButtonElement) {
  const svgEl = button.querySelector("svg");
  const rectEl = button.querySelector("rect");
  const textEl = button.querySelector("span");
  if (!svgEl || !rectEl || !textEl) return null;

  button.classList.remove("invisible");

  const perimeter = syncButtonSvg(button, svgEl, rectEl);
  if (!perimeter) return null;

  gsap.set(button, { backgroundColor: "rgba(255,255,255,0)" });

  const split = new SplitText(textEl, {
    type: "lines",
    mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });
  gsap.set(split.lines, { yPercent: 320, rotate: 10 });

  return { rectEl, split, perimeter };
}

function setupLinesHiddenState(
  el: HTMLElement,
  { transformOrigin = "left center", yPercent = 320, rotate = 10 } = {},
) {
  // El texto arranca con `opacity-0` para evitar flash pre-hidratación,
  // pero SplitText necesita layout estable (width final) antes de partir líneas.
  el.classList.remove("opacity-0");
  gsap.set(el, { opacity: 1 });
  void el.offsetWidth;

  const computed = getComputedStyle(el);
  const isJustified = computed.textAlign === "justify";

  // Altura natural (fit-content) del párrafo ANTES de partir. Al envolver cada
  // línea en bloques con máscara, el alto por línea termina siendo mayor y el
  // texto se ve "distribuido" en un alto doble. Medimos el alto real y la
  // cantidad de líneas para fijar el alto exacto por línea, de modo que el alto
  // total no cambie durante la animación.
  const naturalHeight = el.getBoundingClientRect().height;

  const split = new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "overflow-hidden",
    tag: "div",
  });

  const lineCount = split.lines.length;
  const lastIndex = lineCount - 1;
  const lineHeightPx = lineCount > 0 ? `${naturalHeight / lineCount}px` : "";

  split.lines.forEach((line, index) => {
    const lineEl = line as HTMLElement;

    if (lineHeightPx) {
      lineEl.style.lineHeight = lineHeightPx;
      lineEl.style.height = lineHeightPx;
    }

    // Con `text-justify`, al partir en líneas cada línea queda como un bloque de
    // una sola línea y el justify deja de aplicar, colapsando al ancho del
    // contenido. Forzamos que cada línea ocupe el ancho completo y se justifique
    // igual que el estado final. La última línea (como en cualquier párrafo
    // justificado) NO se justifica, para no estirar las pocas palabras finales.
    if (isJustified) {
      lineEl.style.width = "100%";
      lineEl.style.textAlign = "justify";
      lineEl.style.textAlignLast = index === lastIndex ? "start" : "justify";
    }
  });

  if (lineHeightPx) {
    split.masks.forEach((mask) => {
      (mask as HTMLElement).style.height = lineHeightPx;
    });
  }

  gsap.set(split.lines, { yPercent, rotate, transformOrigin });
  return split;
}

export async function runHomeHeroEntryAnimation(): Promise<void> {
  killHomeHeroEntryTimeline();

  const heroEl = document.querySelector<HTMLElement>(HOME_HERO_SELECTOR);
  if (!heroEl) return;

  applyHeroGeometryState(heroEl);
  particleScrollState.dissolve = 1;
  regenerateParticleSpawnLayout();

  const titleEl = heroEl.querySelector<HTMLElement>(HOME_HERO_TITLE_SELECTOR);
  const labelEl = heroEl.querySelector<HTMLElement>(HOME_HERO_LABEL_SELECTOR);
  const descriptionEl = heroEl.querySelector<HTMLElement>(
    HOME_HERO_DESCRIPTION_SELECTOR,
  );
  const ctaButtons = Array.from(
    heroEl.querySelectorAll<HTMLButtonElement>(HOME_HERO_CTA_SELECTOR),
  );

  let titleSplit: SplitText | null = null;
  let labelSplit: SplitText | null = null;
  let descriptionSplit: SplitText | null = null;
  const buttonSplits: Array<{
    button: HTMLButtonElement;
    rectEl: SVGRectElement;
    split: SplitText;
    perimeter: number;
  }> = [];

  stopScroll();

  // El split por líneas (y la medición de alto por línea) se hace contra el
  // layout actual. Esperamos a que la fuente esté realmente aplicada y a que el
  // ancho responsive / scroll bloqueado queden estables antes de partir, así
  // `SplitText` calcula los saltos de línea con el ancho final y el alto por
  // línea se mide con la métrica real de la fuente (no la fallback).
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Si fonts.ready no resuelve (p. ej. iOS Safari en red local), seguimos.
    }
  }
  await nextFrame();
  await nextFrame();

  revealPageContent();

  if (titleEl) {
    titleEl.classList.remove("opacity-0");
    gsap.set(titleEl, { opacity: 1 });

    titleSplit = new SplitText(titleEl, {
      type: "chars,words,lines",
      tag: "span",
    });
    gsap.set(titleSplit.chars, { opacity: 0 });
  }

  if (labelEl) {
    labelSplit = setupLinesHiddenState(labelEl, {
      transformOrigin: "left top",
    });
  }

  if (descriptionEl) {
    descriptionSplit = setupLinesHiddenState(descriptionEl, {
      transformOrigin: "left top",
      yPercent: 200,
      rotate: 4,
    });
  }

  for (const button of ctaButtons) {
    const setup = setupButtonHiddenState(button);
    if (!setup) continue;
    buttonSplits.push({ button, ...setup });
  }

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      delay: HOME_HERO_ENTRY_DELAY,
      onComplete: () => {
        titleEl?.classList.remove("opacity-0");
        labelEl?.classList.remove("opacity-0");
        descriptionEl?.classList.remove("opacity-0");
        titleSplit?.revert();
        labelSplit?.revert();
        descriptionSplit?.revert();
        buttonSplits.forEach(({ split, button }) => {
          split.revert();
          button.classList.remove("invisible");
        });
        activeTimeline = null;
        startScroll();
        resolve();
      },
    });

    activeTimeline = tl;

    const point0 = 0;
    const point1 = 1;

    // Punto 0: partículas + label + title
    tl.to(
      particleScrollState,
      {
        dissolve: 0,
        duration: HOME_HERO_DISSOLVE_DURATION,
        ease: "none",
      },
      point0,
    );

    if (titleSplit) {
      tl.fromTo(
        titleSplit.chars,
        { opacity: 0 },
        {
          keyframes: [...PRINT_OPACITY_KEYFRAMES],
          stagger: 0.02,
          ease: "none",
          duration: 0.2,
        },
        point0,
      );
    }

    if (labelSplit) {
      tl.to(
        labelSplit.lines,
        {
          yPercent: 0,
          rotate: 0,
          stagger: 0.07,
          duration: 0.4,
          ease: "power3.out",
        },
        point0,
      );
    }

    // Punto 1: CTAs (stagger) + description
    if (descriptionSplit) {
      tl.to(
        descriptionSplit.lines,
        {
          yPercent: 0,
          rotate: 0,
          stagger: 0.07,
          duration: 0.4,
          ease: "power3.out",
        },
        point0 + 0.3,
      );
    }

    if (buttonSplits.length) {
      tl.to(
        buttonSplits.map((b) => b.rectEl),
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.inOut",
          stagger: 0.4,
        },
        point0,
      );

      tl.to(
        buttonSplits.map((b) => b.button),
        {
          backgroundColor: "rgba(255,255,255,0.04)",
          duration: 0.7,
          ease: "none",
          stagger: 0.4,
        },
        point0,
      );

      tl.to(
        buttonSplits.flatMap((b) => b.split.lines as unknown as Element[]),
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.4,
        },
        point0 + 0.3,
      );
    }
  });
}
