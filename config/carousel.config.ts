export const CAROUSEL_CONFIG = {
  // Breakpoints — align with globals.css / useMediaQuery bp
  BREAKPOINT_TABLET: 1024,
  BREAKPOINT_MOBILE: 480,

  // Slide dimensions — always 640/400
  SLIDE_ASPECT_RATIO: 640 / 400,

  // Desktop (>= 1024) — prefer 50vh height, cap at 50vw width if needed
  SLIDE_MAX_VW: 0.5,
  SLIDE_MAX_VH: 0.5,

  // Tablet (< 1024) & mobile (< 480) — width as fraction of viewport (tweak to taste)
  SLIDE_TABLET_VW: 0.85,
  SLIDE_MOBILE_VW: 0.9,

  // Spacing — gap scales with slide width (gap = slideW * SLIDE_GAP_RATIO)
  SLIDE_GAP_RATIO: 0.04,

  // Geometry — segments on both axes for smooth global viewport curve
  PLANE_SEGMENTS_X: 32,
  PLANE_SEGMENTS_Y: 10,

  // Global viewport barrel — shape (vertex shader)
  BARREL_SCALE: 0.32,
  BARREL_EDGE_LIFT: 0.25,

  // Barrel timing — attack = curve in while scrolling, release = straighten out
  BARREL_ATTACK_LERP: 0.06,
  BARREL_RELEASE_LERP: 0.035,
  BARREL_VELOCITY_THRESHOLD: 0.012,
  BARREL_SPEED_FACTOR: 0.18,
  BARREL_IMPULSE_FACTOR: 1.8,
  BARREL_MAX_STRENGTH: 1.0,

  // Scroll / damping (wheel / trackpad on non-touch devices)
  SCROLL_SPEED: 0.00112,
  SCROLL_DAMPING: 0.93,
  SCROLL_VELOCITY_LERP: 0.08,

  // Snap coast (critically damped — no bounce)
  SNAP_SMOOTH_TIME: 0.9,
  SNAP_SETTLE_OFFSET: 0.0005,
  SNAP_SETTLE_VELOCITY: 0.001,

  // Transition image → hover (displacement map)
  TRANSITION_DURATION: 1.2,
  TRANSITION_DISPLACEMENT_EFFECT: 1.2,
  TRANSITION_EASE: "power2.inOut",
  DISPLACEMENT_TEXTURE_URL: "/images/assets/displacement.png",

  // Entry reveal — cards aparecen con displacement + alpha 0→1.
  // El stagger sale de la card centrada hacia los costados (por "anillos").
  ENTRY_REVEAL_DURATION: 1.4,
  ENTRY_REVEAL_STAGGER: 0.14,
  ENTRY_REVEAL_DELAY: 0.1,
  ENTRY_REVEAL_EASE: "power2.out",
  // Si las texturas tardan demasiado, revelar igual pasado este tiempo (ms).
  ENTRY_REVEAL_MAX_WAIT_MS: 1500,

  // Touch (mobile) — drag while finger down vs momentum on release
  /** 1 = finger right moves carousel right; -1 inverts */
  TOUCH_DRAG_DIRECTION: 1,
  /** Speed while dragging (lower = slower follow) */
  TOUCH_DRAG_SPEED: 0.0005,
  /** Speed applied on finger release (momentum / coast) */
  TOUCH_MOMENTUM_SPEED: 0.006,
  TOUCH_DAMPING: 0.9,
  TOUCH_VELOCITY_DECAY: 0.85,

  // Pool / render
  VISIBLE_SLIDES: 5,
  PRELOAD_TEXTURE_COUNT: 3,

  // Interaction
  CLICK_DRAG_THRESHOLD: 6,
  DESELECT_SCROLL_THRESHOLD: 20,

  // Grid hover distortion — same values as RigCanvas / SelectedWorks
  GRID_SIZE: 12,
  GRID_MOUSE_RADIUS: 0.1,
  GRID_STRENGTH: 0.15,
  GRID_RELAXATION: 0.9,
  GRID_UV_DISTORT: 0.02,
} as const;
