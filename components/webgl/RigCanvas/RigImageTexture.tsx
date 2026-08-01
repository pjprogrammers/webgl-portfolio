"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  LinearFilter,
  Mesh,
  RepeatWrapping,
  ShaderMaterial,
  TextureLoader,
  Vector2,
} from "three";
import { createGridDataTexture } from "@/components/webgl/CarouselCanvas/carouselGridDistortion";
import { RIG_CONFIG } from "@/config/rig.config";
import { rigFragmentShader, rigVertexShader } from "./rigShaders";
import { stepRigScrollBarrel } from "./rigScrollBarrel";
import {
  createRigGridSlots,
  stepRigGridHover,
  useRigGridHover,
  type RigGridSlot,
} from "./useRigGridHover";

type ElementRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function computeTextureCover(
  planeAspect: number,
  imageAspect: number,
  parallaxFactor: number,
) {
  let scaleX: number;
  let scaleY: number;

  if (planeAspect > imageAspect) {
    scaleX = 1;
    scaleY = imageAspect / planeAspect;
  } else {
    scaleX = planeAspect / imageAspect;
    scaleY = 1;
  }

  const repeatX = scaleX / parallaxFactor;
  const repeatY = scaleY / parallaxFactor;
  const safeCenter = (1 - repeatY) / 2;
  const maxShift = (scaleY - repeatY) / 2;

  return { repeatX, repeatY, safeCenter, maxShift };
}

export default function RigImageTexture() {
  const { size } = useThree();
  const meshesRef = useRef<Array<Mesh | null>>([]);
  const materialsRef = useRef<ShaderMaterial[]>([]);
  const slotsRef = useRef<RigGridSlot[]>([]);
  const rectsRef = useRef<ElementRect[]>([]);
  const rectsDirtyRef = useRef(true);

  const lastScrollRef = useRef(0);
  const barrelStrengthRef = useRef(0);
  const scrollDirectionRef = useRef(1);

  const imagesArray = useMemo(() => {
    if (typeof window === "undefined") return [];
    return Array.from(
      document.querySelectorAll('[data-type="image"]'),
    ) as HTMLElement[];
  }, []);

  useEffect(() => {
    const dataTextures = imagesArray.map(() => createGridDataTexture());
    slotsRef.current = createRigGridSlots(imagesArray, dataTextures);

    return () => {
      dataTextures.forEach((texture) => texture.dispose());
    };
  }, [imagesArray]);

  useRigGridHover(slotsRef);

  const imageSrcs = useMemo(
    () => imagesArray.map((el) => el.getAttribute("data-src") ?? ""),
    [imagesArray],
  );

  const textures = useLoader(TextureLoader, imageSrcs);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useEffect(() => {
    const markDirty = () => {
      rectsDirtyRef.current = true;
    };

    window.addEventListener("scroll", markDirty, { passive: true });
    window.addEventListener("resize", markDirty, { passive: true });

    return () => {
      window.removeEventListener("scroll", markDirty);
      window.removeEventListener("resize", markDirty);
    };
  }, []);

  useFrame((_, delta) => {
    const slots = slotsRef.current;
    if (!slots.length) return;

    const dt = Math.min(delta, 1 / 30);

    if (rectsDirtyRef.current) {
      rectsRef.current = slots.map((slot) => {
        const rect = slot.element.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        };
      });
      rectsDirtyRef.current = false;
    }

    const targetScroll = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollDelta = targetScroll - lastScrollRef.current;
    lastScrollRef.current = targetScroll;

    barrelStrengthRef.current = stepRigScrollBarrel(
      barrelStrengthRef.current,
      scrollDelta,
      dt,
    );

    if (Math.abs(scrollDelta) > 0.5) {
      const targetDirection = scrollDelta > 0 ? 1 : -1;
      scrollDirectionRef.current +=
        (targetDirection - scrollDirectionRef.current) * 0.12;
    }

    stepRigGridHover(slots);

    slots.forEach((slot, index) => {
      const mesh = meshesRef.current[index];
      const material = materialsRef.current[index];
      const texture = textures[index];
      if (!mesh || !material || !texture) return;

      const rect = rectsRef.current[index];
      if (!rect || rect.width <= 0 || rect.height <= 0) return;

      const x = rect.left - size.width / 2 + rect.width / 2;
      const y = -rect.top + size.height / 2 - rect.height / 2;

      mesh.position.set(x, y, 0);
      mesh.scale.set(rect.width, rect.height, 1);

      const planeAspect = rect.width / rect.height;
      const imageAspect =
        texture.image?.width && texture.image?.height
          ? texture.image.width / texture.image.height
          : 1;

      const { repeatX, repeatY, safeCenter, maxShift } = computeTextureCover(
        planeAspect,
        imageAspect,
        RIG_CONFIG.PARALLAX_FACTOR,
      );

      const elementCenterY = rect.top + rect.height / 2;
      const scrollProgress = elementCenterY / size.height;
      const parallaxShift = (scrollProgress - 0.5) * 2 * maxShift;
      const rawOffsetY = safeCenter + parallaxShift;
      const clampedOffsetY = Math.max(0, Math.min(1 - repeatY, rawOffsetY));

      const meshCenterY = -(rect.top + rect.height / 2 - size.height / 2);

      material.uniforms.uTextureRepeat.value.set(repeatX, repeatY);
      material.uniforms.uTextureOffset.value.set(
        (1 - repeatX) / 2,
        clampedOffsetY,
      );
      material.uniforms.uMeshY.value = meshCenterY;
      material.uniforms.uMeshHeight.value = rect.height;
      material.uniforms.uViewportHeight.value = size.height;
      material.uniforms.uBarrelStrength.value = barrelStrengthRef.current;
      material.uniforms.uScrollDirection.value = scrollDirectionRef.current;
      material.uniforms.uDataTexture.value = slot.dataTexture;
    });
  });

  if (imagesArray.length === 0) return null;

  const {
    PLANE_SEGMENTS_X,
    PLANE_SEGMENTS_Y,
    BARREL_SCALE,
    BARREL_EDGE_LIFT,
    GRID_UV_DISTORT,
  } = RIG_CONFIG;

  return imagesArray.map((_, index) => (
    <mesh key={index} ref={(el) => (meshesRef.current[index] = el)}>
      <planeGeometry args={[1, 1, PLANE_SEGMENTS_X, PLANE_SEGMENTS_Y]} />
      <shaderMaterial
        ref={(el) => {
          if (el) materialsRef.current[index] = el;
        }}
        vertexShader={rigVertexShader}
        fragmentShader={rigFragmentShader}
        uniforms={{
          uTexture: { value: textures[index] },
          uDataTexture: { value: null },
          uAlpha: { value: 1.0 },
          uMeshY: { value: 0.0 },
          uMeshHeight: { value: 1.0 },
          uViewportHeight: { value: 1.0 },
          uBarrelStrength: { value: 0.0 },
          uBarrelScale: { value: BARREL_SCALE },
          uBarrelEdgeLift: { value: BARREL_EDGE_LIFT },
          uScrollDirection: { value: 1.0 },
          uTextureRepeat: { value: new Vector2(1, 1) },
          uTextureOffset: { value: new Vector2(0, 0) },
          uGridUvDistort: { value: GRID_UV_DISTORT },
        }}
        transparent
      />
    </mesh>
  ));
}
