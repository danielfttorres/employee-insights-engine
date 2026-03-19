# ADR-002: Insight extraction design (Mock + optional LLM)

## Status
Accepted

## Context
The system needs structured insights from free-text notes, but it also needs to run reliably in local development, tests, and challenge review environments where an API key may not exist and external API usage should not consume unnecessary time or resources.

## Decision
The default path uses a deterministic mock extractor. The LLM-backed extractor is optional and only used when an OpenAI API key is present.

This keeps the baseline system predictable. Tests and demos do not depend on network access, model behavior, latency, or cost, and local runs do not consume external API resources or wait on remote calls. At the same time, the `InsightExtractor` interface keeps the door open for richer extraction when needed.

The LLM path is intentionally not the default because LLMs are useful but not fully reliable. They can drift, fail, or return inconsistent output across runs. To reduce that risk, extracted output is validated against a schema before the rest of the system uses it.

## Consequences
The main upside is operational reliability. The project works out of the box without secrets and remains testable.

The tradeoff is that the mock extractor is simpler and less flexible than a real model. It will miss nuance that an LLM can sometimes infer. Still, the swap point is explicit, so replacing or improving the implementation stays straightforward.
