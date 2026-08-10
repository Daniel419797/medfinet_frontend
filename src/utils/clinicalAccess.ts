import type { OrganizationRole } from "../services/medfinetSessionApi";

export const CLINICAL_READ_ROLES = [
  "OWNER",
  "ADMIN",
  "HEALTH_WORKER",
  "CAREGIVER",
] as const satisfies readonly OrganizationRole[];

export const CLINICAL_WRITE_ROLES = [
  "OWNER",
  "ADMIN",
  "HEALTH_WORKER",
] as const satisfies readonly OrganizationRole[];

export function canReadClinical(role?: OrganizationRole | null) {
  return Boolean(role && CLINICAL_READ_ROLES.includes(
    role as (typeof CLINICAL_READ_ROLES)[number],
  ));
}

export function canWriteClinical(role?: OrganizationRole | null) {
  return Boolean(role && CLINICAL_WRITE_ROLES.includes(
    role as (typeof CLINICAL_WRITE_ROLES)[number],
  ));
}
