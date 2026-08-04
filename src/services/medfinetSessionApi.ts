import { medfinetRequest } from "./medfinetApiClient";

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "HEALTH_WORKER"
  | "NUTRITION_WORKER"
  | "EMERGENCY_COORDINATOR"
  | "AUDITOR"
  | "MERCHANT"
  | "CAREGIVER";

export type OrganizationMembership = {
  id: string;
  role: OrganizationRole;
  scopeMode: "GLOBAL" | "SCOPED";
  organization: {
    id: string;
    name: string;
    slug: string;
    status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  };
  facilityScopes: Array<{ facilityId: string }>;
  programmeScopes: Array<{ programmeId: string }>;
};

export const medfinetSessionApi = {
  organizations: () =>
    medfinetRequest<OrganizationMembership[]>("/me/organizations"),
  createOrganization: (input: { name: string; slug: string }) =>
    medfinetRequest<{
      organization: OrganizationMembership["organization"];
      membership: { id: string; role: OrganizationRole };
    }>("/organizations", { method: "POST", body: input }),
};
