function triangleArea3(ax, ay, az, bx, by, bz, cx, cy, cz) {
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const acx = cx - ax;
  const acy = cy - ay;
  const acz = cz - az;
  const cxp = aby * acz - abz * acy;
  const cyp = abz * acx - abx * acz;
  const czp = abx * acy - aby * acx;
  return 0.5 * Math.hypot(cxp, cyp, czp);
}

export function buildIndexedTriangleCache(positions, indices) {
  const triangles = [];
  let totalArea = 0;
  const triCount = indices.length / 3;

  for (let t = 0; t < triCount; t++) {
    const i0 = indices[t * 3];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];
    const i0x = i0 * 3;
    const i1x = i1 * 3;
    const i2x = i2 * 3;
    const area = triangleArea3(
      positions[i0x],
      positions[i0x + 1],
      positions[i0x + 2],
      positions[i1x],
      positions[i1x + 1],
      positions[i1x + 2],
      positions[i2x],
      positions[i2x + 1],
      positions[i2x + 2],
    );

    if (area <= 1e-10) continue;

    totalArea += area;
    triangles.push({ i0, i1, i2, area });
  }

  return { triangles, totalArea };
}

export function pickWeightedTriangle(triangles, totalArea) {
  let pick = Math.random() * totalArea;
  let tri = triangles[triangles.length - 1];

  for (const candidate of triangles) {
    pick -= candidate.area;
    if (pick <= 0) {
      tri = candidate;
      break;
    }
  }

  return tri;
}

export function randomBarycentric() {
  let u = Math.random();
  let v = Math.random();

  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }

  return { u, v };
}
