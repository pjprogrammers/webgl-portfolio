import { create } from "zustand";
import type { UiStore } from "./ui-store.types";

export const useUiStore = create<UiStore>((set, get) => ({
  menuOpen: false,
  setMenuOpen: (open) => set({ menuOpen: open }),
  toggleMenu: () => set({ menuOpen: !get().menuOpen }),
}));
