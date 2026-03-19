export type Primitive = string | number | boolean | null;

export interface EqualsRule {
  type: "equals";
  field: string;
  value: Primitive;
}

export interface GreaterThanRule {
  type: "greater_than";
  field: string;
  value: number;
}

export interface LessThanRule {
  type: "less_than";
  field: string;
  value: number;
}

export interface ContainsRule {
  type: "contains";
  field: string;
  value: Primitive;
}

export interface InRule {
  type: "in";
  field: string;
  value: Primitive[];
}

export interface ExistsRule {
  type: "exists";
  field: string;
}

export interface AndRule {
  type: "and";
  rules: Rule[];
}

export interface OrRule {
  type: "or";
  rules: Rule[];
}

export interface NotRule {
  type: "not";
  rule: Rule;
}

export type Rule =
  | EqualsRule
  | GreaterThanRule
  | LessThanRule
  | ContainsRule
  | InRule
  | ExistsRule
  | AndRule
  | OrRule
  | NotRule;

export interface RuleEvaluation {
  matched: boolean;
  reasons: string[];
}
