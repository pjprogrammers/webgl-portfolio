"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  queryWhiteShaderElements,
  readWhiteShaderScrollFromElement,
} from "@/components/webgl/RigCanvas/whiteShaderScrollFromDataset.js";
import { resetWhiteShaderScrollState } from "@/components/webgl/RigCanvas/whiteShaderScrollState.js";
import { gsap, ScrollTrigger } from "@/lib/gsap/registerPlugin";
import { useGlobalStore } from "@/stores/global-store";

export function useWhiteShaderScroll(enabled: boolean) {
  const fontsLoaded = useGlobalStore((state) => state.fontsLoaded);
  const pathname = usePathname();
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!enabled || !fontsLoaded) return;

    resetWhiteShaderScrollState();
    elementsRef.current = queryWhiteShaderElements();

    const ctx = gsap.context(() => {
      for (const el of elementsRef.current) {
        const scroll = readWhiteShaderScrollFromElement(el);

        ScrollTrigger.create({
          trigger: el,
          start: scroll.start,
          end: scroll.end,
          scrub: scroll.scrub,
          markers: scroll.markers,
          invalidateOnRefresh: true,
        });
      }
    });

    ScrollTrigger.refresh();

    return () => {
      resetWhiteShaderScrollState();
      ctx.revert();
    };
  }, [enabled, fontsLoaded, pathname]);
}
