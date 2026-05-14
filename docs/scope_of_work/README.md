# Scope of Work

This directory contains scoped work documents for features and initiatives planned for `vtex.order-shipping`.

## Usage

Before running `/speckit.specify` for a large feature (>3 days, cross-team, API surface changes), create a scope-of-work file here:

```
docs/scope_of_work/<feature-name>.md
```

The file should contain:
- Problem statement and motivation
- Proposed solution (high-level)
- Known constraints and dependencies (vtex.order-manager, vtex.checkout-resources versions)
- Consumer impact assessment (vtex.checkout-cart, vtex.checkout-payment)
- Definition of done

This file serves as the input to `/sdd-full-bootstrap` and provides the context needed for `/speckit.specify` to generate a thorough spec.
