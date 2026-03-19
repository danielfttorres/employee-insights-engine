# ADR-001: Model rules as a JSON DSL instead of hardcoded conditionals

## Status
Accepted

## Context
The project needs to evaluate qualification rules without hardcoding business cases into TypeScript flow. Under challenge time constraints, the design had to be fast to build, easy to test, and easy to change.

## Decision
Rules are represented as JSON-shaped data using a small DSL with typed operators like `equals`, `greater_than`, `and`, `or`, and `not`.

Treating rules as data keeps responsibilities clear: the evaluator executes rules, while the rule set describes business intent. That fits better than spreading `if/else` logic across the codebase, where duplication grows and changes become harder to reason about.

We used JSON instead of inventing a custom parser. It is simple, familiar, maps naturally to TypeScript types, and was enough for the rule shapes we needed. It also avoided spending challenge time on parser work that was not core to the problem.

## Consequences
The main upside is extensibility. New rules can usually be added by extending the DSL and evaluator instead of rewriting application flow.

The tradeoff is that JSON is more verbose than hand-written code or a custom rule language, and it relies on validation and typing to keep invalid rule shapes out.
