import { DEFAULT_WHITE_SHADER_SCROLL } from "./whiteShaderScrollTriggerConfig.js";

function parseBoolean(value) {
  if (value === undefined) return false;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return false;
}

/** @returns {HTMLElement[]} */
export function queryWhiteShaderElements() {
  return /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll("[data-white-shader]"))
  );
}

export function readWhiteShaderScrollFromElement(el) {
  const scrubRaw = el.dataset.whiteShaderScrub;
  const scrub =
    scrubRaw !== undefined
      ? Number(scrubRaw)
      : DEFAULT_WHITE_SHADER_SCROLL.scrub;

  return {
    start: el.dataset.whiteShaderStart ?? DEFAULT_WHITE_SHADER_SCROLL.start,
    end: el.dataset.whiteShaderEnd ?? DEFAULT_WHITE_SHADER_SCROLL.end,
    scrub: Number.isNaN(scrub) ? DEFAULT_WHITE_SHADER_SCROLL.scrub : scrub,
    markers: parseBoolean(el.dataset.markers),
  };
}

const MAX_BANDS = 3;

/**
 * Intersección viewport ↔ secciones `data-white-shader`.
 * softTop/softBottom: dissolve con noise solo si el borde real del elemento está en pantalla.
 */
export function mergeVisibleWhiteShaderBands(elements, viewportHeight) {
  const bands = [];

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const top = Math.max(0, rect.top);
    const bottom = Math.min(viewportHeight, rect.bottom);
    if (bottom <= top) continue;

    bands.push({
      top,
      bottom,
      softTop: rect.top > 0,
      softBottom: rect.bottom < viewportHeight,
    });
  }

  if (bands.length === 0) return [];

  bands.sort((a, b) => a.top - b.top);

  const merged = [{ ...bands[0] }];
  for (let i = 1; i < bands.length; i++) {
    const band = bands[i];
    const last = merged[merged.length - 1];

    if (band.top <= last.bottom) {
      if (band.bottom > last.bottom) {
        last.bottom = band.bottom;
        last.softBottom = band.softBottom;
      }
    } else {
      merged.push({ ...band });
    }
  }

  return merged.slice(0, MAX_BANDS);
}

export function applyWhiteShaderBands(state, bands) {
  state.bandCount = bands.length;

  for (let i = 0; i < state.bands.length; i++) {
    const band = bands[i];
    if (band) {
      state.bands[i].top = band.top;
      state.bands[i].bottom = band.bottom;
    } else {
      state.bands[i].top = 0;
      state.bands[i].bottom = 0;
    }
  }
}
