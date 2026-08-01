/** Registro del campo de partículas activo para reinicializarlo al cambiar de ruta. */
let activeParticleField = null;

export function registerParticleField(field) {
  activeParticleField = field;
}

export function unregisterParticleField(field) {
  if (activeParticleField === field) {
    activeParticleField = null;
  }
}

export function reinitializeParticleFieldForRoute() {
  activeParticleField?.reinitializeForRoute?.();
}

export function regenerateParticleSpawnLayout() {
  activeParticleField?.regenerateSpawnLayout?.();
}
