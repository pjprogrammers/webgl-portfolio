import * as THREE from "three";

import particleFragmentShader from "./gradient/particleFragmentShader.js";
import particleVertexShader from "./gradient/particleVertexShader.js";

export const PARTICLE_COUNT = 10000;
export const SPARKLE_RATIO = 0.2;
export const STAR_FOV = 55;

/** Multiplicador al hacer scroll hacia abajo (2 = x2, 8 = x8). Scroll detenido = x1 */
export const SCROLL_PARTICLE_SPEED = 8;
/** Multiplicador al hacer scroll hacia arriba (0.4 = 40% de la velocidad normal) */
export const SCROLL_UP_PARTICLE_SPEED = 0.2;

const SIZE_SCALE = 0.5;

const CONFIG = {
  count: PARTICLE_COUNT,
  fov: STAR_FOV,
  sizeMin: 0.55,
  sizeMax: 1.65,
  /** Profundidad de spawn (z negativo, lejos de la cámara) */
  spawnFarMin: 900,
  spawnFarMax: 2400,
  /** Tras pasar la cámara (z positivo) → respawn */
  despawnZ: 80,
  /** Velocidad hacia la cámara (unidades/s) — rango amplio por estrella */
  speedMin: 40,
  speedMax: 520,
  sizeRef: 520,
  brightSizeMul: 1.42,
  brightLevel: 2.05,
  dimLevel: 0.68,
  xySpread: 1.05,
  /** Radio base del cursor en unidades mundo (referencia a cursorDepthRef) */
  cursorRadius: 220,
  bulgeStrength: 42,
  /** Profundidad de referencia — el radio/empuje escalan con |z|/ref (misma huella en pantalla) */
  cursorDepthRef: 450,
  /** ≤ este % de distancia (cámara→spawnFarMax): el cursor deja la partícula donde quede */
  cursorNearMaxRatio: 0.2,
  /** ≥ este % de distancia: vuelve a su posición original al salir el cursor */
  cursorFarMinRatio: 0.21,
  /** Velocidad de retorno suave (más bajo = más lento/smooth) */
  cursorReturnSpeed: 3.2,
};

function depthRatio(z) {
  return Math.abs(z) / CONFIG.spawnFarMax;
}

function isFarCursorZone(z) {
  return depthRatio(z) >= CONFIG.cursorFarMinRatio;
}

function randomSize() {
  return (
    (CONFIG.sizeMin + Math.random() * (CONFIG.sizeMax - CONFIG.sizeMin)) *
    2 *
    SIZE_SCALE
  );
}

/** Velocidad propia por estrella — distribución log-uniforme (unas mucho más rápidas). */
function randomStarSpeed() {
  const { speedMin, speedMax } = CONFIG;
  return speedMin * Math.pow(speedMax / speedMin, Math.random());
}

function spreadAtZ(z, aspect) {
  const dist = Math.abs(z);
  const halfH = Math.tan((CONFIG.fov * Math.PI) / 180 / 2) * dist;
  return { halfW: halfH * aspect, halfH };
}

function buildBrightFlags(count) {
  const brightCount = Math.floor(count * SPARKLE_RATIO);
  const flags = Array.from({ length: count }, (_, i) => i < brightCount);
  for (let i = flags.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flags[i], flags[j]] = [flags[j], flags[i]];
  }
  return flags;
}

function randomSpawnZ(farOnly) {
  const range = CONFIG.spawnFarMax - CONFIG.spawnFarMin;
  if (farOnly) {
    return -(CONFIG.spawnFarMax - Math.random() * range * 0.4);
  }
  return -(CONFIG.spawnFarMin + Math.random() * range);
}

function createStar(bright, aspect, farOnly = false) {
  const spawnZ = randomSpawnZ(farOnly);
  const { halfW, halfH } = spreadAtZ(spawnZ, aspect);
  const x = (Math.random() - 0.5) * halfW * 2 * CONFIG.xySpread;
  const y = (Math.random() - 0.5) * halfH * 2 * CONFIG.xySpread;

  return {
    x,
    y,
    z: spawnZ,
    originX: x,
    originY: y,
    offX: 0,
    offY: 0,
    baseSize: randomSize(),
    sparkle: bright,
    speed: randomStarSpeed(),
  };
}

function buildStars(aspect, count) {
  const brightFlags = buildBrightFlags(count);
  return brightFlags.map((bright) => createStar(bright, aspect, false));
}

export function createParticleField(pointer, count = PARTICLE_COUNT) {
  const starCount = count;
  let aspect = 1;
  let stars = [];
  let positions = null;
  let sizes = null;
  let brightness = null;

  const geo = new THREE.BufferGeometry();
  const mat = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
      uSizeRef: { value: CONFIG.sizeRef },
      uSpawnFar: { value: CONFIG.spawnFarMax },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 1;

  function respawn(star) {
    const next = createStar(star.sparkle, aspect, true);
    star.x = next.x;
    star.y = next.y;
    star.z = next.z;
    star.originX = next.originX;
    star.originY = next.originY;
    star.offX = 0;
    star.offY = 0;
    star.speed = randomStarSpeed();
  }

  function mergeFarOffsetIntoPosition(star) {
    if (star.offX === 0 && star.offY === 0) return;
    star.x = star.originX + star.offX;
    star.y = star.originY + star.offY;
    star.offX = 0;
    star.offY = 0;
  }

  function springFarOffset(star, dt) {
    const t = 1 - Math.exp(-CONFIG.cursorReturnSpeed * dt);
    star.offX += -star.offX * t;
    star.offY += -star.offY * t;
    if (Math.abs(star.offX) < 0.004) star.offX = 0;
    if (Math.abs(star.offY) < 0.004) star.offY = 0;
    star.x = star.originX + star.offX;
    star.y = star.originY + star.offY;
  }

  function applyCursorPush(star, px, py, pushX, pushY, useOffset) {
    if (useOffset) {
      const wx = star.originX + star.offX;
      const wy = star.originY + star.offY;
      const dx = px - wx;
      const dy = py - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.0001) return;
      star.offX -= (dx / dist) * pushX;
      star.offY -= (dy / dist) * pushY;
      star.x = star.originX + star.offX;
      star.y = star.originY + star.offY;
      return;
    }

    const dx = px - star.x;
    const dy = py - star.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.0001) return;
    star.x -= (dx / dist) * pushX;
    star.y -= (dy / dist) * pushY;
  }

  function pointerAtZ(z) {
    const { halfW, halfH } = spreadAtZ(z, aspect);
    return {
      px: (pointer.uvSmooth.x - 0.5) * 2 * halfW,
      py: (pointer.uvSmooth.y - 0.5) * 2 * halfH,
    };
  }

  function uploadBuffers() {
    const len = stars.length;
    positions = new Float32Array(len * 3);
    const colors = new Float32Array(len * 3);
    sizes = new Float32Array(len);
    brightness = new Float32Array(len);

    for (let i = 0; i < len; i++) {
      const s = stars[i];
      const i3 = i * 3;
      positions[i3] = s.x;
      positions[i3 + 1] = s.y;
      positions[i3 + 2] = s.z;
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
      sizes[i] = s.sparkle ? s.baseSize * CONFIG.brightSizeMul : s.baseSize;
      brightness[i] = s.sparkle ? CONFIG.brightLevel : CONFIG.dimLevel;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("brightness", new THREE.BufferAttribute(brightness, 1));
  }

  function resize(nextWw, nextWh) {
    aspect = Math.max(nextWw / Math.max(nextWh, 1), 0.01);
    stars = buildStars(aspect, starCount);
    uploadBuffers();
  }

  function tick(delta = 1 / 60) {
    if (!positions || stars.length === 0) return;

    const dt = Math.min(Math.max(delta, 0.001), 0.05);
    const eng = Math.max(pointer.engagement, pointer.vfxEngage * 0.92);
    const depthRef = CONFIG.cursorDepthRef;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      s.z += s.speed * pointer.scrollBoost * dt;

      if (s.z > CONFIG.despawnZ) {
        respawn(s);
      }

      const useOffset = isFarCursorZone(s.z);

      if (!useOffset) {
        mergeFarOffsetIntoPosition(s);
      }

      if (eng > 0.01) {
        const depthScale = Math.abs(s.z) / depthRef;
        const cr = CONFIG.cursorRadius * depthScale;
        const crSq = cr * cr;
        const { px, py } = pointerAtZ(s.z);
        const sampleX = useOffset ? s.originX + s.offX : s.x;
        const sampleY = useOffset ? s.originY + s.offY : s.y;
        const dx = px - sampleX;
        const dy = py - sampleY;
        const distSq = dx * dx + dy * dy;
        const inRadius = distSq < crSq;

        if (inRadius) {
          const dist = Math.sqrt(distSq);
          const falloff = 1 - dist / cr;
          const push =
            falloff *
            falloff *
            CONFIG.bulgeStrength *
            eng *
            depthScale *
            dt *
            4;
          applyCursorPush(s, px, py, push, push, useOffset);
        } else if (useOffset) {
          springFarOffset(s, dt);
        }
      } else if (useOffset && (s.offX !== 0 || s.offY !== 0)) {
        springFarOffset(s, dt);
      }

      const i3 = i * 3;
      positions[i3] = s.x;
      positions[i3 + 1] = s.y;
      positions[i3 + 2] = s.z;
    }

    geo.attributes.position.needsUpdate = true;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  return {
    points,
    resize,
    tick,
    dispose,
    fov: CONFIG.fov,
  };
}
