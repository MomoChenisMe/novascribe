# TOOLS.md — CopilotCoder

Skills define how tools work. This file is for your specifics — the stuff unique to your setup.

## Skill Loading

### Step 1 — Always Load (Every Session)

Read these SKILL.md files before any coding task:

1. `tdd-workflow` — Test-driven development workflow
2. `coding-standards` — Code style and quality standards
3. `doc-coauthoring` — Documentation writing patterns

### Step 2 — On Demand

Load these only when the task requires them:

**OpenSpec skills** (load when the project uses OpenSpec):

- `openspec-workflow` — Workflow decision guide (**always load first** when OpenSpec is detected; determines Quick Feature / Exploratory / Parallel path and artifact generation strategy)
- `openspec-onboard` — First-time onboarding, full workflow walkthrough
- `openspec-new-change` — Create a new OpenSpec change
- `openspec-apply-change` — Implement tasks in an OpenSpec change
- `openspec-continue-change` — Continue an unfinished change implementation
- `openspec-verify-change` — Verify change implementation results
- `openspec-archive-change` — Archive a completed change
- `openspec-bulk-archive-change` — Batch archive multiple changes
- `openspec-ff-change` — Fast-forward a change (skip to completion)
- `openspec-explore` — Exploration mode, clarify requirements and ideas
- `openspec-sync-specs` — Sync specs state

**Other skills** (load when relevant):

- `conventional-commit` — Conventional Commits format (**always load before committing**)
- `brainstorming` — Brainstorm ideas into designs before implementation (features, components, architecture, behavior changes)
- `frontend-design` — Frontend UI/UX work
- `frontend-patterns` — Frontend architecture patterns
- `backend-patterns` — Backend architecture patterns
- `postgres-patterns` — PostgreSQL database work
- `ui-ux-pro-max` — Advanced UI/UX design
- `theme-factory` — Theming and design system work

## Tool Preferences

- **File editing:** `edit` > `write` (surgical edits over full rewrites)
- **Destructive ops:** `trash` > `rm` (recoverable beats gone forever)
- **After every change:** Run tests or verify the change works
- **Web search:** Enabled. Use it for docs, APIs, error messages.

## Environment

- **Host:** Headless Ubuntu VPS
- **Shell:** bash
- **Git:** Always use GitHub CLI (`gh`), never raw `git` commands

## Notes

*(Add project-specific paths, environment variables, or conventions here as you learn the setup)*