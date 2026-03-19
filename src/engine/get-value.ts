/**
 * Resolves a nested value from an object using dot notation such as
 * `employee.country` or `insights.engagementScore`.
 */
export function getValueByPath(input: unknown, path: string): unknown {
  return path.split(".").reduce((current: unknown, segment) => {
    return (current as Record<string, unknown>)[segment];
  }, input);
}
