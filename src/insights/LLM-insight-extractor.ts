import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { getOpenAiApiKey } from "./openai-api-key.js";
import { buildInsightExtractionPrompt } from "./prompts.js";
import { InsightsSchema, type Insights } from "./schema.js";
import type { InsightExtractor } from "./types.js";

/**
 * Uses OpenAI structured output as an optional extraction path for turning
 * free-text activity notes into validated insight objects.
 */
export class LLMInsightExtractor implements InsightExtractor {
  async extract(note: string): Promise<Insights> {
    const apiKey = getOpenAiApiKey();

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required to run the OpenAI insight extractor.");
    }

    const openai = createOpenAI({ apiKey });

    const { experimental_output } = await generateText({
      model: openai("gpt-4.1-mini"),
      experimental_output: Output.object({
        schema: InsightsSchema
      }),
      prompt: buildInsightExtractionPrompt(note)
    });

    return InsightsSchema.parse(experimental_output);
  }
}
