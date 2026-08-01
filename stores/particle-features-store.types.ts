import type { ParticleRouteFeatures } from "@/lib/webgl/particleRouteFeatures";

export type ParticleFeaturesStore = ParticleRouteFeatures & {
  syncFromPathname: (pathname: string) => void;
};
