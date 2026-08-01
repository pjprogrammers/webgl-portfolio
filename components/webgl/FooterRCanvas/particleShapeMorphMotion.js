import {
  PARTICLE_SHAPE_MORPH_COMMIT_START,
  PARTICLE_SHAPE_MORPH_EXPAND,
  PARTICLE_SHAPE_MORPH_RANDOM_AMOUNT,
  PARTICLE_SHAPE_MORPH_RANDOM_SPEED,
  PARTICLE_SHAPE_MORPH_ROTATION_DEGREES,
} from "./footerRConfig.js";

const DEG_TO_RAD = Math.PI / 180;

function rotateAroundY(x, y, z, angleRad) {
  if (Math.abs(angleRad) < 1e-8) return { x, y, z };

  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return { x: x * c + z * s, y, z: -x * s + z * c };
}

function expandFromOrigin(x, y, z, factor) {
  return { x: x * factor, y: y * factor, z: z * factor };
}

function morphExpandFactor(progress, peak) {
  return 1 + peak * Math.sin(progress * Math.PI);
}

function morphCommit(progress, start = PARTICLE_SHAPE_MORPH_COMMIT_START) {
  if (progress <= start) return 0;
  const t = (progress - start) / (1 - start);
  return t * t * (3 - 2 * t);
}

function morphFlightEnvelope(progress, commit) {
  return Math.sin(progress * Math.PI) * (1 - commit);
}

function morphFlightNoise(elapsed, particle, envelope) {
  if (envelope <= 0.001) {
    return { x: 0, y: 0, z: 0 };
  }

  const amount =
    PARTICLE_SHAPE_MORPH_RANDOM_AMOUNT * (particle.morphDrift ?? 1) * envelope;
  const speed = (particle.morphSpeed ?? 1) * PARTICLE_SHAPE_MORPH_RANDOM_SPEED;
  const phase = particle.morphPhase ?? 0;
  const t = elapsed * speed;
  const kick = particle.morphKick ?? 0;

  const nx =
    Math.sin(t * 1.2 + phase) +
    Math.sin(t * 2.1 + phase * 1.7) * 0.5 +
    Math.sin(t * 3.3 + phase * 2.4) * 0.28;
  const ny =
    Math.cos(t * 0.9 + phase * 1.3) +
    Math.sin(t * 1.8 + phase) * 0.45 +
    Math.cos(t * 2.6 + phase * 1.9) * 0.22;
  const nz =
    Math.sin(t * 1.5 + phase * 2.2) * 0.55 +
    Math.cos(t * 2.4 + phase * 0.8) * 0.35;

  const norm = 2.15;

  return {
    x: (nx / norm + particle.morphKickX * kick) * amount,
    y: (ny / norm + particle.morphKickY * kick) * amount,
    z: (nz / norm + particle.morphKickZ * kick) * amount,
  };
}

function lerpShapePosition(from, to, morph) {
  return {
    x: from.x + (to.x - from.x) * morph,
    y: from.y + (to.y - from.y) * morph,
    z: from.z + (to.z - from.z) * morph,
  };
}

/**
 * Transición entre dos posiciones de forma.
 * Con vuelo: expande, gira 360° en Y con ruido y aterriza en la geo destino.
 * Sin vuelo (morph 0/1 o entry-animation=false en destino): posiciones exactas / lerp.
 */
export function applyShapeMorphMotion(
  from,
  to,
  morph,
  particle,
  elapsed = 0,
  useFlight = true,
) {
  if (morph <= 0) {
    return { x: from.x, y: from.y, z: from.z };
  }

  if (morph >= 1) {
    return { x: to.x, y: to.y, z: to.z };
  }

  if (!useFlight) {
    return lerpShapePosition(from, to, morph);
  }

  const expand = morphExpandFactor(morph, PARTICLE_SHAPE_MORPH_EXPAND);
  const angle = morph * PARTICLE_SHAPE_MORPH_ROTATION_DEGREES * DEG_TO_RAD;
  const commit = morphCommit(morph);
  const flight = morphFlightEnvelope(morph, commit);

  let { x, y, z } = expandFromOrigin(from.x, from.y, from.z, expand);
  ({ x, y, z } = rotateAroundY(x, y, z, angle));

  const noise = morphFlightNoise(elapsed, particle, flight);
  x += noise.x;
  y += noise.y;
  z += noise.z;

  return {
    x: x + (to.x - x) * commit,
    y: y + (to.y - y) * commit,
    z: z + (to.z - z) * commit,
  };
}
