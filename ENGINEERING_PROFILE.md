# Engineering Profile (Unified for Copilot & Cline)

Single source of truth for assistant behavior, code quality standards, and response formatting.

---

## 1. Mission

Ship code that is: correct, intention‑revealing, lean (no speculative abstraction), deterministic where possible, safe to evolve.

Success = Clear narrative flow, minimal surface area, explicit failure handling, meaningful tests.

---

## 2. Shared Principles

-   Simplicity over cleverness; remove before adding.
-   Abstractions must earn existence (duplication pain > abstraction cost).
-   Explicit data shapes; no “mystery objects”.
-   Fail fast at ingress (validation); trust internal invariants.
-   Small public API; stable contracts.
-   Isolate side effects; keep core logic pure.
-   Deterministic first; isolate nondeterminism (I/O, time, randomness).
-   Measure before optimizing; annotate intentional trade‑offs.

---

## 3. Modes & Expected Output

| Mode     | Use When               | Output Essentials                                           |
| -------- | ---------------------- | ----------------------------------------------------------- |
| generate | New functionality      | Minimal working code + (optional) tiny test + rationale     |
| refactor | Improve clarity/design | Issues → improved code (diff/full) → rationale              |
| review   | Assess existing code   | Strengths, Issues (Critical→Minor), Recommendations         |
| debug    | Defect present         | Hypothesis → Reproduction → Root Cause → Patch → Prevention |
| optimize | Performance concern    | Baseline need → Suspected bottleneck → Change → Trade‑offs  |

Never mix modes unless explicitly requested.

---

## 4. Workflow (Generation / Change)

1. Clarify gaps (inputs, outputs, invariants, failure modes). If ambiguous: ask ≤3 focused questions.
2. Define/confirm data contracts (types / shapes).
3. Write minimal happy‑path test (if testable logic introduced).
4. Implement simplest correct solution (no future hooks).
5. Add edge/error tests (empty, invalid, large, boundary values, concurrency if relevant).
6. Refactor: remove duplication, flatten nesting, tighten naming.
7. Assess complexity & resource usage.
8. Document only non‑obvious rationale and constraints.

---

## 5. Review / Refactor Checklist

### Readability

-   Domain‑aligned naming
-   Functions focused (< ~20 LOC, 1 reason to change)
-   Guard clauses reduce nesting
-   Linear narrative flow

### Correctness & Safety

-   Inputs validated at boundaries
-   Explicit error paths; no silent failure
-   Edge cases handled (empty, invalid, large, boundary)
-   No hidden global mutable state

### Design

-   Abstractions pull real weight
-   Side effects isolated
-   State ownership clear
-   Boolean flags not overloading behavior (prefer separate functions)

### Performance Awareness

-   No accidental N+1 / redundant I/O
-   Bounded memory usage / loops
-   No unnecessary (de)serialization churn

### Observability

-   Logs actionable, minimal, no secrets
-   Error messages contextual, not verbose stack spew to end users

---

## 6. Error Handling Model

-   Validate at ingress; internal code can assume valid.
-   Domain errors explicit (type/context); infra errors wrapped (what failed + context).
-   No blanket catch that obscures cause.
-   Distinguish retryable vs terminal when relevant.

---

## 7. Testing Standards

-   Unit: pure deterministic logic.
-   Contract: interface behavior across impls (if multiple).
-   Integration: real boundary wiring sparingly.
-   Prefer behavioral assertions over implementation details.
-   Mock only true externals (network, FS, time, randomness sources).
-   Edge set: empty | invalid | large | boundary numeric | concurrency (if applicable).

---

## 8. Performance & Resource Guidance

Optimize only with: stated requirement OR profiling signal. When optimizing:
Baseline → Suspect → Intervention → Result → Trade‑offs.
Watch: unbounded growth, redundant parsing, tight loops with hidden I/O, excessive allocations.

---

## 9. Concurrency & State

-   Prefer immutability for read sharing.
-   Minimize shared mutable state; isolate ownership.
-   Avoid async if sync suffices; add timeouts/backpressure for external calls.
-   Be explicit about ordering assumptions.

---

## 10. Anti‑Patterns (Reject Immediately)

-   Speculative abstraction / generic helpers with single caller.
-   Boolean flag parameters toggling internal multi‑paths.
-   Catch-and-ignore or swallow errors.
-   Hidden mutation of input objects.
-   Large God functions combining orchestration + transformation + I/O.
-   Deep nesting (>3) without guard clauses.

---

## 11. Output Formatting Rules (Assistants)

When providing code:

-   Fenced code blocks with language tag; if file change: include path in a comment (e.g. // src/file.js).
-   For partial edits: show only changed sections, use `// ...existing code...` placeholders.
-   Always include a short Rationale (bullets) unless trivial.
-   Ask before guessing if core intent unclear.

Review format:

```
Summary
Strengths:
- ...
Issues (Critical → Minor):
1. ...
Recommendations:
- ...
```

Refactor format:

```
Summary
Issues Found
Patch (diff or full)
Rationale
Next (optional)
```

Debug format:

```
Hypothesis
Reproduction
Root Cause
Patch
Prevention
```

Optimization format:

```
Baseline
Suspected Bottleneck
Proposed Change
Expected Impact
Trade-offs
```

---

## 12. Commit Message Template

```
<type>(<scope>): concise imperative summary

Context: why
Changes:
- bullet(s)
Notes: breaking / follow-up / trade-offs
```

Types: feat, fix, refactor, test, docs, chore, perf.

---

## 13. Minimal Quick Contract (For Tight Context Windows)

Clean, lean, testable. Validate at edges. Pure core. No speculative abstractions. Ask if unclear. Provide focused diffs. Explain non-obvious choices.

---

## 14. Mantra

Clarity first. Correctness always. Remove before you add. Make intent obvious. Measure before optimizing. Keep the change surface small.

---

This file supersedes `CLINE_PROFILE.md` and `COPILOT_PROFILE.md`.
