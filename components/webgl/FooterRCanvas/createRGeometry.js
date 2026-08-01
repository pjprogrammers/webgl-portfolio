import * as THREE from "three";
import { parse as parseFont } from "opentype.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const FONT_URL = "/fonts/RedHatDisplay-BlackItalic.ttf";
const FONT_SIZE = 512;
const TOP_BAR_THICKNESS_RATIO = 0.1;

function flipY(y) {
  return -y;
}

function splitContours(commands) {
  const contours = [];
  let current = [];

  for (const cmd of commands) {
    if (cmd.type === "M" && current.length > 0) {
      contours.push(current);
      current = [cmd];
    } else {
      current.push(cmd);
    }
  }

  if (current.length > 0) contours.push(current);
  return contours;
}

function contourToShape(commands) {
  const shape = new THREE.Shape();

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M":
        shape.moveTo(cmd.x, flipY(cmd.y));
        break;
      case "L":
        shape.lineTo(cmd.x, flipY(cmd.y));
        break;
      case "C":
        shape.bezierCurveTo(
          cmd.x1,
          flipY(cmd.y1),
          cmd.x2,
          flipY(cmd.y2),
          cmd.x,
          flipY(cmd.y),
        );
        break;
      case "Q":
        shape.quadraticCurveTo(cmd.x1, flipY(cmd.y1), cmd.x, flipY(cmd.y));
        break;
      case "Z":
        shape.closePath();
        break;
      default:
        break;
    }
  }

  return shape;
}

function contourToPath(commands) {
  const path = new THREE.Path();

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M":
        path.moveTo(cmd.x, flipY(cmd.y));
        break;
      case "L":
        path.lineTo(cmd.x, flipY(cmd.y));
        break;
      case "C":
        path.bezierCurveTo(
          cmd.x1,
          flipY(cmd.y1),
          cmd.x2,
          flipY(cmd.y2),
          cmd.x,
          flipY(cmd.y),
        );
        break;
      case "Q":
        path.quadraticCurveTo(cmd.x1, flipY(cmd.y1), cmd.x, flipY(cmd.y));
        break;
      case "Z":
        path.closePath();
        break;
      default:
        break;
    }
  }

  return path;
}

function approximateSignedArea(commands) {
  const points = [];

  for (const cmd of commands) {
    if (
      cmd.type === "M" ||
      cmd.type === "L" ||
      cmd.type === "C" ||
      cmd.type === "Q"
    ) {
      points.push({ x: cmd.x, y: cmd.y });
    }
  }

  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }

  return area / 2;
}

function contoursToShape(contours) {
  const ranked = contours
    .map((contour) => ({
      contour,
      area: approximateSignedArea(contour),
    }))
    .sort((a, b) => Math.abs(b.area) - Math.abs(a.area));

  const shape = contourToShape(ranked[0].contour);

  for (let i = 1; i < ranked.length; i++) {
    shape.holes.push(contourToPath(ranked[i].contour));
  }

  return shape;
}

function buildTopBarGeometry(path, contours) {
  const bounds = path.getBoundingBox();
  const ranked = contours
    .map((contour) => ({
      contour,
      area: approximateSignedArea(contour),
    }))
    .sort((a, b) => Math.abs(b.area) - Math.abs(a.area));

  const top = flipY(bounds.y1);
  const bottom = top - (bounds.y2 - bounds.y1) * TOP_BAR_THICKNESS_RATIO;
  const left = bounds.x1;
  const right = bounds.x2;
  const clockwise = Math.sign(-ranked[0].area) < 0;

  const bar = new THREE.Shape();

  if (clockwise) {
    bar.moveTo(left, top);
    bar.lineTo(right, top);
    bar.lineTo(right, bottom);
    bar.lineTo(left, bottom);
  } else {
    bar.moveTo(left, top);
    bar.lineTo(left, bottom);
    bar.lineTo(right, bottom);
    bar.lineTo(right, top);
  }

  bar.closePath();

  return new THREE.ShapeGeometry(bar, 4);
}

function normalizeGeometry(geometry) {
  geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, 1e-6);
  geometry.scale(1 / maxDim, 1 / maxDim, 1);
  geometry.center();
  return geometry;
}

let geometryPromise = null;

/**
 * Builds a filled uppercase "J" from the Red Hat Display font outlines.
 */
export function createRGeometry() {
  if (!geometryPromise) {
    geometryPromise = fetch(FONT_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${FONT_URL}`);
        }
        return response.arrayBuffer();
      })
      .then((buffer) => parseFont(buffer))
      .then((font) => {
        const path = font.getPath("J", 0, 0, FONT_SIZE);
        const contours = splitContours(path.commands);
        const shape = contoursToShape(contours);
        const geometries = [new THREE.ShapeGeometry(shape, 24)];
        geometries.push(buildTopBarGeometry(path, contours));
        return normalizeGeometry(mergeGeometries(geometries));
      });
  }

  return geometryPromise;
}
