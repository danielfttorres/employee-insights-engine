import { evaluateRule } from "../engine/evaluate-rule.js";
import { extractInsights } from "../insights/extract-insights.js";
import type { ActivityLog, Employee, Mission, MissionEligibility, QualificationContext } from "./types.js";

/**
 * Extracts insights from activity logs, builds the evaluation context,
 * and returns mission eligibility results with their matching reasons.
 */
export async function qualifyMissions(params: {
  employee: Employee;
  activityLogs: [ActivityLog, ...ActivityLog[]];
  missions: Mission[];
}): Promise<{ insights: QualificationContext["insights"]; eligibility: MissionEligibility[] }> {
  const insights = await extractInsights(params.activityLogs);
  const context: QualificationContext = {
    employee: params.employee,
    insights
  };

  const eligibility = params.missions.map((mission) => {
    const evaluation = evaluateRule(mission.rule, context);

    return {
      missionId: mission.id,
      missionName: mission.name,
      qualified: evaluation.matched,
      reasons: evaluation.reasons
    };
  });

  return { insights, eligibility };
}
