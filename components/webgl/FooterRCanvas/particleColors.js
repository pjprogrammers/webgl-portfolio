import * as THREE from "three";

import { GLOBAL_PARTICLE_COLORS } from "./footerRConfig.js";

const FALLBACK_COLOR = { hex: "#ffffff", percent: 100 };

/** @param {{ hex: string, percent: number }[]} entries */
function normalizePalette(entries) {
  const source = entries?.length ? entries : [FALLBACK_COLOR];
  const total = source.reduce(
    (sum, entry) => sum + Math.max(0, entry.percent),
    0,
  );

  if (total <= 0) {
    const color = new THREE.Color(FALLBACK_COLOR.hex);
    return [{ r: color.r, g: color.g, b: color.b, weight: 1 }];
  }

  const color = new THREE.Color();
  return source.map((entry) => {
    color.set(entry.hex);
    return {
      r: color.r,
      g: color.g,
      b: color.b,
      weight: Math.max(0, entry.percent) / total,
    };
  });
}

/** Reparte exactamente `count` partículas según los pesos de la paleta y las mezcla al azar. */
function buildColorIndices(count, palette) {
  const indices = [];

  for (let colorIndex = 0; colorIndex < palette.length; colorIndex++) {
    const amount = Math.round(palette[colorIndex].weight * count);
    for (let i = 0; i < amount; i++) indices.push(colorIndex);
  }

  while (indices.length < count) {
    indices.push(palette.length - 1);
  }
  while (indices.length > count) {
    indices.pop();
  }

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

/**
 * @param {number} count
 * @param {{ hex: string, percent: number }[] | undefined} entries
 * @returns {Float32Array}
 */
export function buildParticleColorBuffer(
  count,
  entries = GLOBAL_PARTICLE_COLORS,
) {
  const palette = normalizePalette(entries);
  const indices = buildColorIndices(count, palette);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const { r, g, b } = palette[indices[i]];
    const i3 = i * 3;
    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
  }

  return colors;
}
