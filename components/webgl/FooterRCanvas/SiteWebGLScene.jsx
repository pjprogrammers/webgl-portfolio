"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import ShaderScene from "../ShaderBackground/ShaderScene.jsx";
import {
  DEFAULT_BLOOM_INTENSITY,
  DEFAULT_BLOOM_SMOOTHING,
  DEFAULT_BLOOM_THRESHOLD,
} from "./shaderBackgroundConfig.js";
import { FOOTER_R_CAMERA_Z } from "./footerRConfig.js";
import { useParticleRouteFeatures } from "@/hooks/useParticleRouteFeatures";
import FooterRScene from "./FooterRScene.jsx";

/**
 * Render manual encima del shader (sin segundo EffectComposer).
 * Un EffectComposer extra reemplaza el framebuffer y tapa gradiente + estrellas Z.
 */
function FooterOverlayPass({ footerScene, footerCameraRef }) {
  const { gl, size } = useThree();

  useLayoutEffect(() => {
    const cam = footerCameraRef.current;
    cam.left = -size.width / 2;
    cam.right = size.width / 2;
    cam.top = size.height / 2;
    cam.bottom = -size.height / 2;
    cam.near = 0.1;
    cam.far = FOOTER_R_CAMERA_Z * 2;
    cam.position.set(0, 0, FOOTER_R_CAMERA_Z);
    cam.updateProjectionMatrix();
  }, [footerCameraRef, size.width, size.height]);

  useFrame(() => {
    gl.autoClear = false;
    gl.clearDepth();
    gl.render(footerScene, footerCameraRef.current);
  }, 2);

  return null;
}

/**
 * Escena unificada en un solo contexto WebGL:
 * - Pase 0: gradiente + estrellas + bloom (cámara NDC, escena principal)
 * - Pase 1: partículas R encima (cámara ortográfica en píxeles, escena aparte)
 */
export default function SiteWebGLScene({
  containerRef,
  enableShaderBackground = true,
  color1,
  color2,
  colorWeights,
  blobRandomness,
  blobDisplacement,
  blobMorphSpeed,
  scrollGradientDownSpeed,
  scrollGradientUpSpeed,
  colorBlend,
  bloomIntensity = DEFAULT_BLOOM_INTENSITY,
  bloomThreshold = DEFAULT_BLOOM_THRESHOLD,
  bloomSmoothing = DEFAULT_BLOOM_SMOOTHING,
  fboScale,
  shaderParticleCount,
}) {
  const footerScene = useMemo(() => new THREE.Scene(), []);
  const footerCameraRef = useRef(
    new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, FOOTER_R_CAMERA_Z * 2),
  );
  const { geometryParticles, footerRParticles } = useParticleRouteFeatures();
  const showFooterParticles = geometryParticles || footerRParticles;

  return (
    <>
      {enableShaderBackground && (
        <ShaderScene
          merged
          containerRef={containerRef}
          color1={color1}
          color2={color2}
          colorWeights={colorWeights}
          blobRandomness={blobRandomness}
          blobDisplacement={blobDisplacement}
          blobMorphSpeed={blobMorphSpeed}
          scrollGradientDownSpeed={scrollGradientDownSpeed}
          scrollGradientUpSpeed={scrollGradientUpSpeed}
          colorBlend={colorBlend}
          enableBloom
          bloomIntensity={bloomIntensity}
          bloomThreshold={bloomThreshold}
          bloomSmoothing={bloomSmoothing}
          fboScale={fboScale}
          shaderParticleCount={shaderParticleCount}
        />
      )}

      {showFooterParticles &&
        createPortal(
          <FooterRScene
            containerRef={containerRef}
            overlayCameraRef={footerCameraRef}
          />,
          footerScene,
        )}

      {showFooterParticles && (
        <FooterOverlayPass
          footerScene={footerScene}
          footerCameraRef={footerCameraRef}
        />
      )}
    </>
  );
}
