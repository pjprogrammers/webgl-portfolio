"use client";

import { useLayoutEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import {
  getRigRouteFeatures,
  type RigRouteFeatures,
} from "@/lib/webgl/rigRouteFeatures";
import { useRigFeaturesStore } from "@/stores/rig-features-store";

/** Flags de RigCanvas según la ruta activa. */
export function useRigRouteFeatures(): RigRouteFeatures {
  const pathname = usePathname();
  const features = useMemo(
    () => getRigRouteFeatures(pathname),
    [pathname],
  );

  useLayoutEffect(() => {
    useRigFeaturesStore.getState().syncFromPathname(pathname);
  }, [pathname]);

  return features;
}
