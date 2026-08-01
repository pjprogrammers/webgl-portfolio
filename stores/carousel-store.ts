import { create } from 'zustand';
import type { CarouselStore } from './carousel-store.types';

export { getHoverSlideId } from './carousel-store.types';

export const useCarouselStore = create<CarouselStore>((set, get) => ({
  currentSlideId: null,
  pendingSlideId: undefined,
  centeredSlideId: null,
  requestSlideSelection: (id) => {
    const { currentSlideId, pendingSlideId } = get();
    if (pendingSlideId === id) return;
    if (pendingSlideId === undefined && currentSlideId === id) return;
    set({ pendingSlideId: id });
  },
  commitCurrentSlideId: () => {
    const { pendingSlideId } = get();
    if (pendingSlideId === undefined) return;
    set({ currentSlideId: pendingSlideId });
  },
  completeSlideTransition: () => {
    const { pendingSlideId } = get();
    if (pendingSlideId === undefined) return;
    set({ pendingSlideId: undefined });
  },
  setCenteredSlideId: (id) => set({ centeredSlideId: id }),
}));
