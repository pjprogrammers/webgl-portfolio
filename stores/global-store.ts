import { create } from "zustand";
import type { GlobalStore } from "./global-store.types";

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  fontsLoaded: false,
  setFontsLoaded: (value: boolean) => set({ fontsLoaded: value }),

  canScroll: true,
  setCanScroll: (value: boolean) => set({ canScroll: value }),

  isLoading: true,
  setIsLoading: (value: boolean) => set({ isLoading: value }),

  showContactForm: false,
  setShowContactForm: (value: boolean) => set({ showContactForm: value }),
  closeContactFormIfOpen: () => {
    if (get().showContactForm) set({ showContactForm: false });
  },
}));
