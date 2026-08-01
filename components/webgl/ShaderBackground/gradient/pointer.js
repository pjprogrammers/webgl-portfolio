import {
  SCROLL_PARTICLE_SPEED,
  SCROLL_UP_PARTICLE_SPEED,
} from "../particleSimulation.js";

/** Estado compartido cursor → partículas + gradiente / Shared pointer state */
export function createPointer() {
  return {
    x: -9999,
    y: -9999,
    prevX: -9999,
    prevY: -9999,
    uv: { x: 0.5, y: 0.5 },
    uvPrev: { x: 0.5, y: 0.5 },
    uvSmooth: { x: 0.5, y: 0.5 },
    uvSmoothPrev: { x: 0.5, y: 0.5 },
    uvVel: { x: 0, y: 0 },
    speed: 0,
    engagement: 0,
    /** Visibilidad del VFX: no baja hasta que uvSmooth alcanza al cursor */
    vfxEngage: 0,
    /** Progreso de salida del trazo (cola → cabeza) cuando el VFX se apaga */
    disengageProgress: 0,
    /** Dirección de scroll de Lenis: 1 = abajo, -1 = arriba, 0 = detenido */
    scrollDirection: 0,
    /** Velocidad absoluta de scroll (px/s) */
    scrollSpeed: 0,
    /** Multiplicador suavizado de velocidad de partículas por scroll */
    scrollBoost: 1,
    /** Multiplicador suavizado del noise/colores del gradiente por scroll */
    scrollGradientBoost: 1,
  };
}

export function updatePointerFromClient(pointer, clientX, clientY, el, ww, wh) {
  const rect = el.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;

  pointer.uvPrev.x = pointer.uv.x;
  pointer.uvPrev.y = pointer.uv.y;

  pointer.uv.x = nx;
  pointer.uv.y = 1.0 - ny;
  pointer.x = nx * ww - ww / 2;
  pointer.y = wh / 2 - ny * wh;

  const vx = pointer.uv.x - pointer.uvPrev.x;
  const vy = pointer.uv.y - pointer.uvPrev.y;
  pointer.uvVel.x += (vx - pointer.uvVel.x) * 0.4;
  pointer.uvVel.y += (vy - pointer.uvVel.y) * 0.4;
}

/** Seguimiento suave del VFX (más alto = menos delay) / VFX follow speed */
export const POINTER_VFX_SMOOTH = 9;

export function updatePointerSmooth(
  pointer,
  delta,
  speed = POINTER_VFX_SMOOTH,
) {
  pointer.uvSmoothPrev.x = pointer.uvSmooth.x;
  pointer.uvSmoothPrev.y = pointer.uvSmooth.y;
  const t = 1 - Math.exp(-speed * delta);
  pointer.uvSmooth.x += (pointer.uv.x - pointer.uvSmooth.x) * t;
  pointer.uvSmooth.y += (pointer.uv.y - pointer.uvSmooth.y) * t;
}

export function updatePointerSpeed(pointer) {
  const dx = pointer.prevX - pointer.x;
  const dy = pointer.prevY - pointer.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  pointer.speed += (dist - pointer.speed) * 0.5;
  if (pointer.speed < 0.001) pointer.speed = 0;
  pointer.prevX = pointer.x;
  pointer.prevY = pointer.y;

  const target = Math.min(pointer.speed / 5, 1);
  pointer.engagement += (target - pointer.engagement) * 0.06;
  if (pointer.engagement < 0.001) pointer.engagement = 0;
}

const CATCHUP_DONE = 0.0025;

/** Mantiene el VFX visible mientras la mancha no ha llegado al cursor real */
export function updatePointerVfxEngage(pointer, delta) {
  const dx = pointer.uv.x - pointer.uvSmooth.x;
  const dy = pointer.uv.y - pointer.uvSmooth.y;
  const lag = Math.sqrt(dx * dx + dy * dy);

  let target = pointer.engagement;
  if (lag > CATCHUP_DONE) {
    target = Math.max(target, Math.min(0.35 + lag * 28.0, 1.0));
  }

  const settling = lag <= CATCHUP_DONE && pointer.engagement < 0.03;
  const rate = settling ? 2.2 : 11.0;
  const t = 1 - Math.exp(-rate * delta);
  pointer.vfxEngage += (target - pointer.vfxEngage) * t;

  if (pointer.vfxEngage < 0.008) pointer.vfxEngage = 0;

  if (pointer.vfxEngage > 0.008) {
    pointer.disengageProgress = 0;
  } else {
    pointer.disengageProgress = Math.min(
      pointer.disengageProgress + delta * 1.35,
      1.5,
    );
  }
}

const SCROLL_DOWN_THRESHOLD = 0.5;
/** Aceleración al empezar scroll hacia abajo */
const SCROLL_BOOST_ACCEL = 10;
/** Desaceleración al soltar scroll hacia abajo */
const SCROLL_BOOST_DECEL = SCROLL_BOOST_ACCEL / 7;
/** Scroll arriba: 1 → lento (rápido — invertido respecto al default) */
const SCROLL_UP_ENTER_RATE = SCROLL_BOOST_ACCEL;
/** Scroll arriba: lento → 1 (suave — invertido respecto al default) */
const SCROLL_UP_EXIT_RATE = SCROLL_BOOST_DECEL;

function resolveScrollTarget(
  isScrollingDown,
  isScrollingUp,
  downSpeed,
  upSpeed,
) {
  if (isScrollingDown) return downSpeed;
  if (isScrollingUp) return upSpeed;
  return 1;
}

function lerpScrollBoost(current, target, slowTarget, delta) {
  let rate;
  if (target === slowTarget) {
    rate = SCROLL_UP_ENTER_RATE;
  } else if (target === 1 && current < 1) {
    rate = SCROLL_UP_EXIT_RATE;
  } else {
    const isDecelerating = target < current;
    rate = isDecelerating ? SCROLL_BOOST_DECEL : SCROLL_BOOST_ACCEL;
  }

  const t = 1 - Math.exp(-rate * delta);
  let next = current + (target - current) * t;
  if (Math.abs(next - target) < 0.001) next = target;
  return next;
}

/** Scroll abajo → downSpeed, detenido → x1, arriba → upSpeed (partículas + gradiente por separado) */
export function updatePointerScrollBoost(
  pointer,
  scrollDirection,
  scrollSpeed,
  delta,
  {
    particleDownSpeed = SCROLL_PARTICLE_SPEED,
    particleUpSpeed = SCROLL_UP_PARTICLE_SPEED,
    gradientDownSpeed = 1,
    gradientUpSpeed = 1,
  } = {},
) {
  pointer.scrollDirection = scrollDirection;
  pointer.scrollSpeed = scrollSpeed;

  const scrollMagnitude = Math.abs(scrollSpeed);
  const isScrollingDown =
    scrollDirection === 1 && scrollMagnitude > SCROLL_DOWN_THRESHOLD;
  const isScrollingUp =
    scrollDirection === -1 && scrollMagnitude > SCROLL_DOWN_THRESHOLD;

  const particleTarget = resolveScrollTarget(
    isScrollingDown,
    isScrollingUp,
    particleDownSpeed,
    particleUpSpeed,
  );
  pointer.scrollBoost = lerpScrollBoost(
    pointer.scrollBoost,
    particleTarget,
    particleUpSpeed,
    delta,
  );

  const gradientTarget = resolveScrollTarget(
    isScrollingDown,
    isScrollingUp,
    gradientDownSpeed,
    gradientUpSpeed,
  );
  pointer.scrollGradientBoost = lerpScrollBoost(
    pointer.scrollGradientBoost,
    gradientTarget,
    gradientUpSpeed,
    delta,
  );
}
