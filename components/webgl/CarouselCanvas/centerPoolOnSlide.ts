import type * as THREE from "three";
import { CAROUSEL_CONFIG } from "@/config/carousel.config";
import {
  assignHoverTexture,
  type HoverTextureBindings,
} from "./carouselHoverTexture";
import { SLIDES } from "./slides.data";

export type CenterPoolSlot = HoverTextureBindings & {
  mesh: THREE.Mesh;
  uniforms: HoverTextureBindings["uniforms"] & {
    uImageTexture: THREE.IUniform;
    uImageCover: THREE.IUniform<THREE.Vector4>;
    uProgress: THREE.IUniform<number>;
  };
  dataIndex: number;
  isShowingHover: boolean;
};

export function centerPoolOnSlide<T extends CenterPoolSlot>(
  pool: T[],
  slideId: string,
  textureMap: Map<string, THREE.Texture>,
  hoverImageMap: Map<string, THREE.Texture>,
  applyImageCover: (slot: T, tex: THREE.Texture) => void,
  resetSlotHoverState: (slot: T) => void,
): number {
  const targetIndex = SLIDES.findIndex((slide) => slide.id === slideId);
  if (targetIndex < 0) return -1;

  const half = Math.floor(CAROUSEL_CONFIG.VISIBLE_SLIDES / 2);

  for (let i = 0; i < pool.length; i++) {
    const dataIndex =
      (((targetIndex + (i - half)) % SLIDES.length) + SLIDES.length) %
      SLIDES.length;
    const slot = pool[i];
    slot.dataIndex = dataIndex;
    const slide = SLIDES[dataIndex];
    slot.mesh.userData.slideId = slide.id;

    const tex = textureMap.get(slide.id);
    if (tex) {
      slot.uniforms.uImageTexture.value = tex;
      applyImageCover(slot, tex);
    }

    resetSlotHoverState(slot);
    assignHoverTexture(slot, slide, hoverImageMap);
  }

  return half;
}
