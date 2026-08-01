import { PARTICLE_SHAPE_SCALE } from "./footerRConfig.js";
import { ADN_INDICES, ADN_POSITIONS } from "./adnGeometry.js";
import { DIAMOND_POSITIONS } from "./diamondGeometry.js";
import { STAR_INDICES, STAR_POSITIONS } from "./starGeometry.js";
import { buildTangentBasis } from "./particleSurfaceMotion.js";
import {
  buildIndexedTriangleCache,
  pickWeightedTriangle,
  randomBarycentric,
} from "./shapeTriangleSampling.js";

const morphedPositions = new Float32Array(STAR_POSITIONS.length);
const starPositionsScaled = new Float32Array(STAR_POSITIONS.length);
const diamondPositionsScaled = new Float32Array(DIAMOND_POSITIONS.length);
const adnPositionsScaled = new Float32Array(ADN_POSITIONS.length);
const starTriangleCache = buildIndexedTriangleCache(
  STAR_POSITIONS,
  STAR_INDICES,
);
const adnTriangleCache = buildIndexedTriangleCache(ADN_POSITIONS, ADN_INDICES);

/** Caché de triángulos por forma. Star/diamond comparten topología (morph 1-a-1). */
const shapeTriangleCaches = {
  star: starTriangleCache,
  diamond: starTriangleCache,
  adn: adnTriangleCache,
};

function writeScaledShapePositions(source, target) {
  const scale = PARTICLE_SHAPE_SCALE;
  for (let i = 0; i < source.length; i++) {
    target[i] = source[i] * scale;
  }
  return target;
}

function vertexAt(positions, index) {
  const i = index * 3;
  return {
    x: positions[i],
    y: positions[i + 1],
    z: positions[i + 2],
  };
}

export function writeMorphedShapePositions(morph, target = morphedPositions) {
  const starWeight = 1 - morph;
  const diamondWeight = morph;
  const scale = PARTICLE_SHAPE_SCALE;

  for (let i = 0; i < STAR_POSITIONS.length; i++) {
    target[i] =
      (STAR_POSITIONS[i] * starWeight + DIAMOND_POSITIONS[i] * diamondWeight) *
      scale;
  }

  return target;
}

export function getStarShapePositions() {
  return writeScaledShapePositions(STAR_POSITIONS, starPositionsScaled);
}

export function getDiamondShapePositions() {
  return writeScaledShapePositions(DIAMOND_POSITIONS, diamondPositionsScaled);
}

export function getAdnShapePositions() {
  return writeScaledShapePositions(ADN_POSITIONS, adnPositionsScaled);
}

export function getMorphedShapePositions(morph) {
  return writeMorphedShapePositions(morph, morphedPositions);
}

export function barycentricShapePoint(positions, i0, i1, i2, u, v) {
  const w = 1 - u - v;
  const a = vertexAt(positions, i0);
  const b = vertexAt(positions, i1);
  const c = vertexAt(positions, i2);

  return {
    x: a.x * w + b.x * u + c.x * v,
    y: a.y * w + b.y * u + c.y * v,
    z: a.z * w + b.z * u + c.z * v,
  };
}

export function faceBasisFromTriangle(positions, i0, i1, i2) {
  const a = vertexAt(positions, i0);
  const b = vertexAt(positions, i1);
  const c = vertexAt(positions, i2);
  const ux = b.x - a.x;
  const uy = b.y - a.y;
  const uz = b.z - a.z;
  const vx = c.x - a.x;
  const vy = c.y - a.y;
  const vz = c.z - a.z;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;

  return buildTangentBasis(nx, ny, nz);
}

export function sampleShapeBarycentricAnchors(count, shape = "star") {
  const cache = shapeTriangleCaches[shape] ?? starTriangleCache;
  const { triangles, totalArea } = cache;
  const anchors = [];

  for (let i = 0; i < count; i++) {
    const tri = pickWeightedTriangle(triangles, totalArea);
    const { u, v } = randomBarycentric();
    anchors.push({
      i0: tri.i0,
      i1: tri.i1,
      i2: tri.i2,
      baryU: u,
      baryV: v,
    });
  }

  return anchors;
}

export function shapeAnchorSurfaceState(positions, anchor, offsetU = 0, offsetV = 0) {
  const point = barycentricShapePoint(
    positions,
    anchor.i0,
    anchor.i1,
    anchor.i2,
    anchor.baryU,
    anchor.baryV,
  );
  const basis = faceBasisFromTriangle(
    positions,
    anchor.i0,
    anchor.i1,
    anchor.i2,
  );

  const d = {
    x: basis.t1x * offsetU + basis.t2x * offsetV,
    y: basis.t1y * offsetU + basis.t2y * offsetV,
    z: basis.t1z * offsetU + basis.t2z * offsetV,
  };

  return {
    x: point.x + d.x,
    y: point.y + d.y,
    z: point.z + d.z,
    ...basis,
  };
}
