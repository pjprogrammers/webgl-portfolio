import {
  GLOBAL_PARTICLE_TWINKLE_INTENSITY,
  GLOBAL_PARTICLE_TWINKLE_PERCENT,
} from "./footerRConfig.js";

/** Marca al azar exactamente `percent` % de partículas con destello. */
export function assignParticleTwinkle(
  particles,
  percent = GLOBAL_PARTICLE_TWINKLE_PERCENT,
) {
  const count = Math.max(
    0,
    Math.min(
      particles.length,
      Math.round(particles.length * (Math.max(0, percent) / 100)),
    ),
  );
  const indices = particles.map((_, index) => index);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (const particle of particles) {
    particle.hasTwinkle = false;
  }

  for (let i = 0; i < count; i++) {
    const particle = particles[indices[i]];
    particle.hasTwinkle = true;
    particle.twinklePhase = Math.random() * Math.PI * 2;
    particle.twinkleSpeed = 0.85 + Math.random() * 2.2;
  }
}

/** Pulso irregular 0–1 con picos afilados (ruido sinusoidal). */
export function particleTwinkleFlash(particle, elapsed) {
  if (!particle.hasTwinkle) return 0;

  const t = elapsed * particle.twinkleSpeed + particle.twinklePhase;
  const mixed =
    Math.sin(t * 1.0) * 0.5 +
    Math.sin(t * 2.17 + particle.phase) * 0.32 +
    Math.sin(t * 4.83 + particle.noisePhase) * 0.18;
  const normalized = (mixed + 1) * 0.5;

  return Math.pow(Math.max(0, normalized), 2.6);
}

export function particleTwinkleBoost(
  particle,
  elapsed,
  intensity = GLOBAL_PARTICLE_TWINKLE_INTENSITY,
) {
  return particleTwinkleFlash(particle, elapsed) * intensity;
}
