"use client";

import { useEffect } from "react";
import { CAROUSEL_CONFIG } from "@/config/carousel.config";
import { subscribeWheel } from "@/lib/input/globalWheelInput";

export interface CarouselClickCoords {
  clientX: number;
  clientY: number;
}

interface CarouselInputOptions {
  onVelocity: (v: number) => void;
  onValidClick: (coords: CarouselClickCoords) => void;
}

// Los listeners de click viven en `window` porque sobre el canvas hay overlays
// transparentes (info de works) que igual deben dejar pasar el click al slide.
// Pero overlays "reales" como el formulario de contacto deben bloquearlo: marcan
// su contenedor con [data-carousel-ignore] y aquí descartamos esos clicks.
function isCarouselIgnoredTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    ? target.closest("[data-carousel-ignore]") !== null
    : false;
}

export function useCarouselInput({
  onVelocity,
  onValidClick,
}: CarouselInputOptions) {
  useEffect(() => {
    const isTouchDevice = navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      let lastX = 0;
      let lastT = 0;
      let coastV = 0;
      let dragStartX = 0;
      let dragStartY = 0;
      let hasDragged = false;

      const onTouchStart = (e: TouchEvent) => {
        dragStartX = lastX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        lastT = performance.now();
        coastV = 0;
        hasDragged = false;
      };

      const touchVelocity = (deltaX: number, dt: number, speed: number) =>
        (deltaX / dt) * speed * 16 * CAROUSEL_CONFIG.TOUCH_DRAG_DIRECTION;

      const onTouchMove = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dt = Math.max(performance.now() - lastT, 1);
        coastV = touchVelocity(x - lastX, dt, CAROUSEL_CONFIG.TOUCH_DRAG_SPEED);
        lastX = x;
        lastT = performance.now();

        const dx = Math.abs(x - dragStartX);
        const dy = Math.abs(y - dragStartY);
        if (
          dx > CAROUSEL_CONFIG.CLICK_DRAG_THRESHOLD ||
          dy > CAROUSEL_CONFIG.CLICK_DRAG_THRESHOLD
        ) {
          hasDragged = true;
        }

        onVelocity(coastV);
      };

      const onTouchEnd = (e: TouchEvent) => {
        const momentumV =
          coastV *
          (CAROUSEL_CONFIG.TOUCH_MOMENTUM_SPEED /
            CAROUSEL_CONFIG.TOUCH_DRAG_SPEED);
        onVelocity(momentumV);
        if (
          !hasDragged &&
          e.changedTouches[0] &&
          !isCarouselIgnoredTarget(e.target)
        ) {
          const touch = e.changedTouches[0];
          onValidClick({ clientX: touch.clientX, clientY: touch.clientY });
        }
      };

      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd);

      return () => {
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
      };
    } else {
      let dragStartX = 0;
      let dragStartY = 0;
      let hasDragged = false;

      const onPointerDown = (e: PointerEvent) => {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        hasDragged = false;
      };

      const onPointerMove = (e: PointerEvent) => {
        const dx = Math.abs(e.clientX - dragStartX);
        const dy = Math.abs(e.clientY - dragStartY);
        if (
          dx > CAROUSEL_CONFIG.CLICK_DRAG_THRESHOLD ||
          dy > CAROUSEL_CONFIG.CLICK_DRAG_THRESHOLD
        ) {
          hasDragged = true;
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!hasDragged && !isCarouselIgnoredTarget(e.target)) {
          onValidClick({ clientX: e.clientX, clientY: e.clientY });
        }
      };

      const onWheel = (e: WheelEvent) => {
        if (isCarouselIgnoredTarget(e.target)) return;
        const delta =
          Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        onVelocity(-delta * CAROUSEL_CONFIG.SCROLL_SPEED);
      };

      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      const unsubscribeWheel = subscribeWheel(onWheel);

      return () => {
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        unsubscribeWheel();
      };
    }
  }, [onVelocity, onValidClick]);
}
