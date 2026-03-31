---
name: saboteur-safety
enabled: true
event: stop
---

If a saboteur session occurred this conversation, run through this checklist before closing:

- [ ] **Git checkpoint exists** — `git log --oneline -3` shows a "pre-saboteur checkpoint" commit
- [ ] **Symptom recorded** — you wrote down the observable symptom before looking at any code
- [ ] **Bug fixed by learner** — you (not the AI) made the fix; the AI only gave warmer/colder hints
- [ ] **Working tree clean** — `git status` shows no uncommitted changes

If any item is unchecked, do not end the session until it is resolved.

**Escape hatch:** if you want to abandon the debugging challenge entirely, run:
```
git revert HEAD
```
This undoes the injected bug and returns the codebase to the pre-saboteur state.
