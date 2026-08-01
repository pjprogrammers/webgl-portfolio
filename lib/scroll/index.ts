import { useScrollStore } from "@/stores/scroll-store";

export { resetScrollToTop } from "./resetScrollToTop";
export { initScrollRestoration } from "./initScrollRestoration";

export function stopScroll() {
  useScrollStore.getState().stopScroll();
}

export function startScroll() {
  useScrollStore.getState().startScroll();
}

export function setScrollEnabled(enabled: boolean) {
  useScrollStore.getState().setScrollEnabled(enabled);
}
