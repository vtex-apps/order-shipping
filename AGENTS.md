# AGENTS.md

## Project purpose

`vtex.order-shipping` is a VTEX IO library that centralizes all shipping-related requests to the Checkout API. It ensures that each interaction with the Checkout API happens in succession, avoiding concurrency issues. It exposes a React Context provider (`OrderShippingProvider`) and a hook (`useOrderShipping`) consumed by Checkout IO UIs.

It belongs to the **checkout** system at VTEX, owned by team `te-0001`.

## Sources of truth

- [docs/README.md](./docs/README.md) — API reference and usage examples
- [react/OrderShipping.tsx](./react/OrderShipping.tsx) — main entry point
- [react/components/createOrderShippingProvider.tsx](./react/components/createOrderShippingProvider.tsx) — provider factory
- [CHANGELOG.md](./CHANGELOG.md) — release history
- [manifest.json](./manifest.json) — VTEX IO app manifest (vendor, name, version, builders, dependencies)
- [GitHub repository](https://github.com/vtex-apps/order-shipping)

## Local setup

**Prerequisites:**
- Node.js 18+ (managed via `.nvmrc` / Volta if present)
- Yarn 1.x
- VTEX Toolbelt (`vtex` CLI) — `npm install -g vtex`

**Install dependencies:**
```bash
cd react && yarn install
```

**Link app to a VTEX workspace for live development:**
```bash
vtex login {account}
vtex use {workspace}
vtex link
```

**Run unit tests:**
```bash
cd react && yarn test
```

> Note: `yarn test` inside `react/` uses `vtex-test-tools test` which is Jest under the hood. Running from the repo root uses the root-level scripts (lint only).

## Verified commands

| Command | What it does |
|---------|-------------|
| `cd react && yarn test` | Run Jest unit tests via vtex-test-tools |
| `yarn lint` (root) | ESLint across `react/` |
| `cd react && yarn lint` | TypeScript typecheck + ESLint |
| `vtex link` | Link app to a workspace for live testing |
| `vtex publish` | Publish new version to VTEX IO registry |

## Architecture

```
react/
├── OrderShipping.tsx             # Public entry point — assembles hooks and exports Provider + hook
├── components/
│   └── createOrderShippingProvider.tsx  # Factory that wires the React Context
├── utils/
│   └── logger.ts                 # VTEX IO logger integration
├── typings/                      # Type declaration shims for VTEX IO module system
├── __tests__/                    # Jest unit tests (co-located with react/)
├── __mocks__/                    # Module mocks for vtex.order-manager and vtex.checkout-resources
└── __fixtures__/                 # Test fixtures (OrderForm, OrderFormProvider)
```

**Data flow:**
```
Consumer component
  → useOrderShipping()
    → OrderShippingProvider (React Context)
      → useOrderQueue (vtex.order-manager) — serializes API calls
        → Checkout GraphQL mutations (vtex.checkout-resources)
          → Checkout API
```

**Key mutations exposed:**
- `estimateShipping(address)` — triggers shipping estimation
- `selectDeliveryOption(deliveryOptionId)` — changes selected delivery option
- `selectPickupOption(pickupOptionId)` — changes selected pickup point
- `updateSelectedAddress(address)` — updates selected address in orderForm

## Project-specific patterns

- **VTEX IO module system**: imports like `vtex.order-manager/OrderForm` are resolved at runtime by the VTEX IO platform. Typings for these live in `react/typings/`.
- **Queue-based mutations**: all mutations go through `useOrderQueue` to serialize API calls and prevent race conditions with the Checkout API. Never bypass the queue.
- **Factory pattern for the provider**: `createOrderShippingProvider` is a factory that takes hook implementations as parameters, enabling testing with different mock implementations.
- **No direct GraphQL queries**: the app only uses mutations via `react-apollo`. It does not own queries — it receives `orderForm` state from `vtex.order-manager`.
- **vtex-test-tools**: tests use `@vtex/test-tools` which wraps `@testing-library/react` and provides VTEX IO-compatible rendering context.
- **Module resolution mocks**: `react/__mocks__/` contains manual mocks for `vtex.*` modules that are not available in the Jest environment.

## Testing expectations

- **Framework**: Jest via `vtex-test-tools` (`@vtex/test-tools`)
- **Renderer**: React Testing Library (`@testing-library/react-hooks` for hooks)
- **Location**: `react/__tests__/`, files matching `*.test.tsx`
- **Runner**: `cd react && yarn test`
- **Mocks**: manual mocks in `react/__mocks__/` for VTEX IO modules (`vtex.order-manager`, `vtex.checkout-resources`)
- **Fixtures**: `react/__fixtures__/` for shared test data (orderForm shape)
- **What to test**: hook behavior, provider wiring, mutation call arguments, error handling

## Expected skills

- `specification`: use before implementing any non-trivial change — create a spec in `specs/` first (SDD Lite flow)
- `implementing`: use to implement from an approved spec autonomously

## Expected MCPs

- **GitHub MCP**: for cross-repo context (vtex.order-manager, vtex.checkout-resources, vtex.checkout-graphql) and PR management
- **Atlassian MCP**: if using Jira for backlog management and traceability between specs and tasks

## Autonomy limits

- **Do not modify `manifest.json` version** without human approval — version bumps trigger VTEX IO publish flows
- **Do not add or change `dependencies` in `manifest.json`** without explaining why — each dependency is a VTEX IO builder or app binding that affects the platform deploy
- **Do not modify `.github/workflows/`** without human approval
- **Do not bypass `useOrderQueue`** when adding new mutations — it exists to prevent Checkout API concurrency issues
- **Do not add new external npm dependencies** to `react/package.json` without explaining why and getting approval
- **Do not change the public API surface** (`OrderShippingProvider`, `useOrderShipping`, exported mutation signatures) without human approval — consumers depend on these contracts
- **Do not commit real VTEX credentials, account names, or workspace names**
