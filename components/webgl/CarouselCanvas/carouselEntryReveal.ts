import gsap from "gsap";
import type * as THREE from "three";

import { CAROUSEL_CONFIG } from "@/config/carousel.config";

type RevealSlot = {
  mesh: THREE.Mesh;
  uniforms: { uReveal: THREE.IUniform<number> };
};

/** Anillo de distancia (0 = centrada) usado para escalonar el stagger. */
function slotRing(slot: RevealSlot, stride: number): number {
  if (stride <= 0) return 0;
  return Math.round(Math.abs(slot.mesh.position.x) / stride);
}

/** Deja todas las cards ocultas (alpha 0) antes de animar la entrada. */
export function setCarouselEntryHidden(slots: RevealSlot[]): void {
  slots.forEach((slot) => {
    gsap.killTweensOf(slot.uniforms.uReveal);
    slot.uniforms.uReveal.value = 0;
  });
}

/**
 * Revela las cards con displacement + alpha 0→1, escalonado desde la card
 * centrada hacia los costados (los pares equidistantes aparecen juntos).
 */
export function runCarouselEntryReveal(
  slots: RevealSlot[],
  stride: number,
): void {
  slots.forEach((slot) => {
    const ring = slotRing(slot, stride);
    gsap.killTweensOf(slot.uniforms.uReveal);
    slot.uniforms.uReveal.value = 0;
    gsap.to(slot.uniforms.uReveal, {
      value: 1,
      duration: CAROUSEL_CONFIG.ENTRY_REVEAL_DURATION,
      ease: CAROUSEL_CONFIG.ENTRY_REVEAL_EASE,
      delay:
        CAROUSEL_CONFIG.ENTRY_REVEAL_DELAY +
        ring * CAROUSEL_CONFIG.ENTRY_REVEAL_STAGGER,
    });
  });
}
