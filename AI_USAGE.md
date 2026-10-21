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
