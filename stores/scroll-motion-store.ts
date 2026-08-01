import { create } from "zustand";
import type { ScrollMotionStore } from "./scroll-motion-store.types";

export const useScrollMotionStore = create<ScrollMotionStore>((set) => ({
  velocity: 0,
  setVelocity: (velocity) => set({ velocity }),
}));
