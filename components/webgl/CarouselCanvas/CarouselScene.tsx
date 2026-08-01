"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { CAROUSEL_CONFIG } from "@/config/carousel.config";
import { SLIDES } from "./slides.data";
import {
  carouselVertexShader,
  carouselFragmentShader,
} from "./carouselShaders";
import { useCarouselInput } from "./useCarouselInput";
import { useCarouselStore } from "@/stores/carousel-store";
import { computeTextureCoverTransform, coverToVec4 } from "./textureCover";
import {
  isCarouselScrollSettled,
  stepCarouselScroll,
} from "./carouselScrollPhysics";
import { stepCarouselBarrel } from "./carouselBarrel";
import {
  assignHoverTexture,
  createInitialHoverTexture,
  loadHoverImageTextures,
  syncHoverImageTexture,
  type HoverTextureBindings,
} from "./carouselHoverTexture";
import {
  createGridDataTexture,
  createGridMouseState,
} from "./carouselGridDistortion";
import { useCarouselGridHover } from "./useCarouselGridHover";
import { centerPoolOnSlide } from "./centerPoolOnSlide";
import {
  runCarouselEntryReveal,
  setCarouselEntryHidden,
} from "./carouselEntryReveal";

interface PoolSlot extends HoverTextureBindings {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  dataTexture: THREE.DataTexture;
  mouseState: ReturnType<typeof createGridMouseState>;
  uniforms: HoverTextureBindings["uniforms"] & {
    uImageTexture: THREE.IUniform;
    uImageCover: THREE.IUniform<THREE.Vector4>;
    uProgress: THREE.IUniform<number>;
    uBarrelStrength: THREE.IUniform<number>;
    uBarrelScale: THREE.IUniform<number>;
    uBarrelEdgeLift: THREE.IUniform<number>;
    uMeshX: THREE.IUniform<number>;
    uMeshWidth: THREE.IUniform<number>;
    uViewportWidth: THREE.IUniform<number>;
    uDispTexture: THREE.IUniform;
    uDispEffectFactor: THREE.IUniform<number>;
    uDataTexture: THREE.IUniform;
    uGridUvDistort: THREE.IUniform<number>;
    uReveal: THREE.IUniform<number>;
  };
  baseOffsetX: number;
  dataIndex: number;
  isShowingHover: boolean;
}

function computeSlideWorldSize(
  camera: THREE.PerspectiveCamera,
  viewportW: number,
  viewportH: number,
) {
  const {
    SLIDE_ASPECT_RATIO,
    SLIDE_MAX_VW,
    SLIDE_MAX_VH,
    BREAKPOINT_TABLET,
    BREAKPOINT_MOBILE,
    SLIDE_TABLET_VW,
    SLIDE_MOBILE_VW,
  } = CAROUSEL_CONFIG;
  const vFOV = (camera.fov * Math.PI) / 180;
  const worldH = 2 * Math.tan(vFOV / 2) * camera.position.z;
  const worldW = worldH * (viewportW / viewportH);

  if (viewportW < BREAKPOINT_MOBILE) {
    const w = worldW * SLIDE_MOBILE_VW;
    return { width: w, height: w / SLIDE_ASPECT_RATIO };
  }

  if (viewportW < BREAKPOINT_TABLET) {
    const w = worldW * SLIDE_TABLET_VW;
    return { width: w, height: w / SLIDE_ASPECT_RATIO };
  }

  const maxW = worldW * SLIDE_MAX_VW;
  const maxH = worldH * SLIDE_MAX_VH;

  // Prefer 50vh height; if that width exceeds 50vw, cap width and derive height
  let h = maxH;
  let w = h * SLIDE_ASPECT_RATIO;
  if (w > maxW) {
    w = maxW;
    h = w / SLIDE_ASPECT_RATIO;
  }
  return { width: w, height: h };
}

function computeSlideLayout(
  camera: THREE.PerspectiveCamera,
  viewportW: number,
  viewportH: number,
) {
  const { width, height } = computeSlideWorldSize(camera, viewportW, viewportH);
  const gap = width * CAROUSEL_CONFIG.SLIDE_GAP_RATIO;
  return { width, height, gap, stride: width + gap };
}

function applyImageCover(slot: PoolSlot, tex: THREE.Texture) {
  const image = tex.image as
    | HTMLImageElement
    | { width: number; height: number };
  const cover = computeTextureCoverTransform(
    image.width,
    image.height,
    CAROUSEL_CONFIG.SLIDE_ASPECT_RATIO,
  );
  slot.uniforms.uImageCover.value.fromArray(coverToVec4(cover));
}

function resetSlotHoverState(slot: PoolSlot) {
  gsap.killTweensOf(slot.uniforms.uProgress);
  slot.uniforms.uProgress.value = 0;
  slot.isShowingHover = false;
  slot.videoElement?.pause();
}

function setSlotHoverVisible(slot: PoolSlot, visible: boolean) {
  if (visible && !slot.isShowingHover) {
    slot.isShowingHover = true;
    gsap.killTweensOf(slot.uniforms.uProgress);
    gsap.to(slot.uniforms.uProgress, {
      value: 1,
      duration: CAROUSEL_CONFIG.TRANSITION_DURATION,
      ease: CAROUSEL_CONFIG.TRANSITION_EASE,
      onStart: () => {
        if (slot.hoverType === "video" && slot.videoElement) {
          slot.videoElement.play().catch(() => {});
        }
      },
      onComplete: () => {
        slot.uniforms.uProgress.value = 1;
      },
    });
    return;
  }

  if (!visible && slot.isShowingHover) {
    slot.isShowingHover = false;
    gsap.killTweensOf(slot.uniforms.uProgress);
    gsap.to(slot.uniforms.uProgress, {
      value: 0,
      duration: CAROUSEL_CONFIG.TRANSITION_DURATION,
      ease: CAROUSEL_CONFIG.TRANSITION_EASE,
      onComplete: () => {
        slot.uniforms.uProgress.value = 0;
        if (slot.hoverType === "video" && slot.videoElement) {
          slot.videoElement.pause();
        }
      },
    });
  }
}

function getHoverSlideIdFromRefs(
  currentSlideId: string | null,
  pendingSlideId: string | null | undefined,
): string | null {
  return pendingSlideId !== undefined ? pendingSlideId : currentSlideId;
}

interface CarouselSceneProps {
  isTablet: boolean;
}

export default function CarouselScene({ isTablet }: CarouselSceneProps) {
  const { camera, size, scene, gl } = useThree();
  const perspCamera = camera as THREE.PerspectiveCamera;

  const requestSlideSelection = useCarouselStore(
    (s) => s.requestSlideSelection,
  );
  const setCenteredSlideId = useCarouselStore((s) => s.setCenteredSlideId);
  const currentSlideId = useCarouselStore((s) => s.currentSlideId);
  const pendingSlideId = useCarouselStore((s) => s.pendingSlideId);

  const poolRef = useRef<PoolSlot[]>([]);
  const textureMapRef = useRef<Map<string, THREE.Texture>>(new Map());
  const hoverImageMapRef = useRef<Map<string, THREE.Texture>>(new Map());
  const dispTextureRef = useRef<THREE.Texture | null>(null);
  const slideLayoutRef = useRef({
    width: 1,
    height: 1,
    gap: 0.04,
    stride: 1.04,
  });
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  const globalOffsetRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const barrelStrengthRef = useRef(0);
  const pendingVelocityRef = useRef(0);
  const forcedSnapSlotRef = useRef<PoolSlot | null>(null);
  const activateOnSettleRef = useRef(false);
  const coastFromScrollRef = useRef(false);
  const lastCenteredSlideIdRef = useRef<string | null>(null);
  const centeredInitializedRef = useRef(false);

  const entryStartedRef = useRef(false);
  const entryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSlideIdRef = useRef(currentSlideId);
  const pendingSlideIdRef = useRef(pendingSlideId);
  const isTabletRef = useRef(isTablet);
  useEffect(() => {
    currentSlideIdRef.current = currentSlideId;
  }, [currentSlideId]);
  useEffect(() => {
    pendingSlideIdRef.current = pendingSlideId;
  }, [pendingSlideId]);
  useEffect(() => {
    isTabletRef.current = isTablet;
  }, [isTablet]);

  const startCarouselEntry = useCallback(() => {
    if (entryStartedRef.current) return;
    const pool = poolRef.current;
    if (!pool.length) return;

    entryStartedRef.current = true;
    if (entryTimeoutRef.current) {
      clearTimeout(entryTimeoutRef.current);
      entryTimeoutRef.current = null;
    }

    runCarouselEntryReveal(pool, slideLayoutRef.current.stride);
  }, []);

  // Espera a que la textura de displacement y todas las imágenes visibles
  // estén listas antes de revelar; así el reveal con displacement no muestra
  // cards en blanco. Un timeout de respaldo evita quedarse esperando.
  const maybeStartCarouselEntry = useCallback(() => {
    if (entryStartedRef.current) return;
    const pool = poolRef.current;
    if (!pool.length || !dispTextureRef.current) return;

    const allImagesReady = pool.every((slot) =>
      textureMapRef.current.has(SLIDES[slot.dataIndex].id),
    );
    if (!allImagesReady) return;

    startCarouselEntry();
  }, [startCarouselEntry]);

  const startCarouselEntryRef = useRef(startCarouselEntry);
  const maybeStartCarouselEntryRef = useRef(maybeStartCarouselEntry);
  useEffect(() => {
    startCarouselEntryRef.current = startCarouselEntry;
    maybeStartCarouselEntryRef.current = maybeStartCarouselEntry;
  }, [startCarouselEntry, maybeStartCarouselEntry]);

  // Load slide + hover image textures at mount
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    SLIDES.forEach((slide) => {
      loader.load(slide.imageUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        textureMapRef.current.set(slide.id, tex);
        poolRef.current.forEach((slot) => {
          if (SLIDES[slot.dataIndex].id === slide.id) {
            slot.uniforms.uImageTexture.value = tex;
            applyImageCover(slot, tex);
          }
        });
        maybeStartCarouselEntryRef.current();
      });
    });

    loadHoverImageTextures(SLIDES, hoverImageMapRef.current, (slideId, tex) => {
      poolRef.current.forEach((slot) => {
        if (
          SLIDES[slot.dataIndex].id === slideId &&
          slot.hoverType === "image"
        ) {
          syncHoverImageTexture(slot, tex);
        }
      });
    });

    loader.load(CAROUSEL_CONFIG.DISPLACEMENT_TEXTURE_URL, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      dispTextureRef.current = tex;
      poolRef.current.forEach((slot) => {
        slot.uniforms.uDispTexture.value = tex;
      });
      maybeStartCarouselEntryRef.current();
    });
  }, []);

  const applySlideLayout = useCallback(
    (viewportW: number, viewportH: number) => {
      const layout = computeSlideLayout(perspCamera, viewportW, viewportH);
      const pool = poolRef.current;
      const prevStride = slideLayoutRef.current.stride;
      const strideScale =
        pool.length && prevStride > 0 ? layout.stride / prevStride : 1;

      if (pool.length && strideScale !== 1) {
        globalOffsetRef.current *= strideScale;
        pool.forEach((slot) => {
          slot.baseOffsetX *= strideScale;
        });
      }

      pool.forEach((slot) => {
        slot.mesh.scale.set(layout.width, layout.height, 1);
        slot.uniforms.uMeshWidth.value = layout.width;
      });

      slideLayoutRef.current = layout;
    },
    [perspCamera],
  );

  // Build pool
  useEffect(() => {
    const layout = computeSlideLayout(perspCamera, size.width, size.height);
    slideLayoutRef.current = layout;
    const { width: slideW, height: slideH, stride: slideStride } = layout;
    const half = Math.floor(CAROUSEL_CONFIG.VISIBLE_SLIDES / 2);

    const geo = new THREE.PlaneGeometry(
      1,
      1,
      CAROUSEL_CONFIG.PLANE_SEGMENTS_X,
      CAROUSEL_CONFIG.PLANE_SEGMENTS_Y,
    );

    const slots: PoolSlot[] = [];

    for (let i = 0; i < CAROUSEL_CONFIG.VISIBLE_SLIDES; i++) {
      const dataIndex =
        (((i - half) % SLIDES.length) + SLIDES.length) % SLIDES.length;
      const slide = SLIDES[dataIndex];

      const hover = createInitialHoverTexture(slide, hoverImageMapRef.current);
      const dataTexture = createGridDataTexture();
      const mouseState = createGridMouseState();

      const fallback = new THREE.Texture();
      const defaultCover = new THREE.Vector4(1, 1, 0, 0);
      const uniforms = {
        uImageTexture: {
          value: textureMapRef.current.get(slide.id) ?? fallback,
        },
        uVideoTexture: hover.uniforms.uVideoTexture,
        uImageCover: { value: defaultCover.clone() },
        uVideoCover: hover.uniforms.uVideoCover,
        uProgress: { value: 0.0 },
        uBarrelStrength: { value: 0.0 },
        uBarrelScale: { value: CAROUSEL_CONFIG.BARREL_SCALE },
        uBarrelEdgeLift: { value: CAROUSEL_CONFIG.BARREL_EDGE_LIFT },
        uMeshX: { value: 0.0 },
        uMeshWidth: { value: slideW },
        uViewportWidth: { value: 1.0 },
        uDispTexture: {
          value: dispTextureRef.current ?? new THREE.Texture(),
        },
        uDispEffectFactor: {
          value: CAROUSEL_CONFIG.TRANSITION_DISPLACEMENT_EFFECT,
        },
        uDataTexture: { value: dataTexture },
        uGridUvDistort: { value: CAROUSEL_CONFIG.GRID_UV_DISTORT },
        // Arranca oculta (alpha 0); la animación de entrada la lleva a 1.
        uReveal: { value: 0.0 },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: carouselVertexShader,
        fragmentShader: carouselFragmentShader,
        uniforms,
        side: THREE.FrontSide,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = false;
      mesh.userData.slideId = slide.id;
      const baseOffsetX = (i - half) * slideStride;
      mesh.position.x = baseOffsetX;
      mesh.scale.set(slideW, slideH, 1);
      scene.add(mesh);

      const slot: PoolSlot = {
        mesh,
        material,
        uniforms,
        dataTexture,
        mouseState,
        baseOffsetX,
        dataIndex,
        videoElement: hover.videoElement,
        videoTexture: hover.videoTexture,
        hoverType: hover.hoverType,
        unbindVideoCover: hover.unbindVideoCover,
        isShowingHover: false,
      };
      slots.push(slot);

      const imageTex = textureMapRef.current.get(slide.id);
      if (imageTex) applyImageCover(slot, imageTex);
    }

    poolRef.current = slots;

    const slideIdFromNav = useCarouselStore.getState().pendingSlideId;
    if (slideIdFromNav) {
      const half = centerPoolOnSlide(
        slots,
        slideIdFromNav,
        textureMapRef.current,
        hoverImageMapRef.current,
        applyImageCover,
        resetSlotHoverState,
      );

      if (half >= 0) {
        globalOffsetRef.current = 0;
        scrollVelocityRef.current = 0;
        forcedSnapSlotRef.current = slots[half];
        lastCenteredSlideIdRef.current = slideIdFromNav;
        centeredInitializedRef.current = true;
        setCenteredSlideId(slideIdFromNav);
      }
    }

    setCarouselEntryHidden(slots);
    entryStartedRef.current = false;
    maybeStartCarouselEntryRef.current();
    entryTimeoutRef.current = setTimeout(() => {
      startCarouselEntryRef.current();
    }, CAROUSEL_CONFIG.ENTRY_REVEAL_MAX_WAIT_MS);

    return () => {
      if (entryTimeoutRef.current) {
        clearTimeout(entryTimeoutRef.current);
        entryTimeoutRef.current = null;
      }
      geo.dispose();
      slots.forEach((slot) => {
        gsap.killTweensOf(slot.uniforms.uReveal);
        slot.unbindVideoCover?.();
        slot.dataTexture.dispose();
        scene.remove(slot.mesh);
        slot.material.dispose();
        if (slot.hoverType === "video") {
          slot.videoTexture.dispose();
          if (slot.videoElement) {
            slot.videoElement.pause();
            slot.videoElement.src = "";
          }
        }
      });
      textureMapRef.current.forEach((t) => t.dispose());
      textureMapRef.current.clear();
      hoverImageMapRef.current.forEach((t) => t.dispose());
      hoverImageMapRef.current.clear();
      dispTextureRef.current?.dispose();
      dispTextureRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize — rescale slides, gap, and pool offsets together
  useEffect(() => {
    applySlideLayout(size.width, size.height);
  }, [size.width, size.height, applySlideLayout]);

  function assignNextSlide(slot: PoolSlot, direction: 1 | -1) {
    slot.dataIndex =
      (slot.dataIndex + direction + SLIDES.length) % SLIDES.length;
    const slide = SLIDES[slot.dataIndex];
    slot.mesh.userData.slideId = slide.id;

    const tex = textureMapRef.current.get(slide.id);
    if (tex) {
      slot.uniforms.uImageTexture.value = tex;
      applyImageCover(slot, tex);
    }

    resetSlotHoverState(slot);
    assignHoverTexture(slot, slide, hoverImageMapRef.current);
  }

  function getSnapTarget(pool: PoolSlot[]): number {
    const slot =
      forcedSnapSlotRef.current ??
      pool.reduce((a, b) =>
        Math.abs(b.mesh.position.x) < Math.abs(a.mesh.position.x) ? b : a,
      );
    return -slot.baseOffsetX;
  }

  function snapToSlot(
    slot: PoolSlot,
    options?: { activateOnComplete?: boolean },
  ) {
    forcedSnapSlotRef.current = slot;
    activateOnSettleRef.current = options?.activateOnComplete ?? false;

    const slide = SLIDES[slot.dataIndex];
    setCenteredSlideId(slide.id);
  }

  const handleVelocity = useCallback((v: number) => {
    if (Math.abs(v) > 0) {
      forcedSnapSlotRef.current = null;
      activateOnSettleRef.current = false;
      coastFromScrollRef.current = true;
    }
    pendingVelocityRef.current += v;
  }, []);

  const handleValidClick = useCallback(
    (coords: { clientX: number; clientY: number }) => {
      const pool = poolRef.current;
      if (!pool.length) return;

      const rect = gl.domElement.getBoundingClientRect();
      pointerRef.current.x =
        ((coords.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y =
        -((coords.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, perspCamera);
      const hits = raycasterRef.current.intersectObjects(
        pool.map((s) => s.mesh),
      );
      if (!hits.length) return;

      const clickedSlot = pool.find((s) => s.mesh === hits[0].object);
      if (!clickedSlot) return;

      const slideId = SLIDES[clickedSlot.dataIndex].id;
      snapToSlot(clickedSlot);
      const isSameSelection =
        currentSlideIdRef.current === slideId &&
        pendingSlideIdRef.current === undefined;
      requestSlideSelection(isSameSelection ? null : slideId);
    },
    [gl, perspCamera, requestSlideSelection],
  );

  useCarouselInput({
    onVelocity: handleVelocity,
    onValidClick: handleValidClick,
  });

  const stepCarouselGridHover = useCarouselGridHover(poolRef, gl, perspCamera);

  useFrame((_, delta) => {
    const pool = poolRef.current;
    if (!pool.length) return;

    const dt = Math.min(delta, 1 / 30);
    const { width: slideW, stride: slideStride } = slideLayoutRef.current;
    const totalWidth = CAROUSEL_CONFIG.VISIBLE_SLIDES * slideStride;
    const halfRange = totalWidth / 2;

    const pendingVelocity = pendingVelocityRef.current;
    pendingVelocityRef.current = 0;
    const hadInput = Math.abs(pendingVelocity) > 0;
    const snapTarget = getSnapTarget(pool);

    const next = stepCarouselScroll(
      {
        globalOffset: globalOffsetRef.current,
        scrollVelocity: scrollVelocityRef.current,
      },
      { pendingVelocity, snapTarget, hadInput, dt },
    );
    globalOffsetRef.current = next.globalOffset;
    scrollVelocityRef.current = next.scrollVelocity;

    if (isCarouselScrollSettled(next, snapTarget)) {
      const settledCentered =
        forcedSnapSlotRef.current ??
        pool.reduce((a, b) =>
          Math.abs(b.mesh.position.x) < Math.abs(a.mesh.position.x) ? b : a,
        );
      const settledSlideId = SLIDES[settledCentered.dataIndex].id;

      if (
        activateOnSettleRef.current &&
        forcedSnapSlotRef.current &&
        isTabletRef.current
      ) {
        requestSlideSelection(settledSlideId);
        activateOnSettleRef.current = false;
        forcedSnapSlotRef.current = null;
      } else if (coastFromScrollRef.current && isTabletRef.current) {
        requestSlideSelection(settledSlideId);
        coastFromScrollRef.current = false;
      }
    }

    barrelStrengthRef.current = stepCarouselBarrel(
      barrelStrengthRef.current,
      scrollVelocityRef.current,
      pendingVelocity,
      hadInput,
      dt,
    );

    const vFOV = (perspCamera.fov * Math.PI) / 180;
    const worldH = 2 * Math.tan(vFOV / 2) * perspCamera.position.z;
    const viewportWidth = worldH * (size.width / size.height);

    pool.forEach((slot) => {
      let posX = slot.baseOffsetX + globalOffsetRef.current;

      // Wrap: slot jumps to opposite side, picks next slide data
      if (posX > halfRange) {
        slot.baseOffsetX -= totalWidth;
        posX -= totalWidth;
        assignNextSlide(slot, 1);
      } else if (posX < -halfRange) {
        slot.baseOffsetX += totalWidth;
        posX += totalWidth;
        assignNextSlide(slot, -1);
      }

      slot.mesh.position.x = posX;
      slot.uniforms.uBarrelStrength.value = barrelStrengthRef.current;
      slot.uniforms.uMeshX.value = posX;
      slot.uniforms.uMeshWidth.value = slideW;
      slot.uniforms.uViewportWidth.value = viewportWidth;

      if (slot.isShowingHover && slot.hoverType === "video") {
        slot.videoTexture.needsUpdate = true;
      }
    });

    const centered = pool.reduce((a, b) =>
      Math.abs(b.mesh.position.x) < Math.abs(a.mesh.position.x) ? b : a,
    );
    const centeredSlideId = SLIDES[centered.dataIndex].id;
    const hoverSlideId = getHoverSlideIdFromRefs(
      currentSlideIdRef.current,
      pendingSlideIdRef.current,
    );

    pool.forEach((slot) => {
      const slideId = SLIDES[slot.dataIndex].id;
      const shouldShowHover =
        hoverSlideId !== null &&
        slideId === hoverSlideId &&
        slot === centered;
      setSlotHoverVisible(slot, shouldShowHover);
    });

    if (lastCenteredSlideIdRef.current !== centeredSlideId) {
      const isProgrammaticSnap = forcedSnapSlotRef.current !== null;

      if (
        centeredInitializedRef.current &&
        !isTabletRef.current &&
        !isProgrammaticSnap &&
        (currentSlideIdRef.current !== null ||
          pendingSlideIdRef.current !== undefined)
      ) {
        requestSlideSelection(null);
      }
      lastCenteredSlideIdRef.current = centeredSlideId;
      centeredInitializedRef.current = true;
      setCenteredSlideId(centeredSlideId);
    }

    stepCarouselGridHover();
  });

  return null;
}
