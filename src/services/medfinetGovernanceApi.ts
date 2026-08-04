import { medfinetRequest as request } from "./medfinetApiClient";

export const medfinetGovernanceApi = {
  // Audit
  listAuditEvents(
    orgId: string,
    params?: { actorSubjectId?: string; action?: string; limit?: number },
  ) {
    const q = new URLSearchParams();
    if (params?.actorSubjectId) q.set("actorSubjectId", params.actorSubjectId);
    if (params?.action) q.set("action", params.action);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<
      Array<{
        id: string;
        action: string;
        actorSubjectId: string;
        entityType: string;
        entityId: string;
        purpose: string;
        createdAt: string;
      }>
    >(`/governance/audit-events${qs ? `?${qs}` : ""}`, {
      organizationId: orgId,
      purpose: "audit-view",
    });
  },

  // Retention Policies
  listRetentionPolicies(orgId: string) {
    return request<
      Array<{
        id: string;
        recordCategory: string;
        retentionDays: number;
        disposition: string;
        legalBasis: string;
        version: number;
        status: string;
      }>
    >("/governance/retention-policies", {
      organizationId: orgId,
      purpose: "governance-view",
    });
  },
  createRetentionPolicy(
    orgId: string,
    body: {
      recordCategory: string;
      retentionDays: number;
      disposition: "REVIEW_ONLY" | "DELETE";
      legalBasis: string;
    },
  ) {
    return request<{ id: string }>("/governance/retention-policies", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "governance-management",
    });
  },
  activateRetentionPolicy(orgId: string, policyId: string) {
    return request(
      `/governance/retention-policies/${encodeURIComponent(policyId)}/activate`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
  previewRetentionRun(orgId: string, policyId: string, idempotencyKey: string) {
    return request<{ id: string; candidateCount: number }>(
      `/governance/retention-policies/${encodeURIComponent(policyId)}/previews`,
      {
        method: "POST",
        body: { idempotencyKey },
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
  approveRetentionRun(orgId: string, runId: string) {
    return request(
      `/governance/retention-runs/${encodeURIComponent(runId)}/approve`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
  executeRetentionRun(orgId: string, runId: string) {
    return request(
      `/governance/retention-runs/${encodeURIComponent(runId)}/execute`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },

  // Legal Holds
  listLegalHolds(orgId: string) {
    return request<
      Array<{
        id: string;
        targetType: string;
        targetReference: string;
        reason: string;
        legalAuthority: string;
        status: string;
        placedAt: string;
        releasedAt?: string;
      }>
    >("/governance/legal-holds", {
      organizationId: orgId,
      purpose: "governance-view",
    });
  },
  placeLegalHold(
    orgId: string,
    body: {
      targetType: "CHILD" | "CAREGIVER" | "ORGANIZATION";
      targetReference: string;
      reason: string;
      legalAuthority: string;
    },
  ) {
    return request<{ id: string }>("/governance/legal-holds", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "governance-management",
    });
  },
  releaseLegalHold(orgId: string, holdId: string, releaseReason: string) {
    return request(
      `/governance/legal-holds/${encodeURIComponent(holdId)}/release`,
      {
        method: "POST",
        body: { releaseReason },
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },

  // Data Subject Requests
  listSubjectRequests(orgId: string) {
    return request<
      Array<{
        id: string;
        requestType: string;
        caregiverId?: string;
        childId?: string;
        status: string;
        requestDetails: string;
        submittedAt: string;
        dueAt: string;
        decidedAt?: string;
      }>
    >("/governance/data-subject-requests", {
      organizationId: orgId,
      purpose: "governance-view",
    });
  },
  submitSubjectRequest(
    orgId: string,
    body: {
      requestType:
        | "ACCESS"
        | "RECTIFICATION"
        | "ERASURE"
        | "RESTRICTION"
        | "PORTABILITY"
        | "OBJECTION";
      caregiverId?: string;
      childId?: string;
      requestDetails: string;
    },
  ) {
    return request<{ id: string }>("/governance/data-subject-requests", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "governance-request",
    });
  },
  verifySubjectRequest(orgId: string, requestId: string) {
    return request(
      `/governance/data-subject-requests/${encodeURIComponent(requestId)}/verify`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
  decideSubjectRequest(
    orgId: string,
    requestId: string,
    body: {
      decision: "APPROVED" | "DENIED";
      decisionReason: string;
    },
  ) {
    return request(
      `/governance/data-subject-requests/${encodeURIComponent(requestId)}/decide`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
  completeSubjectRequest(orgId: string, requestId: string) {
    return request(
      `/governance/data-subject-requests/${encodeURIComponent(requestId)}/complete`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "governance-management",
      },
    );
  },
};
