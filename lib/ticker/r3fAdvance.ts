import { advance } from "@react-three/fiber";

import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import { setR3FConsumerCount } from "@/lib/performance/performanceMonitor";

import { isPageVisible, registerTickerCallback } from "./index";

let consumerCount = 0;
let unregister: (() => void) | null = null;
let lastAdvanceMs = 0;

function onR3FTick({ timeSec, timeMs }: { timeSec: number; timeMs: number }) {
  if (!isPageVisible()) return;

  const { maxFps } = getGraphicsProfile();
  if (maxFps > 0) {
    const minFrameMs = 1000 / maxFps;
    if (timeMs - lastAdvanceMs < minFrameMs) return;
    lastAdvanceMs = timeMs;
  }

  advance(timeSec);
}

/** Registra un consumidor WebGL. `advance()` se llama una sola vez por tick del GSAP ticker. */
export function registerR3FAdvance() {
  consumerCount += 1;
  setR3FConsumerCount(consumerCount);

  if (!unregister) {
    unregister = registerTickerCallback(onR3FTick);
  }

  return () => {
    consumerCount -= 1;
    setR3FConsumerCount(Math.max(consumerCount, 0));
    if (consumerCount <= 0 && unregister) {
      unregister();
      unregister = null;
      consumerCount = 0;
      lastAdvanceMs = 0;
      setR3FConsumerCount(0);
    }
  };
}
