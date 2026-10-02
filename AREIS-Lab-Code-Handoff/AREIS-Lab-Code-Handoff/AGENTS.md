# Working on this website

Read README.md and HANDOFF.md before editing. This is an existing Next.js App Router project. Preserve the current application and modify it directly.

## Commands

- Install: npm ci
- Develop: npm run dev
- Type check: npm run typecheck
- Lint: npm run lint
- Validate active workbook: npm run content:check
- Test workbook parser: npm run content:test
- Test local contact storage: npm run contact:test
- Production build: npm run build
- Run production build: npm run start

Use npm.cmd if PowerShell execution policy blocks npm.ps1. Use Node.js 22.18 or newer. Run commands from the directory containing package.json.

## Constraints

- Preserve the blue/navy/ice-white palette, existing typography, full lab name, and Home navigation unless the owner requests otherwise.
- Keep research areas on separate detail pages. Do not collapse them into one carousel.
- Keep all project information and supplied photographs; do not reintroduce room numbers.
- Keep team photographs in colour and the research-vision image free of yellow overlays.
- Do not introduce generated research photographs, fabricated results, or replacement team identities.
- The Our premise photograph has unresolved feedback; see HANDOFF.md.
- Keep static assets in public with relative URL paths. Never add author-specific filesystem paths.
- Project/research content is read from content/areis-website-content.xlsx (or CONTENT_WORKBOOK_PATH) on each request. Preserve this workflow; the old JSON/TS project/research arrays are reference snapshots, not the active content source.
- No credentials are needed for local use. Contact submissions save through /api/contact to private data/contact-enquiries.csv (or CONTACT_ENQUIRIES_PATH). Never publish enquiry data or claim notification emails were sent. Shared persistent storage is required before deploying on ephemeral or multi-instance hosting.
- Verify affected routes, controls, and mobile layout after changes. Run relevant type/lint checks and build when appropriate.

All project instructions needed to run the website are in this folder; no external Codex skills or plugins are required.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
