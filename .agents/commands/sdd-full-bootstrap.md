---
name: sdd-full-bootstrap
description: Walk through the SDD Full (Spec Kit) workflow for a larger task in this repo.
---

# /sdd-full-bootstrap

Use this command when you've decided the task warrants **SDD Full** — typically >3 days, cross-team, public API surface changes, or architectural decisions that affect consumers of this library.

## Prerequisites

- `specify version` works (uv tool installed). The dev container handles this; if running on the host, follow `.specify/memory/constitution.md` setup notes.
- The Constitution (`.specify/memory/constitution.md`) is up-to-date.
- A scoped scope-of-work file exists at `docs/scope_of_work/<feature-name>.md`. If it doesn't, create it from the PRD/RFC before running `/speckit.specify`.

## Sequence (one command, one session — guard your context window)

1. `/speckit.specify` — output: `specs/{feature}/spec.md` (committed)
2. `/speckit.clarify` — surface ambiguities; loop with PM until resolved; update spec.
3. `/speckit.plan` — output: `specs/{feature}/plan.md` (NOT committed)
4. `/speckit.tasks` — output: `specs/{feature}/tasks.md` (NOT committed)
5. `/speckit.analyze` — output: `specs/{feature}/analysis.md` (NOT committed)
6. `/speckit.implement phase 1 only` — work in slices, commit code per slice.

After each step, decide whether to start a **new session** to avoid context compaction. `implement` is the most context-hungry step — always slice it.

## Models to use

- Steps 1, 3 (specify, plan): Tier-1 reasoning model (e.g. Claude Opus).
- Steps 2, 4, 5, 6 (clarify, tasks, analyze, implement): Standard execution model (e.g. Claude Sonnet).

## What to commit vs not commit

| Artifact | Commit? |
|---|---|
| `specs/{feature}/spec.md` | yes |
| `plan.md`, `tasks.md`, `analysis.md` | no — ephemeral |
| Generated code | yes |
| `.specify/memory/constitution.md` | yes (manual edits only) |

## order-shipping specific notes

- New mutations must follow the `use{MutationName}` hook pattern in `react/OrderShipping.tsx`
- Wire new hooks through `createOrderShippingProvider` factory — do not add state directly to the provider
- Public API changes require updating `docs/README.md` before opening the implementation PR
- Always run `cd react && yarn test` before finalizing any implementation PR
- Consumer breakage (vtex.checkout-cart, vtex.checkout-payment) must be assessed for any API surface change
