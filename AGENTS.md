# order-shipping — Agent Context

## Project Purpose

`vtex.order-shipping` is a VTEX IO React app that centralizes all shipping-related requests to the Checkout API. It exposes `OrderShippingProvider` and `useOrderShipping` so consumer components can call shipping operations (address estimation, delivery option selection, pickup option selection, address update) without concurrency issues.

## Sources of Truth

- **README**: `docs/README.md` — API surface, usage examples, provider hierarchy
- **Main entry**: `react/OrderShipping.tsx`
- **Core logic**: `react/components/createOrderShippingProvider.tsx`
- **Tests**: `react/__tests__/`
- **Manifest**: `manifest.json` (VTEX IO app metadata)

## Local Setup

This is a VTEX IO app. There is no standalone local server — development happens via the VTEX CLI (`vtex link`).

```sh
# Install dependencies (root + react)
yarn install
cd react && yarn install

# Run tests
cd react && yarn test

# Lint + type-check
yarn lint           # ESLint (root)
cd react && yarn lint  # tsc --noEmit + ESLint
```

## Verified Commands

| Purpose | Command |
|---|---|
| Tests | `cd react && yarn test` |
| Lint (root) | `yarn lint` |
| Lint + typecheck (react) | `cd react && yarn lint` |
| Format | `yarn format` |

## Architectural Limits

- All mutations go through the queue mechanism (`useOrderQueue`, `useQueueStatus` from `vtex.order-manager`). Never call Checkout API mutations directly — always enqueue them.
- `createOrderShippingProvider` is the factory for the provider; do not instantiate Apollo hooks outside of it.
- `react/` follows the VTEX IO React builder — no Next.js, no CRA. Imports use VTEX IO module syntax (`vtex.checkout-resources/MutationXxx`).
- Do not add npm dependencies without explicit justification; prefer VTEX IO peer dependencies declared in `manifest.json`.

## Project-Specific Patterns

- Provider factory pattern: `createOrderShippingProvider` receives hook factories as parameters to allow dependency injection and testability.
- Logger: use `useLogger` from `react/utils/logger.ts` for all side-effect logging.
- Mutations follow the pattern: `useMutation` → `useCallback` → return named function.
- Tests use `@vtex/test-tools` (`vtex-test-tools test`) with `@testing-library/react-hooks`. Mock mutations via `jest.fn().mockResolvedValue(...)`.

## Testing Expectations

- Tests live in `react/__tests__/`.
- Fixtures in `react/__fixtures__/`.
- Every new hook or provider variant must have a corresponding test.
- Do not remove or skip tests to make the build pass.
- Run: `cd react && yarn test`

## Expected Skills

- `/specification` — create a spec for a Jira task using SDD Lite
- `/implementing` — implement from an approved spec
- `/speckit.constitution` — generate/update `.specify/memory/constitution.md`
- `/speckit.specify` — create baseline specification (SDD Full)
- `/speckit.plan` — create implementation plan (SDD Full)
- `/speckit.implement` — execute implementation (SDD Full)

## Expected MCPs

No VTEX Admin UI or AI Workspace backend in this repo. No additional MCPs required beyond the defaults (GitHub, Atlassian if backlog management is needed).

## Autonomy Limits

The agent **can** do autonomously:
- Add or modify tests
- Implement changes scoped to `react/` following existing patterns
- Run lint, typecheck, and tests

The agent **must ask a human** before:
- Changing `manifest.json` (version, dependencies, builders)
- Modifying `.github/workflows/`
- Adding new npm/yarn dependencies
- Changing the public API of `OrderShippingProvider` or `useOrderShipping`
- Any change that affects how the queue enqueues mutations
