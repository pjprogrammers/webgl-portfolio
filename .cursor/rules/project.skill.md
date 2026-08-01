# Project Skill

## Project Goal

Creative animated marketing website.

Focus:

- storytelling
- smooth UX
- high performance
- responsive design

---

## Mandatory Stack

- Next.js latest
- Tailwind
- GSAP
- Lenis
- Zustand
- i18n EN/ES

---

## Optional Stack

- R3F if 3D required
- Prismic if CMS required
- Embla if carousel required
- React Player if video required

---

## File size & module boundaries

- **Target ~400 lines or fewer per project source file** (components, hooks, utils, scene files, app routes under `src/`, etc.). **Always prefer** splitting or extracting modules so files stay smaller and easier to navigate.
- **When a file may exceed ~400 lines:** only if **the code genuinely needs it** or **splitting would be clearly worse** (e.g. one tightly coupled animation loop where extraction obscures behavior). In those cases, a file **can** go over ~400 lines — but **shrinking below ~400 remains the default priority** whenever it is reasonable.
- **Out of scope for this guideline:** repo / tooling files such as `next.config.*`, `package.json`, `yarn.lock` / `pnpm-lock.yaml`, `tsconfig.json`, CI YAML, generated lockfiles, etc. Those should be **as long as they need to be**; do not apply the ~400-line target to them.
- **Prefer dedicated modules** for standalone **functions**, **constants** (including config objects), **types**, and non-trivial **subcomponents**, wired with explicit **`import` / `export`**.

### Component folder layout (default)

- **Each component lives in its own folder** named after the component (PascalCase to match the component name).
- **`index.tsx`** (or `index.ts`) is the public entry: the component itself (what consumers import from `@/.../ComponentName` or `./ComponentName`).
- **Local-only** helpers, constants, and small pure functions that are **used only inside that component** stay **next to `index.tsx`** in the same folder — e.g. `constants.ts`, `utils.ts`, `types.ts`, `hooks.ts`, or feature-specific names (`carouselPhysics.ts`, `layout.ts`) when that makes the role obvious.
- Do **not** move single-use helpers into `utils/` or `lib/` just to shrink `index.tsx`; **co-locate** them in the component folder instead.

### Shared vs global

- If a function or constant is **likely to be reused** across multiple features or app-wide, place it in a **more global** home: e.g. `src/utils/`, `src/lib/`, `src/hooks/`, or a **shared module inside a domain folder** (e.g. `components/organisms/DualRowCarousel/` exports used only by carousel pieces).
- **Name files by domain / feature** when grouping shared constants and functions so imports stay discoverable (e.g. `carouselConstants.ts`, `heroTiming.ts`, `i18nFormatters.ts`), instead of dumping unrelated helpers into one generic `utils.ts`.

---

## Delivery Requirements

AI must ensure:

- build passes
- lint passes
- typecheck passes
- no console errors