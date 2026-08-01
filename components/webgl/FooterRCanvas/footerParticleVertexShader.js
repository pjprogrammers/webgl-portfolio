const footerParticleVertexShader = `
uniform float uSizeRef;
uniform float uLocalZExtent;
uniform float uZAlphaMin;
uniform float uZAlphaMax;

attribute float size;
attribute float brightness;
attribute float opacity;
attribute vec3 color;

varying vec3 vColor;
varying float vBrightness;
varying float vOpacity;

void main() {
  vColor = color;

  float localExtent = max(uLocalZExtent, 1.0);
  float zNorm = clamp(position.z / localExtent, -1.0, 1.0);
  float depthAlpha = mix(uZAlphaMin, uZAlphaMax, zNorm * 0.5 + 0.5);
  vOpacity = opacity * depthAlpha;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

  // Profundidad del centro del grupo: evita que la rotación infle tamaño/brillo en un borde.
  float centerDepth = max(-mvCenter.z, 1.0);
  float depthScale = uSizeRef / centerDepth;

  // Variación sutil por Z local (parallax original), sin amplificar la inclinación del grupo.
  float localZFactor = 1.0 + (position.z / localExtent) * 0.1;
  localZFactor = clamp(localZFactor, 0.9, 1.1);

  float sizeScale = depthScale * localZFactor;
  gl_PointSize = clamp(size * sizeScale, 0.0, 64.0);
  vBrightness = brightness * clamp(sizeScale, 0.72, 1.22);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export default footerParticleVertexShader;
