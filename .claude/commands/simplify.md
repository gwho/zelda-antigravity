Review recently changed code for simplification opportunities.

## Step 1 — Identify scope

If $ARGUMENTS is provided, scope the review to that file. Otherwise run:
```
git diff HEAD
```
to identify all changed files in the current working session.

## Step 2 — Phase-aware review

Read `CLAUDE.md` to determine the current G→C→R phase:

- **Re-implement phase**: compare the learner's implementation against the reference implementation (if one exists in git history or a `docs/scaffold-*.md` file). Flag divergences that reduce clarity or correctness.
- **Comprehend / Extend phase**: lightweight review focused on the changes themselves.

## Step 3 — Report only (no code suggestions)

For each changed file, report findings in exactly three categories. Omit any category with no findings.

**Redundant code** — logic that is duplicated, dead, or could be removed without changing behaviour.

**Missed reuse** — a helper, utility, or existing function that could replace hand-written logic.

**Efficiency** — unnecessary recomputation, avoidable allocations, or loops that do more work than needed.

For each finding: state the file, the approximate line range, and a one-sentence plain-English description of the issue. Do NOT write corrected code.

---

Run `/simplify` again after you make changes.
