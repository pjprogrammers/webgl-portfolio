import {
  FOOTER_R_FORM_STAGGER,
  PARTICLE_DISSOLVE_STAGGER,
} from "./footerRConfig.js";

function centerDistance3(x, y, z) {
  return Math.hypot(x, y, z);
}

/**
 * Delays radiales desde (0, 0, 0):
 * - dissolve out: bordes primero (delay bajo lejos del centro)
 * - dissolve in: centro primero (delay bajo cerca del centro)
 */
export function assignRadialDissolveDelays(particles) {
  let maxShapeDist = 1e-8;
  let maxAnchorDist = 1e-8;

  for (const p of particles) {
    p.shapeDist = centerDistance3(p.shapeX, p.shapeY, p.shapeZ);
    p.anchorDist = centerDistance3(p.anchorX, p.anchorY, p.anchorZ);
    maxShapeDist = Math.max(maxShapeDist, p.shapeDist);
    maxAnchorDist = Math.max(maxAnchorDist, p.anchorDist);
  }

  for (const p of particles) {
    const shapeNorm = p.shapeDist / maxShapeDist;
    const anchorNorm = p.anchorDist / maxAnchorDist;

    p.dissolveDelay = (1 - shapeNorm) * PARTICLE_DISSOLVE_STAGGER;
    p.formDelay = anchorNorm * FOOTER_R_FORM_STAGGER;
  }
}
