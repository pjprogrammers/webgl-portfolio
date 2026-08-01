import {
  DEFAULT_DISSOLVE_IN_SCROLL,
  DEFAULT_DISSOLVE_OUT_SCROLL,
} from "./particleScrollTriggerConfig.js";

/**
 * Lee ScrollTrigger desde atributos del elemento:
 *   data-dissolve="out" | "in"
 *   Con "in" + `data-geometry`: dissolve hacia esa geo usando `data-start`/`data-end`
 *     (fallback: `data-dissolve-start`/`data-dissolve-end`).
 *   Con "in" sin geometría: formación R con `data-dissolve-start`/`data-dissolve-end`.
 *   data-dissolve-scrub="0.6"   (opcional)
 *   data-markers="true"         (opcional, debug start/end)
 */
function parseBoolean(value) {
  if (value === undefined) return false;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return false;
}

export function readDissolveScrollFromElement(el, type) {
  const defaults =
    type === "out" ? DEFAULT_DISSOLVE_OUT_SCROLL : DEFAULT_DISSOLVE_IN_SCROLL;
  const scrubRaw = el.dataset.dissolveScrub;
  const scrub = scrubRaw !== undefined ? Number(scrubRaw) : defaults.scrub;

  return {
    start: el.dataset.dissolveStart ?? defaults.start,
    end: el.dataset.dissolveEnd ?? defaults.end,
    scrub: Number.isNaN(scrub) ? defaults.scrub : scrub,
    markers: parseBoolean(el.dataset.markers),
  };
}

/**
 * Scroll de dissolve-in con geometría: prioriza `data-start`/`data-end`
 * (mismos que el morph), con fallback a `data-dissolve-start`/`data-dissolve-end`.
 */
export function readGeometryDissolveInScroll(el) {
  const dissolveScroll = readDissolveScrollFromElement(el, "in");
  const scrubRaw = el.dataset.dissolveScrub ?? el.dataset.geometryScrub;
  const scrub =
    scrubRaw !== undefined ? Number(scrubRaw) : dissolveScroll.scrub;

  return {
    start: el.dataset.start ?? dissolveScroll.start,
    end: el.dataset.end ?? dissolveScroll.end,
    scrub: Number.isNaN(scrub) ? dissolveScroll.scrub : scrub,
    markers: dissolveScroll.markers,
  };
}

export function queryDissolveElements(type) {
  return document.querySelectorAll(`[data-dissolve="${type}"]`);
}
