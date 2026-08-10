import { describe, expect, it } from "vitest";
import {
  CLINICAL_READ_ROLES,
  CLINICAL_WRITE_ROLES,
  canReadClinical,
  canWriteClinical,
} from "./clinicalAccess";

describe("clinical access policy", () => {
  it("allows owners and administrators to read clinical records", () => {
    expect(CLINICAL_READ_ROLES).toContain("OWNER");
    expect(CLINICAL_READ_ROLES).toContain("ADMIN");
    expect(canReadClinical("CAREGIVER")).toBe(true);
  });

  it("limits writes to owner, administrator, and health worker", () => {
    expect(CLINICAL_WRITE_ROLES).toEqual([
      "OWNER",
      "ADMIN",
      "HEALTH_WORKER",
    ]);
    expect(canWriteClinical("HEALTH_WORKER")).toBe(true);
    expect(canWriteClinical("NUTRITION_WORKER")).toBe(false);
    expect(canWriteClinical("EMERGENCY_COORDINATOR")).toBe(false);
    expect(canWriteClinical("CAREGIVER")).toBe(false);
  });
});
