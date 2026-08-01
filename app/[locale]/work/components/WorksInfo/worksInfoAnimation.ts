export const WORK_LINE_FROM = { yPercent: 320, scale: 1, rotate: 10 };

export const WORK_LINE_ENTER = {
  yPercent: 0,
  scale: 1,
  rotate: 0,
  stagger: 0.07,
  duration: 0.4,
  ease: "power3.out",
} as const;

export const WORK_LINE_EXIT = {
  yPercent: 320,
  scale: 1,
  rotate: 10,
  duration: 0.4,
  ease: "power3.in",
} as const;

export const WORK_NAME_CHAR_FROM = { opacity: 0 };

export const WORK_NAME_CHAR_ENTER = {
  keyframes: [
    { opacity: 0.4 },
    { opacity: 0.6 },
    { opacity: 0.8 },
    { opacity: 1 },
  ],
  stagger: 0.02,
  ease: "power1.inOut",
  duration: 0.2,
} as const;

export const WORK_NAME_CHAR_EXIT = {
  keyframes: [
    { opacity: 0.8 },
    { opacity: 0.6 },
    { opacity: 0.4 },
    { opacity: 0 },
  ],
  ease: "power1.inOut",
  duration: 0.2,
} as const;

export const WORK_INFO_SCRUB_EASE = "none";
