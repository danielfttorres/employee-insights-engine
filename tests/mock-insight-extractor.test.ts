import { describe, expect, it } from "vitest";
import { MockInsightExtractor } from "../src/insights/mock-insight-extractor.js";
import { buildInsightExtractionPrompt } from "../src/insights/prompts.js";

describe("MockInsightExtractor", () => {
  it("returns high engagement and low compliance risk for positive notes", async () => {
    const extractor = new MockInsightExtractor();

    const insights = await extractor.extract("Highly engaged employee. No compliance issues.");

    expect(insights.engagementScore).toBeGreaterThanOrEqual(75);
    expect(insights.complianceRisk).toBe("low");
  });

  it("returns high urgency and decision maker involvement when signaled", async () => {
    const extractor = new MockInsightExtractor();

    const insights = await extractor.extract("They want to move quickly. CTO is involved.");

    expect(insights.urgency).toBe("high");
    expect(insights.decisionMakerInvolved).toBe(true);
  });
});

describe("buildInsightExtractionPrompt", () => {
  it("includes clear instructions and the original note", () => {
    const prompt = buildInsightExtractionPrompt("Sample activity note.");

    expect(prompt).toContain("Return only information that can be inferred");
    expect(prompt).toContain("Sample activity note.");
  });
});
