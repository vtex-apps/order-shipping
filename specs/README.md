# Specs

Feature specifications for `vtex.order-shipping`, following the **VTEX SDD Lite** workflow.

## Lifecycle

```
Draft → Approved → Done
```

| Status | Meaning | Trigger |
|---|---|---|
| `Draft` | Written, awaiting review | `/specification` skill generates spec |
| `Approved` | Reviewed and accepted for implementation | Human flips status after PR review |
| `Done` | Fully implemented | `/implementing` skill completes the PR |

## Creating a spec

**SDD Lite** (small changes, bug fixes, new mutations):
```
/specification "<task description>"
```

**SDD Full** (larger features, API surface changes, cross-team work):
```
/sdd-full-bootstrap
```

See `.agents/commands/` for the full workflow guides.

## Ephemeral artifacts

The following files are **gitignored** — they are intermediate SDD artifacts generated during planning and should not be committed:

- `*/plan.md`
- `*/tasks.md`
- `*/analysis.md`

Only `spec.md` files and final implementation code are committed.
