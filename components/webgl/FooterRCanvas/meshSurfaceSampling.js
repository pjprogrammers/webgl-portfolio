import * as THREE from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

import { STAR_POSITIONS, STAR_INDICES } from "./starGeometry.js";
import { buildTangentBasis } from "./particleSurfaceMotion.js";

/** Extent máximo en XY de starGeometry (sin escala). */
export const STAR_RAW_EXTENT = 2.55;

function buildIndexedGeometry(positions, indices) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));
  return geo;
}

const starGeometry = buildIndexedGeometry(STAR_POSITIONS, STAR_INDICES);

/**
 * Puntos uniformes sobre la superficie de un BufferGeometry (no volumen).
 * Incluye normal y base tangente para animar sobre la superficie.
 */
export function sampleMeshSurface(geometry, count, scale = 1) {
  const mesh = new THREE.Mesh(geometry);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const points = [];

  for (let i = 0; i < count; i++) {
    sampler.sample(position, normal);
    const basis = buildTangentBasis(normal.x, normal.y, normal.z);

    points.push({
      x: position.x * scale,
      y: position.y * scale,
      z: position.z * scale,
      nx: normal.x,
      ny: normal.y,
      nz: normal.z,
      ...basis,
    });
  }

  return points;
}

/** Muestra sobre starGeometry escalada al espacio normalizado de la R. */
export function sampleStarSurface(count, scale = 1) {
  return sampleMeshSurface(starGeometry, count, scale);
}
