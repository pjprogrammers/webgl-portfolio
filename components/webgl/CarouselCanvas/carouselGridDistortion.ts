import * as THREE from 'three';
import { CAROUSEL_CONFIG } from '@/config/carousel.config';

export interface GridMouseState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vX: number;
  vY: number;
}

export function createGridMouseState(): GridMouseState {
  return { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
}

export function createGridDataTexture(): THREE.DataTexture {
  const { GRID_SIZE } = CAROUSEL_CONFIG;
  const data = new Float32Array(4 * GRID_SIZE * GRID_SIZE);
  const tex = new THREE.DataTexture(
    data,
    GRID_SIZE,
    GRID_SIZE,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  tex.needsUpdate = true;
  return tex;
}

export function clearGridMouseVelocity(state: GridMouseState) {
  state.vX = 0;
  state.vY = 0;
}

export function updateGridMouseFromUv(
  state: GridMouseState,
  u: number,
  v: number,
) {
  state.vX = u - state.prevX;
  state.vY = v - state.prevY;
  state.x = u;
  state.y = v;
  state.prevX = u;
  state.prevY = v;
}

export function stepGridDistortion(
  dataTexture: THREE.DataTexture,
  mouse: GridMouseState,
) {
  const { GRID_SIZE, GRID_MOUSE_RADIUS, GRID_STRENGTH, GRID_RELAXATION } =
    CAROUSEL_CONFIG;
  const data = dataTexture.image.data as Float32Array;
  const cellCount = GRID_SIZE * GRID_SIZE;

  for (let k = 0; k < cellCount; k++) {
    data[k * 4] *= GRID_RELAXATION;
    data[k * 4 + 1] *= GRID_RELAXATION;
  }

  const gridMouseX = GRID_SIZE * mouse.x;
  const gridMouseY = GRID_SIZE * mouse.y;
  const maxDist = GRID_SIZE * GRID_MOUSE_RADIUS;

  for (let gi = 0; gi < GRID_SIZE; gi++) {
    for (let gj = 0; gj < GRID_SIZE; gj++) {
      const dx = gridMouseX - gi;
      const dy = gridMouseY - gj;
      const distSq = dx * dx + dy * dy;
      if (distSq < maxDist * maxDist && distSq > 0) {
        const idx = 4 * (gi + GRID_SIZE * gj);
        const power = Math.min(maxDist / Math.sqrt(distSq), 10);
        data[idx] += GRID_STRENGTH * 100 * mouse.vX * power;
        data[idx + 1] -= GRID_STRENGTH * 100 * mouse.vY * power;
      }
    }
  }

  mouse.vX = 0;
  mouse.vY = 0;
  dataTexture.needsUpdate = true;
}
