"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { bp, minWidth } from "@/lib/hooks/useMediaQuery";

import {
  queryDissolveElements,
  readDissolveScrollFromElement,
  readGeometryDissolveInScroll,
} from "@/components/webgl/FooterRCanvas/particleDissolveScrollFromDataset.js";
import {
  copyGeometryVec3,
  geometryVec3Equal,
} from "@/components/webgl/FooterRCanvas/geometryTransformFromDataset.js";
import {
  geometryMorphTargetValue,
  getOrderedGeometryMorphElements,
  hasValidGeometryDataset,
  readGeometryScrollFromElement,
} from "@/components/webgl/FooterRCanvas/particleGeometryScrollFromDataset.js";
import {
  GEOMETRY_SCROLL_ROTATION_Y_START,
  setupGeometryScrollRotationTrigger,
} from "@/components/webgl/FooterRCanvas/geometryScrollRotation.js";
import { particleScrollState } from "@/components/webgl/FooterRCanvas/particleScrollState.js";
import { reinitializeParticleFieldForRoute } from "@/components/webgl/FooterRCanvas/particleFieldRegistry.js";
import { gsap, ScrollTrigger } from "@/lib/gsap/registerPlugin";
import { resetScrollToTop } from "@/lib/scroll/resetScrollToTop";
import {
  isAboutRoute,
  killAboutHeroEntryAnimation,
  primeAboutHeroParticleState,
  runAboutHeroEntryAnimation,
} from "@/lib/webgl/aboutHeroEntry";
import {
  isHomeRoute,
  killHomeHeroEntryAnimation,
  primeHomeHeroParticleState,
  runHomeHeroEntryAnimation,
} from "@/lib/webgl/homeHeroEntry";
import {
  animateDissolveIn,
  hasClientNavigatedOnce,
  killParticleTransitionTweens,
  resetPageExitTransition,
  shouldRunEntryDissolve,
} from "@/lib/webgl/particlePageTransition";
import {
  preparePageContentForEntry,
  revealPageContent,
} from "@/lib/webgl/pageExitFade";
import { useGlobalStore } from "@/stores/global-store";
import { useParticleRouteFeatures } from "@/hooks/useParticleRouteFeatures";

function resetParticleScrollState() {
  const elements = getOrderedGeometryMorphElements();

  if (elements.length > 0) {
    const firstScroll = readGeometryScrollFromElement(elements[0]);
    particleScrollState.shapeTarget = firstScroll.target;
    particleScrollState.shapeMorph = geometryMorphTargetValue(
      firstScroll.target,
    );
    particleScrollState.shapeMorphUseFlight = firstScroll.entryAnimation;
    copyGeometryVec3(
      particleScrollState.geometryScale,
      firstScroll.geometryScale,
    );
    copyGeometryVec3(
      particleScrollState.geometryPosition,
      firstScroll.geometryPosition,
    );
    copyGeometryVec3(
      particleScrollState.geometryRotation,
      firstScroll.geometryRotation,
    );
  } else {
    particleScrollState.shapeTarget = "star";
    particleScrollState.shapeMorph = 0;
    copyGeometryVec3(particleScrollState.geometryScale, { x: 1, y: 1, z: 1 });
    copyGeometryVec3(particleScrollState.geometryPosition, {
      x: 0,
      y: 0,
      z: 0,
    });
    copyGeometryVec3(particleScrollState.geometryRotation, {
      x: 0,
      y: 0,
      z: 0,
    });
    particleScrollState.shapeMorphUseFlight = true;
  }

  particleScrollState.geometryScrollRotationY =
    GEOMETRY_SCROLL_ROTATION_Y_START;
  particleScrollState.dissolve = 0;
  particleScrollState.rFormation = 0;
  particleScrollState.pageDissolveOut = false;
}

function setupGeometryMorphScrollTriggers() {
  const elements = getOrderedGeometryMorphElements();
  if (elements.length === 0) return;

  const firstScroll = readGeometryScrollFromElement(elements[0]);
  particleScrollState.shapeTarget = firstScroll.target;
  particleScrollState.shapeMorph = geometryMorphTargetValue(firstScroll.target);
  particleScrollState.shapeMorphUseFlight = firstScroll.entryAnimation;
  copyGeometryVec3(
    particleScrollState.geometryScale,
    firstScroll.geometryScale,
  );
  copyGeometryVec3(
    particleScrollState.geometryPosition,
    firstScroll.geometryPosition,
  );
  copyGeometryVec3(
    particleScrollState.geometryRotation,
    firstScroll.geometryRotation,
  );

  if (elements.length < 2) return;

  for (let i = 0; i < elements.length - 1; i++) {
    const fromEl = elements[i];
    const toEl = elements[i + 1];
    const fromScroll = readGeometryScrollFromElement(fromEl);
    const toScroll = readGeometryScrollFromElement(toEl);
    const fromMorph = geometryMorphTargetValue(fromScroll.target);
    const toMorph = geometryMorphTargetValue(toScroll.target);

    const sameTransform =
      fromMorph === toMorph &&
      geometryVec3Equal(fromScroll.geometryScale, toScroll.geometryScale) &&
      geometryVec3Equal(
        fromScroll.geometryPosition,
        toScroll.geometryPosition,
      ) &&
      geometryVec3Equal(fromScroll.geometryRotation, toScroll.geometryRotation);

    if (sameTransform) continue;

    const useFlight = toScroll.entryAnimation;

    gsap.fromTo(
      particleScrollState,
      {
        shapeMorph: fromMorph,
        shapeMorphUseFlight: useFlight,
        "geometryScale.x": fromScroll.geometryScale.x,
        "geometryScale.y": fromScroll.geometryScale.y,
        "geometryScale.z": fromScroll.geometryScale.z,
        "geometryPosition.x": fromScroll.geometryPosition.x,
        "geometryPosition.y": fromScroll.geometryPosition.y,
        "geometryPosition.z": fromScroll.geometryPosition.z,
        "geometryRotation.x": fromScroll.geometryRotation.x,
        "geometryRotation.y": fromScroll.geometryRotation.y,
        "geometryRotation.z": fromScroll.geometryRotation.z,
      },
      {
        shapeMorph: toMorph,
        shapeMorphUseFlight: useFlight,
        "geometryScale.x": toScroll.geometryScale.x,
        "geometryScale.y": toScroll.geometryScale.y,
        "geometryScale.z": toScroll.geometryScale.z,
        "geometryPosition.x": toScroll.geometryPosition.x,
        "geometryPosition.y": toScroll.geometryPosition.y,
        "geometryPosition.z": toScroll.geometryPosition.z,
        "geometryRotation.x": toScroll.geometryRotation.x,
        "geometryRotation.y": toScroll.geometryRotation.y,
        "geometryRotation.z": toScroll.geometryRotation.z,
        ease: "none",
        scrollTrigger: {
          trigger: toEl,
          start: toScroll.start,
          end: toScroll.end,
          scrub: toScroll.scrub,
          markers: toScroll.markers,
          invalidateOnRefresh: true,
        },
      },
    );
  }
}

function geometryScrollStateProps(
  geoScroll: ReturnType<typeof readGeometryScrollFromElement>,
) {
  return {
    shapeTarget: geoScroll.target,
    shapeMorph: geometryMorphTargetValue(geoScroll.target),
    shapeMorphUseFlight: geoScroll.entryAnimation,
    "geometryScale.x": geoScroll.geometryScale.x,
    "geometryScale.y": geoScroll.geometryScale.y,
    "geometryScale.z": geoScroll.geometryScale.z,
    "geometryPosition.x": geoScroll.geometryPosition.x,
    "geometryPosition.y": geoScroll.geometryPosition.y,
    "geometryPosition.z": geoScroll.geometryPosition.z,
    "geometryRotation.x": geoScroll.geometryRotation.x,
    "geometryRotation.y": geoScroll.geometryRotation.y,
    "geometryRotation.z": geoScroll.geometryRotation.z,
  };
}

function setupDissolveScrollTriggers({
  footerRParticles,
  geometryParticles,
}: {
  footerRParticles: boolean;
  geometryParticles: boolean;
}) {
  if (geometryParticles) {
    for (const el of queryDissolveElements("out")) {
      const scroll = readDissolveScrollFromElement(el, "out");

      gsap.fromTo(
        particleScrollState,
        { dissolve: 0 },
        {
          dissolve: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: scroll.start,
            end: scroll.end,
            scrub: scroll.scrub,
            markers: scroll.markers,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    for (const el of queryDissolveElements("in")) {
      if (!hasValidGeometryDataset(el)) continue;

      const scroll = readGeometryDissolveInScroll(el);
      const geoScroll = readGeometryScrollFromElement(el);
      const geometryProps = geometryScrollStateProps(geoScroll);

      gsap.fromTo(
        particleScrollState,
        { dissolve: 1, ...geometryProps },
        {
          dissolve: 0,
          ...geometryProps,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: scroll.start,
            end: scroll.end,
            scrub: scroll.scrub,
            markers: scroll.markers,
            invalidateOnRefresh: true,
          },
        },
      );
    }
  }

  if (footerRParticles) {
    for (const el of queryDissolveElements("in")) {
      if (hasValidGeometryDataset(el)) continue;

      const scroll = readDissolveScrollFromElement(el, "in");

      gsap.fromTo(
        particleScrollState,
        { rFormation: 0 },
        {
          rFormation: 1,
          // Process/Resume dejan dissolve=1; hay que revertirlo mientras forma la R.
          dissolve: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: scroll.start,
            end: scroll.end,
            scrub: scroll.scrub,
            markers: scroll.markers,
            invalidateOnRefresh: true,
          },
        },
      );
    }
  }
}

function setupParticleScrollTriggers({
  footerRParticles,
  geometryParticles,
}: {
  footerRParticles: boolean;
  geometryParticles: boolean;
}) {
  const ctx = gsap.context(() => {
    if (geometryParticles) {
      setupGeometryMorphScrollTriggers();
      setupGeometryScrollRotationTrigger();
    }

    if (geometryParticles || footerRParticles) {
      setupDissolveScrollTriggers({ footerRParticles, geometryParticles });
    }
  });

  ScrollTrigger.refresh();
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return ctx;
}

export function useParticleScrollAnimation() {
  const fontsLoaded = useGlobalStore((state) => state.fontsLoaded);
  const isLoading = useGlobalStore((state) => state.isLoading);
  const pathname = usePathname();
  const { geometryParticles, footerRParticles } = useParticleRouteFeatures();
  const scrollCtxRef = useRef<gsap.Context | null>(null);
  const aboutRoute = isAboutRoute(pathname);
  const homeRoute = isHomeRoute(pathname);

  // El hero de about monta el morph ADN solo en ≥768px (tablet-portrait). En
  // <768px desactivamos la geometría (sin morph ni dissolve de aparición), pero
  // mantenemos el campo de partículas para que la R del footer siga formándose.
  const [adnGeometryAllowed, setAdnGeometryAllowed] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(minWidth(bp.tabletPortrait)).matches
      : true,
  );

  useEffect(() => {
    const mql = window.matchMedia(minWidth(bp.tabletPortrait));
    const update = () => setAdnGeometryAllowed(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const geometryEnabled =
    geometryParticles && (!aboutRoute || adnGeometryAllowed);

  // Antes del paint de la ruta entrante: mantener el contenido oculto tras el
  // fade de salida hasta que la animación de entrada lo revele.
  useLayoutEffect(() => {
    preparePageContentForEntry(hasClientNavigatedOnce());
  }, [pathname]);

  useLayoutEffect(() => {
    if (isLoading) return;
    resetScrollToTop();
  }, [pathname, isLoading]);

  useLayoutEffect(() => {
    if (!fontsLoaded || !geometryParticles) return;

    if (aboutRoute) primeAboutHeroParticleState(pathname);
    if (homeRoute) primeHomeHeroParticleState(pathname);
  }, [fontsLoaded, pathname, aboutRoute, homeRoute, geometryParticles]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    let cancelled = false;

    async function initRouteParticles() {
      resetParticleScrollState();

      if (aboutRoute && geometryParticles)
        primeAboutHeroParticleState(pathname);
      if (homeRoute && geometryParticles) primeHomeHeroParticleState(pathname);

      reinitializeParticleFieldForRoute();

      scrollCtxRef.current?.revert();
      scrollCtxRef.current = null;

      if (!geometryParticles && !footerRParticles) {
        if (hasClientNavigatedOnce()) revealPageContent();
        return;
      }

      if (aboutRoute && geometryParticles) {
        await runAboutHeroEntryAnimation({ animateParticles: geometryEnabled });
        if (cancelled) return;
      } else if (homeRoute && geometryParticles) {
        await runHomeHeroEntryAnimation();
        if (cancelled) return;
      } else if (shouldRunEntryDissolve(geometryEnabled)) {
        await animateDissolveIn();
        if (cancelled) return;
      } else if (hasClientNavigatedOnce()) {
        revealPageContent();
      }

      scrollCtxRef.current = setupParticleScrollTriggers({
        footerRParticles,
        geometryParticles: geometryEnabled,
      });
    }

    void initRouteParticles();

    return () => {
      cancelled = true;
      resetPageExitTransition();
      killParticleTransitionTweens();
      killAboutHeroEntryAnimation();
      killHomeHeroEntryAnimation();
      scrollCtxRef.current?.revert();
      scrollCtxRef.current = null;
      resetParticleScrollState();
    };
  }, [
    fontsLoaded,
    isLoading,
    pathname,
    geometryParticles,
    geometryEnabled,
    footerRParticles,
    aboutRoute,
    homeRoute,
  ]);
}
