---
name: order-shipping-baseline
description: Baseline rules every agent must follow when editing this repo.
applyTo: "**/*"
---

# Baseline rules — vtex-apps/order-shipping

These rules apply to **every** agent conversation in this repo. They override generic best practices and codify the order-shipping team standards.

## Repository purpose

`vtex.order-shipping` is a **VTEX IO React library** that centralizes all shipping-related requests to the Checkout API. It serializes mutations through `useOrderQueue` to prevent concurrency issues. It is consumed by Checkout IO UIs.

It belongs to the **checkout** system at VTEX (owner: `te-0001`).

## Stack (do not invent alternatives)

- **React 16** — hooks-based, no class components
- **TypeScript** — strict typing; avoid `any`
- **VTEX IO react builder** — code lives in `react/`, not `src/`
- **react-apollo** — GraphQL mutations only (no queries — state comes from vtex.order-manager)
- **vtex.order-manager** — provides `useOrderQueue`, `useOrderForm`, `useQueueStatus`
- **vtex.checkout-resources** — provides mutation documents
- **@vtex/test-tools** — Jest + React Testing Library wrapper for VTEX IO
- **Yarn** — do not use npm or pnpm inside `react/`

## Critical architectural constraint

**All mutations MUST go through `useOrderQueue`.** This is the core invariant of this library — it prevents race conditions with the Checkout API. Never call a GraphQL mutation directly without enqueuing it.

## Code style — non-negotiable

- TypeScript for all new files in `react/` — no `.js` files
- 2 spaces, LF, UTF-8
- Follow existing naming: hooks prefixed with `use`, factory functions prefixed with `create`
- Types for VTEX IO modules live in `react/typings/` — do not import types from `node_modules` for VTEX modules

## VTEX IO module resolution

- Imports like `vtex.order-manager/OrderForm` are resolved by the platform at runtime
- Type stubs live in `react/typings/` and `react/__mocks__/` for Jest
- Do not mock `vtex.*` modules inline — use the existing mocks in `react/__mocks__/`

## Autonomy limits — always ask before crossing these

- **Do not modify `manifest.json` version** — triggers VTEX IO publish flows
- **Do not add/change `dependencies` in `manifest.json`** — each is a platform-level binding
- **Do not bypass `useOrderQueue`** in mutations — breaks concurrency guarantee
- **Do not change public API surface** (`OrderShippingProvider`, `useOrderShipping`, mutation signatures) without approval
- **Do not modify `.github/` workflows** without human approval
- **Do not add npm packages** to `react/package.json` without justification and approval

## Versioning & releases

- Release notes go in `CHANGELOG.md` (Keep a Changelog format)
- Conventional Commits required for all commits
- Version lives in `manifest.json` (NOT `package.json`) — bump there for releases
