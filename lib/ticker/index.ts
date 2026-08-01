import { gsap } from "@/lib/gsap/registerPlugin";
import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";

export type TickerFrame = {
  /** GSAP ticker time in seconds — use for R3F advance() */
  timeSec: number;
  /** Wall-clock ms — use for Lenis raf() */
  timeMs: number;
  /** Delta since last tick in ms */
  deltaMs: number;
};

export type TickerCallback = (frame: TickerFrame) => void;

const callbacks = new Set<TickerCallback>();
let started = false;
let pageVisible =
  typeof document === "undefined" || document.visibilityState === "visible";

let gsapTickerConfigured = false;

function configureGsapTicker() {
  if (gsapTickerConfigured) return;
  gsapTickerConfigured = true;

  gsap.ticker.lagSmoothing(0);

  const { maxFps } = getGraphicsProfile();
  gsap.ticker.fps(maxFps > 0 ? maxFps : -1);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    pageVisible = document.visibilityState === "visible";
    if (pageVisible) {
      gsap.ticker.wake();
    }
  });
}

export function isPageVisible() {
  return pageVisible;
}

function onTick(timeSec: number, deltaMs: number) {
  if (!pageVisible) return;

  const frame: TickerFrame = {
    timeSec,
    timeMs: timeSec * 1000,
    deltaMs,
  };

  for (const callback of callbacks) {
    callback(frame);
  }
}

export function registerTickerCallback(callback: TickerCallback) {
  configureGsapTicker();
  callbacks.add(callback);

  if (!started) {
    gsap.ticker.add(onTick);
    started = true;
  }

  return () => {
    callbacks.delete(callback);
    if (callbacks.size === 0 && started) {
      gsap.ticker.remove(onTick);
      started = false;
    }
  };
}
