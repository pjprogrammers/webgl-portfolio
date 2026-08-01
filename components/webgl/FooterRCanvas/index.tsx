"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { WebGLRenderer } from "three";
import { getGraphicsProfile } from "@/lib/performance/graphicsProfile";
import { registerR3FAdvance } from "@/lib/ticker/r3fAdvance";
import SiteWebGLScene from "./SiteWebGLScene.jsx";
import { useParticleScrollAnimation } from "./useParticleScrollAnimation";
import {
  CSS_FALLBACK_GRADIENT,
  DEFAULT_BLOB_DISPLACEMENT,
  DEFAULT_BLOB_MORPH_SPEED,
  DEFAULT_BLOB_RANDOMNESS,
  DEFAULT_COLOR_BLEND,
  DEFAULT_COLOR_WEIGHTS,
  DEFAULT_SCROLL_GRADIENT_DOWN_SPEED,
  DEFAULT_SCROLL_GRADIENT_UP_SPEED,
  DEFAULT_SHADER_COLORS,
} from "./shaderBackgroundConfig.js";

export {
  CSS_FALLBACK_GRADIENT,
  DEFAULT_BLOB_DISPLACEMENT,
  DEFAULT_BLOB_MORPH_SPEED,
  DEFAULT_BLOB_RANDOMNESS,
  DEFAULT_COLOR_BLEND,
  DEFAULT_COLOR_WEIGHTS,
  DEFAULT_SCROLL_GRADIENT_DOWN_SPEED,
  DEFAULT_SCROLL_GRADIENT_UP_SPEED,
  DEFAULT_SHADER_COLORS,
} from "./shaderBackgroundConfig.js";

export type SiteWebGLCanvasProps = {
  enableShaderBackground?: boolean;
  color1?: string;
  color2?: string;
  colorWeights?: number[];
  blobRandomness?: number;
  blobDisplacement?: number;
  blobMorphSpeed?: number;
  scrollGradientDownSpeed?: number;
  scrollGradientUpSpeed?: number;
  colorBlend?: number;
};

function SiteWebGLCanvas({
  enableShaderBackground = true,
  color1 = DEFAULT_SHADER_COLORS.color1,
  color2 = DEFAULT_SHADER_COLORS.color2,
  colorWeights = DEFAULT_COLOR_WEIGHTS,
  blobRandomness = DEFAULT_BLOB_RANDOMNESS,
  blobDisplacement = DEFAULT_BLOB_DISPLACEMENT,
  blobMorphSpeed = DEFAULT_BLOB_MORPH_SPEED,
  scrollGradientDownSpeed = DEFAULT_SCROLL_GRADIENT_DOWN_SPEED,
  scrollGradientUpSpeed = DEFAULT_SCROLL_GRADIENT_UP_SPEED,
  colorBlend = DEFAULT_COLOR_BLEND,
}: SiteWebGLCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const graphicsProfile = getGraphicsProfile();

  useEffect(() => {
    if (webglFailed) return;
    return registerR3FAdvance();
  }, [webglFailed]);

  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      const minTextureSize = enableShaderBackground ? 2048 : 512;
      if (gl.capabilities.maxTextureSize < minTextureSize) {
        setWebglFailed(true);
        return;
      }

      gl.setClearColor(0x000000, 0);
      gl.domElement.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          setWebglFailed(true);
        },
        { once: true },
      );
    },
    [enableShaderBackground],
  );

  if (webglFailed) {
    return (
      <div
        data-site-entrance-canvas
        aria-hidden
        className="gl-gradient js-gl-gradient pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: CSS_FALLBACK_GRADIENT }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-site-entrance-canvas
      aria-hidden
      className="gl-gradient js-gl-gradient pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60"
    >
      {/* <div
        className="absolute inset-0 z-[100000] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: "url(/images/assets/noise.png)",
          backgroundRepeat: "repeat",
          backgroundPosition: "center center",
        }}
      /> */}
      <Canvas
        orthographic
        camera={{
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
          near: 0,
          far: 1,
          position: [0, 0, 0],
        }}
        gl={{
          alpha: true,
          antialias: graphicsProfile.antialias,
          powerPreference: "high-performance",
        }}
        dpr={Math.min(
          typeof window !== "undefined" ? window.devicePixelRatio : 1,
          graphicsProfile.dpr,
        )}
        frameloop="never"
        style={{ width: "100%", height: "100%" }}
        onCreated={handleCreated}
        onError={() => setWebglFailed(true)}
      >
        <Suspense fallback={null}>
          <SiteWebGLScene
            containerRef={containerRef}
            enableShaderBackground={enableShaderBackground}
            color1={color1}
            color2={color2}
            colorWeights={colorWeights}
            blobRandomness={blobRandomness}
            blobDisplacement={blobDisplacement}
            blobMorphSpeed={blobMorphSpeed}
            scrollGradientDownSpeed={scrollGradientDownSpeed}
            scrollGradientUpSpeed={scrollGradientUpSpeed}
            colorBlend={colorBlend}
            fboScale={graphicsProfile.fboScale}
            shaderParticleCount={graphicsProfile.shaderParticleCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Canvas WebGL unificado: gradiente shader + partículas R en un solo contexto. */
export default function GlobalParticleCanvas(props: SiteWebGLCanvasProps) {
  useParticleScrollAnimation();
  return <SiteWebGLCanvas {...props} />;
}
