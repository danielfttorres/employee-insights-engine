# ADR-003: Recursive rule evaluator design

## Status
Accepted

## Context
The rule DSL supports nested boolean composition with `and`, `or`, and `not`, plus a small set of leaf operators. The implementation needed to stay readable and easy to extend without adding a lot of framework code for a relatively small problem.

## Decision
The evaluator is implemented recursively. Composite rules call the evaluator on their children, and leaf rules are handled in a focused operator branch.

This is simpler than building a full expression engine. The rule shape already looks like a tree, so recursion matches the data model directly and keeps the control flow obvious.

Operators were isolated so each rule type has one clear implementation point. That makes behavior easier to test and reason about, and lowers the cost of adding another operator later.

Clarity was prioritized over abstraction. A straightforward switch with explicit cases is easier to maintain here than adding indirection too early.

## Consequences
The main upside is maintainability. The evaluator is easy to read, and new operators can be added without rewriting the recursive structure.

The tradeoff is that this is not a generic rules engine. If the DSL grows a lot, the switch-based design may need to be reorganized. For the current scope, that is acceptable.
