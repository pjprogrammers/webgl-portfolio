const trailFragmentShader = `
precision highp float;

uniform sampler2D u_trailPrev;
uniform vec2 u_pointer;
uniform vec2 u_pointerPrev;
uniform float u_pointerEngage;
uniform float u_pointerRadius;
uniform vec2 u_resolution;
uniform float u_fade;
uniform float u_disengage;
uniform float u_ageRate;
uniform float u_time;

varying vec2 vUv;

const float TRAIL_LEN_NORM = 0.38;

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

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ba = b - a;
  float len2 = dot(ba, ba);
  if (len2 < 0.00001) return length(p - a);
  float t = clamp(dot(p - a, ba) / len2, 0.0, 1.0);
  return length(p - a - ba * t);
}

float headDistForPoint(vec2 p, vec2 prev, vec2 cur) {
  vec2 ba = cur - prev;
  float len2 = dot(ba, ba);
  if (len2 < 0.00001) return length(p - cur) / TRAIL_LEN_NORM;
  float t = clamp(dot(p - prev, ba) / len2, 0.0, 1.0);
  return (1.0 - t) * sqrt(len2) / TRAIL_LEN_NORM;
}

float exitScale(float headDist) {
  return clamp(1.0 - (u_disengage * 1.2 - (1.0 - headDist)), 0.0, 1.0);
}

float stampBlob(vec2 p, vec2 center, float radius, float engage) {
  float dist = length(p - center);
  vec2 nCoord = p * 4.2 + vec2(u_time * 0.22, -u_time * 0.19);
  float edgeNoise = fbm(nCoord) * radius * 0.42;
  edgeNoise += fbm(nCoord * 1.85 + 3.7 - u_time * 0.31) * radius * 0.22;
  float edge = radius + edgeNoise;
  float soft = radius * 0.22 + 0.012;
  float blob = 1.0 - smoothstep(edge, edge + soft, dist);
  float pulse = 0.88 + 0.12 * sin(u_time * 1.6 + fbm(p * 2.0) * 3.0);
  return blob * engage * pulse;
}

float stampSegment(vec2 p, vec2 a, vec2 b, float radius, float engage) {
  float dist = min(distToSegment(p, a, b), length(p - b));
  vec2 nCoord = p * 4.2 + vec2(u_time * 0.22, -u_time * 0.19);
  float edgeNoise = fbm(nCoord) * radius * 0.42;
  edgeNoise += fbm(nCoord * 1.85 + 3.7 - u_time * 0.31) * radius * 0.22;
  float edge = radius + edgeNoise;
  float soft = radius * 0.22 + 0.012;
  float blob = 1.0 - smoothstep(edge, edge + soft, dist);
  float pulse = 0.88 + 0.12 * sin(u_time * 1.6 + fbm(p * 2.0) * 3.0);
  return blob * engage * pulse;
}

void main() {
  vec2 uv = vUv;
  vec4 prev = texture2D(u_trailPrev, uv);
  float trail = prev.r * u_fade;
  float headDist = prev.g;
  float scale = prev.b;

  if (u_pointerEngage > 0.008) {
    vec2 p = toAspect(uv);
    vec2 cur = toAspect(u_pointer);
    vec2 prevPt = toAspect(u_pointerPrev);
    float radius = u_pointerRadius * (0.5 + u_pointerEngage * 0.35);

    float stamp = stampSegment(p, prevPt, cur, radius, u_pointerEngage);
    float stampHeadDist = headDistForPoint(p, prevPt, cur);

    vec2 seg = cur - prevPt;
    float segLen = length(seg);
    if (segLen > 0.0001) {
      float step = radius * 0.22;
      int nSteps = int(clamp(segLen / step, 1.0, 12.0));
      for (int i = 0; i <= 12; i++) {
        if (i > nSteps) break;
        float t = float(i) / float(nSteps);
        vec2 pt = mix(prevPt, cur, t);
        float blob = stampBlob(p, pt, radius, u_pointerEngage);
        if (blob > stamp) {
          stamp = blob;
          stampHeadDist = (1.0 - t) * segLen / TRAIL_LEN_NORM;
        }
      }
    } else {
      float blob = stampBlob(p, cur, radius, u_pointerEngage);
      if (blob > stamp) {
        stamp = blob;
        stampHeadDist = 0.0;
      }
    }

    if (stamp > trail) {
      trail = stamp;
      headDist = clamp(stampHeadDist, 0.0, 1.0);
      scale = 1.0;
    } else if (trail > 0.001) {
      headDist = min(headDist + u_ageRate, 1.0);
      scale = 1.0;
    }
  } else if (trail > 0.001) {
    scale = exitScale(headDist);
    trail *= scale;
  } else {
    headDist = 0.0;
    scale = 0.0;
  }

  gl_FragColor = vec4(trail, headDist, scale, 1.0);
}
`;

export default trailFragmentShader;
