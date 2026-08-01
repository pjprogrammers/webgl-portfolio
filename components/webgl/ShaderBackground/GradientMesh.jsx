"use client";

import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

import fragmentShader from "./gradient/fragmentShader.js";
import vertexShader from "./gradient/vertexShader.js";
import { colorUniform, weightUniforms } from "./uniforms.js";

const GradientMesh = forwardRef(function GradientMesh(
  {
    ww,
    wh,
    color1,
    color2,
    colorWeights,
    blobRandomness,
    blobDisplacement,
    blobMorphSpeed,
    colorBlend,
    uniformsRef,
  },
  ref,
) {
  const materialRef = useRef(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
        3,
      ),
    );
    geo.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
    );
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_color1: colorUniform(color1),
      u_color2: colorUniform(color2),
      ...weightUniforms(colorWeights),
      u_blobRandomness: { value: blobRandomness },
      u_blobDisplacement: { value: blobDisplacement },
      u_blobMorphSpeed: { value: blobMorphSpeed },
      u_colorBlend: { value: colorBlend },
    }),
    [color1, color2, colorWeights, blobRandomness, blobDisplacement, blobMorphSpeed, colorBlend],
  );

  useImperativeHandle(ref, () => ({
    get uniforms() {
      return materialRef.current?.uniforms;
    },
  }));

  useLayoutEffect(() => {
    if (!uniformsRef) return;
    uniformsRef.current = materialRef.current?.uniforms ?? null;
    return () => {
      uniformsRef.current = null;
    };
  }, [uniforms, uniformsRef]);

  return (
    <mesh geometry={geometry} scale={[ww / 2, wh / 2, 1]} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
});

export default GradientMesh;
