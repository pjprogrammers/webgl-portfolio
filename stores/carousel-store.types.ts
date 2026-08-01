export type CarouselStore = {
  /** Committed slide — drives visible text content. */
  currentSlideId: string | null;
  /** Slide queued on click; drives hover texture immediately. undefined = idle. */
  pendingSlideId: string | null | undefined;
  centeredSlideId: string | null;
  requestSlideSelection: (id: string | null) => void;
  /** Promote pending → current after text exit (before enter). */
  commitCurrentSlideId: () => void;
  /** Clear pending after text enter completes. */
  completeSlideTransition: () => void;
  setCenteredSlideId: (id: string | null) => void;
};

export function getHoverSlideId(state: CarouselStore): string | null {
  return state.pendingSlideId !== undefined
    ? state.pendingSlideId
    : state.currentSlideId;
}
