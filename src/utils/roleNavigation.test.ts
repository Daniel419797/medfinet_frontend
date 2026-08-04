import { describe, expect, it } from "vitest";
import { roleHomePath } from "./roleNavigation";

describe("roleHomePath", () => {
  it.each([
    ["OWNER", "/admin/dashboard"],
    ["ADMIN", "/admin/dashboard"],
    ["HEALTH_WORKER", "/health-worker/dashboard"],
    ["NUTRITION_WORKER", "/health-worker/dashboard"],
    ["EMERGENCY_COORDINATOR", "/health-worker/dashboard"],
    ["MERCHANT", "/merchant"],
    ["AUDITOR", "/audit"],
    ["CAREGIVER", "/dashboard"],
  ] as const)("routes %s to %s", (role, expected) => {
    expect(roleHomePath(role)).toBe(expected);
  });

  it("uses the caregiver-safe workspace before a role is available", () => {
    expect(roleHomePath()).toBe("/dashboard");
  });
});
