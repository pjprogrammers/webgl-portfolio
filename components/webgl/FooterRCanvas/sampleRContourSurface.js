/**
 * Aristas de frontera de un BufferGeometry (solo contorno, no diagonales internas).
 */
function extractBoundarySegments(geometry) {
  const position = geometry.attributes.position;
  const index = geometry.index;
  const edgeUse = new Map();

  const markEdge = (a, b) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    edgeUse.set(key, (edgeUse.get(key) || 0) + 1);
  };

  const triangleCount = index ? index.count / 3 : position.count / 3;

  for (let t = 0; t < triangleCount; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    markEdge(i0, i1);
    markEdge(i1, i2);
    markEdge(i2, i0);
  }

  const getVertex = (i) => ({
    x: position.getX(i),
    y: position.getY(i),
    z: position.getZ(i),
  });

  const segments = [];
  let totalLength = 0;

  for (const [key, use] of edgeUse) {
    if (use !== 1) continue;

    const [ia, ib] = key.split("|").map(Number);
    const a = getVertex(ia);
    const b = getVertex(ib);
    const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    if (len < 1e-10) continue;

    segments.push({ a, b, len });
    totalLength += len;
  }

  return { segments, totalLength };
}

function tangentAlongSegment(a, b, len) {
  const t1x = (b.x - a.x) / len;
  const t1y = (b.y - a.y) / len;
  const t1z = (b.z - a.z) / len;
  const t2x = -t1y;
  const t2y = t1x;
  const t2z = 0;

  return { t1x, t1y, t1z, t2x, t2y, t2z };
}

/**
 * Puntos uniformes sobre el contorno (aristas de frontera) de la R.
 * Misma forma de salida que sampleMeshSurface para anclas de partículas.
 */
export function sampleRContourSurface(geometry, count) {
  const { segments, totalLength } = extractBoundarySegments(geometry);

  if (segments.length === 0 || totalLength <= 0) {
    return [];
  }

  const points = [];

  for (let i = 0; i < count; i++) {
    let pick = Math.random() * totalLength;
    let seg = segments[segments.length - 1];

    for (const candidate of segments) {
      pick -= candidate.len;
      if (pick <= 0) {
        seg = candidate;
        break;
      }
    }

    const t = Math.random();
    const x = seg.a.x + (seg.b.x - seg.a.x) * t;
    const y = seg.a.y + (seg.b.y - seg.a.y) * t;
    const z = seg.a.z + (seg.b.z - seg.a.z) * t;
    const edgeTangent = tangentAlongSegment(seg.a, seg.b, seg.len);

    points.push({
      x,
      y,
      z,
      nx: 0,
      ny: 0,
      nz: 1,
      ...edgeTangent,
    });
  }

  return points;
}
