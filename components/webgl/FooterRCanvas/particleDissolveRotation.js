import {
  PARTICLE_DISSOLVE_ROTATION_AXIS,
  PARTICLE_DISSOLVE_ROTATION_DEGREES,
} from "./footerRConfig.js";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Rota (x, y, z) alrededor del origen según el progreso del dissolve (0–1).
 * Misma configuración de eje y grados para dissolve out e in.
 */
export function rotateParticleForDissolve(x, y, z, progress) {
  const angle = progress * PARTICLE_DISSOLVE_ROTATION_DEGREES * DEG_TO_RAD;
  if (Math.abs(angle) < 1e-8) return { x, y, z };

  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const axis = PARTICLE_DISSOLVE_ROTATION_AXIS;

  if (axis === "x") {
    return { x, y: y * c - z * s, z: y * s + z * c };
  }
  if (axis === "y") {
    return { x: x * c + z * s, y, z: -x * s + z * c };
  }
  return { x: x * c - y * s, y: x * s + y * c, z };
}
