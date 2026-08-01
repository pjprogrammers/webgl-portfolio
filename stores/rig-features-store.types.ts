import type { RigRouteFeatures } from "@/lib/webgl/rigRouteFeatures";

export type RigFeaturesStore = RigRouteFeatures & {
  syncFromPathname: (pathname: string) => void;
};
