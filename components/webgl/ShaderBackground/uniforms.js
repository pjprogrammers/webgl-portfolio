import * as THREE from "three";

export function colorUniform(hex) {
  return { value: new THREE.Color(hex) };
}

/** @param {number[] | undefined} weights — two percentages (color1…color2) */
export function weightUniforms(weights) {
  const defaults = [35, 65];
  const w = weights?.length === 2 ? weights : defaults;
  return {
    u_weight1: { value: w[0] },
    u_weight2: { value: w[1] },
  };
}
