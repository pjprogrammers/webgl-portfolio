import * as THREE from "three";

import {
  FOOTER_R_DEPTH_SIZE_REF,
  FOOTER_R_FORM_STAGGER,
  FOOTER_R_PARTICLE_DRIFT_MAX,
  FOOTER_R_PARTICLE_DRIFT_MIN,
  FOOTER_R_PARTICLE_NOISE_AMOUNT,
  FOOTER_R_PARTICLE_NOISE_SPEED,
  FOOTER_R_PARTICLE_OFFSET_MAX,
  FOOTER_R_PARTICLE_SIZE_MAX,
  FOOTER_R_PARTICLE_SIZE_MIN,
  FOOTER_R_PARTICLE_WANDER_SPEED,
  FOOTER_R_PARTICLE_Z_ALPHA_MAX,
  FOOTER_R_PARTICLE_Z_ALPHA_MIN,
  FOOTER_R_PARTICLE_Z_RANGE,
  FOOTER_R_SPAWN_SPREAD,
  PARTICLE_DISSOLVE_STAGGER,
  PARTICLE_SPAWN_DISTANCE_MULTIPLIER,
  GLOBAL_PARTICLE_TWINKLE_PERCENT,
  GLOBAL_PARTICLE_TWINKLE_INTENSITY,
  FOOTER_PARTICLE_GLOW_BOOST,
  FOOTER_PARTICLE_HALO_STRENGTH,
} from "./footerRConfig.js";
import { buildParticleColorBuffer } from "./particleColors.js";
import {
  assignParticleTwinkle,
  particleTwinkleBoost,
} from "./particleTwinkle.js";
import { assignRadialDissolveDelays } from "./particleRadialDissolveDelays.js";
import { rotateParticleForDissolve } from "./particleDissolveRotation.js";
import { particleScrollState } from "./particleScrollState.js";
import footerParticleFragmentShader from "./footerParticleFragmentShader.js";
import footerParticleVertexShader from "./footerParticleVertexShader.js";
import {
  getOrderedGeometryMorphElements,
  readGeometryScrollFromElement,
} from "./particleGeometryScrollFromDataset.js";
import { sampleRParticleAnchors } from "./sampleRParticleAnchors.js";
import { anchorSurfacePosition } from "./particleSurfaceMotion.js";
import { applyShapeMorphMotion } from "./particleShapeMorphMotion.js";
import {
  getAdnShapePositions,
  getDiamondShapePositions,
  getStarShapePositions,
  sampleShapeBarycentricAnchors,
  shapeAnchorSurfaceState,
} from "./shapeVertexMorph.js";

export const FOOTER_R_PARTICLE_COUNT = 4000;
const CURSOR_RADIUS = 78;
const CURSOR_PUSH = 34;
const CURSOR_RETURN_SPEED = 5.2;
const CURSOR_MOTION_REF = 90;

function randomParticleSize() {
  const min = FOOTER_R_PARTICLE_SIZE_MIN;
  const max = FOOTER_R_PARTICLE_SIZE_MAX;
  const range = max - min;
  return min + range * Math.random() * 0.32;
}

function clampWanderMagnitude(wanderX, wanderY) {
  const max = FOOTER_R_PARTICLE_OFFSET_MAX;
  const mag = Math.hypot(wanderX, wanderY);

  if (mag <= max || mag < 1e-8) {
    return { x: wanderX, y: wanderY };
  }

  const scale = max / mag;
  return { x: wanderX * scale, y: wanderY * scale };
}

/** Pseudo-ruido con senos en frecuencias inconmensurables (barato para 10k partículas). */
function particleNoise(elapsed, phase, amount, speed) {
  const t = elapsed * speed;
  const nx =
    Math.sin(t * 1.0 + phase) +
    Math.sin(t * 1.73 + phase * 2.1) * 0.55 +
    Math.sin(t * 2.41 + phase * 3.7) * 0.28;
  const ny =
    Math.cos(t * 0.87 + phase * 1.4) +
    Math.cos(t * 1.91 + phase * 2.8) * 0.52 +
    Math.sin(t * 2.17 + phase * 1.1) * 0.31;
  const nz =
    Math.sin(t * 1.31 + phase * 2.5) + Math.sin(t * 2.05 + phase * 4.2) * 0.45;

  const norm = 1.83;
  return {
    x: (nx / norm) * amount,
    y: (ny / norm) * amount,
    z: (nz / 1.45) * amount * 0.7,
  };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function staggeredProgress(delay, progress, stagger) {
  if (progress <= delay) return 0;
  const span = 1 - delay;
  if (span <= 1e-6) return 1;
  return Math.min(1, (progress - delay) / span);
}

function particleFormationT(formDelay, progress) {
  return staggeredProgress(formDelay, progress, FOOTER_R_FORM_STAGGER);
}

function particleDissolveT(dissolveDelay, progress) {
  return staggeredProgress(dissolveDelay, progress, PARTICLE_DISSOLVE_STAGGER);
}

function surfaceParticleFields(surface) {
  return {
    x: surface.x,
    y: surface.y,
    z: surface.z,
    t1x: surface.t1x,
    t1y: surface.t1y,
    t1z: surface.t1z,
    t2x: surface.t2x,
    t2y: surface.t2y,
    t2z: surface.t2z,
  };
}

function applyShapeAnchorToParticle(p, shapeAnchor, shapePositions) {
  const shape = shapeAnchorSurfaceState(shapePositions, shapeAnchor);
  p.shapeTriI0 = shapeAnchor.i0;
  p.shapeTriI1 = shapeAnchor.i1;
  p.shapeTriI2 = shapeAnchor.i2;
  p.shapeBaryU = shapeAnchor.baryU;
  p.shapeBaryV = shapeAnchor.baryV;
  p.shapeX = shape.x;
  p.shapeY = shape.y;
  p.shapeZ = shape.z;
  p.shapeT1x = shape.t1x;
  p.shapeT1y = shape.t1y;
  p.shapeT1z = shape.t1z;
  p.shapeT2x = shape.t2x;
  p.shapeT2y = shape.t2y;
  p.shapeT2z = shape.t2z;
}

function buildParticles(rSurfacePoints, shapeAnchors, starPositions) {
  return rSurfacePoints.map((anchor, index) => {
    const shapeAnchor = shapeAnchors[index] ?? {
      i0: 0,
      i1: 1,
      i2: 2,
      baryU: 0,
      baryV: 0,
    };
    const anchorFields = surfaceParticleFields(anchor);
    const particle = {
      anchorX: anchorFields.x,
      anchorY: anchorFields.y,
      anchorZ: anchorFields.z,
      anchorT1x: anchorFields.t1x,
      anchorT1y: anchorFields.t1y,
      anchorT1z: anchorFields.t1z,
      anchorT2x: anchorFields.t2x,
      anchorT2y: anchorFields.t2y,
      anchorT2z: anchorFields.t2z,
      spawnX: 0,
      spawnY: 0,
      spawnZ: 0,
      formDelay: 0,
      dissolveDelay: 0,
      wanderX: 0,
      wanderY: 0,
      x: 0,
      y: 0,
      z: 0,
      opacity: 0,
      offX: 0,
      offY: 0,
      phase: Math.random() * Math.PI * 2,
      noisePhase: Math.random() * Math.PI * 2,
      noiseSpeed: FOOTER_R_PARTICLE_NOISE_SPEED * (0.72 + Math.random() * 0.56),
      drift:
        FOOTER_R_PARTICLE_DRIFT_MIN +
        Math.random() *
          (FOOTER_R_PARTICLE_DRIFT_MAX - FOOTER_R_PARTICLE_DRIFT_MIN),
      twinkle: 0.35 + Math.random() * 0.65,
      morphPhase: Math.random() * Math.PI * 2,
      morphSpeed: 0.75 + Math.random() * 0.9,
      morphDrift: 0.55 + Math.random() * 0.9,
      morphKick: 0.35 + Math.random() * 0.65,
      morphKickX: (Math.random() - 0.5) * 2,
      morphKickY: (Math.random() - 0.5) * 2,
      morphKickZ: (Math.random() - 0.5) * 1.4,
      hasTwinkle: false,
      twinklePhase: 0,
      twinkleSpeed: 1,
      baseSize: randomParticleSize(),
    };
    applyShapeAnchorToParticle(particle, shapeAnchor, starPositions);
    return particle;
  });
}

function readInitialShapeTarget() {
  const geometryEls = getOrderedGeometryMorphElements();
  return geometryEls.length > 0
    ? readGeometryScrollFromElement(geometryEls[0]).target
    : "star";
}

function shapePositionsForTarget(shape) {
  if (shape === "adn") return getAdnShapePositions();
  if (shape === "diamond") return getDiamondShapePositions();
  return getStarShapePositions();
}

function particleOffset(p, elapsed, wobble) {
  const driftX = Math.cos(elapsed * 0.7 + p.phase) * p.drift * wobble;
  const driftY = Math.sin(elapsed * 0.9 + p.phase * 1.3) * p.drift * wobble;
  return clampWanderMagnitude(p.wanderX + driftX, p.wanderY + driftY);
}

export function createFooterRParticleField(
  geometry,
  count = FOOTER_R_PARTICLE_COUNT,
  twinkleOptions = {},
) {
  const {
    twinklePercent = GLOBAL_PARTICLE_TWINKLE_PERCENT,
    twinkleIntensity = GLOBAL_PARTICLE_TWINKLE_INTENSITY,
  } = twinkleOptions;
  const rSurfacePoints = sampleRParticleAnchors(geometry, count);
  const initialShape = readInitialShapeTarget();
  const shapeAnchors = sampleShapeBarycentricAnchors(count, initialShape);
  const starPositions = getStarShapePositions();
  const particles = buildParticles(rSurfacePoints, shapeAnchors, starPositions);
  assignRadialDissolveDelays(particles);
  assignParticleTwinkle(particles, twinklePercent);
  let baseScale = 1;
  let canvasWidth = 0;
  let canvasHeight = 0;

  let positions = null;
  let sizes = null;
  let brightness = null;
  let opacities = null;
  let formTs = null;
  let elapsed = 0;

  const geo = new THREE.BufferGeometry();
  const mat = new THREE.ShaderMaterial({
    vertexShader: footerParticleVertexShader,
    fragmentShader: footerParticleFragmentShader,
    uniforms: {
      uSizeRef: { value: FOOTER_R_DEPTH_SIZE_REF },
      uLocalZExtent: { value: FOOTER_R_PARTICLE_Z_RANGE },
      uZAlphaMin: { value: FOOTER_R_PARTICLE_Z_ALPHA_MIN },
      uZAlphaMax: { value: FOOTER_R_PARTICLE_Z_ALPHA_MAX },
      uGlowBoost: { value: FOOTER_PARTICLE_GLOW_BOOST },
      uHaloStrength: { value: FOOTER_PARTICLE_HALO_STRENGTH },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 1;

  function uploadBuffers() {
    const len = particles.length;
    positions = new Float32Array(len * 3);
    const colors = buildParticleColorBuffer(len);
    sizes = new Float32Array(len);
    brightness = new Float32Array(len);
    opacities = new Float32Array(len);

    for (let i = 0; i < len; i++) {
      const p = particles[i];
      const i3 = i * 3;
      positions[i3] = p.x * baseScale;
      positions[i3 + 1] = p.y * baseScale;
      positions[i3 + 2] = p.z * baseScale;
      sizes[i] = p.baseSize;
      brightness[i] = 0.92;
      opacities[i] = p.opacity;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("brightness", new THREE.BufferAttribute(brightness, 1));
    geo.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
  }

  function setSpawnLayout(width, height) {
    if (!baseScale || particles.length === 0 || width <= 0 || height <= 0)
      return;

    canvasWidth = width;
    canvasHeight = height;

    const spawnDistance =
      FOOTER_R_SPAWN_SPREAD * PARTICLE_SPAWN_DISTANCE_MULTIPLIER;
    const spreadNormX = (width / baseScale) * 0.5 * spawnDistance;
    const spreadNormY = (height / baseScale) * 0.5 * spawnDistance;
    const spreadNormZ =
      FOOTER_R_PARTICLE_Z_RANGE * 1.4 * PARTICLE_SPAWN_DISTANCE_MULTIPLIER;
    const rFormation = particleScrollState.rFormation;

    for (const p of particles) {
      p.spawnX = (Math.random() - 0.5) * spreadNormX * 2;
      p.spawnY = (Math.random() - 0.5) * spreadNormY * 2;
      p.spawnZ = (Math.random() - 0.5) * spreadNormZ * 2;

      if (rFormation > 0.001 && rFormation < 0.999) {
        p.wanderX = 0;
        p.wanderY = 0;
        p.x = p.spawnX;
        p.y = p.spawnY;
        p.z = p.spawnZ;
        p.opacity = 0;
      }
    }

    if (!positions || !opacities) return;
    if (rFormation <= 0.001 || rFormation >= 0.999) return;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const i3 = i * 3;
      positions[i3] = p.x * baseScale + p.offX;
      positions[i3 + 1] = p.y * baseScale + p.offY;
      positions[i3 + 2] = p.z * baseScale;
      opacities[i] = p.opacity;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.opacity.needsUpdate = true;
  }

  function updateZExtent() {
    mat.uniforms.uLocalZExtent.value =
      FOOTER_R_PARTICLE_Z_RANGE * Math.max(baseScale, 1);
  }

  function setScale(nextScale, width = canvasWidth, height = canvasHeight) {
    baseScale = nextScale;
    updateZExtent();
    if (width > 0 && height > 0) {
      setSpawnLayout(width, height);
    } else if (!positions) {
      return;
    } else {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const i3 = i * 3;
        positions[i3] = p.x * baseScale + p.offX;
        positions[i3 + 1] = p.y * baseScale + p.offY;
        positions[i3 + 2] = p.z * baseScale;
      }

      geo.attributes.position.needsUpdate = true;
    }
  }

  function springOffset(particle, dt) {
    const t = 1 - Math.exp(-CURSOR_RETURN_SPEED * dt);
    particle.offX += -particle.offX * t;
    particle.offY += -particle.offY * t;

    if (Math.abs(particle.offX) < 0.02) particle.offX = 0;
    if (Math.abs(particle.offY) < 0.02) particle.offY = 0;
  }

  function applyCursorInfluence(particle, cursorX, cursorY, dt, pushStrength) {
    springOffset(particle, dt);

    if (pushStrength <= 0.02) return;

    const worldX = particle.x * baseScale + particle.offX;
    const worldY = particle.y * baseScale + particle.offY;
    const dx = cursorX - worldX;
    const dy = cursorY - worldY;
    const distSq = dx * dx + dy * dy;
    const radiusSq = CURSOR_RADIUS * CURSOR_RADIUS;

    if (distSq >= radiusSq) return;

    const dist = Math.sqrt(distSq) || 0.0001;
    const falloff = 1 - dist / CURSOR_RADIUS;
    const push = falloff * falloff * CURSOR_PUSH * pushStrength * dt * 60;

    particle.offX -= (dx / dist) * push;
    particle.offY -= (dy / dist) * push;
  }

  function tick(delta = 1 / 60, pointer = null) {
    if (!positions || particles.length === 0) return;

    const dt = Math.min(Math.max(delta, 0.001), 0.05);
    elapsed += dt;
    const {
      dissolve,
      rFormation,
      shapeMorph,
      shapeMorphUseFlight,
      shapeTarget,
      pageDissolveOut,
    } = particleScrollState;
    updateZExtent();
    const morph = shapeMorph ?? 0;
    const morphUseFlight = shapeMorphUseFlight !== false;
    const useAdnShape = shapeTarget === "adn";
    const starShapePositions = getStarShapePositions();
    const diamondShapePositions = getDiamondShapePositions();
    const adnShapePositions = useAdnShape ? getAdnShapePositions() : null;
    const inFooterFormation = rFormation > 0.001;
    const allowWander = FOOTER_R_PARTICLE_OFFSET_MAX > 0;
    const wanderBlend = allowWander
      ? (1 - Math.exp(-FOOTER_R_PARTICLE_WANDER_SPEED * dt)) *
        (inFooterFormation ? Math.min(1, rFormation) : 1)
      : 0;
    const engagement = pointer?.engagement ?? 0;
    const pointerInside = pointer?.active ?? false;
    const cursorX = pointer?.localSmoothX ?? pointer?.smoothX ?? 0;
    const cursorY = pointer?.localSmoothY ?? pointer?.smoothY ?? 0;
    const cursorActive = engagement > 0.02 || pointerInside;
    const motion = cursorActive
      ? Math.min(1, (pointer?.speed ?? 0) / CURSOR_MOTION_REF)
      : 0;
    const pushStrength = engagement * motion;

    const noiseScale =
      FOOTER_R_PARTICLE_NOISE_AMOUNT > 1e-6
        ? FOOTER_R_PARTICLE_OFFSET_MAX / FOOTER_R_PARTICLE_NOISE_AMOUNT
        : 0;

    if (!formTs || formTs.length !== particles.length) {
      formTs = new Float32Array(particles.length);
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const wobble = Math.sin(elapsed * (1.1 + p.twinkle) + p.phase);
      const noise = particleNoise(
        elapsed,
        p.noisePhase,
        FOOTER_R_PARTICLE_NOISE_AMOUNT,
        p.noiseSpeed,
      );

      p.wanderX += (noise.x * noiseScale - p.wanderX) * wanderBlend;
      p.wanderY += (noise.y * noiseScale - p.wanderY) * wanderBlend;

      const offset = particleOffset(p, elapsed, wobble);
      let opacity = 1;
      let visibility = 1;
      let particleScale = 1;

      if (inFooterFormation) {
        const sim = anchorSurfacePosition(p, offset.x, offset.y);
        const formT = easeOutCubic(particleFormationT(p.formDelay, rFormation));
        formTs[i] = formT;

        let x = p.spawnX + (sim.x - p.spawnX) * formT;
        let y = p.spawnY + (sim.y - p.spawnY) * formT;
        let z = p.spawnZ + (sim.z - p.spawnZ) * formT;

        if (dissolve <= 0.001) {
          ({ x, y, z } = rotateParticleForDissolve(x, y, z, formT));
        }

        opacity = formT;
        visibility = formT;
        particleScale = formT;

        // Salida de página (R formada) o dissolve-out de navegación; no durante
        // el scroll de formación. `pageDissolveOut` cubre el caso en que el footer
        // no alcanza rFormation 1 por toparse con el límite de scroll.
        if (dissolve > 0.001 && (rFormation >= 0.999 || pageDissolveOut)) {
          const dissolveT = easeOutCubic(
            particleDissolveT(p.dissolveDelay, dissolve),
          );

          x = x + (p.spawnX - x) * dissolveT;
          y = y + (p.spawnY - y) * dissolveT;
          z = z + (p.spawnZ - z) * dissolveT;
          ({ x, y, z } = rotateParticleForDissolve(x, y, z, dissolveT));
          opacity *= 1 - dissolveT;
          visibility *= 1 - dissolveT * 0.85;
          particleScale *= 1 - dissolveT;
        }

        p.x = x;
        p.y = y;
        p.z = z;
      } else {
        formTs[i] = 0;
        const shapeAnchor = {
          i0: p.shapeTriI0,
          i1: p.shapeTriI1,
          i2: p.shapeTriI2,
          baryU: p.shapeBaryU,
          baryV: p.shapeBaryV,
        };
        let sim;
        if (useAdnShape) {
          sim = shapeAnchorSurfaceState(
            adnShapePositions,
            shapeAnchor,
            offset.x,
            offset.y,
          );
        } else {
          const fromShape = shapeAnchorSurfaceState(
            starShapePositions,
            shapeAnchor,
            offset.x,
            offset.y,
          );
          const toShape = shapeAnchorSurfaceState(
            diamondShapePositions,
            shapeAnchor,
            offset.x,
            offset.y,
          );
          sim = applyShapeMorphMotion(
            fromShape,
            toShape,
            morph,
            p,
            elapsed,
            morphUseFlight,
          );
        }
        const dissolveT = easeOutCubic(
          particleDissolveT(p.dissolveDelay, dissolve),
        );

        let x = sim.x + (p.spawnX - sim.x) * dissolveT;
        let y = sim.y + (p.spawnY - sim.y) * dissolveT;
        let z = sim.z + (p.spawnZ - sim.z) * dissolveT;
        ({ x, y, z } = rotateParticleForDissolve(x, y, z, dissolveT));
        p.x = x;
        p.y = y;
        p.z = z;
        opacity = 1 - dissolveT;
        visibility = 1 - dissolveT * 0.85;
        particleScale = 1 - dissolveT;
      }

      if (cursorActive || p.offX !== 0 || p.offY !== 0) {
        applyCursorInfluence(p, cursorX, cursorY, dt, pushStrength);
      }

      const i3 = i * 3;
      positions[i3] = p.x * baseScale + p.offX;
      positions[i3 + 1] = p.y * baseScale + p.offY;
      positions[i3 + 2] = p.z * baseScale;
      opacities[i] = opacity;
      sizes[i] = p.baseSize * particleScale;

      const visibilityFactor = Math.max(
        visibility,
        inFooterFormation ? rFormation : 1,
      );
      const twinkleBoost =
        particleTwinkleBoost(p, elapsed, twinkleIntensity) * visibilityFactor;
      const wobbleBoost = p.hasTwinkle ? 0 : wobble * 0.1 * visibilityFactor;

      brightness[i] = 1.05 + wobbleBoost + twinkleBoost;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    geo.attributes.brightness.needsUpdate = true;
    geo.attributes.opacity.needsUpdate = true;
  }

  function reinitializeForRoute() {
    const shape = readInitialShapeTarget();
    const shapePositions = shapePositionsForTarget(shape);
    const shapeAnchors = sampleShapeBarycentricAnchors(particles.length, shape);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      applyShapeAnchorToParticle(p, shapeAnchors[i], shapePositions);
      p.wanderX = 0;
      p.wanderY = 0;
      p.offX = 0;
      p.offY = 0;
    }

    if (canvasWidth > 0 && canvasHeight > 0) {
      setSpawnLayout(canvasWidth, canvasHeight);
    }

    tick(0);
  }

  function regenerateSpawnLayout() {
    if (canvasWidth > 0 && canvasHeight > 0) {
      setSpawnLayout(canvasWidth, canvasHeight);
    }
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  uploadBuffers();

  return {
    points,
    setScale,
    setSpawnLayout,
    tick,
    reinitializeForRoute,
    regenerateSpawnLayout,
    dispose,
  };
}
