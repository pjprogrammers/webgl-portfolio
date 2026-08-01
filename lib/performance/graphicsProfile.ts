export type GraphicsTier = "high" | "medium" | "low";

export type GraphicsProfile = {
  tier: GraphicsTier;
  /** Cap de devicePixelRatio para canvas WebGL */
  dpr: number;
  /** Partículas del GlobalParticleCanvas */
  particleCount: number;
  particleTwinklePercent: number;
  particleTwinkleIntensity: number;
  /** Partículas del ShaderBackground */
  shaderParticleCount: number;
  enableBloom: boolean;
  /** Escala de resolución de FBOs del shader (1 = pantalla completa) */
  fboScale: number;
  antialias: boolean;
  /** 0 = sin límite; 60/30 = cap del ticker GSAP y WebGL */
  maxFps: number;
};

const HIGH_PROFILE: GraphicsProfile = {
  tier: "high",
  dpr: 2,
  particleCount: 4000,
  particleTwinklePercent: 40,
  particleTwinkleIntensity: 3.5,
  shaderParticleCount: 10000,
  enableBloom: true,
  fboScale: 1,
  antialias: false,
  maxFps: 60,
};

const MEDIUM_PROFILE: GraphicsProfile = {
  tier: "medium",
  dpr: 1.5,
  particleCount: 2800,
  particleTwinklePercent: 20,
  particleTwinkleIntensity: 1.8,
  shaderParticleCount: 6000,
  enableBloom: true,
  fboScale: 0.85,
  antialias: false,
  maxFps: 60,
};

const LOW_PROFILE: GraphicsProfile = {
  tier: "low",
  dpr: 1,
  particleCount: 1800,
  particleTwinklePercent: 0,
  particleTwinkleIntensity: 0,
  shaderParticleCount: 3000,
  enableBloom: false,
  fboScale: 0.7,
  antialias: false,
  maxFps: 30,
};

let cachedProfile: GraphicsProfile | null = null;

function detectTier(): GraphicsTier {
  if (typeof window === "undefined") return "high";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  const coarse = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
  ).matches;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const dpr = window.devicePixelRatio || 1;

  if (coarse) return "medium";

  const lowMemory = typeof memory === "number" && memory <= 4;
  const lowCores = typeof cores === "number" && cores <= 4;
  const highDpr = dpr >= 2;

  if (lowMemory || (lowCores && highDpr)) return "medium";

  return "high";
}

export function getGraphicsProfile(): GraphicsProfile {
  if (cachedProfile) return cachedProfile;

  const tier = detectTier();
  cachedProfile =
    tier === "low"
      ? LOW_PROFILE
      : tier === "medium"
        ? MEDIUM_PROFILE
        : HIGH_PROFILE;

  return cachedProfile;
}

export function resetGraphicsProfileCache() {
  cachedProfile = null;
}
