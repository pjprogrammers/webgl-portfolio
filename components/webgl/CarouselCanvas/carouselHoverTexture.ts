import * as THREE from 'three';
import { CAROUSEL_CONFIG } from '@/config/carousel.config';
import type { SlideData } from './slides.data';
import { computeTextureCoverTransform, coverToVec4 } from './textureCover';

export interface HoverTextureBindings {
  uniforms: {
    uVideoTexture: THREE.IUniform;
    uVideoCover: THREE.IUniform<THREE.Vector4>;
  };
  videoElement: HTMLVideoElement | null;
  videoTexture: THREE.Texture;
  hoverType: SlideData['hoverType'];
  unbindVideoCover?: () => void;
}

function createVideoElement(src: string): HTMLVideoElement {
  const video = document.createElement('video');
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.crossOrigin = 'anonymous';
  return video;
}

function applyHoverImageCover(
  videoCoverUniform: THREE.IUniform<THREE.Vector4>,
  tex: THREE.Texture,
) {
  const image = tex.image as
    | HTMLImageElement
    | { width: number; height: number };
  const cover = computeTextureCoverTransform(
    image.width,
    image.height,
    CAROUSEL_CONFIG.SLIDE_ASPECT_RATIO,
  );
  videoCoverUniform.value.fromArray(coverToVec4(cover));
}

function applyVideoCover(
  slot: HoverTextureBindings,
  video: HTMLVideoElement,
) {
  const cover = computeTextureCoverTransform(
    video.videoWidth,
    video.videoHeight,
    CAROUSEL_CONFIG.SLIDE_ASPECT_RATIO,
  );
  slot.uniforms.uVideoCover.value.fromArray(coverToVec4(cover));
}

function bindVideoCover(slot: HoverTextureBindings) {
  const video = slot.videoElement;
  if (!video) return undefined;

  const onMetadata = () => applyVideoCover(slot, video);
  video.addEventListener('loadedmetadata', onMetadata);
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    onMetadata();
  }
  return () => video.removeEventListener('loadedmetadata', onMetadata);
}

export function loadHoverImageTextures(
  slides: SlideData[],
  map: Map<string, THREE.Texture>,
  onLoaded: (slideId: string, tex: THREE.Texture) => void,
) {
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';

  slides.forEach((slide) => {
    if (slide.hoverType !== 'image') return;

    loader.load(slide.hoverTexture, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      map.set(slide.id, tex);
      onLoaded(slide.id, tex);
    });
  });
}

export function createInitialHoverTexture(
  slide: SlideData,
  hoverImageMap: Map<string, THREE.Texture>,
): HoverTextureBindings {
  if (slide.hoverType === 'video') {
    const videoElement = createVideoElement(slide.hoverTexture);
    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    const bindings: HoverTextureBindings = {
      uniforms: {
        uVideoTexture: { value: videoTexture },
        uVideoCover: {
          value: new THREE.Vector4(1, 1, 0, 0),
        },
      },
      videoElement,
      videoTexture,
      hoverType: slide.hoverType,
    };
    bindings.unbindVideoCover = bindVideoCover(bindings);
    return bindings;
  }

  const hoverTex = hoverImageMap.get(slide.id) ?? new THREE.Texture();
  const bindings: HoverTextureBindings = {
    uniforms: {
      uVideoTexture: { value: hoverTex },
      uVideoCover: {
        value: new THREE.Vector4(1, 1, 0, 0),
      },
    },
    videoElement: null,
    videoTexture: hoverTex,
    hoverType: slide.hoverType,
  };

  if (hoverImageMap.has(slide.id)) {
    applyHoverImageCover(bindings.uniforms.uVideoCover, hoverTex);
  }

  return bindings;
}

export function assignHoverTexture(
  slot: HoverTextureBindings,
  slide: SlideData,
  hoverImageMap: Map<string, THREE.Texture>,
) {
  slot.unbindVideoCover?.();
  slot.hoverType = slide.hoverType;

  if (slide.hoverType === 'video') {
    if (!slot.videoElement) {
      slot.videoElement = createVideoElement('');
      slot.videoTexture = new THREE.VideoTexture(slot.videoElement);
      slot.videoTexture.minFilter = THREE.LinearFilter;
      slot.videoTexture.magFilter = THREE.LinearFilter;
      slot.videoTexture.format = THREE.RGBAFormat;
      slot.uniforms.uVideoTexture.value = slot.videoTexture;
    }

    slot.videoElement.src = slide.hoverTexture;
    slot.unbindVideoCover = bindVideoCover(slot);
    return;
  }

  if (slot.videoElement) {
    slot.videoElement.pause();
    slot.videoElement.src = '';
  }

  const hoverTex = hoverImageMap.get(slide.id);
  if (hoverTex) {
    slot.uniforms.uVideoTexture.value = hoverTex;
    slot.videoTexture = hoverTex;
    applyHoverImageCover(slot.uniforms.uVideoCover, hoverTex);
  }
}

export function syncHoverImageTexture(
  slot: HoverTextureBindings,
  tex: THREE.Texture,
) {
  slot.uniforms.uVideoTexture.value = tex;
  slot.videoTexture = tex;
  applyHoverImageCover(slot.uniforms.uVideoCover, tex);
}
