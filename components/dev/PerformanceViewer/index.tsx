"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getPerformanceSnapshot,
  isPerformanceViewerEnabled,
  subscribePerformanceMonitor,
} from "@/lib/performance/performanceMonitor";
import { formatFpsClass, formatMb } from "./formatMetric";

function MetricRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-white/45">{label}</span>
      <span
        className={`font-mono text-[11px] ${valueClassName ?? "text-white/85"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 border-t border-white/10 pt-2 text-[10px] font-semibold tracking-[0.14em] text-white/35 uppercase">
      {children}
    </p>
  );
}

export function PerformanceViewer() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setEnabled(isPerformanceViewerEnabled());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "p" && event.shiftKey) {
        event.preventDefault();
        setCollapsed((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  const snapshot = useSyncExternalStore(
    subscribePerformanceMonitor,
    getPerformanceSnapshot,
    getPerformanceSnapshot,
  );

  if (!enabled) return null;

  return (
    <div
      className="hidden tablet-landscape:block pointer-events-auto fixed right-3 bottom-3 z-9999 w-[min(100vw-1.5rem,22rem)] font-mono text-[11px] leading-relaxed text-white/80"
      aria-live="polite"
      aria-label="Visor de rendimiento"
    >
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-[10px] tracking-[0.12em] text-white/55 uppercase hover:bg-white/5"
        >
          <span>Performance</span>
          <span>{collapsed ? "▸" : "▾"}</span>
        </button>

        {!collapsed ? (
          <div className="space-y-1 px-3 pb-3">
            <MetricRow
              label="FPS"
              value={`${snapshot.fps}`}
              valueClassName={formatFpsClass(snapshot.fps)}
            />
            <MetricRow
              label="Frame"
              value={`${snapshot.frameMs.toFixed(1)} ms`}
            />
            <MetricRow
              label="GSAP Δ"
              value={`${snapshot.gsapDeltaMs.toFixed(1)} ms`}
            />
            <MetricRow
              label="Visible"
              value={snapshot.pageVisible ? "sí" : "no"}
            />

            <SectionTitle>Memoria</SectionTitle>
            <MetricRow
              label="JS heap"
              value={`${formatMb(snapshot.memoryUsedMb)} / ${formatMb(snapshot.memoryTotalMb)}`}
            />
            <MetricRow
              label="Device RAM"
              value={
                snapshot.deviceMemoryGb !== null
                  ? `${snapshot.deviceMemoryGb} GB`
                  : "—"
              }
            />
            <MetricRow
              label="CPU cores"
              value={
                snapshot.hardwareConcurrency !== null
                  ? `${snapshot.hardwareConcurrency}`
                  : "—"
              }
            />

            <SectionTitle>WebGL</SectionTitle>
            <MetricRow
              label="Tier"
              value={`${snapshot.graphicsTier} (dpr ${snapshot.graphicsDpr})`}
            />
            <MetricRow
              label="Partículas"
              value={`${snapshot.particleCount} + ${snapshot.shaderParticleCount}`}
            />
            <MetricRow
              label="Bloom / FBO"
              value={`${snapshot.enableBloom ? "on" : "off"} / ${snapshot.fboScale}`}
            />
            <MetricRow
              label="Cap FPS"
              value={snapshot.maxFps > 0 ? `${snapshot.maxFps}` : "sin límite"}
            />
            <MetricRow
              label="Canvases"
              value={`${snapshot.canvasCount} (R3F ${snapshot.r3fConsumers})`}
            />
            <MetricRow
              label="DPR real"
              value={`${snapshot.devicePixelRatio}`}
            />
            {snapshot.webglRenderer ? (
              <p className="pt-1 text-[10px] leading-snug text-white/40">
                {snapshot.webglRenderer}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-1 px-1 text-[10px] text-white/30">
        Shift+P para {collapsed ? "expandir" : "colapsar"}
      </p>
    </div>
  );
}
