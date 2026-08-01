import {
  GEOMETRY_SCROLL_ROTATION_END_DEGREES,
  GEOMETRY_SCROLL_ROTATION_SCROLL_START,
  GEOMETRY_SCROLL_ROTATION_SCRUB,
  GEOMETRY_SCROLL_ROTATION_START_DEGREES,
} from "./footerRConfig.js";
import {
  getOrderedGeometryMorphElements,
  hasValidGeometryDataset,
} from "./particleGeometryScrollFromDataset.js";
import {
  queryDissolveElements,
  readDissolveScrollFromElement,
  readGeometryDissolveInScroll,
} from "./particleDissolveScrollFromDataset.js";
import { particleScrollState } from "./particleScrollState.js";
import { gsap } from "@/lib/gsap/registerPlugin";

const DEG_TO_RAD = Math.PI / 180;

export const GEOMETRY_SCROLL_ROTATION_Y_START =
  GEOMETRY_SCROLL_ROTATION_START_DEGREES * DEG_TO_RAD;

export const GEOMETRY_SCROLL_ROTATION_Y_END =
  GEOMETRY_SCROLL_ROTATION_END_DEGREES * DEG_TO_RAD;

/**
 * Grados finales de rotación Y por scroll para la página activa.
 * `data-geometry-scroll-rotation-end-degrees` en cualquier elemento del DOM;
 * si no existe, usa `GEOMETRY_SCROLL_ROTATION_END_DEGREES` de footerRConfig.
 */
function readGeometryScrollRotationEndDegrees() {
  const el = document.querySelector(
    "[data-geometry-scroll-rotation-end-degrees]",
  );
  if (!el) return GEOMETRY_SCROLL_ROTATION_END_DEGREES;

  const raw = el.dataset.geometryScrollRotationEndDegrees;
  if (raw === undefined || raw === "") return GEOMETRY_SCROLL_ROTATION_END_DEGREES;

  const parsed = Number(raw);
  return Number.isFinite(parsed)
    ? parsed
    : GEOMETRY_SCROLL_ROTATION_END_DEGREES;
}

function geometryScrollRotationEndRadians() {
  return readGeometryScrollRotationEndDegrees() * DEG_TO_RAD;
}

/**
 * Fin del tramo de rotación por scroll: cubre todo el body con geometrías
 * (incl. dissolve-in) y termina al iniciar la formación de la R en el footer.
 */
function resolveGeometryScrollRotationEnd(geometryEls) {
  const footerDissolveInEls = [...queryDissolveElements("in")].filter(
    (el) => !hasValidGeometryDataset(el),
  );

  if (footerDissolveInEls.length > 0) {
    const footerEl = footerDissolveInEls[0];
    const scroll = readDissolveScrollFromElement(footerEl, "in");
    return { endEl: footerEl, end: scroll.start };
  }

  const geometryDissolveInEls = [...queryDissolveElements("in")].filter((el) =>
    hasValidGeometryDataset(el),
  );

  if (geometryDissolveInEls.length > 0) {
    const lastInEl = geometryDissolveInEls[geometryDissolveInEls.length - 1];
    const scroll = readGeometryDissolveInScroll(lastInEl);
    return { endEl: lastInEl, end: scroll.end };
  }

  const dissolveOutEls = queryDissolveElements("out");
  if (dissolveOutEls.length > 0) {
    const outEl = dissolveOutEls[0];
    const scroll = readDissolveScrollFromElement(outEl, "out");
    return { endEl: outEl, end: scroll.end };
  }

  return {
    endEl: geometryEls[geometryEls.length - 1],
    end: "bottom top",
  };
}

export function setupGeometryScrollRotationTrigger() {
  const geometryEls = getOrderedGeometryMorphElements();
  if (geometryEls.length === 0) return;

  const firstEl = geometryEls[0];
  const { endEl, end } = resolveGeometryScrollRotationEnd(geometryEls);

  gsap.fromTo(
    particleScrollState,
    { geometryScrollRotationY: GEOMETRY_SCROLL_ROTATION_Y_START },
    {
      geometryScrollRotationY: geometryScrollRotationEndRadians(),
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger: firstEl,
        start: GEOMETRY_SCROLL_ROTATION_SCROLL_START,
        endTrigger: endEl,
        end,
        scrub: GEOMETRY_SCROLL_ROTATION_SCRUB,
        invalidateOnRefresh: true,
      },
    },
  );
}
