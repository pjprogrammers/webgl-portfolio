import { normalizeRoutePath } from "@/lib/webgl/particleRouteFeatures";

export type RigRouteFeatures = {
  /** Distorsión WebGL de `[data-type="image"]` (Selected Works en home). */
  imageDistortion: boolean;
  /** Overlay blanco animado en `[data-white-shader]` (About). */
  whiteShader: boolean;
};

const DEFAULT_FEATURES: RigRouteFeatures = {
  imageDistortion: false,
  whiteShader: false,
};

/** Rutas sin prefijo de locale (`/` = home). */
const ROUTE_RIG_FEATURES: Record<string, RigRouteFeatures> = {
  "/": { imageDistortion: true, whiteShader: false },
  "/about": { imageDistortion: false, whiteShader: true },
};

export function getRigRouteFeatures(pathname: string): RigRouteFeatures {
  const path = normalizeRoutePath(pathname);
  return ROUTE_RIG_FEATURES[path] ?? DEFAULT_FEATURES;
}

export function hasActiveRigFeatures(features: RigRouteFeatures): boolean {
  return features.imageDistortion || features.whiteShader;
}
