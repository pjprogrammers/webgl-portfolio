/** @typedef {{ x: number; y: number; z: number }} GeometryVec3 */

export const GEOMETRY_SCALE_DEFAULT = { x: 1, y: 1, z: 1 };
export const GEOMETRY_POSITION_DEFAULT = { x: 0, y: 0, z: 0 };
export const GEOMETRY_ROTATION_DEFAULT = { x: 0, y: 0, z: 0 };

/**
 * Parsea un valor `data-geometry-*` en { x, y, z }:
 * - un número → mismo valor en los tres ejes;
 * - tres números separados por coma o espacio → xyz.
 *
 * @param {string | undefined} raw
 * @param {GeometryVec3} fallback
 * @returns {GeometryVec3}
 */
export function parseGeometryVec3(raw, fallback) {
  if (raw === undefined || raw === "") {
    return { x: fallback.x, y: fallback.y, z: fallback.z };
  }

  const parts = String(raw)
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);

  if (parts.length === 1 && !Number.isNaN(parts[0])) {
    return { x: parts[0], y: parts[0], z: parts[0] };
  }

  if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
    return { x: parts[0], y: parts[1], z: parts[2] };
  }

  return { x: fallback.x, y: fallback.y, z: fallback.z };
}

/** @param {GeometryVec3} target @param {GeometryVec3} source */
export function copyGeometryVec3(target, source) {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

/** @param {GeometryVec3} a @param {GeometryVec3} b */
export function geometryVec3Equal(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/** @param {GeometryVec3} scale */
export function maxGeometryScaleComponent(scale) {
  return Math.max(scale?.x ?? 1, scale?.y ?? 1, scale?.z ?? 1, 1);
}
