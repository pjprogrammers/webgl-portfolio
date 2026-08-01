import { CAROUSEL_CONFIG } from "@/config/carousel.config";

export const RIG_CONFIG = {
  ...CAROUSEL_CONFIG,

  /** Page scroll (px/frame) → barrel drive — tuned for vertical Selected Works. */
  SCROLL_VELOCITY_SCALE: 0.0008,
  SCROLL_IMPULSE_SCALE: 0.008,

  /** Texture cover parallax while scrolling. */
  PARALLAX_FACTOR: 1.2,
} as const;
