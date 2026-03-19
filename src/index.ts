import { activityLogsByEmployee, employees, missions } from "./data/sample-data.js";
import { qualifyMissions } from "./domain/qualify-missions.js";
import { getOpenAiApiKey } from "./insights/openai-api-key.js";

if (getOpenAiApiKey()) {
  console.log("🤖 Using the optional OpenAI insight extraction path.");
} else {
  console.log("🧪 Using mock insight extraction.");
}

for (const employee of employees) {
  const result = await qualifyMissions({
    employee,
    activityLogs: activityLogsByEmployee[employee.id]!,
    missions
  });

  console.log(`\n👤 Employee: ${employee.name}`);
  console.log("🧠 Insights:", result.insights);

  for (const mission of result.eligibility) {
    console.log(`- ${mission.missionName}: ${mission.qualified ? "QUALIFIED" : "NOT QUALIFIED"}`);
    for (const reason of mission.reasons) {
      console.log(`  • ${reason}`);
    }
  }
}
