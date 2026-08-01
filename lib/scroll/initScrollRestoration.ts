/** Desactiva la restauración automática del scroll del navegador (refresh, back/forward). */
export function initScrollRestoration() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}
