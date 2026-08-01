import { useGlobalStore } from "@/stores/global-store";

type WheelListener = (event: WheelEvent) => void;

const listeners = new Set<WheelListener>();
let initialized = false;

function onWheel(event: WheelEvent) {
  const target = event.target as Element | null;
  const isInsidePrevented = target?.closest?.("[data-lenis-prevent]") != null;

  if (!isInsidePrevented) {
    useGlobalStore.getState().closeContactFormIfOpen();
  }

  for (const listener of listeners) {
    listener(event);
  }
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  window.addEventListener("wheel", onWheel, { passive: true });
  initialized = true;
}

/** Mount once at app root so wheel-driven UI (e.g. contact panel) stays in sync. */
export function initGlobalWheelInput() {
  ensureInitialized();
}

export function subscribeWheel(listener: WheelListener) {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
