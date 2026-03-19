import type { InsightExtractor } from "./types.js";
import { InsightsSchema, type Insights } from "./schema.js";

/**
 * Checks whether the note contains at least one keyword from the list.
 */
function includesAny(note: string, keywords: string[]): boolean {
  return keywords.some((keyword) => note.includes(keyword));
}

/**
 * Counts how many times a keyword appears in the note.
 */
function countOccurrences(note: string, keyword: string): number {
  return note.split(keyword).length - 1;
}

/**
 * Adds a signal only once to avoid duplicate entries.
 */
function addSignal(signals: string[], signal: string): void {
  if (!signals.includes(signal)) {
    signals.push(signal);
  }
}

/**
 * Uses deterministic keyword-based heuristics as the default extraction path.
 * It scans the note for predefined patterns, derives structured signals such
 * as engagement, compliance risk, urgency, and referrals, and returns a
 * schema-validated insight object for downstream rule evaluation.
 */
export class MockInsightExtractor implements InsightExtractor {
  async extract(note: string): Promise<Insights> {
    const normalizedNote = note.toLowerCase();
    const positiveSignals: string[] = [];
    const negativeSignals: string[] = [];
    const hasExplicitNoComplianceIssues =
      normalizedNote.includes("no compliance issues") || normalizedNote.includes("no blockers");

    let engagementScore = 55;

    if (normalizedNote.includes("highly engaged")) {
      engagementScore += 30;
      addSignal(positiveSignals, "Highly engaged employee");
    }

    if (includesAny(normalizedNote, ["great", "praised", "helped", "supported"])) {
      engagementScore += 20;
      if (normalizedNote.includes("helped")) {
        addSignal(positiveSignals, "Helped a teammate");
      }
      if (normalizedNote.includes("supported")) {
        addSignal(positiveSignals, "Supported a teammate");
      }
      if (normalizedNote.includes("praised")) {
        addSignal(positiveSignals, "Received praise from manager");
      }
      if (normalizedNote.includes("great")) {
        addSignal(positiveSignals, "Great performance");
      }
    }

    if (includesAny(normalizedNote, ["mentored", "mentor", "team participation"])) {
      engagementScore += 15;
      if (normalizedNote.includes("mentored") || normalizedNote.includes("mentor")) {
        addSignal(positiveSignals, "Mentored a new hire");
      }
      if (normalizedNote.includes("team participation")) {
        addSignal(positiveSignals, "Team participation");
      }
    }

    if (includesAny(normalizedNote, ["training completed", "completed training"])) {
      engagementScore += 10;
      addSignal(positiveSignals, "Training completed");
    }

    if (includesAny(normalizedNote, ["high utilization", "utilization maintained"])) {
      engagementScore += 15;
      addSignal(positiveSignals, "High utilization");
    }

    if (hasExplicitNoComplianceIssues) {
      addSignal(positiveSignals, normalizedNote.includes("no blockers") ? "No blockers" : "No compliance issues");
    }

    if (
      !hasExplicitNoComplianceIssues &&
      includesAny(normalizedNote, ["manual issues", "issue", "escalation", "missed", "late", "overdue"])
    ) {
      engagementScore -= 18;
      if (normalizedNote.includes("manual issues")) {
        addSignal(negativeSignals, "Manual issues");
      }
      if (normalizedNote.includes("issue")) {
        addSignal(negativeSignals, "Operational issue");
      }
      if (normalizedNote.includes("escalation")) {
        addSignal(negativeSignals, "Escalation");
      }
      if (normalizedNote.includes("missed")) {
        addSignal(negativeSignals, "Missed deadline");
      }
      if (normalizedNote.includes("late")) {
        addSignal(negativeSignals, "Late follow-up");
      }
      if (normalizedNote.includes("overdue")) {
        addSignal(negativeSignals, "Overdue task");
      }
    }

    if (includesAny(normalizedNote, ["policy violation", "breach"])) {
      engagementScore -= 25;
      if (normalizedNote.includes("policy violation")) {
        addSignal(negativeSignals, "Policy violation");
      }
      if (normalizedNote.includes("breach")) {
        addSignal(negativeSignals, "Compliance breach");
      }
    }

    let complianceRisk: Insights["complianceRisk"] = "low";
    if (includesAny(normalizedNote, ["policy violation", "breach"])) {
      complianceRisk = "high";
    } else if (
      !hasExplicitNoComplianceIssues &&
      includesAny(normalizedNote, ["manual issues", "issue", "escalation", "missed", "late", "overdue"])
    ) {
      complianceRisk = "medium";
    } else if (hasExplicitNoComplianceIssues) {
      complianceRisk = "low";
    }

    let urgency: Insights["urgency"] = "medium";
    if (includesAny(normalizedNote, ["urgent", "move quickly"])) {
      urgency = "high";
    } else if (includesAny(normalizedNote, ["no rush", "not urgent"])) {
      urgency = "low";
    }

    const decisionMakerInvolved = includesAny(normalizedNote, [
      "decision maker involved",
      "cto is involved",
      "vp is involved",
      "ceo is involved"
    ]);

    const referralMentions = countOccurrences(normalizedNote, "referral");
    const trainingCompleted = includesAny(normalizedNote, ["training completed", "completed training"]);
    const missionKeywords = [
      referralMentions > 0 ? "referral" : null,
      trainingCompleted ? "training" : null,
      includesAny(normalizedNote, ["high utilization", "utilization maintained"]) ? "utilization" : null,
      includesAny(normalizedNote, ["mentored", "mentor"]) ? "mentorship" : null
    ].filter((keyword): keyword is string => keyword !== null);

    return InsightsSchema.parse({
      engagementScore: Math.max(0, Math.min(100, engagementScore)),
      complianceRisk,
      positiveSignals,
      negativeSignals,
      decisionMakerInvolved,
      urgency,
      referralMentions,
      trainingCompleted,
      missionKeywords
    });
  }
}
