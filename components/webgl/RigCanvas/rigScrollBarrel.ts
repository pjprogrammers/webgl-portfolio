import { RIG_CONFIG } from "@/config/rig.config";
import { stepCarouselBarrel } from "@/components/webgl/CarouselCanvas/carouselBarrel";

export function stepRigScrollBarrel(
  current: number,
  scrollDeltaPx: number,
  dt: number,
): number {
  const hadInput = Math.abs(scrollDeltaPx) > 0.5;
  const scrollVelocity = scrollDeltaPx * RIG_CONFIG.SCROLL_VELOCITY_SCALE;
  const pendingVelocity = scrollDeltaPx * RIG_CONFIG.SCROLL_IMPULSE_SCALE;

  return stepCarouselBarrel(
    current,
    scrollVelocity,
    pendingVelocity,
    hadInput,
    dt,
  );
}
