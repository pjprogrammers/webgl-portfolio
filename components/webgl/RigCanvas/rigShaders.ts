export const rigVertexShader = /* glsl */ `
uniform float uBarrelStrength;
uniform float uBarrelScale;
uniform float uBarrelEdgeLift;
uniform float uScrollDirection;
uniform float uMeshY;
uniform float uMeshHeight;
uniform float uViewportHeight;

varying vec2 vUv;

const float M_PI = 3.14159265;

// Vertical-scroll counterpart of carousel globalViewportBarrelY:
// one shared viewport curve on X driven by world Y.
vec3 globalViewportBarrelX(vec3 pos) {
  float vertexWorldY = uMeshY + pos.y * uMeshHeight;
  float normalizedY = clamp(vertexWorldY / (uViewportHeight * 0.5), -1.0, 1.0);
  float distFromCenter = abs(normalizedY);

  float pinchAtY = cos(distFromCenter * M_PI * 0.5);
  float edgeAtY = 1.0 - pinchAtY;
  float s = uBarrelStrength * uBarrelScale * uScrollDirection;

  pos.x *= 1.0 - pinchAtY * s;
  pos.x *= 1.0 + edgeAtY * s * uBarrelEdgeLift;

  return pos;
}

void main() {
  vUv = uv;
  vec3 pos = globalViewportBarrelX(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const rigFragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform vec2 uTextureRepeat;
uniform vec2 uTextureOffset;
uniform float uAlpha;
uniform float uGridUvDistort;

varying vec2 vUv;

void main() {
  vec4 gridOffset = texture2D(uDataTexture, vUv);
  vec2 uv = vUv * uTextureRepeat + uTextureOffset - uGridUvDistort * gridOffset.rg;
  gl_FragColor = vec4(texture2D(uTexture, uv).rgb, uAlpha);
}
`;
