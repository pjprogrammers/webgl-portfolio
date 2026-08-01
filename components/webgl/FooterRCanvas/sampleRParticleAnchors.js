import {
  FOOTER_R_CONTOUR_PARTICLE_RATIO,
  FOOTER_R_FACE_DEPTH,
} from "./footerRConfig.js";
import { sampleMeshSurface } from "./meshSurfaceSampling.js";
import { sampleRContourSurface } from "./sampleRContourSurface.js";

function shuffleInPlace(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

/**
 * Anclas de partículas para la R: borde (contorno) + relleno de la cara frontal con volumen en Z.
 */
export function sampleRParticleAnchors(geometry, count) {
  const contourRatio = Math.min(Math.max(FOOTER_R_CONTOUR_PARTICLE_RATIO, 0), 1);
  const contourCount = Math.round(count * contourRatio);
  const fillCount = Math.max(0, count - contourCount);

  const contourPoints = sampleRContourSurface(geometry, contourCount);
  const fillPoints =
    fillCount > 0 ? sampleMeshSurface(geometry, fillCount, 1) : [];

  for (const point of contourPoints) {
    point.z -= Math.random() * FOOTER_R_FACE_DEPTH * 0.12;
  }

  for (const point of fillPoints) {
    point.z -= Math.random() * FOOTER_R_FACE_DEPTH;
  }

  const points = [...contourPoints, ...fillPoints];
  shuffleInPlace(points);
  return points;
}
