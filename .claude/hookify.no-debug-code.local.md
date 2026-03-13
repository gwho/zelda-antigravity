---
name: no-debug-code
enabled: true
event: file
conditions:
  - field: file_path
    regex_match: dungeon-crawler/src/.*\.ts$
  - field: new_text
    regex_match: console\.(log|warn|error|debug|info)\(
action: warn
---

**Warning: console statement detected in source file.**

You are in the **predict before modify** discipline. Console statements are a crutch that bypasses the learning objective — forming a prediction *before* running the code.

**What to do instead:**

1. Remove the `console.*` call you just added.
2. Write down your prediction: *what do you expect to happen, and why?*
3. Make the change and observe the result in the running game.
4. Compare observation to prediction. The gap is where learning happens.

If you are genuinely stuck and need to inspect a value, ask the examiner or challenger agent to give you a hint instead of logging it.
