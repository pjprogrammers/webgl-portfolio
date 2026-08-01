/** Estado de scroll: estrella → diamante → dissolve out → formación R (footer). */
export const particleScrollState = {
  /** Geometría activa leída del primer `[data-geometry]` del DOM. */
  shapeTarget: "star",
  /** Escala xyz del tramo activo (`data-geometry-scale`). */
  geometryScale: { x: 1, y: 1, z: 1 },
  /** Offset xyz en espacio normalizado (`data-geometry-position`). */
  geometryPosition: { x: 0, y: 0, z: 0 },
  /** Rotación xyz en grados (`data-geometry-rotation`). */
  geometryRotation: { x: 0, y: 0, z: 0 },
  /** 0 = estrella, 1 = diamante (morph por vértices 1-a-1). */
  shapeMorph: 0,
  /** Si el tramo activo usa vuelo orbital (false = lerp directo entre geos). */
  shapeMorphUseFlight: true,
  /** Rotación Y (rad) del grupo de geometría impulsada por scroll. */
  geometryScrollRotationY: 0,
  /** 0 = forma visible, 1 = dispersas con opacidad 0. */
  dissolve: 0,
  /** 0 = no formada, 1 = R completa en el footer. */
  rFormation: 0,
  /**
   * true mientras corre el dissolve-out de navegación entre páginas.
   * Permite disolver la R del footer aunque `rFormation` no llegue a 1
   * (el footer suele toparse con el límite de scroll antes de formarse al 100%).
   */
  pageDissolveOut: false,
};
