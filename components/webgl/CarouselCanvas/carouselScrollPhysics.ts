import { CAROUSEL_CONFIG } from "@/config/carousel.config";

export type CarouselScrollState = {
  globalOffset: number;
  scrollVelocity: number;
};

type StepOptions = {
  pendingVelocity: number;
  snapTarget: number;
  hadInput: boolean;
  dt: number;
};

const VELOCITY_SCALE = 60;

function frameDecay(base: number, dt: number) {
  return Math.pow(base, dt * 60);
}

/** Critically damped ease — no overshoot (Unity SmoothDamp). Velocity in units/sec. */
function smoothDamp(
  current: number,
  target: number,
  currentVelocity: number,
  smoothTime: number,
  deltaTime: number,
): { value: number; velocity: number } {
  const time = Math.max(0.0001, smoothTime);
  const omega = 2 / time;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (currentVelocity + omega * change) * deltaTime;
  const newVelocity = (currentVelocity - omega * temp) * exp;
  const newValue = target + (change + temp) * exp;
  return { value: newValue, velocity: newVelocity };
}

export function stepCarouselScroll(
  state: CarouselScrollState,
  { pendingVelocity, snapTarget, hadInput, dt }: StepOptions,
): CarouselScrollState {
  let { globalOffset, scrollVelocity } = state;

  scrollVelocity += pendingVelocity;

  if (hadInput) {
    scrollVelocity *= frameDecay(CAROUSEL_CONFIG.SCROLL_DAMPING, dt);
    globalOffset += scrollVelocity * dt * VELOCITY_SCALE;
  } else {
    const velocitySec = scrollVelocity * VELOCITY_SCALE;
    const damped = smoothDamp(
      globalOffset,
      snapTarget,
      velocitySec,
      CAROUSEL_CONFIG.SNAP_SMOOTH_TIME,
      dt,
    );
    globalOffset = damped.value;
    scrollVelocity = damped.velocity / VELOCITY_SCALE;
  }

  if (
    !hadInput &&
    Math.abs(snapTarget - globalOffset) <
      CAROUSEL_CONFIG.SNAP_SETTLE_OFFSET &&
    Math.abs(scrollVelocity) < CAROUSEL_CONFIG.SNAP_SETTLE_VELOCITY
  ) {
    globalOffset = snapTarget;
    scrollVelocity = 0;
  }

  return { globalOffset, scrollVelocity };
}

export function isCarouselScrollSettled(
  state: CarouselScrollState,
  snapTarget: number,
): boolean {
  return (
    Math.abs(snapTarget - state.globalOffset) <
      CAROUSEL_CONFIG.SNAP_SETTLE_OFFSET &&
    Math.abs(state.scrollVelocity) < CAROUSEL_CONFIG.SNAP_SETTLE_VELOCITY
  );
}
