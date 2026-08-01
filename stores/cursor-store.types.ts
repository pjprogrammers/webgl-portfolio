import type * as THREE from "three";

export type SceneUniforms = {
  uTime: { value: number };
  uTrailTexture: { value: THREE.DataTexture };
  uTrailCount: { value: number };
  uViewport: { value: [number, number] };
  uDistortRadiusPx: { value: number };
  uDistortStrength: { value: number };
  uDistortFalloffPower: { value: number };
};

export type ScrollUniforms = {
  uScrollVelocity: { value: number };
  uScrollCurvature: { value: number };
  uScrollWave: { value: number };
};

export type CursorVisualType =
  | "default"
  | "hover"
  | "text"
  | "drag"
  | "hide"
  | "simple-hover";

export type CursorState = {
  normalized: { x: number; y: number };
  pixel: { x: number; y: number };
  strength: number;
  active: boolean;
  type: CursorVisualType;
  setCursor: (
    pixel: { x: number; y: number },
    viewport: { width: number; height: number },
  ) => void;
  setActive: (active: boolean) => void;
  setStrength: (strength: number) => void;
  setType: (type: CursorVisualType) => void;
};
