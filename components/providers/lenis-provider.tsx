"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { connectScrollTrigger } from "@/lib/gsap/connectScrollTrigger";
import { resetScrollToTop } from "@/lib/scroll/resetScrollToTop";
import { registerTickerCallback } from "@/lib/ticker";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";
import { useScrollMotionStore } from "@/stores/scroll-motion-store";
import { useUiStore } from "@/stores/ui-store";

type LenisProviderProps = {
  children: React.ReactNode;
};

export function LenisProvider({ children }: LenisProviderProps) {
  const setLenis = useScrollStore((state) => state.setLenis);
  const setVelocity = useScrollMotionStore((state) => state.setVelocity);
  const menuOpen = useUiStore((state) => state.menuOpen);
  const isLoading = useGlobalStore((state) => state.isLoading);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
    });

    lenis.on("scroll", ({ velocity, direction }) => {
      setVelocity(velocity * direction);

      if (Math.abs(velocity) > 0.01) {
        useGlobalStore.getState().closeContactFormIfOpen();
      }
    });

    const unregisterTicker = registerTickerCallback(({ timeMs }) => {
      lenis.raf(timeMs);
    });

    lenisRef.current = lenis;
    setLenis(lenis);
    resetScrollToTop();

    if (useGlobalStore.getState().isLoading) {
      lenis.stop();
    }

    const disconnectScrollTrigger = connectScrollTrigger(lenis);

    return () => {
      disconnectScrollTrigger();
      unregisterTicker();
      lenis.destroy();
      setLenis(null);
      lenisRef.current = null;
      setVelocity(0);
    };
  }, [setLenis, setVelocity]);

  useEffect(() => {
    if (!lenisRef.current) return;

    const { enabled } = useScrollStore.getState();
    const shouldAllowScroll = enabled && !menuOpen && !isLoading;

    if (shouldAllowScroll) lenisRef.current.start();
    else lenisRef.current.stop();
  }, [menuOpen, isLoading]);

  return children;
}
