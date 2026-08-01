import { copyGeometryVec3 } from "@/components/webgl/FooterRCanvas/geometryTransformFromDataset.js";
import {
  geometryMorphTargetValue,
  readGeometryScrollFromElement,
} from "@/components/webgl/FooterRCanvas/particleGeometryScrollFromDataset.js";
import { regenerateParticleSpawnLayout } from "@/components/webgl/FooterRCanvas/particleFieldRegistry.js";
import { particleScrollState } from "@/components/webgl/FooterRCanvas/particleScrollState.js";
import { gsap, SplitText } from "@/lib/gsap/registerPlugin";
import { startScroll, stopScroll } from "@/lib/scroll";
import { revealPageContent } from "@/lib/webgl/pageExitFade";
import { normalizeRoutePath } from "@/lib/webgl/particleRouteFeatures";

export const ABOUT_HERO_DISSOLVE_DURATION = 2;
export const ABOUT_HERO_SELECTOR = "[data-about-hero]";
export const ABOUT_HERO_TITLE_SELECTOR = "[data-about-hero-title]";

const PRINT_OPACITY_KEYFRAMES = [
  { opacity: 0.4 },
  { opacity: 0.6 },
  { opacity: 0.8 },
  { opacity: 1 },
] as const;

let activeTimeline: gsap.core.Timeline | null = null;

export function isAboutRoute(pathname: string): boolean {
  return normalizeRoutePath(pathname) === "/about";
}

export function killAboutHeroEntryAnimation() {
  activeTimeline?.kill();
  activeTimeline = null;
  startScroll();
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

export function primeAboutHeroParticleState(pathname: string) {
  if (!isAboutRoute(pathname)) return;

  const heroEl = document.querySelector<HTMLElement>(ABOUT_HERO_SELECTOR);
  if (!heroEl) return;

  applyHeroGeometryState(heroEl);
  particleScrollState.dissolve = 1;
}

export async function runAboutHeroEntryAnimation({
  animateParticles = true,
}: { animateParticles?: boolean } = {}): Promise<void> {
  killAboutHeroEntryAnimation();

  const heroEl = document.querySelector<HTMLElement>(ABOUT_HERO_SELECTOR);
  if (!heroEl) return;

  applyHeroGeometryState(heroEl);
  // En <768px las partículas ADN quedan ocultas (dissolve=1): solo se revela el
  // título, sin animar la aparición ni reubicar el spawn del campo.
  particleScrollState.dissolve = 1;
  if (animateParticles) regenerateParticleSpawnLayout();

  const titleEl = heroEl.querySelector<HTMLElement>(ABOUT_HERO_TITLE_SELECTOR);
  let split: SplitText | null = null;

  revealPageContent();

  if (titleEl) {
    // El h1 arranca con `opacity-0` para evitar flash pre-hidratación,
    // pero para animar chars necesitamos que el contenedor sea visible.
    titleEl.classList.remove("opacity-0");
    gsap.set(titleEl, { opacity: 1 });

    split = new SplitText(titleEl, {
      type: "chars,words,lines",
      tag: "span",
    });
    gsap.set(split.chars, { opacity: 0 });
  }

  stopScroll();

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        titleEl?.classList.remove("opacity-0");
        split?.revert();
        activeTimeline = null;
        startScroll();
        resolve();
      },
    });

    activeTimeline = tl;

    if (animateParticles) {
      tl.to(
        particleScrollState,
        {
          dissolve: 0,
          duration: ABOUT_HERO_DISSOLVE_DURATION,
          ease: "none",
        },
        0,
      );
    }

    if (split) {
      tl.fromTo(
        split.chars,
        { opacity: 0 },
        {
          keyframes: [...PRINT_OPACITY_KEYFRAMES],
          stagger: 0.02,
          ease: "none",
          duration: 0.2,
        },
        0,
      );
    }
  });
}
