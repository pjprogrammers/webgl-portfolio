import { DEFAULT_GEOMETRY_MORPH_SCROLL } from "./particleScrollTriggerConfig.js";
import {
  GEOMETRY_POSITION_DEFAULT,
  GEOMETRY_ROTATION_DEFAULT,
  GEOMETRY_SCALE_DEFAULT,
  parseGeometryVec3,
} from "./geometryTransformFromDataset.js";

export function isValidGeometryName(raw) {
  return raw === "diamond" || raw === "adn" || raw === "star";
}

export function hasValidGeometryDataset(el) {
  return isValidGeometryName(el?.dataset?.geometry);
}

function parseBoolean(value) {
  if (value === undefined) return false;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return false;
}

/**
 * Lee ScrollTrigger desde atributos del elemento:
 *   data-geometry="diamond" | "star" | "adn"
 *   data-geometry-scale="1.5" | "1.5,1,1"  (escala xyz; un número → todos los ejes)
 *   data-geometry-position="0.1" | "0,0.2,0"
 *   data-geometry-rotation="45" | "0,90,0"   (grados)
 *   data-geometry-entry-animation="false"  (geo exacta, sin vuelo ni deformación)
 *   data-geometry-scroll-rotation-end-degrees="-720"  (giro Y al footer; opcional)
 *   data-start="top bottom"                (solo en el destino del morph)
 *   data-end="top top"
 *   data-geometry-scrub="0.2"   (opcional)
 *   data-markers="true"         (opcional)
 *
 * Marcadores encadenados: el tramo de morph usa el start/end del destino
 * (p. ej. Hero star estático → Services diamond con scroll de transición).
 */
export function readGeometryScrollFromElement(el) {
  const scrubRaw = el.dataset.geometryScrub;
  const scrub =
    scrubRaw !== undefined
      ? Number(scrubRaw)
      : DEFAULT_GEOMETRY_MORPH_SCROLL.scrub;

  const raw = el.dataset.geometry;
  const target = isValidGeometryName(raw) ? raw : "star";
  const entryRaw = el.dataset.geometryEntryAnimation;
  return {
    target,
    geometryScale: parseGeometryVec3(
      el.dataset.geometryScale,
      GEOMETRY_SCALE_DEFAULT,
    ),
    geometryPosition: parseGeometryVec3(
      el.dataset.geometryPosition,
      GEOMETRY_POSITION_DEFAULT,
    ),
    geometryRotation: parseGeometryVec3(
      el.dataset.geometryRotation,
      GEOMETRY_ROTATION_DEFAULT,
    ),
    entryAnimation: entryRaw === undefined ? true : parseBoolean(entryRaw),
    start: el.dataset.start ?? DEFAULT_GEOMETRY_MORPH_SCROLL.start,
    end: el.dataset.end ?? DEFAULT_GEOMETRY_MORPH_SCROLL.end,
    scrub: Number.isNaN(scrub) ? DEFAULT_GEOMETRY_MORPH_SCROLL.scrub : scrub,
    markers: parseBoolean(el.dataset.markers),
  };
}

export function queryGeometryMorphElements() {
  return document.querySelectorAll("[data-geometry]");
}

/** Marcadores ordenados en el DOM (p. ej. Hero star → Services diamond). */
export function getOrderedGeometryMorphElements() {
  return [...queryGeometryMorphElements()];
}

export function geometryMorphTargetValue(target) {
  return target === "diamond" ? 1 : 0;
}
