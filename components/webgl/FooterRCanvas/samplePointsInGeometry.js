import { buildGeometryTriangles } from "./geometryTriangles.js";

/**
 * Uniform random samples inside a triangulated BufferGeometry (2D xy).
 */
export function samplePointsInGeometry(geometry, count, prebuilt = null) {
  const { triangles, totalArea } = prebuilt ?? buildGeometryTriangles(geometry);

  if (triangles.length === 0 || totalArea <= 0) {
    return [];
  }

  const points = [];

  for (let i = 0; i < count; i++) {
    let pick = Math.random() * totalArea;
    let tri = triangles[triangles.length - 1];

    for (const candidate of triangles) {
      pick -= candidate.area;
      if (pick <= 0) {
        tri = candidate;
        break;
      }
    }

    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }

    const { a, b, c } = tri;
    points.push({
      x: a.x + u * (b.x - a.x) + v * (c.x - a.x),
      y: a.y + u * (b.y - a.y) + v * (c.y - a.y),
    });
  }

  return points;
}
