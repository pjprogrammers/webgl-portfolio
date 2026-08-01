const particleFragmentShader = `
precision highp float;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = dot(uv, uv);
  if (dist > 0.25) discard;

  float core = smoothstep(0.25, 0.06, dist);
  float alpha = core * 0.26 * clamp(vBrightness, 0.0, 2.5);
  vec3 rgb = vColor * (0.4 + vBrightness * 0.7);

  gl_FragColor = vec4(rgb, alpha);
}
`;

export default particleFragmentShader;
