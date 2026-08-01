"use client";

import { useLayoutEffect, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { initScrollRestoration } from "@/lib/scroll/initScrollRestoration";
import { resetScrollToTop } from "@/lib/scroll/resetScrollToTop";
import { markClientNavigation } from "@/lib/webgl/particlePageTransition";

/**
 * Garantiza scroll en 0 en cada carga y navegación.
 * Debe montarse antes que hooks que crean ScrollTriggers en navegación,
 * para que el scroll esté en 0 cuando se inicialicen las animaciones.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    initScrollRestoration();
    resetScrollToTop();
  }, []);

  useLayoutEffect(() => {
    resetScrollToTop();
  }, [pathname]);

  useEffect(() => {
    initScrollRestoration();

    const onPopState = () => {
      markClientNavigation();
      resetScrollToTop();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      resetScrollToTop();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
