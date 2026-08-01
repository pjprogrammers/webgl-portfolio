"use client";

import { useEffect, type RefObject } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap/registerPlugin";

// La imagen se renderiza a scale 1.2 dentro de un contenedor con overflow-hidden,
// dejando un 10% de margen oculto arriba y abajo. Movemos el yPercent dentro de
// ese margen para generar el parallax sin descubrir bordes vacíos.
const PARALLAX_SCALE = 1.2;
const PARALLAX_SHIFT = 14;

/**
 * Parallax por scroll para las imágenes estáticas de Selected Works en
 * tablet/mobile (≤1024px), donde no corre la distorsión WebGL.
 */
export function useWorkImageParallax(
  imageRefs: RefObject<(HTMLElement | null)[]>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const els = imageRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;

    const tweens = els.map((el) =>
      gsap.fromTo(
        el,
        { yPercent: -PARALLAX_SHIFT, scale: PARALLAX_SCALE },
        {
          yPercent: PARALLAX_SHIFT,
          scale: PARALLAX_SCALE,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      ),
    );

    ScrollTrigger.refresh();

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, [imageRefs, enabled]);
}
