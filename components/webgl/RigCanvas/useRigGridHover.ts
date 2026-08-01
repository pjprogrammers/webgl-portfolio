"use client";

import { useEffect, type RefObject } from "react";
import { useCursorStore } from "@/stores/cursor-store";
import {
  clearGridMouseVelocity,
  createGridMouseState,
  stepGridDistortion,
  updateGridMouseFromUv,
  type GridMouseState,
} from "@/components/webgl/CarouselCanvas/carouselGridDistortion";
import type { DataTexture } from "three";

export interface RigGridSlot {
  element: HTMLElement;
  dataTexture: DataTexture;
  mouseState: GridMouseState;
}

export function createRigGridSlots(
  elements: HTMLElement[],
  dataTextures: DataTexture[],
): RigGridSlot[] {
  return elements.map((element, index) => ({
    element,
    dataTexture: dataTextures[index],
    mouseState: createGridMouseState(),
  }));
}

export function useRigGridHover(slotsRef: RefObject<RigGridSlot[]>) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const slots = slotsRef.current;
      if (!slots?.length) return;

      let hovered = false;

      slots.forEach((slot) => {
        clearGridMouseVelocity(slot.mouseState);

        const rect = slot.element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;

        if (x < 0 || x > 1 || y < 0 || y > 1) return;

        hovered = true;
        updateGridMouseFromUv(slot.mouseState, x, y);
      });

      const setCursorType = useCursorStore.getState().setType;
      if (hovered) {
        setCursorType("hover");
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target?.closest("[data-event]")) {
        setCursorType("default");
      }
    };

    const onMouseLeave = () => {
      useCursorStore.getState().setType("default");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [slotsRef]);
}

export function stepRigGridHover(slots: RigGridSlot[]) {
  slots.forEach((slot) => {
    stepGridDistortion(slot.dataTexture, slot.mouseState);
  });
}
