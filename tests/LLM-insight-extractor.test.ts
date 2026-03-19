import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOpenAIMock, generateTextMock, outputObjectMock, getOpenAiApiKeyMock } = vi.hoisted(() => ({
  createOpenAIMock: vi.fn(),
  generateTextMock: vi.fn(),
  outputObjectMock: vi.fn(),
  getOpenAiApiKeyMock: vi.fn()
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: createOpenAIMock
}));

vi.mock("ai", () => ({
  generateText: generateTextMock,
  Output: {
    object: outputObjectMock
  }
}));

vi.mock("../src/insights/openai-api-key.js", () => ({
  getOpenAiApiKey: getOpenAiApiKeyMock
}));

import { LLMInsightExtractor } from "../src/insights/LLM-insight-extractor.js";

describe("LLMInsightExtractor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the OpenAI API key is missing", async () => {
    getOpenAiApiKeyMock.mockReturnValue(undefined);

    const extractor = new LLMInsightExtractor();

    await expect(extractor.extract("Sample activity note.")).rejects.toThrow(
      "OPENAI_API_KEY is required to run the OpenAI insight extractor."
    );
  });

  it("uses structured output and returns schema-validated insights", async () => {
    const modelMock = vi.fn().mockReturnValue("mock-model");

    getOpenAiApiKeyMock.mockReturnValue("test-key");
    createOpenAIMock.mockReturnValue(modelMock);
    outputObjectMock.mockReturnValue("mock-output-config");
    generateTextMock.mockResolvedValue({
      experimental_output: {
        engagementScore: 82,
        complianceRisk: "low",
        positiveSignals: ["Training completed"],
        negativeSignals: [],
        decisionMakerInvolved: false,
        urgency: "medium",
        referralMentions: 1,
        trainingCompleted: true,
        missionKeywords: ["training", "referral"]
      }
    });

    const extractor = new LLMInsightExtractor();
    const result = await extractor.extract("Training completed and referral submitted.");

    expect(createOpenAIMock).toHaveBeenCalledWith({ apiKey: "test-key" });
    expect(modelMock).toHaveBeenCalledWith("gpt-4.1-mini");
    expect(outputObjectMock).toHaveBeenCalledTimes(1);
    expect(generateTextMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      engagementScore: 82,
      complianceRisk: "low",
      positiveSignals: ["Training completed"],
      negativeSignals: [],
      decisionMakerInvolved: false,
      urgency: "medium",
      referralMentions: 1,
      trainingCompleted: true,
      missionKeywords: ["training", "referral"]
    });
  });
});
