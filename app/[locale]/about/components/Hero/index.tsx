"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { bp, minWidth } from "@/lib/hooks/useMediaQuery";

/** El morph de partículas ADN solo se monta en ≥768px (tablet-portrait). */
const ADN_GEOMETRY_QUERY = minWidth(bp.tabletPortrait);

const Hero = () => {
  const t = useTranslations("about.hero");
  // Arranca en `true` para que SSR + hidratación coincidan; en <768px el efecto
  // lo corrige a `false` y React quita los atributos, dejando que el campo de
  // partículas resuelva la forma como "star" (sin computar la geometría ADN).
  const [showAdnGeometry, setShowAdnGeometry] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(ADN_GEOMETRY_QUERY);
    const update = () => setShowAdnGeometry(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return (
    <section
      data-about-hero
      data-geometry-scroll-rotation-end-degrees={-720}
      data-geometry={showAdnGeometry ? "adn" : undefined}
      data-geometry-scale={showAdnGeometry ? [1.5, 1.5, 1.5] : undefined}
      data-geometry-position={showAdnGeometry ? [0.6, 0, 0] : undefined}
      data-geometry-entry-animation={showAdnGeometry ? false : undefined}
      className="mt-navbar-height relative isolate z-10 pt-4 px-8 pb-8 mobile-landscape:px-12 mobile-landscape:pb-12 tablet-portrait:px-20 tablet-portrait:pb-20 desktop:px-24 desktop:pb-20 desktop-lg:px-30 desktop-lg:pb-30 min-h-hero-screen-height flex flex-col justify-end"
    >
      <h1
        data-about-hero-title
        className="relative z-1 heading-1 leading-[1em]! font-instrument-serif max-w-190 opacity-0"
      >
        {t("title")}
      </h1>
    </section>
  );
};

export default Hero;
