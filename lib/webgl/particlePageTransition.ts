import type { MouseEvent } from "react";

import { PARTICLE_PAGE_DISSOLVE_DURATION } from "@/components/webgl/FooterRCanvas/footerRConfig.js";
import { particleScrollState } from "@/components/webgl/FooterRCanvas/particleScrollState.js";
import { regenerateParticleSpawnLayout } from "@/components/webgl/FooterRCanvas/particleFieldRegistry.js";
import { gsap } from "@/lib/gsap/registerPlugin";
import { resetScrollToTop, startScroll, stopScroll } from "@/lib/scroll";
import {
  getParticleRouteFeatures,
  hasFooterParticleField,
  normalizeRoutePath,
} from "@/lib/webgl/particleRouteFeatures";
import {
  animatePageExitFade,
  killPageExitFadeTweens,
  revealPageContent,
} from "@/lib/webgl/pageExitFade";

type AppHref = string | { pathname?: string | null | undefined };

let activeTween: gsap.core.Tween | null = null;
let isTransitioning = false;
let isExiting = false;
let hasClientNavigated = false;

const DISSOLVE_VISIBLE_THRESHOLD = 0.92;

export function areParticlesVisible(): boolean {
  return particleScrollState.dissolve < DISSOLVE_VISIBLE_THRESHOLD;
}

export function markClientNavigation() {
  hasClientNavigated = true;
}

export function hasClientNavigatedOnce(): boolean {
  return hasClientNavigated;
}

export function shouldRunEntryDissolve(geometryParticles: boolean): boolean {
  return hasClientNavigated && geometryParticles;
}

export function killParticleTransitionTweens() {
  activeTween?.kill();
  activeTween = null;
  isTransitioning = false;
  startScroll();
}

/**
 * Reinicia el guard de salida y mata cualquier fade pendiente. Pensado para el
 * cleanup de ruta, NO para `runDissolveTween` (que llama a
 * `killParticleTransitionTweens`), de modo que el dissolve no mate al fade que
 * corre en paralelo durante la misma transición.
 */
export function resetPageExitTransition() {
  isExiting = false;
  killPageExitFadeTweens();
}

function normalizeHrefPath(href: AppHref): string {
  const raw =
    typeof href === "string"
      ? (href.split("#")[0]?.split("?")[0] ?? "/")
      : (href.pathname ?? "/");

  return normalizeRoutePath(raw || "/");
}

function runDissolveTween(to: number): Promise<void> {
  killParticleTransitionTweens();

  return new Promise((resolve) => {
    stopScroll();
    isTransitioning = true;

    activeTween = gsap.to(particleScrollState, {
      dissolve: to,
      duration: PARTICLE_PAGE_DISSOLVE_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        activeTween = null;
        isTransitioning = false;
        startScroll();
        resolve();
      },
    });
  });
}

export async function animateDissolveOut(): Promise<void> {
  if (particleScrollState.dissolve >= DISSOLVE_VISIBLE_THRESHOLD) return;

  particleScrollState.pageDissolveOut = true;
  // En el footer la R ya está formada: regenerar el spawn teletransportaría las
  // partículas a puntos lejanos antes de animar. Solo regeneramos cuando NO hay
  // formación de footer (dissolve de geometrías) para que salgan desde donde están.
  if (particleScrollState.rFormation <= 0.001) {
    regenerateParticleSpawnLayout();
  }
  await runDissolveTween(1);
}

export async function animateDissolveIn(): Promise<void> {
  revealPageContent();
  particleScrollState.pageDissolveOut = false;
  particleScrollState.dissolve = 1;
  regenerateParticleSpawnLayout();
  await runDissolveTween(0);
}

export function isParticleTransitionActive(): boolean {
  return isTransitioning;
}

/**
 * Intercepta clics en links internos: dissolve out si hay partículas visibles,
 * luego devuelve `navigate` para hacer `router.push`.
 * Devuelve `null` si el clic debe seguir el comportamiento nativo del link.
 */
export async function handleParticleTransitionClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: AppHref,
  currentPathname: string,
  navigate: () => void,
): Promise<(() => void) | null> {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const currentPath = normalizeRoutePath(currentPathname);
  const targetPath = normalizeHrefPath(href);

  if (currentPath === targetPath) {
    return null;
  }

  event.preventDefault();

  if (isTransitioning || isExiting) {
    return null;
  }

  const currentFeatures = getParticleRouteFeatures(currentPathname);
  const shouldDissolveOut =
    hasFooterParticleField(currentFeatures) && areParticlesVisible();

  // Salida unificada: el contenido (texto, carousel works, planeGeometry de
  // Selected Works) se desvanece a opacidad 0 en paralelo con el dissolve de
  // partículas, y navegamos cuando todo terminó.
  isExiting = true;

  const exitAnimations: Promise<void>[] = [animatePageExitFade()];
  if (shouldDissolveOut) {
    exitAnimations.push(animateDissolveOut());
  }

  await Promise.all(exitAnimations);

  isExiting = false;
  markClientNavigation();
  resetScrollToTop();

  return navigate;
}
