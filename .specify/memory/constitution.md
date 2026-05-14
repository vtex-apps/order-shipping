# order-shipping Constitution

## Core Principles

### I. Queue-First for Checkout Mutations (NON-NEGOTIABLE)
Every mutation that touches the Checkout API must be wrapped in a task and enqueued via `useOrderQueue().enqueue(task, taskId)`. Direct Apollo mutation calls outside the queue are forbidden. This prevents concurrency issues in the checkout flow.

### II. Dependency Injection via Factory
`createOrderShippingProvider` is the single factory for `OrderShippingProvider`. All hooks (`useEstimateShipping`, `useSelectDeliveryOption`, `useSelectPickupOption`, `useUpdateSelectedAddress`, `useLogger`, `useOrderQueue`, `useOrderForm`, `useQueueStatus`) must be injected as parameters. No hook may be imported and called directly inside the provider body.

### III. TypeScript Strict Mode (NON-NEGOTIABLE)
All code must compile under `react/tsconfig.json`: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noImplicitReturns`, `alwaysStrict`. No `any` casts without explicit justification. No `// @ts-ignore`.

### IV. Test-Driven for New Hooks and Providers
New hooks and provider variants must have corresponding tests in `react/__tests__/` before the implementation is considered complete. Tests use `@vtex/test-tools` (`vtex-test-tools test`) with `@testing-library/react-hooks`. Do not skip or remove tests to make the build pass.

### V. Optimistic Updates for Selection Operations
`selectDeliveryOption` and `selectPickupOption` apply an optimistic update to `orderForm` via `setOrderForm` before enqueueing, then reconcile with the server response once the queue fulfills. New selection operations must follow this same pattern.

### VI. Structured Error Logging
Errors caught in enqueued tasks must be logged via `useLogger().log(...)` before re-throwing. Log params must include `type: 'Error'`, `level: 'Critical'`, `event: { error, orderFormId }`, and a descriptive `workflowInstance`. Do not use `console.error` or `console.log` directly in business logic.

## Stack and Runtime

- **Builder**: VTEX IO React `3.x` (not Next.js, not CRA)
- **Runtime**: React 16.8+ with hooks
- **Data**: Apollo Client via `react-apollo` `useMutation`; GraphQL mutations from `vtex.checkout-resources`
- **Types**: `@vtex/checkout-types` for `CheckoutOrderForm`, `Address`, `DeliveryOption`, `PickupOption`
- **State management**: React Context + `useState`/`useMemo`/`useCallback`; no Redux, no Zustand
- **Module resolution**: VTEX IO module syntax (`vtex.module-name/ExportName`) — not npm package paths for IO peers

## Code Standards

- `useCallback` on every async handler exposed via context to prevent unnecessary re-renders
- `useMemo` on context value object
- Factory return type must be `{ OrderShippingProvider }` (named, not default-only)
- Prefer explicit return types on exported functions
- No unused imports; ESLint enforces this via `eslint-config-vtex`

## Folder Organization

```
react/
├── OrderShipping.tsx          # Public entry — wires hooks into the factory
├── components/
│   └── createOrderShippingProvider.tsx  # Factory + context + hook
├── utils/
│   └── logger.ts              # Logging utilities
├── __tests__/                 # Test files
├── __fixtures__/              # Shared test fixtures
├── __mocks__/                 # Module mocks
└── typings/                   # VTEX IO type declarations
```

Do not add new top-level files to `react/` without a clear reason. New features belong inside `components/` or `utils/`.

## Testing Requirements

- Framework: `@vtex/test-tools` (Jest under the hood)
- Command: `cd react && yarn test`
- Every new exported hook must have at least one test covering the happy path and one covering the error/cancellation path
- Fixtures for `orderForm` and providers belong in `react/__fixtures__/`
- Never mock the queue or provider in ways that hide the enqueue contract

## Dependency Restrictions

- Do not add npm packages without justification in the PR description
- Prefer VTEX IO peer dependencies declared in `manifest.json` over npm equivalents
- Do not upgrade `react-apollo` to `@apollo/client` without an ADR — the IO builder pins the Apollo version

## Human Approval Required

Changes to the following require explicit human approval before implementation:
- `manifest.json` (version bumps, new dependencies, builder changes)
- `.github/workflows/` (CI pipeline)
- Public API of `OrderShippingProvider` or `useOrderShipping` (breaking changes)
- Queue enqueue logic in `createOrderShippingProvider.tsx`
- New npm dependencies in either `package.json`

## Governance

This constitution supersedes inferred patterns. When in doubt, follow the queue-first and dependency-injection principles. Mark gaps as TBD — do not fill them by inference.

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
