/**
 * Builds the prompt used by the LLM extractor to convert a free-text
 * activity note into structured insights.
 */
export function buildInsightExtractionPrompt(note: string): string {
  return [
    "You extract structured employee activity insights.",
    "Return only information that can be inferred from the activity note.",
    "Do not invent facts.",
    "Use the provided schema exactly.",
    "",
    "Activity note:",
    note
  ].join("\n");
}
