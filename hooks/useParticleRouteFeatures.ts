"use client";

import { useLayoutEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import {
  getParticleRouteFeatures,
  type ParticleRouteFeatures,
} from "@/lib/webgl/particleRouteFeatures";
import { useParticleFeaturesStore } from "@/stores/particle-features-store";

/** Flags de partículas WebGL según la ruta activa. */
export function useParticleRouteFeatures(): ParticleRouteFeatures {
  const pathname = usePathname();
  const features = useMemo(
    () => getParticleRouteFeatures(pathname),
    [pathname],
  );

  useLayoutEffect(() => {
    useParticleFeaturesStore.getState().syncFromPathname(pathname);
  }, [pathname]);

  return features;
}
