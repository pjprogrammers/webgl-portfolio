# Jashan Singla — Portfolio

Personal portfolio website for **Jashan Singla** — AI Automation & Cybersecurity.

A creative, animated marketing site focused on storytelling, smooth UX, high performance, and responsive design. Built with a WebGL (Three.js) frontend layered over a Next.js App Router backend, with internationalization, smooth scrolling, and GPU-powered visuals.

Live at [jashansingla.com](https://www.jashansingla.com).

---

## Tech Stack

| Area | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI / Styling | React 19, Tailwind CSS v4, classnames |
| Motion | GSAP, Lenis (smooth scroll), Motion |
| 3D / WebGL | Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing |
| State | Zustand |
| i18n | next-intl |
| CMS | Prismic (Slice Machine) |
| Email | Resend |
| Dev tooling | TypeScript, ESLint, lil-gui (debug), opentype.js (fonts) |

---

## Getting Started

Requirements: Node.js 20+ and a package manager (npm recommended).

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page auto-updates as you edit files.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

> **Note:** If Turbopack panics with a `Next.js package not found` error during `npm run dev`, clear the corrupted dev cache and restart:
>
> ```bash
> Remove-Item .next -Recurse -Force   # Windows PowerShell
> npm run dev
> ```

---

## Project Structure

```
app/                App Router pages and layouts (routes under app/[locale]/)
components/         Shared React components (one folder per component)
config/             Site, carousel, rig, and info configuration
hooks/              Shared React hooks
i18n/               next-intl routing and request setup
lib/                Domain modules: gsap, input, performance, prismic, scroll, ticker, webgl
messages/           Translation message files (en.json)
public/             Static assets (images, fonts, og images)
stores/             Zustand stores (one store + types file per feature)
proxy.ts            Next.js proxy (next-intl middleware)
next.config.ts      Next.js configuration
```

### Routing

- `app/[locale]/` — locale-prefixed routes: `/` (home), `/about`, `/work`
- `app/layout.tsx` — root layout; `app/[locale]/layout.tsx` — per-locale layout
- `proxy.ts` — next-intl middleware for locale handling

---

## Agentic Coding Tools

**If you are using an agentic coding tool (AI coding assistant, agent, etc.) with this repository, read and follow these before writing any code:**

- **`AGENTS.md`** — critical notes about this specific Next.js version (breaking changes, conventions, and deprecations) plus code organization rules.
- **`.cursor/`** — skill rules (`.cursor/rules/*.skill.md`) covering project conventions, architecture, design system, performance, debugging, and WebGL/R3F specifics.
- **`skills.md`** — procedural motion/creative-development guide (GSAP, Lenis, cursor, WebGL/R3F, page transitions).
- **`rules.md`** — permanent motion rules and anti-patterns (same domain as `skills.md`).
- **Any similar agent-facing files** — e.g. `CLAUDE.md` (Claude Code), `.opencode/` or `opencode.json` (opencode), `.github/copilot-instructions.md` — if present, read and honor them too.

These files exist so the tooling produces code that matches the project's actual structure and dependencies. When in doubt, prefer them over general training knowledge.

---

## Deployment

Deploy to [Vercel](https://vercel.com/new) (from the creators of Next.js) — or any platform that supports Next.js. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
