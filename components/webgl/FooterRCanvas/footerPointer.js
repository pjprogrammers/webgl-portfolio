export function createFooterPointer() {
  return {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    localSmoothX: 0,
    localSmoothY: 0,
    prevSmoothX: 0,
    prevSmoothY: 0,
    speed: 0,
    active: false,
    engagement: 0,
  };
}

export function updateFooterPointerFromClient(
  pointer,
  clientX,
  clientY,
  container,
  width,
  height,
) {
  if (!container) {
    pointer.active = false;
    return;
  }

  const rect = container.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const inside =
    localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height;

  pointer.active = inside;

  if (!inside) return;

  pointer.x = localX - width / 2;
  pointer.y = -(localY - height / 2);
}

export function updateFooterPointerSmooth(pointer, delta) {
  const dt = Math.min(Math.max(delta, 0.001), 0.05);
  const follow = 1 - Math.exp(-16 * dt);
  const targetEngagement = pointer.active ? 1 : 0;
  const engage = 1 - Math.exp(-10 * dt);

  if (pointer.active) {
    pointer.smoothX += (pointer.x - pointer.smoothX) * follow;
    pointer.smoothY += (pointer.y - pointer.smoothY) * follow;
  }

  const dx = pointer.smoothX - pointer.prevSmoothX;
  const dy = pointer.smoothY - pointer.prevSmoothY;
  const instantSpeed = Math.hypot(dx, dy) / dt;
  const speedBlend = 1 - Math.exp(-14 * dt);

  pointer.speed += (instantSpeed - pointer.speed) * speedBlend;
  pointer.prevSmoothX = pointer.smoothX;
  pointer.prevSmoothY = pointer.smoothY;
  pointer.engagement += (targetEngagement - pointer.engagement) * engage;
}
