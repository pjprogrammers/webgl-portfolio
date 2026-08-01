import { create } from "zustand";
import { lockNativeScroll, unlockNativeScroll } from "@/lib/scroll/nativeScrollLock";
import type { ScrollStore } from "./scroll-store.types";

export const useScrollStore = create<ScrollStore>((set, get) => ({
  lenis: null,
  enabled: true,
  setLenis: (instance) => set({ lenis: instance }),
  stopScroll: () => {
    get().lenis?.stop();
    lockNativeScroll();
    set({ enabled: false });
  },
  startScroll: () => {
    unlockNativeScroll();
    get().lenis?.start();
    set({ enabled: true });
  },
  setScrollEnabled: (enabled) => {
    if (enabled) {
      unlockNativeScroll();
      get().lenis?.start();
    } else {
      get().lenis?.stop();
      lockNativeScroll();
    }
    set({ enabled });
  },
}));
