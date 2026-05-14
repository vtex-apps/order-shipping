---
name: sdd-lite-bootstrap
description: Walk through the SDD Lite workflow for a small task or bug fix in this repo.
---

# /sdd-lite-bootstrap

Use this command when the work is **small, contained, and lower risk**: new mutations, hook behavior changes, bug fixes, or focused refactors.

## Sequence

1. `/specification "<task description with definition of done>"`
   - Skill produces `specs/<feature-name>.md` with `status: Draft`.
   - The skill opens a PR on branch `spec/<feature-name>` containing **only** the spec file.
2. Review the PR, validate against `docs/README.md` API surface and existing tests.
3. **Manually flip** the spec's frontmatter `Status` from `Draft` to `Approved` and merge the spec PR.
4. `/implementing "specs/<feature-name>.md"`
   - The skill runs non-interactively: branches `feat/<feature-name>`, writes failing tests, implements minimal code, runs `cd react && yarn test`, updates CHANGELOG, opens an implementation PR.
   - On success, status moves to `Done`. If the spec is contradictory or blocked, the skill opens a GitHub issue titled `implementing blocked: <feature-name>` and ends — no half-baked PR.
5. Standard code review and merge.

## order-shipping specific notes

- All new code goes in `react/` — no source files at the repo root
- All new hooks must be wired through `useOrderQueue` — never bypass the queue
- Tests go in `react/__tests__/` as `*.test.tsx`; extend `react/__mocks__/` as needed for new VTEX module bindings
- Run `cd react && yarn test` to validate — not `yarn test` from repo root
- Version bump goes in `manifest.json` (not `package.json`)
- Add a CHANGELOG entry under `## [Unreleased]` for every user-facing change

## When to NOT use SDD Lite

Switch to `/sdd-full-bootstrap` if any of the following apply:

- Estimated effort >3 days
- Changes touch `manifest.json` builders or dependencies
- Public API surface changes (`useOrderShipping` interface, exported types)
- High ambiguity or unresolved product decisions
- Significant architectural impact (e.g., adding a new provider, changing queue behavior)
- Cross-team coordination required (vtex.order-manager, vtex.checkout-resources)
