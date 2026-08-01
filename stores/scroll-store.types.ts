import type Lenis from "lenis";

export type ScrollStore = {
  lenis: Lenis | null;
  enabled: boolean;
  setLenis: (instance: Lenis | null) => void;
  stopScroll: () => void;
  startScroll: () => void;
  setScrollEnabled: (enabled: boolean) => void;
};
