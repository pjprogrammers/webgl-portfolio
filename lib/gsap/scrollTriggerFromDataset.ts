import type { ScrollTrigger } from "@/lib/gsap/registerPlugin";

export type ScrollTriggerDatasetDefaults = {
  start?: string;
  end?: string;
  scrub?: number | boolean;
  markers?: boolean;
  toggleActions?: string;
  pin?: boolean;
};

function normalizePosition(value: string, prefix: "top" | "bottom"): string {
  if (value.startsWith("top ") || value.startsWith("bottom ")) return value;
  if (value.includes(" ")) return value;
  return `${prefix} ${value}`;
}

function resolveScrub(
  el: HTMLElement,
  defaultScrub?: number | boolean,
): number | boolean | undefined {
  const { scrub } = el.dataset;

  if (scrub !== undefined) {
    if (scrub === "" || scrub === "false" || scrub === "0") return undefined;
    if (scrub === "true") return true;
    const num = Number(scrub);
    return Number.isNaN(num) ? true : num;
  }

  if (defaultScrub === undefined) return undefined;
  return defaultScrub;
}

function resolveTrigger(el: HTMLElement): Element {
  const selector = el.dataset.trigger?.trim();
  if (!selector) return el;

  return document.querySelector<Element>(selector) ?? el;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

export function scrollTriggerFromDataset(
  el: HTMLElement,
  defaults: ScrollTriggerDatasetDefaults = {},
): ScrollTrigger.Vars {
  const start = normalizePosition(
    el.dataset.start ?? defaults.start ?? "top 90%",
    "top",
  );

  const endRaw = el.dataset.end ?? defaults.end;
  const end = endRaw ? normalizePosition(endRaw, "bottom") : undefined;

  const scrub = resolveScrub(el, defaults.scrub);
  const markers = parseBoolean(el.dataset.markers) ?? defaults.markers ?? false;

  const toggleActions = el.dataset.toggleActions ?? defaults.toggleActions;

  const pin = parseBoolean(el.dataset.pin) ?? defaults.pin;

  const config: ScrollTrigger.Vars = {
    trigger: resolveTrigger(el),
    start,
    markers,
  };

  if (end) config.end = end;
  if (scrub !== undefined) config.scrub = scrub;
  if (toggleActions) config.toggleActions = toggleActions;
  if (pin) config.pin = true;

  const pinSpacing = parseBoolean(el.dataset.pinSpacing);
  if (pinSpacing !== undefined) config.pinSpacing = pinSpacing;

  if (el.dataset.scroller) {
    const scroller = document.querySelector(el.dataset.scroller);
    if (scroller) config.scroller = scroller;
  }

  return config;
}
