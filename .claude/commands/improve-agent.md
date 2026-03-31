Run the skill-creator description-optimizer workflow on a named agent.

## Step 1 — Load the agent

Read `.claude/agents/$ARGUMENTS.md`.

If $ARGUMENTS is empty, ask: "Which agent would you like to improve? (examiner, challenger, saboteur, scaffolder, architect, cartographer, code-explainer, teacher)"

## Step 2 — Diagnose five problems

Analyse the agent's `description` field against these five criteria. For each, note whether it passes or fails with a one-sentence explanation:

1. **Too vague** — does the description tell Claude *when* to invoke this agent vs. a general-purpose agent?
2. **Too specific** — does it list so many narrow examples that natural phrasings get missed?
3. **Missing variety** — does it cover at least two meaningfully different trigger contexts?
4. **Weak commentary** — do the `<commentary>` blocks explain *why* the agent fits, not just restate the user's words?
5. **No anti-examples** — are there cases where someone might incorrectly invoke this agent that the description fails to distinguish?

## Step 3 — Produce a BEFORE / AFTER diff

Show only the `description` field — not the full file.

```
BEFORE:
<paste current description field value>

AFTER:
<revised description — address all failing criteria>
```

Do NOT write to the file. Present the diff for review only.

## Step 4 — Manual test instruction

After presenting the diff, say:

"To test whether the new description works: close this conversation, open a new one, and phrase a request naturally **without using the agent name**. The agent should invoke automatically based on context alone. If it does not, the description still needs work."
