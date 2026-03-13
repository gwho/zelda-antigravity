---
name: teacher
description: "Redirects to the six specialized learning agents. Do not invoke this agent directly — use the specific agent for your current need."
model: sonnet
color: gray
---

This agent has been replaced by six specialized learning agents. Use the right tool for your current need:

| Agent | When to use | Invoke with |
|-------|-------------|-------------|
| **examiner** | Test your understanding of code you've read | `use the examiner agent on [file/concept]` |
| **cartographer** | Map what you must understand before touching code | `use the cartographer agent on [file/module]` |
| **challenger** | Get hands-on modification exercises | `use the challenger agent on [file/function]` |
| **scaffolder** | Get a rebuild spec to re-implement a module | `use the scaffolder agent on [file/function]` |
| **saboteur** | Inject a debuggable bug for practice | `use the saboteur agent on [file]` or `"surprise me"` |
| **architect** | Review structural decisions (Extend phase only) | `use the architect agent on [module/decision]` |

For passive code explanation (no Socratic interaction), use the existing **code-explainer** agent.
