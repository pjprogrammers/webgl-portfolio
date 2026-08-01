import { ScrollTrigger } from "@/lib/gsap/registerPlugin";
import { useScrollMotionStore } from "@/stores/scroll-motion-store";
import { useScrollStore } from "@/stores/scroll-store";

/** Lleva el scroll a 0 de forma inmediata (Lenis + DOM nativo + ScrollTrigger). */
export function resetScrollToTop() {
  useScrollMotionStore.getState().setVelocity(0);

  const lenis = useScrollStore.getState().lenis;
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  ScrollTrigger.update();
}
