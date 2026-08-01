# GSAP Advanced Animation Skill

## Animation Architecture

All animations must live in:

src/animations/

Animations must be:

- reusable
- modular
- killable on unmount

---

## ScrollTrigger Rules

- scrub ONLY for storytelling sections
- reveal animations for UI elements
- batch animations when possible

---

## Split Text Strategy

Create utility:

animations/splitText.ts

Reuse across project.

---

## Page Transitions

Use GSAP timelines.

Avoid CSS-only transitions.

---

## Performance Rules

- animate transform + opacity
- avoid layout properties
- debounce scroll logic