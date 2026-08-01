const fragmentShader = `
precision highp float;

uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_weight1;
uniform float u_weight2;
uniform float u_blobRandomness;
uniform float u_blobDisplacement;
uniform float u_blobMorphSpeed;
uniform float u_colorBlend;

varying vec2 vUv;

const float BLOB_SCALE = 0.35;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.72;
  mat2 rot = mat2(0.87, -0.5, 0.5, 0.87);

  for (int i = 0; i < 2; i++) {
    value += amplitude * snoise(p);
    p = rot * p * 1.55 + 19.7;
    amplitude *= 0.55;
  }

  return value;
}

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// Warp suave: intensidad controlada por u_blobDisplacement
vec2 domainWarp(vec2 p, float time, float displacement) {
  float t1 = time * 0.13;
  float t2 = time * 0.087;

  vec2 q = vec2(
    fbm(p + vec2(t1, t2)),
    fbm(p + vec2(4.7, 2.3) + vec2(-t2, t1))
  );

  return p + q * mix(0.0, 0.28, displacement);
}

// u_blobRandomness controla cuánto varía la forma entre capas
float fbmAnimated(vec2 p, float phase, float randomness) {
  float value = 0.0;
  float amplitude = 0.72;
  mat2 rot = mat2(0.87, -0.5, 0.5, 0.87);
  float evolutionAmp = mix(0.04, 0.14, randomness);

  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 evolution = vec2(
      sin(phase * (0.28 + fi * 0.12) + fi * 2.1),
      cos(phase * (0.24 + fi * 0.1) - fi * 1.7)
    ) * (evolutionAmp + fi * evolutionAmp * 0.35);

    value += amplitude * snoise(p + evolution);
    p = rot * p * 1.55 + 19.7;
    amplitude *= 0.55;
  }

  return value;
}

float smoother(float t) {
  return t * t * (3.0 - 2.0 * t);
}

float colorTransition(float lt) {
  return mix(step(0.5, lt), smoother(lt), u_colorBlend);
}

vec3 palette2(float t) {
  t = clamp(t, 0.0, 1.0);

  float total = u_weight1 + u_weight2;
  float w2 = total > 0.001 ? u_weight2 / total : 0.55;

  // Mezcla continua en todo el rango — sin zonas planas de un solo color
  float biased = pow(t, mix(1.0, max(w2, 0.2), u_colorBlend * 0.65 + 0.35));
  float blendT = smoother(smoother(biased));

  return mix(u_color2, u_color1, colorTransition(blendT));
}

void main() {
  vec2 uv = vUv;
  float time = u_time * u_blobMorphSpeed;

  vec2 centered = (uv - 1.0) * BLOB_SCALE;

  float swirl = time * 0.17;
  vec2 swirled = rot2(swirl * mix(0.0, 0.35, u_blobDisplacement)) * centered;

  vec2 nBase = domainWarp(swirled, time, u_blobDisplacement);

  float tA = time * 0.21;
  float tB = time * 0.14;
  float n1 = fbmAnimated(nBase, tA, u_blobRandomness);
  float n2 = fbmAnimated(nBase + vec2(8.3, 5.1), tB + 1.3, u_blobRandomness);
  float n3 = fbmAnimated(
    nBase + vec2(-6.2, 9.4),
    tA * 0.85 + tB * 0.6 + 2.7,
    u_blobRandomness
  );

  float fieldCoherent = n1 * 0.58 + n2 * 0.24 + n3 * 0.18;
  float fieldChaotic = (n1 + n2 + n3) / 3.0;
  float field = mix(fieldCoherent, fieldChaotic, u_blobRandomness) + 0.02;

  float edge = mix(0.14, 0.58, u_colorBlend);
  float mask = smoothstep(-edge, edge, field);
  float maskSmooth = smoother(smoother(mask));
  mask = mix(mask, maskSmooth, u_colorBlend);

  float spatial = smoother(clamp(uv.y * 0.46 + (1.0 - uv.x) * 0.2, 0.0, 1.0));
  float detail = fbmAnimated(
    nBase * 1.3 + vec2(3.1, -2.8),
    time * 0.32,
    u_blobRandomness
  ) * mix(0.002, 0.012, u_blobRandomness);

  float rampRaw = clamp(mask * 0.4 + spatial * 0.48 + detail + 0.02, 0.0, 1.0);
  float expo = mix(3.8, 0.82, u_colorBlend);
  rampRaw = pow(rampRaw, expo);

  float rampLo = mix(0.0, 0.04, u_colorBlend);
  float rampHi = mix(1.0, 0.78, u_colorBlend);
  float rampT = (rampRaw - rampLo) / max(rampHi - rampLo, 0.001);

  gl_FragColor = vec4(palette2(rampT), 1.0);
}
`;

export default fragmentShader;
