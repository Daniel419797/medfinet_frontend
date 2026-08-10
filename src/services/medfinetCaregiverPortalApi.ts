import { medfinetRequest as request } from "./medfinetApiClient";

export type ParentRelationship =
  | "MOTHER"
  | "FATHER"
  | "GUARDIAN"
  | "RELATIVE"
  | "OTHER";

export type ConnectParentInput = {
  accountId?: string;
  accountEmail?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLanguage?: string;
  childId: string;
  relationship: ParentRelationship;
  isPrimary?: boolean;
  hasConsentAuthority?: boolean;
};

export const medfinetCaregiverPortalApi = {
  connectParent(orgId: string, body: ConnectParentInput) {
    return request<{
      caregiver: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        subjectId: string;
      };
      membership: {
        id: string;
        role: "CAREGIVER";
        status: string;
      };
      child: {
        id: string;
        medfinetId: string;
        firstName: string;
        lastName: string;
      };
      relationship: {
        relationship: ParentRelationship;
        isPrimary: boolean;
        hasConsentAuthority: boolean;
      };
    }>("/caregivers/connect-parent", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "caregiver-portal-connection",
    });
  },
};
