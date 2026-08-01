/**
 * Defaults de ScrollTrigger cuando un elemento `data-dissolve` no define start/end/scrub.
 *
 * Sintaxis GSAP: `"bordeElemento bordeViewport"`.
 * Ver comentarios en `particleDissolveScrollFromDataset.js`.
 */

/** `data-dissolve="out"`: esfera → dispersión. */
export const DEFAULT_DISSOLVE_OUT_SCROLL = {
  start: "top bottom",
  end: "top center",
  scrub: 0.2,
};

/** `data-dissolve="in"`: dispersión → formación R (sin geo) o hacia `data-geometry`. */
export const DEFAULT_DISSOLVE_IN_SCROLL = {
  start: "top bottom",
  end: "top top",
  scrub: 0.2,
};

/** `data-geometry`: morph estrella ↔ diamante. */
export const DEFAULT_GEOMETRY_MORPH_SCROLL = {
  start: "top bottom",
  end: "top top",
  scrub: 0.2,
};
