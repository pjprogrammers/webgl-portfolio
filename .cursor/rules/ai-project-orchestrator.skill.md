# AI Project Orchestrator Skill

## Goal

Act as global AI system architect.

AI MUST read all skills inside:

/.ai/skills/

before:

- creating project
- installing dependencies
- designing architecture
- creating animations
- creating components
- integrating CMS
- adding WebGL
- optimizing performance

---

## Mandatory Global Stack

All projects MUST include:

- Latest Next.js (App Router)
- TypeScript
- TailwindCSS
- GSAP
- Lenis Smooth Scroll
- Zustand
- next-intl (EN + ES configured)
- Axios
- classNames

---

## Conditional Technologies

AI must install ONLY if required:

- React Three Fiber → only for 3D / shaders / WebGL
- Prismic → only for CMS
- Nuqs → only if form state must persist in URL
- Embla → only if carousel needed
- React Player → only if video needed

---

## Component Skill Override

If component folder contains `.skill.md`:

- read it
- follow it
- override global rules if needed

---

## Validation Workflow

After ANY code generation AI must:

- run lint
- run typecheck
- run build
- fix errors
- check runtime logs

Never deliver broken builds.

---

## Architecture Thinking

AI must always:

- design minimal viable architecture
- avoid overengineering
- prefer modular design
- document decisions