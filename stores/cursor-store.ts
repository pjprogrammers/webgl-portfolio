import { create } from "zustand";
import type { CursorState } from "./cursor-store.types";

export const useCursorStore = create<CursorState>((set) => ({
  normalized: { x: 0.5, y: 0.5 },
  pixel: { x: 0, y: 0 },
  strength: 0,
  active: false,
  type: "default",
  setCursor: (pixel, viewport) =>
    set({
      pixel,
      normalized: {
        x: pixel.x / viewport.width,
        y: 1 - pixel.y / viewport.height,
      },
    }),
  setActive: (active) => set({ active }),
  setStrength: (strength) => set({ strength }),
  setType: (type) => set({ type }),
}));
