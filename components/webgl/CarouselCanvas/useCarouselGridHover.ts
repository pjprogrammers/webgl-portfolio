"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useCursorStore } from "@/stores/cursor-store";
import {
  clearGridMouseVelocity,
  stepGridDistortion,
  updateGridMouseFromUv,
  type GridMouseState,
} from "./carouselGridDistortion";

export interface GridHoverSlot {
  mesh: THREE.Mesh;
  dataTexture: THREE.DataTexture;
  mouseState: GridMouseState;
  uniforms: { uDataTexture: THREE.IUniform };
}

export function useCarouselGridHover(
  poolRef: RefObject<GridHoverSlot[]>,
  gl: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
) {
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const pool = poolRef.current;
      if (!pool.length) return;

      const rect = gl.domElement.getBoundingClientRect();
      pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(
        pool.map((slot) => slot.mesh),
      );

      pool.forEach((slot) => clearGridMouseVelocity(slot.mouseState));

      const setCursorType = useCursorStore.getState().setType;

      if (hits.length > 0 && hits[0].uv) {
        const slot = pool.find((s) => s.mesh === hits[0].object);
        if (slot) {
          setCursorType("hover");
          updateGridMouseFromUv(slot.mouseState, hits[0].uv.x, hits[0].uv.y);
          return;
        }
      }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target?.closest("[data-event]")) {
        setCursorType("default");
      }
    };

    const onMouseLeave = () => {
      useCursorStore.getState().setType("default");
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [poolRef, gl, camera]);

  return function stepCarouselGridHover() {
    poolRef.current.forEach((slot) => {
      stepGridDistortion(slot.dataTexture, slot.mouseState);
      slot.uniforms.uDataTexture.value = slot.dataTexture;
    });
  };
}
