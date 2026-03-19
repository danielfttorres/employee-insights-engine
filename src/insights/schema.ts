import { z } from "zod";

export const InsightsSchema = z.object({
  engagementScore: z.number().min(0).max(100),
  complianceRisk: z.enum(["low", "medium", "high"]),
  positiveSignals: z.array(z.string()).default([]),
  negativeSignals: z.array(z.string()).default([]),
  decisionMakerInvolved: z.boolean().default(false),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  referralMentions: z.number().int().min(0).default(0),
  trainingCompleted: z.boolean().default(false),
  missionKeywords: z.array(z.string()).default([])
});

export type Insights = z.infer<typeof InsightsSchema>;
