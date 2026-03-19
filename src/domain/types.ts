import type { Rule } from "../engine/rule-dsl.js";
import type { Insights } from "../insights/schema.js";

export interface Employee {
  id: string;
  name: string;
  country: string;
  utilization: number;
  role: "agent" | "manager" | "recruiter";
}

export interface ActivityLog {
  employeeId: string;
  note: string;
  createdAt: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  rule: Rule;
}

export interface QualificationContext {
  employee: Employee;
  insights: Insights;
}

export interface MissionEligibility {
  missionId: string;
  missionName: string;
  qualified: boolean;
  reasons: string[];
}
