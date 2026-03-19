/**
 * Returns the OpenAI API key from the current environment, when available.
 */
export function getOpenAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}
