import { CAROUSEL_CONFIG } from "@/config/carousel.config";

const VELOCITY_SCALE = 60;

function frameLerp(rate: number, dt: number) {
  return 1 - Math.pow(1 - rate, dt * 60);
}

export function stepCarouselBarrel(
  current: number,
  scrollVelocity: number,
  pendingVelocity: number,
  hadInput: boolean,
  dt: number,
): number {
  const velocitySec = Math.abs(scrollVelocity) * VELOCITY_SCALE;
  const impulse = hadInput
    ? Math.abs(pendingVelocity) * CAROUSEL_CONFIG.BARREL_IMPULSE_FACTOR
    : 0;
  const rawDrive = Math.max(velocitySec, impulse);

  let target = 0;
  if (rawDrive > CAROUSEL_CONFIG.BARREL_VELOCITY_THRESHOLD) {
    target = Math.min(
      (rawDrive - CAROUSEL_CONFIG.BARREL_VELOCITY_THRESHOLD) *
        CAROUSEL_CONFIG.BARREL_SPEED_FACTOR,
      CAROUSEL_CONFIG.BARREL_MAX_STRENGTH,
    );
  }

  const lerpRate =
    target > current
      ? CAROUSEL_CONFIG.BARREL_ATTACK_LERP
      : CAROUSEL_CONFIG.BARREL_RELEASE_LERP;

  return current + (target - current) * frameLerp(lerpRate, dt);
}
