export const carouselVertexShader = /* glsl */ `
uniform float uBarrelStrength;
uniform float uBarrelScale;
uniform float uBarrelEdgeLift;
uniform float uMeshX;
uniform float uMeshWidth;
uniform float uViewportWidth;

varying vec2 vUv;

const float M_PI = 3.14159265;

// Global viewport pincushion on Y — continuous across all visible cards.
// Uses world X (not per-card UV) so the curve is one shared mask.
vec3 globalViewportBarrelY(vec3 pos) {
  float vertexWorldX = uMeshX + pos.x * uMeshWidth;
  float normalizedX = clamp(vertexWorldX / (uViewportWidth * 0.5), -1.0, 1.0);
  float distFromCenter = abs(normalizedX);

  // 1 at viewport center → max pinch, 0 at edges → no pinch
  float pinchAtX = cos(distFromCenter * M_PI * 0.5);
  float edgeAtX = 1.0 - pinchAtX;
  float s = uBarrelStrength * uBarrelScale;

  // Inward curve: compress at center, lift at edges
  pos.y *= 1.0 - pinchAtX * s;
  pos.y *= 1.0 + edgeAtX * s * uBarrelEdgeLift;

  return pos;
}

void main() {
  vUv = uv;

  vec3 pos = globalViewportBarrelY(position);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const carouselFragmentShader = /* glsl */ `
uniform sampler2D uImageTexture;
uniform sampler2D uVideoTexture;
uniform sampler2D uDispTexture;
uniform sampler2D uDataTexture;
uniform vec4 uImageCover;
uniform vec4 uVideoCover;
uniform float uProgress;
uniform float uDispEffectFactor;
uniform float uGridUvDistort;
uniform float uReveal;

varying vec2 vUv;

vec2 coverUv(vec2 uv, vec4 cover) {
  return uv * cover.xy + cover.zw;
}

vec2 distortCoverUv(vec2 uv, vec4 cover) {
  vec2 baseUv = coverUv(uv, cover);
  vec4 gridOffset = texture2D(uDataTexture, uv);
  return baseUv - uGridUvDistort * gridOffset.rg;
}

void main() {
  // Reveal de entrada: las cards aparecen con displacement (UV desplazada)
  // y alpha 0 -> 1. uReveal = 0 (oculta) -> 1 (visible / estado final).
  vec4 disp = texture2D(uDispTexture, vUv);
  float dispVal = disp.r * uDispEffectFactor;
  float revealDisp = (1.0 - uReveal) * dispVal;

  vec2 imgUv = distortCoverUv(vUv, uImageCover);
  vec2 videoUv = distortCoverUv(vUv, uVideoCover);
  imgUv.x += revealDisp;
  videoUv.x += revealDisp;

  vec4 color;
  if (uProgress >= 0.999) {
    color = texture2D(uVideoTexture, videoUv);
  } else if (uProgress <= 0.001) {
    color = texture2D(uImageTexture, imgUv);
  } else {
    vec2 distortedImg = vec2(imgUv.x + uProgress * dispVal, imgUv.y);
    vec2 distortedVideo = vec2(
      videoUv.x - (1.0 - uProgress) * dispVal,
      videoUv.y
    );

    vec4 imgColor = texture2D(uImageTexture, distortedImg);
    vec4 videoColor = texture2D(uVideoTexture, distortedVideo);

    color = mix(imgColor, videoColor, uProgress);
  }

  color.a *= uReveal;
  gl_FragColor = color;
}
`;
