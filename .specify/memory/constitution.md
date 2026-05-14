# order-shipping Constitution

## I. Stack (NON-NEGOTIABLE)

This is a **VTEX IO React library**. The following stack is fixed and must not be changed without explicit human approval:

- **Language**: TypeScript — all new files in `react/` must be `.ts` or `.tsx`. No `.js` files.
- **Framework**: React 16 (hooks-based) — no class components for new code
- **VTEX IO builder**: `react: 3.x` — code lives in `react/`, never in `src/`
- **GraphQL client**: `react-apollo` — mutations only; state management is owned by `vtex.order-manager`
- **Package manager**: Yarn — do not use npm or pnpm inside `react/`
- **Test runner**: `vtex-test-tools` (Jest + React Testing Library) — command: `cd react && yarn test`
- **Node**: managed by Volta/nvm config if present; do not upgrade without verification

## II. Architecture

- `react/OrderShipping.tsx` is the public entry point — assembles hooks and re-exports `OrderShippingProvider` and `useOrderShipping`
- `react/components/createOrderShippingProvider.tsx` is the provider factory — all provider logic goes here
- All GraphQL mutations MUST be enqueued via `useOrderQueue` — this is the **core invariant** of the library
- `react/__mocks__/` contains manual mocks for all `vtex.*` modules — extend these, do not create inline mocks
- `react/__fixtures__/` holds shared test state shapes — use them for consistent test data
- `react/typings/` holds type declaration shims — do not import VTEX module types from `node_modules`

## III. Code Standards

- `any` types are forbidden — use proper TypeScript types or `unknown` with type guards
- Hook naming: `use{MutationName}` (e.g., `useEstimateShipping`, `useSelectDeliveryOption`)
- Provider factory naming: `create{ProviderName}Provider`
- Tests must use `react/__mocks__/` — never bypass the established mock layer
- `react/utils/logger.ts` is the only permitted logging mechanism — no `console.log` in source

## IV. Testing Requirements

- Every new hook or mutation wiring must have a corresponding test in `react/__tests__/`
- Every bug fix must include a failing regression test before the fix
- Tests run with `cd react && yarn test` — do not use root-level `yarn test` (that is lint-only)
- Do not remove or skip existing tests to make a build pass

## V. Dependency Rules

- **`react/package.json`**: only add devDependencies for tooling/types — production React deps are provided by the VTEX IO platform
- **`manifest.json` dependencies**: each entry is a VTEX IO app binding — changes require justification and team approval
- Any new dependency must be justified; prefer extending existing patterns over adding new libraries

## VI. What Agents Cannot Change Without Human Approval

- `manifest.json` — version, builders, and app dependencies are platform-level contracts
- `.github/` — CI/CD configuration
- Public API surface: `OrderShippingProvider` shape, `useOrderShipping` return type, exported mutation signatures
- `react/components/createOrderShippingProvider.tsx` queue integration — queue bypass breaks concurrency guarantee
- Any change that affects consumers (vtex.checkout-cart, vtex.checkout-payment) without explicit cross-team coordination

## Governance

This constitution reflects the constraints of the `vtex.order-shipping` library. It supersedes any generic best-practice suggestion. Changes require explicit approval from the **@vtex/te-0001** (checkout) team.

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
