/** Bandas visibles del white shader en px desde el top del viewport (top, bottom). */
export const whiteShaderScrollState = {
  bands: [
    { top: 0, bottom: 0 },
    { top: 0, bottom: 0 },
    { top: 0, bottom: 0 },
  ],
  bandCount: 0,
};

export function resetWhiteShaderScrollState() {
  whiteShaderScrollState.bandCount = 0;
  for (const band of whiteShaderScrollState.bands) {
    band.top = 0;
    band.bottom = 0;
  }
}
