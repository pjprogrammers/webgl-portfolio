/** Paleta default del gradiente (color1 = highlight → color2 = base oscura). */
export const DEFAULT_SHADER_COLORS = {
  color1: "#0D0718",
  color2: "#3F2476",
};

/** % del canvas que ocupa cada banda (color1 = highlight → color2 = base). Suma ~100. */
export const DEFAULT_COLOR_WEIGHTS = [0, 100];

/** 0 = manchas suaves/coherentes, 1 = formas caóticas y fragmentadas. */
export const DEFAULT_BLOB_RANDOMNESS = 0.35;

/** 0 = casi estáticas, 1 = recorren más espacio (warp + remolino). */
export const DEFAULT_BLOB_DISPLACEMENT = 0.55;

/** Velocidad de morphing/evolución de cada mancha (1 = ritmo base). */
export const DEFAULT_BLOB_MORPH_SPEED = 1.3;

/** Scroll abajo: multiplicador del noise/colores del gradiente. */
export const DEFAULT_SCROLL_GRADIENT_DOWN_SPEED = 1.8;

/** Scroll arriba: multiplicador del noise/colores. */
export const DEFAULT_SCROLL_GRADIENT_UP_SPEED = 0.3;

/** 0 = colores definidos/separados, 1 = mezcla suave (default). */
export const DEFAULT_COLOR_BLEND = 1;

/** Intensidad del bloom post-procesado (solo canvas shader dedicado). */
export const DEFAULT_BLOOM_INTENSITY = 2;

/** Umbral de luminancia para el bloom (0–1). */
export const DEFAULT_BLOOM_THRESHOLD = 0.02;

/** Suavizado del threshold del bloom. */
export const DEFAULT_BLOOM_SMOOTHING = 0.3;

export const CSS_FALLBACK_GRADIENT =
  "radial-gradient(ellipse at 45% 35%, #634E7E 0%, #403052 45%, #030205 100%)";
