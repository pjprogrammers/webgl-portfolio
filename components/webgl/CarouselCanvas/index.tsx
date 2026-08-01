"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import useMediaQuery, { maxWidth, bp } from "@/lib/hooks/useMediaQuery";
import CarouselScene from "./CarouselScene";

const CAMERA_Z = 5;

export default function CarouselCanvas() {
  const profile = getGraphicsProfile();
  const isTablet = useMediaQuery(maxWidth(bp.tabletLandscape));

  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 100,
          position: [0, 0, CAMERA_Z],
        }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        dpr={Math.min(
          typeof window !== "undefined" ? window.devicePixelRatio : 1,
          profile.dpr,
        )}
        frameloop="always"
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <CarouselScene isTablet={isTablet} />
        </Suspense>
      </Canvas>
    </div>
  );
}
