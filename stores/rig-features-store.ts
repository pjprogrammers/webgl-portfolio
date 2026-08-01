import { create } from "zustand";

import { getRigRouteFeatures } from "@/lib/webgl/rigRouteFeatures";
import type { RigFeaturesStore } from "./rig-features-store.types";

export const useRigFeaturesStore = create<RigFeaturesStore>((set, get) => ({
  imageDistortion: false,
  whiteShader: false,
  syncFromPathname: (pathname) => {
    const next = getRigRouteFeatures(pathname);
    const current = get();

    if (
      current.imageDistortion === next.imageDistortion &&
      current.whiteShader === next.whiteShader
    ) {
      return;
    }

    set(next);
  },
}));
