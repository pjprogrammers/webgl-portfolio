import { shaderMaterial } from "@react-three/drei";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uAlpha;
  uniform vec2 uResolution;
  uniform float uBandCount;
  uniform vec4 uBand0;
  uniform vec4 uBand1;
  uniform vec4 uBand2;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uEdgeFeather;

  varying vec2 vUv;

  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(
      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
      0.0
    );
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    mat2 rot = mat2(0.87, -0.5, 0.5, 0.87);

    for (int i = 0; i < 3; i++) {
      value += amplitude * snoise(p);
      p = rot * p * 2.05 + 19.7;
      amplitude *= 0.48;
    }

    return value;
  }

  float bandMask(
    float screenY,
    vec4 band,
    float noiseOffset,
    float feather
  ) {
    if (band.y <= band.x) return 0.0;

    float maskTop;
    if (band.z > 0.5) {
      float topEdge = band.x + noiseOffset;
      maskTop = smoothstep(topEdge - feather, topEdge + feather, screenY);
    } else {
      maskTop = screenY >= band.x ? 1.0 : 0.0;
    }

    float maskBottom;
    if (band.w > 0.5) {
      float bottomEdge = band.y + noiseOffset;
      maskBottom = 1.0 - smoothstep(bottomEdge - feather, bottomEdge + feather, screenY);
    } else {
      maskBottom = screenY <= band.y ? 1.0 : 0.0;
    }

    return maskTop * maskBottom;
  }

  void main() {
    float screenY = (1.0 - vUv.y) * uResolution.y;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 noiseUv = vec2(vUv.x * aspect, screenY / max(uResolution.y, 1.0)) * uNoiseScale;
    float noise = fbm(noiseUv);
    float noiseOffset = noise * uNoiseStrength * uResolution.y;
    float feather = uEdgeFeather * uResolution.y;

    float mask = 0.0;

    if (uBandCount > 0.5) {
      mask = max(mask, bandMask(screenY, uBand0, noiseOffset, feather));
    }
    if (uBandCount > 1.5) {
      mask = max(mask, bandMask(screenY, uBand1, noiseOffset, feather));
    }
    if (uBandCount > 2.5) {
      mask = max(mask, bandMask(screenY, uBand2, noiseOffset, feather));
    }

    float alpha = uAlpha * mask;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

export const WhiteShaderMaterial = shaderMaterial(
  {
    uAlpha: 0,
    uResolution: [1, 1],
    uBandCount: 0,
    uBand0: [0, 0, 0, 0],
    uBand1: [0, 0, 0, 0],
    uBand2: [0, 0, 0, 0],
    uNoiseScale: 2.8,
    uNoiseStrength: 0.11,
    uEdgeFeather: 0.045,
  },
  vertexShader,
  fragmentShader,
);
