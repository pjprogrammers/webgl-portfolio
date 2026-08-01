import { gsap } from "@/lib/gsap/registerPlugin";

/** Duración (s) del fade out de contenido al salir de una página. */
export const PAGE_EXIT_FADE_DURATION = 0.8;
const PAGE_EXIT_FADE_EASE = "power2.inOut";

/** Contenido DOM por página (texto, carousel works, etc.). Vive dentro de `<main>`. */
const PAGE_CONTENT_SELECTOR = "[data-page-content]";
/**
 * Capa WebGL de las imágenes (planeGeometry) de Selected Works. Vive en el
 * layout, así que persiste entre rutas y hay que restablecer su opacidad al
 * entrar a una nueva página.
 */
const RIG_CANVAS_SELECTOR = "[data-rig-canvas]";

let activeTweens: gsap.core.Tween[] = [];

function fadeTargets(): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `${PAGE_CONTENT_SELECTOR}, ${RIG_CANVAS_SELECTOR}`,
    ),
  );
}

export function killPageExitFadeTweens() {
  activeTweens.forEach((tween) => tween.kill());
  activeTweens = [];
}

/**
 * Tras navegación cliente, mantiene el contenido DOM oculto hasta que la
 * animación de entrada lo revele (`revealPageContent`). React puede reutilizar
 * el nodo `<main>` entre rutas; si limpiáramos el `opacity: 0` del fade de
 * salida aquí, el contenido de la ruta anterior o el cuerpo de la nueva ruta
 * parpadearía un frame antes de la entrada.
 *
 * Debe llamarse en un `useLayoutEffect` (antes del paint).
 *
 * NOTA: el RigCanvas (`[data-rig-canvas]`) NO se toca aquí. Su revelado lo
 * controla el propio canvas (ver `revealRigCanvas`).
 */
export function preparePageContentForEntry(fromClientNavigation: boolean) {
  killPageExitFadeTweens();
  if (!fromClientNavigation || typeof document === "undefined") return;

  const contentLayers = document.querySelectorAll<HTMLElement>(
    PAGE_CONTENT_SELECTOR,
  );
  gsap.set(contentLayers, { opacity: 0 });
}

/** Revela el contenido DOM una vez la animación de entrada está lista. */
export function revealPageContent() {
  if (typeof document === "undefined") return;

  const contentLayers = document.querySelectorAll<HTMLElement>(
    PAGE_CONTENT_SELECTOR,
  );
  gsap.set(contentLayers, { clearProps: "opacity" });
}

/** Oculta la capa WebGL del rig (evita mostrar el frame stale de la ruta previa). */
export function setRigCanvasHidden() {
  if (typeof document === "undefined") return;
  const rig = document.querySelectorAll<HTMLElement>(RIG_CANVAS_SELECTOR);
  if (!rig.length) return;
  gsap.set(rig, { opacity: 0 });
}

/** Revela la capa WebGL del rig una vez dibujó un frame fresco de la ruta nueva. */
export function revealRigCanvas() {
  if (typeof document === "undefined") return;
  const rig = document.querySelectorAll<HTMLElement>(RIG_CANVAS_SELECTOR);
  if (!rig.length) return;
  gsap.set(rig, { clearProps: "opacity" });
}

/**
 * Desvanece a opacidad 0 todo el contenido de la página actual: texto/contenido
 * (`[data-page-content]`, que incluye el carousel de Works) y la capa de
 * imágenes de Selected Works (`[data-rig-canvas]`).
 */
export function animatePageExitFade(): Promise<void> {
  killPageExitFadeTweens();

  const targets = fadeTargets();
  if (!targets.length) return Promise.resolve();

  return new Promise((resolve) => {
    const tween = gsap.to(targets, {
      opacity: 0,
      duration: PAGE_EXIT_FADE_DURATION,
      ease: PAGE_EXIT_FADE_EASE,
      onComplete: () => {
        activeTweens = [];
        resolve();
      },
    });

    activeTweens = [tween];
  });
}
