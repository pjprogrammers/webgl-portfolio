"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { OrthographicCamera, useFBO } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap/registerPlugin";
import { registerTickerCallback } from "@/lib/ticker";
import GUI from "lil-gui";

import GradientMesh from "./GradientMesh.jsx";
import { createParticleField, STAR_FOV } from "./particleSimulation.js";
import compositeFragmentShader from "./gradient/compositeFragmentShader.js";
import compositeVertexShader from "./gradient/compositeVertexShader.js";
import trailFragmentShader from "./gradient/trailFragmentShader.js";
import {
  createPointer,
  updatePointerFromClient,
  updatePointerSpeed,
  updatePointerSmooth,
  updatePointerVfxEngage,
  updatePointerScrollBoost,
} from "./gradient/pointer.js";
import { useScrollStore } from "@/stores/scroll-store";

const CURSOR_BLOT_RADIUS = 90;
const TRAIL_FADE = 0.968;

export default function ShaderScene({
  containerRef,
  color1,
  color2,
  colorWeights,
  blobRandomness,
  blobDisplacement,
  blobMorphSpeed,
  scrollGradientDownSpeed,
  scrollGradientUpSpeed,
  colorBlend,
  bloomIntensity,
  bloomThreshold,
  bloomSmoothing,
  enableBloom = true,
  /** En canvas fusionado: sin cámara makeDefault ni bloom (las partículas R van encima). */
  merged = false,
  fboScale = 1,
  shaderParticleCount,
  isMobile,
}) {
  const { gl, size } = useThree();
  const ww = size.width;
  const wh = size.height;
  const fboW = Math.max(1, Math.round(ww * fboScale));
  const fboH = Math.max(1, Math.round(wh * fboScale));

  const gradientScene = useMemo(() => new THREE.Scene(), []);
  const starScene = useMemo(() => new THREE.Scene(), []);
  const trailScene = useMemo(() => new THREE.Scene(), []);
  const postCamera = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
  const gradientCamera = useRef(
    new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 100),
  );
  const starCamera = useRef(new THREE.PerspectiveCamera(STAR_FOV, 1, 1, 4000));

  const pointer = useMemo(() => createPointer(), []);
  const particles = useMemo(
    () => createParticleField(pointer, shaderParticleCount),
    [pointer, shaderParticleCount],
  );
  const sceneFbo = useFBO(fboW, fboH);
  const trailFboA = useFBO(fboW, fboH);
  const trailFboB = useFBO(fboW, fboH);

  const trailReadRef = useRef(trailFboA);
  const trailWriteRef = useRef(trailFboB);

  const gradientRef = useRef(null);
  const gradientUniformsRef = useRef(null);
  const trailUniformsRef = useRef(null);
  const compositeUniformsRef = useRef(null);
  const colorTweenRef = useRef(null);
  const guiRef = useRef(null);
  const sizeRef = useRef({ ww, wh });
  const scrollGradientSpeedRef = useRef({
    down: scrollGradientDownSpeed,
    up: scrollGradientUpSpeed,
  });

  const blotRadius = CURSOR_BLOT_RADIUS / Math.min(ww, wh);

  const trailUniforms = useMemo(
    () => ({
      u_trailPrev: { value: trailFboA.texture },
      u_time: { value: 0 },
      u_pointer: { value: new THREE.Vector2(0.5, 0.5) },
      u_pointerPrev: { value: new THREE.Vector2(0.5, 0.5) },
      u_pointerEngage: { value: 0 },
      u_pointerRadius: { value: blotRadius },
      u_resolution: { value: new THREE.Vector2(ww, wh) },
      u_fade: { value: TRAIL_FADE },
      u_disengage: { value: 0 },
      u_ageRate: { value: 0.018 },
    }),
    [trailFboA.texture, blotRadius, ww, wh],
  );

  const compositeUniforms = useMemo(
    () => ({
      u_scene: { value: sceneFbo.texture },
      u_trail: { value: trailFboB.texture },
      u_time: { value: 0 },
      u_pointerEngage: { value: 0 },
      u_resolution: { value: new THREE.Vector2(ww, wh) },
    }),
    [sceneFbo.texture, trailFboB.texture, ww, wh],
  );

  useLayoutEffect(() => {
    scrollGradientSpeedRef.current = {
      down: scrollGradientDownSpeed,
      up: scrollGradientUpSpeed,
    };
  }, [scrollGradientDownSpeed, scrollGradientUpSpeed]);

  useLayoutEffect(() => {
    starScene.add(particles.points);
    particles.resize(ww, wh);
    return () => {
      starScene.remove(particles.points);
    };
  }, [starScene, particles, ww, wh]);

  useLayoutEffect(() => {
    sizeRef.current = { ww, wh };

    const gradientCam = gradientCamera.current;
    gradientCam.left = -ww / 2;
    gradientCam.right = ww / 2;
    gradientCam.top = wh / 2;
    gradientCam.bottom = -wh / 2;
    gradientCam.position.z = 1;
    gradientCam.lookAt(0, 0, 0);
    gradientCam.updateProjectionMatrix();

    const starCam = starCamera.current;
    starCam.aspect = ww / Math.max(wh, 1);
    starCam.position.set(0, 0, 0);
    starCam.lookAt(0, 0, -1);
    starCam.updateProjectionMatrix();

    trailUniformsRef.current?.u_resolution.value.set(ww, wh);
    if (trailUniformsRef.current) {
      trailUniformsRef.current.u_pointerRadius.value =
        CURSOR_BLOT_RADIUS / Math.min(ww, wh);
    }
    compositeUniformsRef.current?.u_resolution.value.set(ww, wh);
  }, [ww, wh]);

  useEffect(() => {
    const onPointerMove = (e) => {
      const el = containerRef?.current;
      if (!el) return;
      const { ww: w, wh: h } = sizeRef.current;
      updatePointerFromClient(pointer, e.clientX, e.clientY, el, w, h);
    };

    const onTouchMove = (e) => {
      if (!e.touches.length) return;
      const el = containerRef?.current;
      if (!el) return;
      const { ww: w, wh: h } = sizeRef.current;
      const t = e.touches[0];
      updatePointerFromClient(pointer, t.clientX, t.clientY, el, w, h);
    };

    const unregisterSpeedTick = registerTickerCallback(() => {
      updatePointerSpeed(pointer);
    });

    const onUpdateColors = (e) => {
      const { colors, duration } = e.detail;
      const uniforms = gradientRef.current?.uniforms;
      if (!uniforms || !colors || colors.length < 2) return;

      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap
        .timeline({
          defaults: { duration: duration ?? 3, ease: "power2" },
        })
        .to(
          uniforms.u_color1.value,
          {
            r: new THREE.Color(colors[0]).r,
            g: new THREE.Color(colors[0]).g,
            b: new THREE.Color(colors[0]).b,
          },
          0,
        )
        .to(
          uniforms.u_color2.value,
          {
            r: new THREE.Color(colors[1]).r,
            g: new THREE.Color(colors[1]).g,
            b: new THREE.Color(colors[1]).b,
          },
          0,
        );
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("updateGlBackground", onUpdateColors);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("updateGlBackground", onUpdateColors);
      unregisterSpeedTick();
      colorTweenRef.current?.kill();
    };
  }, [containerRef, pointer]);

  useEffect(() => () => particles.dispose(), [particles]);

  useEffect(() => {
    const destroyGui = () => {
      guiRef.current?.destroy();
      guiRef.current = null;
    };

    const syncDebugGui = () => {
      destroyGui();
      if (process.env.NODE_ENV !== "development") return;
      if (window.location.hash !== "#debug") return;

      const gradientUniforms = gradientRef.current?.uniforms;
      if (!gradientUniforms) return;

      const params = {
        color1,
        color2,
        weight1: colorWeights[0],
        weight2: colorWeights[1],
        blobRandomness,
        blobDisplacement,
        blobMorphSpeed,
        colorBlend,
        bloomIntensity,
        bloomThreshold,
      };

      const gui = new GUI({ title: "Shader BG (dev)" });
      gui.domElement.style.zIndex = "170";
      guiRef.current = gui;

      const folder = gui.addFolder("Colores / Colors");
      folder.open();

      const bindColor = (paramKey, uniformKey) => {
        folder.addColor(params, paramKey).onChange((value) => {
          gradientUniforms[uniformKey].value.set(value);
        });
      };

      bindColor("color1", "u_color1");
      bindColor("color2", "u_color2");

      const weightsFolder = gui.addFolder("Pesos % / Weights %");
      weightsFolder.open();
      const weightSum = { total: colorWeights.reduce((a, b) => a + b, 0) };
      weightsFolder
        .add(weightSum, "total")
        .name("Suma / Sum")
        .disable()
        .listen();

      const bindWeight = (paramKey, uniformKey) => {
        weightsFolder
          .add(params, paramKey, 0, 100, 1)
          .name(`${paramKey.replace("weight", "color")} %`)
          .onChange((value) => {
            gradientUniforms[uniformKey].value = value;
            weightSum.total = params.weight1 + params.weight2;
          });
      };

      bindWeight("weight1", "u_weight1");
      bindWeight("weight2", "u_weight2");

      const blobsFolder = gui.addFolder("Manchas / Blobs");
      blobsFolder.open();
      blobsFolder
        .add(params, "blobRandomness", 0, 1, 0.01)
        .name("Randomness")
        .onChange((value) => {
          gradientUniforms.u_blobRandomness.value = value;
        });
      blobsFolder
        .add(params, "blobDisplacement", 0, 1, 0.01)
        .name("Desplazamiento / Displacement")
        .onChange((value) => {
          gradientUniforms.u_blobDisplacement.value = value;
        });
      blobsFolder
        .add(params, "blobMorphSpeed", 0, 2, 0.01)
        .name("Velocidad morph / Morph speed")
        .onChange((value) => {
          gradientUniforms.u_blobMorphSpeed.value = value;
        });

      const motionFolder = gui.addFolder("Animación / Motion");
      motionFolder.open();
      motionFolder
        .add(params, "colorBlend", 0, 1, 0.01)
        .name("Mezcla / Blend")
        .onChange((value) => {
          gradientUniforms.u_colorBlend.value = value;
        });

      const bloomFolder = gui.addFolder("Bloom");
      bloomFolder.open();
      bloomFolder
        .add(params, "bloomIntensity", 0, 2, 0.01)
        .name("Intensidad")
        .onChange(() => {
          window.dispatchEvent(new Event("shader-bloom-update"));
        });
      bloomFolder
        .add(params, "bloomThreshold", 0, 1, 0.01)
        .name("Threshold")
        .onChange(() => {
          window.dispatchEvent(new Event("shader-bloom-update"));
        });
    };

    syncDebugGui();
    window.addEventListener("hashchange", syncDebugGui);

    return () => {
      window.removeEventListener("hashchange", syncDebugGui);
      destroyGui();
    };
  }, [
    color1,
    color2,
    colorWeights,
    blobRandomness,
    blobDisplacement,
    blobMorphSpeed,
    colorBlend,
    bloomIntensity,
    bloomThreshold,
  ]);

  useFrame((_, delta) => {
    updatePointerSmooth(pointer, delta);
    updatePointerVfxEngage(pointer, delta);
    const lenis = useScrollStore.getState().lenis;
    const { down: gradientDownSpeed, up: gradientUpSpeed } =
      scrollGradientSpeedRef.current;
    updatePointerScrollBoost(
      pointer,
      lenis?.direction ?? 0,
      lenis?.velocity ?? 0,
      delta,
      { gradientDownSpeed, gradientUpSpeed },
    );
    const gradientUniforms = gradientUniformsRef.current;
    const trailUniforms = trailUniformsRef.current;
    const compositeUniforms = compositeUniformsRef.current;
    if (!gradientUniforms || !trailUniforms || !compositeUniforms) return;

    const trailActive =
      pointer.vfxEngage > 0.02 ||
      pointer.disengageProgress > 0.02 ||
      pointer.engagement > 0.02;

    gradientUniforms.u_time.value += delta * pointer.scrollGradientBoost;
    trailUniforms.u_time.value += delta;
    compositeUniforms.u_time.value += delta;

    const trailRead = trailReadRef.current;
    const trailWrite = trailWriteRef.current;

    if (trailActive) {
      trailUniforms.u_trailPrev.value = trailRead.texture;
      trailUniforms.u_pointer.value.set(pointer.uvSmooth.x, pointer.uvSmooth.y);
      trailUniforms.u_pointerPrev.value.set(
        pointer.uvSmoothPrev.x,
        pointer.uvSmoothPrev.y,
      );
      trailUniforms.u_pointerEngage.value = pointer.vfxEngage;
      trailUniforms.u_fade.value = Math.pow(TRAIL_FADE, delta * 60);
      trailUniforms.u_disengage.value = pointer.disengageProgress;
      trailUniforms.u_ageRate.value = 0.018 * delta * 60;

      gl.setRenderTarget(trailWrite);
      gl.setClearColor(0x000000, 0);
      gl.clear();
      gl.render(trailScene, postCamera.current);

      trailReadRef.current = trailWrite;
      trailWriteRef.current = trailRead;
    }

    particles.tick(delta);

    gl.setRenderTarget(sceneFbo);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(gradientScene, gradientCamera.current);
    gl.clearDepth();
    const starCam = starCamera.current;
    starCam.aspect = ww / Math.max(wh, 1);
    starCam.updateProjectionMatrix();
    gl.render(starScene, starCam);

    compositeUniforms.u_scene.value = sceneFbo.texture;
    compositeUniforms.u_trail.value = trailReadRef.current.texture;
    compositeUniforms.u_pointerEngage.value = pointer.vfxEngage;

    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  }, -100);

  return (
    <>
      <OrthographicCamera
        makeDefault
        left={-1}
        right={1}
        top={1}
        bottom={-1}
        near={0}
        far={1}
        position={[0, 0, 0]}
      />

      {createPortal(
        <>
          <GradientMesh
            ref={gradientRef}
            uniformsRef={gradientUniformsRef}
            ww={ww}
            wh={wh}
            color1={color1}
            color2={color2}
            colorWeights={colorWeights}
            blobRandomness={blobRandomness}
            blobDisplacement={blobDisplacement}
            blobMorphSpeed={blobMorphSpeed}
            colorBlend={colorBlend}
          />
        </>,
        gradientScene,
      )}

      {createPortal(
        <mesh frustumCulled={false}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            ref={(material) => {
              trailUniformsRef.current = material?.uniforms ?? null;
            }}
            vertexShader={compositeVertexShader}
            fragmentShader={trailFragmentShader}
            uniforms={trailUniforms}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>,
        trailScene,
      )}

      <mesh frustumCulled={false} renderOrder={0}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={(material) => {
            compositeUniformsRef.current = material?.uniforms ?? null;
          }}
          vertexShader={compositeVertexShader}
          fragmentShader={compositeFragmentShader}
          uniforms={compositeUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {enableBloom && (
        <EffectComposer multisampling={0} renderPriority={1}>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={bloomThreshold}
            luminanceSmoothing={bloomSmoothing}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}
