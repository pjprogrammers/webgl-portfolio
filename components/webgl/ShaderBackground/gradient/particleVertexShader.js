const particleVertexShader = `
uniform float uSizeRef;
uniform float uSpawnFar;

attribute float size;
attribute float brightness;
attribute vec3 color;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-mvPosition.z, 1.0);

  gl_PointSize = size * (uSizeRef / depth);
  gl_PointSize = clamp(gl_PointSize, 0.0, 56.0);

  float approach = clamp(1.0 + mvPosition.z / uSpawnFar, 0.2, 1.0);
  vBrightness = brightness * approach;

  gl_Position = projectionMatrix * mvPosition;
}
`;

export default particleVertexShader;
