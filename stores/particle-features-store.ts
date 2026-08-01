import { create } from "zustand";

import { getParticleRouteFeatures } from "@/lib/webgl/particleRouteFeatures";
import type { ParticleFeaturesStore } from "./particle-features-store.types";

export const useParticleFeaturesStore = create<ParticleFeaturesStore>((set, get) => ({
  geometryParticles: false,
  footerRParticles: false,
  syncFromPathname: (pathname) => {
    const next = getParticleRouteFeatures(pathname);
    const current = get();

    if (
      current.geometryParticles === next.geometryParticles &&
      current.footerRParticles === next.footerRParticles
    ) {
      return;
    }

    set(next);
  },
}));
