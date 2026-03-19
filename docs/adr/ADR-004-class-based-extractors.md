# ADR-004: Use classes for insight extractors

## Status
Accepted

## Context
The project supports more than one insight extraction strategy: a deterministic mock implementation and an optional LLM-backed implementation. Both need to expose the same contract, stay easy to swap, and leave room for future configuration.

## Decision
Insight extractors are implemented as classes that satisfy the `InsightExtractor` interface.

This keeps the integration point explicit: each extractor has one responsibility and one public operation, `extract`. It also makes instantiation straightforward in the selection layer, where the system can switch between mock and LLM behavior without branching through unrelated logic.

Classes were chosen over plain exported functions because they give us a cleaner path if an extractor later needs dependencies, cached clients, or constructor-based configuration. That matters more for the LLM path, where API clients and model settings can grow over time.

## Consequences
The main upside is consistency. Both extractors follow the same shape and are easy to replace behind the shared interface.

The tradeoff is that classes add a little ceremony for a small codebase. A function-based design could also work, but this keeps the abstraction stable if extractor complexity grows.
