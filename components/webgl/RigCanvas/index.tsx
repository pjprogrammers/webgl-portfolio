"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import { registerR3FAdvance } from "@/lib/ticker/r3fAdvance";
import { bp } from "@/lib/hooks/useMediaQuery";
import { useRigRouteFeatures } from "@/hooks/useRigRouteFeatures";
import { hasActiveRigFeatures } from "@/lib/webgl/rigRouteFeatures";
import { revealRigCanvas, setRigCanvasHidden } from "@/lib/webgl/pageExitFade";
import { FixedViewportPlane } from "./FixedViewportPlane";
import RigImageTexture from "./RigImageTexture";
import { useWhiteShaderScroll } from "./useWhiteShaderScroll";

/** Frames dibujados que esperamos tras cambiar de ruta antes de revelar el rig. */
const RIG_REVEAL_FRAME_THRESHOLD = 2;

/** ≤1024px: tablet/mobile, donde la distorsión WebGL de imágenes se desactiva. */
const SMALL_SCREEN_QUERY = `(max-width: ${bp.tabletLandscape}px)`;

/**
 * En tablet/mobile no queremos cargar la distorsión WebGL de Selected Works
 * (texturas + frame loop) para una experiencia más liviana y fluida. El valor
 * inicial se lee de forma síncrona en cliente para que `RigImageTexture` nunca
 * llegue a montarse ni a pedir texturas en pantallas chicas.
 */
function useIsSmallScreen() {
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(SMALL_SCREEN_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(SMALL_SCREEN_QUERY);
    const handleChange = () => setIsSmall(mql.matches);
    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isSmall;
}

/**
 * Mantiene la capa WebGL del rig oculta al entrar a una ruta y la revela recién
 * cuando el canvas dibujó un frame fresco de la ruta nueva, evitando el flash
 * del último frame (stale) de la página anterior.
 *
 * En rutas sin features de rig el canvas no avanza (`useFrame` no corre), así
 * que la capa permanece oculta: correcto, no hay nada que mostrar.
 */
function RigEntryReveal({ active }: { active: boolean }) {
  const pathname = usePathname();
  const framesRef = useRef(0);
  const revealedRef = useRef(false);

  useLayoutEffect(() => {
    revealedRef.current = false;
    framesRef.current = 0;
    setRigCanvasHidden();
  }, [pathname, active]);

  useFrame(() => {
    if (revealedRef.current || !active) return;
    framesRef.current += 1;
    if (framesRef.current >= RIG_REVEAL_FRAME_THRESHOLD) {
      revealedRef.current = true;
      revealRigCanvas();
    }
  });

  return null;
}

const RigCanvas = () => {
  const { imageDistortion: routeImageDistortion, whiteShader } =
    useRigRouteFeatures();
  const isSmallScreen = useIsSmallScreen();
  // En ≤1024px no aplicamos la distorsión WebGL de imágenes (Selected Works
  // usa <Image> con parallax CSS/GSAP en su lugar).
  const imageDistortion = routeImageDistortion && !isSmallScreen;
  const active = hasActiveRigFeatures({ imageDistortion, whiteShader });

  useEffect(() => {
    if (!active) return;
    return registerR3FAdvance();
  }, [active]);

  useWhiteShaderScroll(whiteShader);

  const profile = getGraphicsProfile();

  return (
    <div
      data-rig-canvas
      className="pointer-events-none fixed top-0 left-0 z-2 h-screen w-screen"
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100] }}
        frameloop="never"
        dpr={Math.min(
          typeof window !== "undefined" ? window.devicePixelRatio : 1,
          profile.dpr,
        )}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        {whiteShader && <FixedViewportPlane />}
        {imageDistortion && <RigImageTexture />}
        <RigEntryReveal active={active} />
      </Canvas>
    </div>
  );
};

export default RigCanvas;
