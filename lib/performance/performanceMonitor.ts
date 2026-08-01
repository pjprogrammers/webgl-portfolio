import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import { isPageVisible, registerTickerCallback } from "@/lib/ticker";

export type PerformanceSnapshot = {
  fps: number;
  frameMs: number;
  gsapDeltaMs: number;
  pageVisible: boolean;
  r3fConsumers: number;
  canvasCount: number;
  webglRenderer: string | null;
  memoryUsedMb: number | null;
  memoryTotalMb: number | null;
  deviceMemoryGb: number | null;
  hardwareConcurrency: number | null;
  devicePixelRatio: number;
  graphicsTier: string;
  graphicsDpr: number;
  particleCount: number;
  shaderParticleCount: number;
  enableBloom: boolean;
  fboScale: number;
  maxFps: number;
};

type Listener = () => void;

const FPS_SAMPLE_SIZE = 30;

let started = false;
let unregisterTicker: (() => void) | null = null;
const listeners = new Set<Listener>();

let frameTimes: number[] = [];
let lastSampleMs = 0;
let lastStaticSampleMs = 0;
let gsapDeltaMs = 0;
let r3fConsumers = 0;
let cachedCanvasCount = 0;
let cachedWebglRenderer: string | null = null;

const emptySnapshot: PerformanceSnapshot = {
  fps: 0,
  frameMs: 0,
  gsapDeltaMs: 0,
  pageVisible: true,
  r3fConsumers: 0,
  canvasCount: 0,
  webglRenderer: null,
  memoryUsedMb: null,
  memoryTotalMb: null,
  deviceMemoryGb: null,
  hardwareConcurrency: null,
  devicePixelRatio: 1,
  graphicsTier: "high",
  graphicsDpr: 2,
  particleCount: 0,
  shaderParticleCount: 0,
  enableBloom: true,
  fboScale: 1,
  maxFps: 0,
};

let snapshot: PerformanceSnapshot = { ...emptySnapshot };

function readMemoryMb() {
  const memory = (
    performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    }
  ).memory;

  if (!memory) {
    return { usedMb: null, totalMb: null };
  }

  return {
    usedMb: memory.usedJSHeapSize / (1024 * 1024),
    totalMb: memory.totalJSHeapSize / (1024 * 1024),
  };
}

function readWebglRenderer() {
  if (typeof document === "undefined") return null;

  for (const canvas of document.querySelectorAll("canvas")) {
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) continue;

    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "WebGL (renderer oculto)";

    return context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
  }

  return null;
}

function refreshStaticMetrics(timeMs: number) {
  if (timeMs - lastStaticSampleMs < 1000) return;
  lastStaticSampleMs = timeMs;

  cachedCanvasCount =
    typeof document === "undefined"
      ? 0
      : document.querySelectorAll("canvas").length;
  cachedWebglRenderer = readWebglRenderer();
}

function buildSnapshot(fps: number, timeMs: number): PerformanceSnapshot {
  refreshStaticMetrics(timeMs);

  const profile = getGraphicsProfile();
  const { usedMb, totalMb } = readMemoryMb();
  const nav = navigator as Navigator & { deviceMemory?: number };

  return {
    fps,
    frameMs: fps > 0 ? 1000 / fps : 0,
    gsapDeltaMs,
    pageVisible: isPageVisible(),
    r3fConsumers,
    canvasCount: cachedCanvasCount,
    webglRenderer: cachedWebglRenderer,
    memoryUsedMb: usedMb,
    memoryTotalMb: totalMb,
    deviceMemoryGb:
      typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    hardwareConcurrency:
      typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : null,
    devicePixelRatio:
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    graphicsTier: profile.tier,
    graphicsDpr: profile.dpr,
    particleCount: profile.particleCount,
    shaderParticleCount: profile.shaderParticleCount,
    enableBloom: profile.enableBloom,
    fboScale: profile.fboScale,
    maxFps: profile.maxFps,
  };
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function onTick({ timeMs, deltaMs }: { timeMs: number; deltaMs: number }) {
  gsapDeltaMs = deltaMs;

  if (timeMs - lastSampleMs < 16) return;
  lastSampleMs = timeMs;

  frameTimes.push(deltaMs);
  if (frameTimes.length > FPS_SAMPLE_SIZE) {
    frameTimes = frameTimes.slice(-FPS_SAMPLE_SIZE);
  }

  const avgDelta =
    frameTimes.reduce((sum, value) => sum + value, 0) / frameTimes.length;
  const fps = avgDelta > 0 ? Math.round(1000 / avgDelta) : 0;

  snapshot = buildSnapshot(fps, timeMs);
  notifyListeners();
}

function ensureStarted() {
  if (started) return;
  started = true;
  unregisterTicker = registerTickerCallback(onTick);
  snapshot = buildSnapshot(0, performance.now());
}

function ensureStopped() {
  if (!started || listeners.size > 0) return;
  unregisterTicker?.();
  unregisterTicker = null;
  started = false;
  frameTimes = [];
  snapshot = { ...emptySnapshot };
}

export function setR3FConsumerCount(count: number) {
  r3fConsumers = count;
  if (started) {
    snapshot = { ...snapshot, r3fConsumers };
    notifyListeners();
  }
}

export function getPerformanceSnapshot() {
  return snapshot;
}

export function subscribePerformanceMonitor(listener: Listener) {
  ensureStarted();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    ensureStopped();
  };
}

export function isPerformanceViewerEnabled() {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "development") return true;
  return new URLSearchParams(window.location.search).has("perf");
}
