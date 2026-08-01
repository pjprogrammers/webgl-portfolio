const compositeFragmentShader = `
precision highp float;

uniform sampler2D u_scene;
uniform sampler2D u_trail;
uniform float u_time;
uniform float u_pointerEngage;
uniform vec2 u_resolution;

varying vec2 vUv;

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
  float amplitude = 0.55;
  mat2 rot = mat2(0.87, -0.5, 0.5, 0.87);
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p);
    p = rot * p * 2.05 + 19.7;
    amplitude *= 0.48;
  }
  return value;
}

vec2 toAspect(vec2 uv) {
  return vec2(uv.x * u_resolution.x / u_resolution.y, uv.y);
}

vec2 fromAspect(vec2 p) {
  return vec2(p.x / (u_resolution.x / u_resolution.y), p.y);
}

vec2 trailBlobCenter(vec2 uv) {
  vec2 texel = vec2(1.0 / u_resolution.x, 1.0 / u_resolution.y);
  vec2 p = uv;

  for (int i = 0; i < 4; i++) {
    float c = texture2D(u_trail, p).r;
    if (c < 0.0001) break;

    float r = texture2D(u_trail, clamp(p + vec2(texel.x, 0.0), 0.0, 1.0)).r;
    float l = texture2D(u_trail, clamp(p - vec2(texel.x, 0.0), 0.0, 1.0)).r;
    float u = texture2D(u_trail, clamp(p + vec2(0.0, texel.y), 0.0, 1.0)).r;
    float d = texture2D(u_trail, clamp(p - vec2(0.0, texel.y), 0.0, 1.0)).r;
    vec2 grad = vec2(r - l, u - d);
    float len = length(grad);
    if (len < 0.00001) break;
    p += (grad / len) * texel.x * 1.6;
  }

  return clamp(p, 0.0, 1.0);
}

float trailBlobScaled(vec2 uv) {
  vec4 data = texture2D(u_trail, uv);
  float intensity = data.r;
  float scale = data.b;

  if (intensity < 0.001) return 0.0;
  if (scale > 0.985) return intensity;

  vec2 center = trailBlobCenter(uv);
  vec2 scaledUv = center + (uv - center) / max(scale, 0.025);
  float scaledIntensity = texture2D(u_trail, clamp(scaledUv, 0.0, 1.0)).r;

  return scaledIntensity * smoothstep(0.0, 0.12, scale);
}

vec4 sampleScene(vec2 uv) {
  return texture2D(u_scene, clamp(uv, 0.0, 1.0));
}

// Deforma el patrón del fondo siguiendo la dirección del trazo / warp along trail direction
vec2 patternWarp(vec2 uv, float blob) {
  vec2 p = toAspect(uv);
  vec2 nBase = p * 3.2 + vec2(u_time * 0.16, -u_time * 0.13);

  float n1 = fbm(nBase);
  float n2 = fbm(nBase * 1.65 + vec2(5.1, 2.4) - u_time * 0.11);
  float n3 = fbm(nBase * 2.1 - u_time * 0.2 + 8.0);

  vec2 flow = vec2(n1 - n2, n2 - n3);
  flow *= 2.4;

  vec2 texel = vec2(1.0 / u_resolution.x, 1.0 / u_resolution.y);
  float tC = trailBlobScaled(uv);
  float tR = trailBlobScaled(clamp(uv + vec2(texel.x, 0.0), 0.0, 1.0));
  float tU = trailBlobScaled(clamp(uv + vec2(0.0, texel.y), 0.0, 1.0));
  vec2 grad = vec2(tR - tC, tU - tC);
  float gradLen = length(grad);
  vec2 vel = gradLen > 0.00008 ? grad / gradLen : vec2(0.0);
  vec2 right = vec2(-vel.y, vel.x);

  flow += vel * blob * 1.4;
  flow += right * blob * 0.65;

  float amp = blob * (0.028 + u_pointerEngage * 0.022);
  return fromAspect(flow * amp);
}

void main() {
  vec2 uv = vUv;
  vec4 base = sampleScene(uv);

  float blob = trailBlobScaled(uv);
  if (blob < 0.001) {
    gl_FragColor = base;
    return;
  }

  vec2 warp = patternWarp(uv, blob);
  vec4 warped = sampleScene(uv + warp);
  vec4 warpedDeep = sampleScene(uv + warp * 1.35 + vec2(warp.y, -warp.x) * 0.15);
  vec4 displaced = mix(warped, warpedDeep, blob * 0.4);

  gl_FragColor = mix(base, displaced, clamp(blob * 0.98, 0.0, 1.0));
}
`;

export default compositeFragmentShader;
