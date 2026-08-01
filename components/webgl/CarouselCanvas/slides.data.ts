import { works } from '@/components/organisms/SelectedWorks/works';

export type HoverType = 'image' | 'video';

export interface SlideData {
  id: string;
  imageUrl: string;
  hoverTexture: string;
  hoverType: HoverType;
  client: string;
  services: string[];
  projectUrl: string;
}

export function formatSlideId(index: number): string {
  const oneBased = index + 1;
  return `slide-${oneBased <= 9 ? `0${oneBased}` : oneBased}`;
}

export const SLIDES: SlideData[] = works.map((work, index) => ({
  id: formatSlideId(index),
  imageUrl: work.image,
  hoverTexture: work.activeMedia,
  hoverType: work.type,
  client: work.name,
  services: work.services,
  projectUrl: work.link,
}));
