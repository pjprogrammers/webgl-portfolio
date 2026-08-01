/** Fracción del lado menor del canvas que ocupa la R / forma de partículas (0–1). */
export const FOOTER_R_SIZE_FILL = 0.68;

/**
 * Escala de starGeometry al espacio normalizado de la R.
 * Equivale al antiguo radio de esfera (0.48) sobre el extent raw de la estrella (~2.55).
 */
export const PARTICLE_SHAPE_SCALE = 0.48 / 2.55;

/**
 * Morph entre geometrías (estrella ↔ diamante): expansión radial máxima en el punto medio.
 * 0 = sin expansión; ~0.5–0.7 = vuelo visible hacia afuera durante el giro.
 */
export const PARTICLE_SHAPE_MORPH_EXPAND = 0.62;

/** Grados de rotación en Y al completar el morph (360 = una vuelta completa). */
export const PARTICLE_SHAPE_MORPH_ROTATION_DEGREES = 360;

/**
 * Rotación Y inicial del grupo star/diamond (grados) cuando el scroll está en 0
 * (arriba del sitio). 0 = sin giro al cargar.
 */
export const GEOMETRY_SCROLL_ROTATION_START_DEGREES = 0;

/**
 * Rotación Y final del grupo de geometrías (grados) al iniciar la formación R
 * en el footer. Cubre Hero → dissolve-out → dissolve-in con geometría.
 * La R del footer no hereda este giro (`rFormation` fuerza rotación 0).
 */
// export const GEOMETRY_SCROLL_ROTATION_END_DEGREES = -720;
export const GEOMETRY_SCROLL_ROTATION_END_DEGREES = -2160;

/**
 * Punto de inicio del ScrollTrigger de rotación (sintaxis GSAP).
 * `"top top"` = progreso 0 con la página arriba del todo.
 */
export const GEOMETRY_SCROLL_ROTATION_SCROLL_START = "top top";

/**
 * Scrub de GSAP para la rotación Y del grupo star/diamond por scroll.
 * 1 = acoplado al scroll; 2 = más suavizado / lag.
 */
export const GEOMETRY_SCROLL_ROTATION_SCRUB = 0.7;

/**
 * Fracción del morph (0–1) a partir de la cual las partículas aterrizan en la geo destino.
 * Antes solo orbitan expandidas; al final encajan en la nueva forma.
 */
export const PARTICLE_SHAPE_MORPH_COMMIT_START = 0.68;

/** Amplitud del movimiento aleatorio durante el vuelo del morph (espacio normalizado). */
export const PARTICLE_SHAPE_MORPH_RANDOM_AMOUNT = 0.34;

/** Velocidad base del ruido aleatorio en el morph. */
export const PARTICLE_SHAPE_MORPH_RANDOM_SPEED = 1.35;

/**
 * Fracción del scroll (0–1) de stagger radial en dissolve out.
 * Los bordes arrancan primero; el centro es el último en irse.
 */
export const PARTICLE_DISSOLVE_STAGGER = 0.65;

/** Duración (s) del dissolve out/in en navegación entre páginas. */
export const PARTICLE_PAGE_DISSOLVE_DURATION = 1.35;

/** Tamaño mínimo y máximo de las partículas en píxeles de pantalla. */
export const FOOTER_R_PARTICLE_SIZE_MIN = 0.1;
export const FOOTER_R_PARTICLE_SIZE_MAX = 10;

/**
 * Referencia de profundidad local para alpha/tamaño en shader y spread de spawn en Z.
 * Debe acordar con FOOTER_R_FACE_DEPTH para el parallax al inclinar la R.
 */
export const FOOTER_R_PARTICLE_Z_RANGE = 0.12;

/**
 * Fracción de partículas en el contorno (0–1). El resto rellena la cara frontal de la R.
 * ~0.2 mantiene borde definido sin parecer solo un stroke.
 */
export const FOOTER_R_CONTOUR_PARTICLE_RATIO = 0.2;

/**
 * Grosor del volumen de relleno en espacio normalizado.
 * z=0 es la cara frontal; las partículas se distribuyen hacia z negativo.
 */
export const FOOTER_R_FACE_DEPTH = 0.11;

/**
 * Distancia de la cámara ortográfica en +Z.
 * Debe quedar muy por delante del world Z máximo al inclinar el grupo hacia el cursor;
 * con z=100 las partículas cercanas (~z>100) quedaban detrás del plano de cámara.
 */
export const FOOTER_R_CAMERA_Z = 800;

/** Referencia de profundidad para escalar tamaño y brillo según Z (proporcional a la cámara). */
export const FOOTER_R_DEPTH_SIZE_REF = 700 * (FOOTER_R_CAMERA_Z / 100);

/** Alpha mínimo en Z lejano (partículas al fondo del volumen). */
export const FOOTER_R_PARTICLE_Z_ALPHA_MIN = 0.6;

/** Alpha máximo en Z cercano (partículas al frente del volumen). */
export const FOOTER_R_PARTICLE_Z_ALPHA_MAX = 1;

/**
 * Fracción de partículas (0–1) que empiezan fuera de la R (en el halo de offset).
 * 0 = todas ancladas exactamente al contorno / superficie.
 */
export const FOOTER_R_PARTICLE_OFFSET_RATIO = 0;

/**
 * Desplazamiento máximo desde el punto ancla en espacio normalizado.
 * 0 = sin vagar fuera de la geometría.
 */
export const FOOTER_R_PARTICLE_OFFSET_MAX = 0;

/**
 * Fracción máxima (0–1) de partículas que pueden estar fuera de la geometría a la vez.
 * 0 = ninguna puede salirse del contorno / superficie.
 */
export const FOOTER_R_PARTICLE_OUTSIDE_MAX_RATIO = 0;

/** Rapidez con la que el offset de cada partícula persigue el ruido (mayor = más ágil). */
export const FOOTER_R_PARTICLE_WANDER_SPEED = 0.06;

/**
 * Amplitud del movimiento tipo ruido en espacio normalizado.
 * 0 = solo wobble suave; subir para vibración más orgánica.
 */
export const FOOTER_R_PARTICLE_NOISE_AMOUNT = 0.042;

/** Velocidad del ruido; más alto = partículas más inquietas. */
export const FOOTER_R_PARTICLE_NOISE_SPEED = 0.2;

/** Rango del wobble sinusoidal base (min–max, espacio normalizado). */
export const FOOTER_R_PARTICLE_DRIFT_MIN = 0.006;
export const FOOTER_R_PARTICLE_DRIFT_MAX = 0.018;

/**
 * Fracción del scroll (0–1) de stagger radial en dissolve in.
 * Las anclas del centro entran primero; las del borde, al final.
 */
export const FOOTER_R_FORM_STAGGER = 0.72;

/** Extensión del área de spawn aleatorio respecto al canvas (0–1 por eje). */
export const FOOTER_R_SPAWN_SPREAD = 0.92;

/**
 * Multiplicador de distancia para dissolve out (expansión hacia afuera del canvas).
 * 2 = las partículas viajan al doble de distancia desde la forma.
 */
export const PARTICLE_SPAWN_DISTANCE_MULTIPLIER = 2;

/**
 * Rotación de las partículas durante dissolve out / dissolve in.
 * Grados totales al completar la transición (negativo = sentido opuesto).
 */
export const PARTICLE_DISSOLVE_ROTATION_DEGREES = 360;

/** Eje de rotación durante dissolve: `"x"` | `"y"` | `"z"`. */
export const PARTICLE_DISSOLVE_ROTATION_AXIS = "y";

/**
 * Intensidad del tilt del grupo hacia el cursor (0 = sin rotación, ~0.6 ≈ 31° en el borde).
 */
export const FOOTER_R_GROUP_LOOK_TILT = 0.58;

/** Rapidez del slerp de rotación del grupo (mayor = sigue al cursor más rápido). */
export const FOOTER_R_GROUP_ROTATION_SPEED = 9;

/**
 * Paleta de colores de las partículas globales.
 * Cada entrada: `{ hex, percent }` — `percent` = % del total de partículas con ese color.
 * Los porcentajes se normalizan si no suman 100.
 *
 * @example
 * [
 *   { hex: "#3F2476", percent: 70 },
 *   { hex: "#FFFFFF", percent: 30 },
 * ]
 */
export const GLOBAL_PARTICLE_COLORS = [
  { hex: "#58467b", percent: 100 },
  // { hex: "#8C7CAD", percent: 10 },
  // { hex: "#3F2476", percent: 10 },
];

/** % de partículas (0–100) con destello animado aleatorio. */
export const GLOBAL_PARTICLE_TWINKLE_PERCENT = 35;

/**
 * Intensidad del destello sobre el brillo base (0 = sin efecto, ~1 = sutil, ~2+ = notable).
 */
export const GLOBAL_PARTICLE_TWINKLE_INTENSITY = 2.5;

/** Multiplicador emisivo del núcleo en el fragment shader (glow sin segundo bloom pass). */
export const FOOTER_PARTICLE_GLOW_BOOST = 1.45;

/** Fuerza del halo exterior por partícula (0–1). */
export const FOOTER_PARTICLE_HALO_STRENGTH = 0.78;
