import type { ActivityLog, Employee, Mission } from "../domain/types.js";

export const employees: Employee[] = [
  {
    id: "emp-1",
    name: "Ana Torres",
    country: "BR",
    utilization: 0.82,
    role: "agent"
  },
  {
    id: "emp-2",
    name: "Michael Carter",
    country: "US",
    utilization: 0.68,
    role: "recruiter"
  }
];

export const activityLogsByEmployee: Record<string, [ActivityLog, ...ActivityLog[]]> = {
  "emp-1": [
    {
      employeeId: "emp-1",
      note: "Helped a teammate and mentored a new hire. Training completed this week.",
      createdAt: "2026-03-10T10:00:00Z"
    },
    {
      employeeId: "emp-1",
      note: "Received praise from manager after a great client call. Referral submitted.",
      createdAt: "2026-03-12T13:00:00Z"
    },
    {
      employeeId: "emp-1",
      note: "High utilization maintained all sprint with no blockers.",
      createdAt: "2026-03-14T16:00:00Z"
    }
  ],
  "emp-2": [
    {
      employeeId: "emp-2",
      note: "Missed follow-up deadline and had one escalation.",
      createdAt: "2026-03-11T09:00:00Z"
    },
    {
      employeeId: "emp-2",
      note: "Referral discussed with candidate but training is still pending.",
      createdAt: "2026-03-13T11:30:00Z"
    }
  ]
};

export const missions: Mission[] = [
  {
    id: "mission-high-performer",
    name: "High Performer",
    description: "Rewards employees with strong utilization and engagement in the US.",
    rule: {
      type: "and",
      rules: [
        { type: "greater_than", field: "employee.utilization", value: 0.75 },
        { type: "equals", field: "employee.country", value: "US" },
        { type: "greater_than", field: "insights.engagementScore", value: 80 }
      ]
    }
  },
  {
    id: "mission-referral-champion",
    name: "Referral Champion",
    description: "Rewards people who actively bring referrals and completed training.",
    rule: {
      type: "and",
      rules: [
        { type: "greater_than", field: "insights.referralMentions", value: 0 },
        { type: "equals", field: "insights.trainingCompleted", value: true }
      ]
    }
  },
  {
    id: "mission-compliance-safe",
    name: "Compliance Safe",
    description: "Flags employees whose compliance risk is not high.",
    rule: {
      type: "not",
      rule: { type: "equals", field: "insights.complianceRisk", value: "high" }
    }
  }
];
