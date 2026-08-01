"use client";

import { useEffect, type RefObject } from "react";

import { gsap, SplitText } from "@/lib/gsap/registerPlugin";
import { useGlobalStore } from "@/stores/global-store";

const WORKS_HEADER_ENTRY_DELAY = 0.2;
const WORKS_HEADER_LINE_FROM = { yPercent: 320, rotate: 10 };

/**
 * Animación de entrada para los textos del header de Works (los marcados con
 * `data-works-line` / `data-works-block`). Replica el efecto `.js-s-lines`:
 * líneas enmascaradas que entran con stagger.
 *
 * - `data-works-line`: se parte en líneas (SplitText) y cada línea entra con
 *   yPercent + rotate.
 * - `data-works-block`: se anima como un bloque entero (sin SplitText, sin
 *   rotate) para no interferir con mediciones internas, p. ej. el contador.
 *   El elemento debe vivir dentro de un contenedor `overflow-hidden`.
 */
export function useWorksHeaderEntry(
  containerRef: RefObject<HTMLElement | null>,
): void {
  const fontsLoaded = useGlobalStore((state) => state.fontsLoaded);
  const isLoading = useGlobalStore((state) => state.isLoading);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    const container = containerRef.current;
    if (!container) return;

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const lines: Element[] = [];

      container
        .querySelectorAll<HTMLElement>("[data-works-line]")
        .forEach((el) => {
          const split = new SplitText(el, {
            type: "lines",
            mask: "lines",
            linesClass: "overflow-hidden",
            tag: "div",
          });
          splits.push(split);
          gsap.set(split.lines, WORKS_HEADER_LINE_FROM);
          lines.push(...split.lines);
        });

      const blocks = Array.from(
        container.querySelectorAll<HTMLElement>("[data-works-block]"),
      );
      gsap.set(blocks, { yPercent: 320 });

      gsap.set(container, { opacity: 1 });

      gsap.to([...lines, ...blocks], {
        yPercent: 0,
        rotate: 0,
        stagger: 0.07,
        duration: 0.4,
        ease: "power3.out",
        delay: WORKS_HEADER_ENTRY_DELAY,
      });
    }, container);

    return () => {
      splits.forEach((split) => split.revert());
      ctx.revert();
    };
  }, [fontsLoaded, isLoading, containerRef]);
}
