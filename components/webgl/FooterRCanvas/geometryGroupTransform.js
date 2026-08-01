import { particleScrollState } from "./particleScrollState.js";

const DEG_TO_RAD = Math.PI / 180;

/** Rotación Y impulsada por scroll (grupo exterior). */
export function applyGeometryScrollGroupTransform(
  group,
  scrollState = particleScrollState,
) {
  if (!group) return;

  const inFooterFormation = (scrollState.rFormation ?? 0) > 0.001;

  group.position.set(0, 0, 0);
  group.scale.set(1, 1, 1);
  group.rotation.x = 0;
  group.rotation.z = 0;
  group.rotation.y = inFooterFormation
    ? 0
    : (scrollState.geometryScrollRotationY ?? 0);
  group.updateMatrixWorld();
}

/**
 * `data-geometry-position/scale/rotation` sobre el grupo que envuelve la geometría.
 */
export function applyGeometryDatasetTransform(
  group,
  baseScale,
  scrollState = particleScrollState,
) {
  if (!group) return;

  const inFooterFormation = (scrollState.rFormation ?? 0) > 0.001;

  if (inFooterFormation) {
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);
    group.scale.set(1, 1, 1);
  } else {
    const pos = scrollState.geometryPosition;
    const rot = scrollState.geometryRotation;
    const scl = scrollState.geometryScale;

    group.position.set(
      pos.x * baseScale,
      pos.y * baseScale,
      pos.z * baseScale,
    );
    group.rotation.set(
      rot.x * DEG_TO_RAD,
      rot.y * DEG_TO_RAD,
      rot.z * DEG_TO_RAD,
    );
    group.scale.set(scl.x ?? 1, scl.y ?? 1, scl.z ?? 1);
  }

  group.updateMatrixWorld();
}
