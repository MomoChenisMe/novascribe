---
name: iterative-retrieval
description: Pattern for progressively refining context retrieval to solve the subagent context problem
---

# Iterative Retrieval Pattern

Solves the "context problem" in multi-agent workflows where subagents don't know what context they need until they start working.

## The Solution: Iterative Retrieval

A 4-phase loop that progressively refines context:

1. **DISPATCH**: Initial broad query to gather candidate files.
2. **EVALUATE**: Assess retrieved content for relevance (0.0 to 1.0).
3. **REFINE**: Update search criteria based on evaluation (add keywords, patterns, excludes).
4. **LOOP**: Repeat with refined criteria (max 3 cycles).

### Best Practices

1. **Start broad, narrow progressively**.
2. **Learn codebase terminology** from the first cycle.
3. **Track what's missing** to drive refinement.
4. **Stop at "good enough"**.
