function pointInTriangle(px, py, a, b, c) {
  const d1 = (px - b.x) * (a.y - b.y) - (a.x - b.x) * (py - b.y);
  const d2 = (px - c.x) * (b.y - c.y) - (b.x - c.x) * (py - c.y);
  const d3 = (px - a.x) * (c.y - a.y) - (c.x - a.x) * (py - a.y);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

/**
 * Triángulos 2D (xy) de un BufferGeometry para tests de inclusión y muestreo.
 */
export function buildGeometryTriangles(geometry) {
  const position = geometry.attributes.position;
  const index = geometry.index;
  const triangles = [];
  let totalArea = 0;

  const getVertex = (i) => ({
    x: position.getX(i),
    y: position.getY(i),
  });

  const triangleCount = index ? index.count / 3 : position.count / 3;

  for (let t = 0; t < triangleCount; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    const a = getVertex(i0);
    const b = getVertex(i1);
    const c = getVertex(i2);
    const area =
      Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) * 0.5;

    if (area <= 1e-10) continue;

    totalArea += area;
    triangles.push({ a, b, c, area });
  }

  return { triangles, totalArea };
}

export function isPointInsideGeometry(x, y, triangles) {
  for (const tri of triangles) {
    if (pointInTriangle(x, y, tri.a, tri.b, tri.c)) {
      return true;
    }
  }
  return false;
}
