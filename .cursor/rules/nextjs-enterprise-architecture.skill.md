# Next.js Enterprise Architecture Skill

## Folder Structure (Atomic Design)

src/

app/
components/
components/atoms
components/molecules
components/organisms
features/
animations/
hooks/
lib/
services/
store/
styles/
types/
utils/
providers/

---

## Page Transition

All projects must include:

- fade in on page enter
- fade out on page exit

Transitions must be reusable.

---

## SVG Strategy

Use SVG as React components.

---

## State Management

Use Zustand for:

- UI state
- navigation state
- animation state
- theme state

Avoid deep prop drilling.

---

## Data Fetching

Use Axios.

---

## i18n Strategy

Use next-intl.

Always configure:

- EN
- ES

---

## CMS Strategy

If CMS needed:

Use Prismic.

---

## WebGL Strategy

If 3D required:

Use React Three Fiber ecosystem.

Avoid raw Three.js.