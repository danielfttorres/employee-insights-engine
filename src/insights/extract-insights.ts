import type { ActivityLog } from "../domain/types.js";
import { LLMInsightExtractor } from "./LLM-insight-extractor.js";
import { MockInsightExtractor } from "./mock-insight-extractor.js";
import { getOpenAiApiKey } from "./openai-api-key.js";
import type { Insights } from "./schema.js";
import type { InsightExtractor } from "./types.js";

const complianceRiskRank: Record<Insights["complianceRisk"], number> = {
  low: 0,
  medium: 1,
  high: 2
};

const urgencyRank: Record<Insights["urgency"], number> = {
  low: 0,
  medium: 1,
  high: 2
};

/**
 * Selects the insight extractor implementation based on whether
 * an OpenAI API key is available in the current environment.
 */
function getInsightExtractor(): InsightExtractor {
  return getOpenAiApiKey() ? new LLMInsightExtractor() : new MockInsightExtractor();
}

/**
 * Combines multiple extracted insight objects into a single summary
 * that can be used by the mission evaluation flow.
 */
function mergeInsights(insightsList: Insights[]): Insights {
  const [firstInsight, ...remainingInsights] = insightsList;
  const engagementScore = Math.round(
    insightsList.reduce((total, insights) => total + insights.engagementScore, 0) / insightsList.length
  );

  return {
    engagementScore,
    complianceRisk: remainingInsights.reduce((highestRisk, current) =>
      complianceRiskRank[current.complianceRisk] > complianceRiskRank[highestRisk] ? current.complianceRisk : highestRisk
    , firstInsight!.complianceRisk),
    positiveSignals: Array.from(new Set(insightsList.flatMap((insights) => insights.positiveSignals))),
    negativeSignals: Array.from(new Set(insightsList.flatMap((insights) => insights.negativeSignals))),
    decisionMakerInvolved: insightsList.some((insights) => insights.decisionMakerInvolved),
    urgency: remainingInsights.reduce((highestUrgency, current) =>
      urgencyRank[current.urgency] > urgencyRank[highestUrgency] ? current.urgency : highestUrgency
    , firstInsight!.urgency),
    referralMentions: insightsList.reduce((total, insights) => total + insights.referralMentions, 0),
    trainingCompleted: insightsList.some((insights) => insights.trainingCompleted),
    missionKeywords: Array.from(new Set(insightsList.flatMap((insights) => insights.missionKeywords)))
  };
}

/**
 * Extracts insights from all activity logs using the configured extractor
 * and merges the results into a single evaluation-ready insight object.
 */
export async function extractInsights(logs: [ActivityLog, ...ActivityLog[]]): Promise<Insights> {
  const extractor = getInsightExtractor();
  const extractedInsights = await Promise.all(logs.map((log) => extractor.extract(log.note)));

  return mergeInsights(extractedInsights);
}
