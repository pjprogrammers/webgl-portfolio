export interface TextureCoverTransform {
  scale: [number, number];
  offset: [number, number];
}

export function computeTextureCoverTransform(
  texWidth: number,
  texHeight: number,
  planeAspect: number,
): TextureCoverTransform {
  if (texWidth <= 0 || texHeight <= 0) {
    return { scale: [1, 1], offset: [0, 0] };
  }

  const texAspect = texWidth / texHeight;

  if (texAspect > planeAspect) {
    const scaleX = planeAspect / texAspect;
    return { scale: [scaleX, 1], offset: [(1 - scaleX) * 0.5, 0] };
  }

  const scaleY = texAspect / planeAspect;
  return { scale: [1, scaleY], offset: [0, (1 - scaleY) * 0.5] };
}

export function coverToVec4({ scale, offset }: TextureCoverTransform): [number, number, number, number] {
  return [scale[0], scale[1], offset[0], offset[1]];
}
