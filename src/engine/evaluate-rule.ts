import { getValueByPath } from "./get-value.js";
import type { Rule, RuleEvaluation } from "./rule-dsl.js";

/**
 * Formats values for human-readable rule evaluation reasons.
 */
function describeValue(value: unknown): string {
  return Array.isArray(value) ? `[${value.map(String).join(", ")}]` : String(value);
}

/**
 * Evaluates non-composite rules against the current context.
 */
function evaluateLeaf(rule: Exclude<Rule, { type: "and" | "or" | "not" }>, context: unknown): RuleEvaluation {
  const actual = getValueByPath(context, rule.field);

  switch (rule.type) {
    case "equals": {
      const matched = actual === rule.value;
      return {
        matched,
        reasons: [
          `${rule.field} ${matched ? "equals" : "does not equal"} ${describeValue(rule.value)} (actual: ${describeValue(actual)})`
        ]
      };
    }
    case "greater_than": {
      const matched = typeof actual === "number" && actual > rule.value;
      return {
        matched,
        reasons: [
          `${rule.field} ${matched ? "is greater than" : "is not greater than"} ${rule.value} (actual: ${describeValue(actual)})`
        ]
      };
    }
    case "less_than": {
      const matched = typeof actual === "number" && actual < rule.value;
      return {
        matched,
        reasons: [
          `${rule.field} ${matched ? "is less than" : "is not less than"} ${rule.value} (actual: ${describeValue(actual)})`
        ]
      };
    }
    case "contains": {
      const matched =
        typeof actual === "string"
          ? actual.includes(String(rule.value))
          : Array.isArray(actual) && actual.includes(rule.value);

      return {
        matched,
        reasons: [
          `${rule.field} ${matched ? "contains" : "does not contain"} ${describeValue(rule.value)} (actual: ${describeValue(actual)})`
        ]
      };
    }
    case "in": {
      const matched = rule.value.includes(actual as never);
      return {
        matched,
        reasons: [
          `${rule.field} ${matched ? "is in" : "is not in"} ${describeValue(rule.value)} (actual: ${describeValue(actual)})`
        ]
      };
    }
    case "exists": {
      const matched = actual !== undefined && actual !== null;
      return {
        matched,
        reasons: [`${rule.field} ${matched ? "exists" : "does not exist"}`]
      };
    }
  }
}

/**
 * Evaluates a rule tree against the provided context and returns both
 * the boolean result and the reasons that explain the outcome.
 */
export function evaluateRule(rule: Rule, context: unknown): RuleEvaluation {
  switch (rule.type) {
    case "and": {
      const evaluations = rule.rules.map((childRule) => evaluateRule(childRule, context));
      return {
        matched: evaluations.every((result) => result.matched),
        reasons: evaluations.flatMap((result) => result.reasons)
      };
    }

    case "or": {
      const evaluations = rule.rules.map((childRule) => evaluateRule(childRule, context));
      const matched = evaluations.some((result) => result.matched);
      const reasons = matched
        ? evaluations.filter((result) => result.matched).flatMap((result) => result.reasons)
        : evaluations.flatMap((result) => result.reasons);

      return { matched, reasons };
    }

    case "not": {
      const evaluation = evaluateRule(rule.rule, context);
      return {
        matched: !evaluation.matched,
        reasons: evaluation.reasons.map((reason) =>
          evaluation.matched ? `NOT failed because ${reason}` : `NOT matched because ${reason}`
        )
      };
    }

    default:
      return evaluateLeaf(rule, context);
  }
}
