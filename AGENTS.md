<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Code organization

- Keep each source file **at or under ~400 lines**; split before hitting the limit when practical.
- **One folder per component**: `ComponentName/index.tsx` as the component; **component-local** constants/functions in sibling files in that folder (single-use only there). **Shared / cross-feature** logic goes under `utils/`, `lib/`, `hooks/`, or domain-named modules — see `.cursor/rules/project.skill.md`.
