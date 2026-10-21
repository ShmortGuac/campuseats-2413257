# AI usage log

Using AI never costs marks; a vague or missing log does.
Add a new section every week, before you tag. Did not use AI? Write "None" under Tool(s).

## Week 1
- Tool(s): None
- What I asked for:
- What I kept, changed or rejected, and why:
- One thing the AI got wrong and how I fixed it:

## Week 2
- Tool(s): None
- What I asked for:
- What I kept, changed or rejected, and why:
- One thing the AI got wrong and how I fixed it:

## Week 3
- Tool(s): Claude Code (only for the optional stretch task)
- What I asked for: Add a 600 ms delay before the vendors fetch using setTimeout, cleared in the effect's cleanup, and replace the "Loading menus…" text with a skeleton of grey cards.
- What I kept, changed or rejected, and why: I kept the setTimeout inside the existing useEffect with a cleanup that calls both clearTimeout and controller.abort(), so leaving the page or pressing Try again never starts a stale fetch. I kept the skeleton Loading component (2 vendor-sized and 4 menu-sized grey cards) and its CSS, because it reuses the existing card and grid classes.
- One thing the AI got wrong and how I fixed it: Nothing broke in the code, but its first check of the page miscounted the vendor cards because it also counted class names inside the CSS that Vite injects into the page. It re-checked by clicking through the app in a real browser instead.

## Week 3 (extra): CI/CD
- Tool(s): Claude Code
- What I asked for: Ideas for GitHub Actions / CI/CD, then to set up two of them: a workflow that runs lint and build on every push, and Playwright browser tests that run in CI and upload screenshots of each view.
- What I kept, changed or rejected, and why: I kept the workflow in `.github/workflows/ci.yml` (lint and build job, then a browser tests job), the Playwright config that tests the production build with `vite preview`, and five tests in `e2e/campuseats.spec.js` covering menu loading, the error and Try again state, switching vendors, the cart (qty merge, +/−, remove, badge, total, notes) and checkout validation. The tests read prices from the page instead of hard-coding them, so they still pass if I change my menu. I rejected the other ideas for now (GitHub Pages deploy, vendors.json checks, tag checklist, releases, daily special) to keep the project close to the lab sheet.
- One thing the AI got wrong and how I fixed it: Its first version of the test file used an empty `{}` destructuring pattern in `afterEach`, which ESLint rejected (`no-empty-pattern`). It changed the tests to collect console errors in a shared variable instead, and lint passed.
