disable-model-invocation: true

---

**Safety gate — read before proceeding.**

The saboteur agent will inject a realistic bug into the codebase for debugging practice. Before you confirm, verify all four steps:

1. **No uncommitted changes** — run `git status` and confirm the working tree is clean. Commit or stash anything in progress first.
2. **You are in the right directory** — the repo root should be `dungeon-crawler/` or its parent.
3. **You know the escape hatch** — if you want to abandon the challenge at any time, run `git revert HEAD` to undo the injection.
4. **You will not ask the AI to fix the bug** — the saboteur gives warmer/colder hints only. Finding and fixing the bug is your job.

Type **"confirmed"** to proceed, or **"cancel"** to abort.

---

After confirmation:

If $ARGUMENTS is provided, invoke: `use the saboteur agent on $ARGUMENTS`

If $ARGUMENTS is empty, invoke: `use the saboteur agent, surprise me`
