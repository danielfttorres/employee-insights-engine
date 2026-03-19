import { describe, expect, it } from "vitest";
import { evaluateRule } from "../src/engine/evaluate-rule.js";
import { activityLogsByEmployee, employees, missions } from "../src/data/sample-data.js";
import { qualifyMissions } from "../src/domain/qualify-missions.js";
import { extractInsights } from "../src/insights/extract-insights.js";

describe("extractInsights", () => {
  it("derives engagement, training, referrals and compliance risk from notes", async () => {
    const insights = await extractInsights(activityLogsByEmployee["emp-1"]!);

    expect(insights.engagementScore).toBeGreaterThanOrEqual(80);
    expect(insights.trainingCompleted).toBe(true);
    expect(insights.referralMentions).toBe(1);
    expect(insights.complianceRisk).toBe("low");
    expect(insights.positiveSignals.length).toBeGreaterThan(0);
  });
});

describe("evaluateRule", () => {
  it("evaluates nested DSL rules with explanations", () => {
    const result = evaluateRule(missions[0]!.rule, {
      employee: {
        id: "emp-test",
        name: "Test Employee",
        country: "US",
        utilization: 0.9,
        role: "agent"
      },
      insights: {
        engagementScore: 95,
        complianceRisk: "low",
        positiveSignals: [],
        negativeSignals: [],
        decisionMakerInvolved: false,
        urgency: "medium",
        referralMentions: 1,
        trainingCompleted: true,
        missionKeywords: ["referral", "training"]
      }
    });

    expect(result.matched).toBe(true);
    expect(result.reasons).toHaveLength(3);
    expect(result.reasons[0]).toContain("employee.utilization");
  });

  it("supports less_than, contains, in, exists, and or rules", () => {
    const result = evaluateRule(
      {
        type: "or",
        rules: [
          {
            type: "and",
            rules: [
              { type: "less_than", field: "employee.utilization", value: 0.7 },
              { type: "contains", field: "insights.positiveSignals", value: "Mentored a new hire" },
              { type: "exists", field: "insights.urgency" }
            ]
          },
          {
            type: "and",
            rules: [
              { type: "in", field: "employee.role", value: ["agent", "manager"] },
              { type: "contains", field: "insights.missionKeywords", value: "referral" }
            ]
          }
        ]
      },
      {
        employee: employees[0]!,
        insights: {
          engagementScore: 88,
          complianceRisk: "low",
          positiveSignals: ["Mentored a new hire", "Training completed"],
          negativeSignals: [],
          decisionMakerInvolved: false,
          urgency: "medium",
          referralMentions: 1,
          trainingCompleted: true,
          missionKeywords: ["referral", "training"]
        }
      }
    );

    expect(result.matched).toBe(true);
    expect(result.reasons.some((reason) => reason.includes("employee.role is in"))).toBe(true);
    expect(result.reasons.some((reason) => reason.includes("insights.missionKeywords contains referral"))).toBe(true);
  });

  it("supports less_than and exists when evaluating a failing branch", () => {
    const result = evaluateRule(
      {
        type: "and",
        rules: [
          { type: "less_than", field: "employee.utilization", value: 0.7 },
          { type: "exists", field: "insights.urgency" }
        ]
      },
      {
        employee: employees[1]!,
        insights: {
          engagementScore: 40,
          complianceRisk: "medium",
          positiveSignals: [],
          negativeSignals: ["Escalation"],
          decisionMakerInvolved: false,
          urgency: "high",
          referralMentions: 0,
          trainingCompleted: false,
          missionKeywords: []
        }
      }
    );

    expect(result.matched).toBe(true);
    expect(result.reasons).toHaveLength(2);
    expect(result.reasons[0]).toContain("employee.utilization is less than 0.7");
    expect(result.reasons[1]).toContain("insights.urgency exists");
  });
});

describe("qualifyMissions", () => {
  it("returns mission eligibility with reasons for each mission", async () => {
    const result = await qualifyMissions({
      employee: employees[0]!,
      activityLogs: activityLogsByEmployee["emp-1"]!,
      missions
    });

    expect(result.eligibility).toHaveLength(3);
    expect(result.eligibility.find((mission) => mission.missionId === "mission-referral-champion")?.qualified).toBe(true);
    expect(result.eligibility.every((mission) => mission.reasons.length > 0)).toBe(true);
  });

  it("marks lower-performing employees as not qualified when rules fail", async () => {
    const result = await qualifyMissions({
      employee: employees[1]!,
      activityLogs: activityLogsByEmployee["emp-2"]!,
      missions
    });

    expect(result.eligibility.find((mission) => mission.missionId === "mission-high-performer")?.qualified).toBe(false);
  });
});
