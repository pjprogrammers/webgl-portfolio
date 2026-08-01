"use client";

import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh, ShaderMaterial } from "three";

import {
  mergeVisibleWhiteShaderBands,
  queryWhiteShaderElements,
} from "./whiteShaderScrollFromDataset.js";
import { WhiteShaderMaterial } from "./whiteShaderMaterial";

extend({ WhiteShaderMaterial });

const MAX_BANDS = 3;

function applyBandsToMaterial(
  material: ShaderMaterial & Record<string, unknown>,
  size: { width: number; height: number },
) {
  const elements = queryWhiteShaderElements();
  const bands = mergeVisibleWhiteShaderBands(elements, size.height);

  material.uResolution = [size.width, size.height];
  material.uAlpha = bands.length > 0 ? 1.0 : 0.0;
  material.uBandCount = bands.length;

  for (let i = 0; i < MAX_BANDS; i++) {
    const band = bands[i];
    material[`uBand${i}`] = band
      ? [band.top, band.bottom, band.softTop ? 1 : 0, band.softBottom ? 1 : 0]
      : [0, 0, 0, 0];
  }
}

export function FixedViewportPlane() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { size } = useThree();

  useFrame(() => {
    const mesh = meshRef.current;
    const material = materialRef.current as
      | (ShaderMaterial & Record<string, unknown>)
      | null;
    if (!mesh || !material) return;

    mesh.position.set(0, 0, -1);
    mesh.scale.set(size.width, size.height, 1);
    applyBandsToMaterial(material, size);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error R3F extended material */}
      <whiteShaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uAlpha={0}
        uResolution={[size.width, size.height]}
        uBandCount={0}
        uBand0={[0, 0, 0, 0]}
        uBand1={[0, 0, 0, 0]}
        uBand2={[0, 0, 0, 0]}
        uNoiseScale={2.8}
        uNoiseStrength={0.11}
        uEdgeFeather={0.045}
        attach="material"
      />
    </mesh>
  );
}
