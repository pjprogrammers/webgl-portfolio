const footerParticleFragmentShader = `
precision highp float;

uniform float uGlowBoost;
uniform float uHaloStrength;

varying vec3 vColor;
varying float vBrightness;
varying float vOpacity;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = dot(uv, uv);
  if (dist > 0.25) discard;

  float core = smoothstep(0.14, 0.0, dist);
  float halo = smoothstep(0.25, 0.035, dist);
  float shape = core + halo * uHaloStrength;

  float alpha = shape * vOpacity * clamp(vBrightness, 0.0, 3.0);
  vec3 rgb = vColor * (0.72 + vBrightness * 1.05);
  rgb *= 1.0 + core * uGlowBoost;

  gl_FragColor = vec4(rgb, alpha * 0.82);
}
`;

export default footerParticleFragmentShader;
