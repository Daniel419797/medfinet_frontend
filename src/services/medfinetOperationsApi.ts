import { medfinetRequest as request } from "./medfinetApiClient";

function query(path: string, values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(
    ([key, value]) => value && params.set(key, value),
  );
  const suffix = params.toString();
  return `${path}${suffix ? `?${suffix}` : ""}`;
}

export type OperationsCaregiver = {
  id: string;
  firstName: string;
  lastName: string;
  preferredLanguage: string;
  subjectId?: string;
  phone?: string;
  phoneVerifiedAt?: string;
  email?: string;
  createdAt: string;
  _count: { children: number };
};
export type OperationsAppointment = {
  id: string;
  childId: string;
  facilityId?: string;
  kind: string;
  scheduledFor: string;
  status: string;
  notes?: string;
  child: { medfinetId: string; firstName: string; lastName: string };
  facility?: { name: string; code: string };
  caregiverResponses: Array<{
    response: "CONFIRMED" | "RESCHEDULE_REQUESTED";
    status: string;
    preferredStart?: string;
    preferredEnd?: string;
    createdAt: string;
  }>;
};
export type ClimateEvent = {
  id: string;
  name: string;
  eventType: string;
  status: string;
  severity: string;
  source: string;
  startsAt: string;
  endsAt?: string;
  affectedAreas: Array<{
    id: string;
    administrativeAreaCode: string;
    administrativeAreaName: string;
    severity: string;
  }>;
};
export type WorklistSummary = {
  id: string;
  name: string;
  status: string;
  generatedCount: number;
  generationComplete: boolean;
  climateEvent: { id: string; name: string; eventType: string };
  programme: { id: string; name: string; code: string };
  _count: { entries: number };
};
export type WorklistDetail = WorklistSummary & {
  entries: Array<{
    id: string;
    eligibility: string;
    eligibilityReason: string;
    priority: string;
    status: string;
    child: {
      id: string;
      medfinetId: string;
      firstName: string;
      lastName: string;
    };
    deliveries: Array<Record<string, unknown>>;
    referrals: Array<Record<string, unknown>>;
  }>;
};

export const medfinetOperationsApi = {
  caregivers: (orgId: string, search?: string) =>
    request<OperationsCaregiver[]>(query("/caregivers", { search }), {
      organizationId: orgId,
      purpose: "caregiver-operations",
    }),
  appointments: (orgId: string, status?: string) =>
    request<OperationsAppointment[]>(query("/appointments", { status }), {
      organizationId: orgId,
      purpose: "appointment-operations",
    }),
  respondToAppointment: (
    orgId: string,
    appointmentId: string,
    body: {
      decision: "CONFIRMED" | "RESCHEDULE_REQUESTED";
      idempotencyKey: string;
      preferredStart?: string;
      preferredEnd?: string;
    },
  ) =>
    request(
      `/appointments/${encodeURIComponent(appointmentId)}/caregiver-response`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "appointment-response",
      },
    ),
  emergencyAccess: (orgId: string, reviewStatus?: string) =>
    request<Array<Record<string, unknown>>>(
      query("/emergency-access", { reviewStatus }),
      { organizationId: orgId, purpose: "emergency-access-review" },
    ),
  climateEvents: (orgId: string, status?: string) =>
    request<ClimateEvent[]>(query("/climate-events", { status }), {
      organizationId: orgId,
      purpose: "climate-response",
    }),
  worklists: (orgId: string, status?: string) =>
    request<WorklistSummary[]>(query("/worklists", { status }), {
      organizationId: orgId,
      purpose: "climate-response",
    }),
  worklist: (orgId: string, worklistId: string) =>
    request<WorklistDetail>(`/worklists/${encodeURIComponent(worklistId)}`, {
      organizationId: orgId,
      purpose: "climate-response",
    }),
  devices: (orgId: string, status?: string) =>
    request<Array<Record<string, unknown>>>(query("/devices", { status }), {
      organizationId: orgId,
      purpose: "device-administration",
    }),
  rewardAccounts: (orgId: string) =>
    request<Array<Record<string, unknown>>>("/reward-accounts", {
      organizationId: orgId,
      purpose: "rewards-administration",
    }),
  rewardRedemptions: (orgId: string) =>
    request<Array<Record<string, unknown>>>("/reward-redemptions", {
      organizationId: orgId,
      purpose: "rewards-administration",
    }),
};
