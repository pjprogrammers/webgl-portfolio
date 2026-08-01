"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/gsap/registerPlugin";
import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import { createRGeometry } from "./createRGeometry.js";
import { createFooterRParticleField } from "./footerRParticleSimulation.js";
import {
  registerParticleField,
  unregisterParticleField,
} from "./particleFieldRegistry.js";
import { FOOTER_R_CAMERA_Z, FOOTER_R_SIZE_FILL } from "./footerRConfig.js";
import {
  applyGeometryDatasetTransform,
  applyGeometryScrollGroupTransform,
} from "./geometryGroupTransform.js";
import {
  updateFooterGroupRotation,
  syncPointerToGroupLocal,
} from "./footerGroupRotation.js";
import {
  createFooterPointer,
  updateFooterPointerFromClient,
  updateFooterPointerSmooth,
} from "./footerPointer.js";

export default function FooterRScene({ containerRef, overlayCameraRef }) {
  const pointerGroupRef = useRef(null);
  const geometryScrollGroupRef = useRef(null);
  const geometryTransformGroupRef = useRef(null);
  const fieldRef = useRef(null);
  const geometryRef = useRef(null);
  const pointer = useMemo(() => createFooterPointer(), []);
  const sizeRef = useRef({ width: 0, height: 0 });
  const { size, camera } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;

    createRGeometry()
      .then((geo) => {
        if (disposed) {
          geo.dispose();
          return;
        }

        geometryRef.current = geo;
        const profile = getGraphicsProfile();
        fieldRef.current = createFooterRParticleField(geo, profile.particleCount, {
          twinklePercent: profile.particleTwinklePercent,
          twinkleIntensity: profile.particleTwinkleIntensity,
        });
        registerParticleField(fieldRef.current);
        setReady(true);
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });

    return () => {
      disposed = true;
      unregisterParticleField(fieldRef.current);
      fieldRef.current?.dispose();
      fieldRef.current = null;
      geometryRef.current?.dispose();
      geometryRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !fieldRef.current || !geometryTransformGroupRef.current) return;

    const points = fieldRef.current.points;
    geometryTransformGroupRef.current.add(points);
    ScrollTrigger.refresh();

    return () => {
      geometryTransformGroupRef.current?.remove(points);
    };
  }, [ready]);

  useLayoutEffect(() => {
    sizeRef.current = { width: size.width, height: size.height };
  }, [size.width, size.height]);

  useEffect(() => {
    const getPointerBounds = () => containerRef?.current ?? null;

    const onPointerMove = (event) => {
      const bounds = getPointerBounds();
      const { width, height } = sizeRef.current;
      updateFooterPointerFromClient(
        pointer,
        event.clientX,
        event.clientY,
        bounds,
        width,
        height,
      );
    };

    const onTouchMove = (event) => {
      if (!event.touches.length) return;
      const touch = event.touches[0];
      const bounds = getPointerBounds();
      const { width, height } = sizeRef.current;
      updateFooterPointerFromClient(
        pointer,
        touch.clientX,
        touch.clientY,
        bounds,
        width,
        height,
      );
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [containerRef, pointer]);

  useLayoutEffect(() => {
    const targetCamera = overlayCameraRef?.current ?? camera;
    if (!(targetCamera instanceof THREE.OrthographicCamera)) return;

    const { width, height } = size;
    targetCamera.left = -width / 2;
    targetCamera.right = width / 2;
    targetCamera.top = height / 2;
    targetCamera.bottom = -height / 2;
    targetCamera.near = 0.1;
    targetCamera.far = FOOTER_R_CAMERA_Z * 2;
    targetCamera.position.set(0, 0, FOOTER_R_CAMERA_Z);
    targetCamera.updateProjectionMatrix();
  }, [camera, overlayCameraRef, size]);

  useLayoutEffect(() => {
    if (!ready || !fieldRef.current) return;

    const targetSize = Math.min(size.width, size.height) * FOOTER_R_SIZE_FILL;
    fieldRef.current.setScale(targetSize, size.width, size.height);
  }, [ready, size.width, size.height]);

  useFrame((_, delta) => {
    updateFooterPointerSmooth(pointer, delta);

    const { width, height } = sizeRef.current;
    updateFooterGroupRotation(
      pointerGroupRef.current,
      pointer,
      width,
      height,
      delta,
    );
    const baseSize = Math.min(width, height) * FOOTER_R_SIZE_FILL;
    applyGeometryScrollGroupTransform(geometryScrollGroupRef.current);
    applyGeometryDatasetTransform(geometryTransformGroupRef.current, baseSize);
    syncPointerToGroupLocal(geometryTransformGroupRef.current, pointer);

    fieldRef.current?.tick(delta, pointer);
  });

  return (
    <group ref={pointerGroupRef}>
      <group ref={geometryScrollGroupRef}>
        <group ref={geometryTransformGroupRef} />
      </group>
    </group>
  );
}
