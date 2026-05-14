---
name: test-discipline
description: Test-first conventions for order-shipping changes.
applyTo: "react/**/*.{ts,tsx}"
---

# Test discipline — vtex-apps/order-shipping

## Order of operations

1. Read the spec. Identify User Stories and their Given/When/Then acceptance criteria.
2. Write failing tests derived from acceptance criteria (red first).
3. Implement the minimum code to make the tests pass.
4. Run `cd react && yarn test` to confirm the full suite passes.

## Test runner

- **Command**: `cd react && yarn test` — runs Jest via `vtex-test-tools`
- Do NOT run `yarn test` from the repo root — it is the root-level lint script
- Tests run in CI via `.github/workflows/testreact.yml`

## Unit tests (Jest + React Testing Library)

### Location and naming

- All tests live in `react/__tests__/`, files matching `*.test.tsx`
- Test files should mirror the module they test (e.g., `OrderShipping.test.tsx` → `OrderShipping.tsx`)
- Use `@testing-library/react-hooks` for hook-only tests

### Mocking

- VTEX IO modules (`vtex.order-manager`, `vtex.checkout-resources`) are mocked via `react/__mocks__/`
- Do not create inline `jest.mock()` for VTEX modules — extend the existing mock files instead
- Use `react/__fixtures__/` for shared `orderForm` state shapes

### What requires a test

- Every new hook or hook behavior change
- Every new mutation wired into the provider
- Error handling paths (API failures, queue errors)
- Every bug fix — add a failing regression test before the fix

### What does NOT require a test

- Pure type changes (`.d.ts`, `typings/`)
- Manifest or changelog updates
- Style changes

## Coverage

- No enforced threshold, but do not let coverage drop on changed files
- Focus on behavior tests, not implementation details
