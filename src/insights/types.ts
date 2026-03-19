import type { Insights } from "./schema.js";

export interface InsightExtractor {
  extract(note: string): Promise<Insights>;
}
