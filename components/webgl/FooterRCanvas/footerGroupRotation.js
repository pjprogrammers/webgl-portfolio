import * as THREE from "three";

import {
  FOOTER_R_GROUP_LOOK_TILT,
  FOOTER_R_GROUP_ROTATION_SPEED,
} from "./footerRConfig.js";

const FRONT = new THREE.Vector3(0, 0, 1);
const CURSOR_WORLD = new THREE.Vector3();
const CURSOR_LOCAL = new THREE.Vector3();
const LOOK_DIR = new THREE.Vector3();
const TARGET_QUAT = new THREE.Quaternion();
const IDENTITY_QUAT = new THREE.Quaternion();

export function updateFooterGroupRotation(
  group,
  pointer,
  width,
  height,
  delta,
) {
  if (!group) return;

  const dt = Math.min(Math.max(delta, 0.001), 0.05);
  const blend = 1 - Math.exp(-FOOTER_R_GROUP_ROTATION_SPEED * dt);
  const engagement = pointer.engagement ?? 0;
  const halfW = Math.max(width * 0.5, 1);
  const halfH = Math.max(height * 0.5, 1);

  if (engagement > 0.001) {
    const nx = (pointer.smoothX / halfW) * engagement;
    const ny = (pointer.smoothY / halfH) * engagement;

    LOOK_DIR.set(
      -nx * FOOTER_R_GROUP_LOOK_TILT,
      -ny * FOOTER_R_GROUP_LOOK_TILT,
      1,
    ).normalize();
    TARGET_QUAT.setFromUnitVectors(FRONT, LOOK_DIR);
  } else {
    TARGET_QUAT.copy(IDENTITY_QUAT);
  }

  group.quaternion.slerp(TARGET_QUAT, blend);
  group.updateMatrixWorld();
}

export function syncPointerToGroupLocal(group, pointer) {
  CURSOR_WORLD.set(pointer.smoothX, pointer.smoothY, 0);
  CURSOR_LOCAL.copy(CURSOR_WORLD);

  if (group) {
    group.worldToLocal(CURSOR_LOCAL);
  }

  pointer.localSmoothX = CURSOR_LOCAL.x;
  pointer.localSmoothY = CURSOR_LOCAL.y;
}
