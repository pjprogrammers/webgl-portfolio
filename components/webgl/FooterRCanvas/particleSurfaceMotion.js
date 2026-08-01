/** Base tangente ortonormal a partir de la normal de superficie. */
export function buildTangentBasis(nx, ny, nz) {
  const nLen = Math.hypot(nx, ny, nz) || 1;
  const nnx = nx / nLen;
  const nny = ny / nLen;
  const nnz = nz / nLen;

  let hx = 0;
  let hy = 0;
  let hz = 1;
  if (Math.abs(nnz) > 0.9) {
    hz = 0;
    hy = 1;
  }

  let t1x = nny * hz - nnz * hy;
  let t1y = nnz * hx - nnx * hz;
  let t1z = nnx * hy - nny * hx;
  const t1Len = Math.hypot(t1x, t1y, t1z) || 1;
  t1x /= t1Len;
  t1y /= t1Len;
  t1z /= t1Len;

  const t2x = nny * t1z - nnz * t1y;
  const t2y = nnz * t1x - nnx * t1z;
  const t2z = nnx * t1y - nny * t1x;

  return { t1x, t1y, t1z, t2x, t2y, t2z };
}

/** Desplazamiento en el plano tangente (u, v) en espacio local. */
export function applyTangentOffset(t1x, t1y, t1z, t2x, t2y, t2z, u, v) {
  return {
    x: t1x * u + t2x * v,
    y: t1y * u + t2y * v,
    z: t1z * u + t2z * v,
  };
}

export function anchorSurfacePosition(p, offsetU, offsetV) {
  const d = applyTangentOffset(
    p.anchorT1x,
    p.anchorT1y,
    p.anchorT1z,
    p.anchorT2x,
    p.anchorT2y,
    p.anchorT2z,
    offsetU,
    offsetV,
  );

  return {
    x: p.anchorX + d.x,
    y: p.anchorY + d.y,
    z: p.anchorZ + d.z,
  };
}

export function shapeSurfacePosition(p, offsetU, offsetV) {
  const d = applyTangentOffset(
    p.shapeT1x,
    p.shapeT1y,
    p.shapeT1z,
    p.shapeT2x,
    p.shapeT2y,
    p.shapeT2z,
    offsetU,
    offsetV,
  );

  return {
    x: p.shapeX + d.x,
    y: p.shapeY + d.y,
    z: p.shapeZ + d.z,
  };
}
