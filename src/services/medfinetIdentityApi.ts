import { medfinetRequest as request } from "./medfinetApiClient";

export const medfinetIdentityApi = {
  // Organizations
  createOrganization(
    orgId: string,
    body: { name: string; slug: string; programmeNames?: string[] },
  ) {
    return request<{ id: string; name: string; slug: string }>(
      "/organizations",
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "organization-management",
      },
    );
  },
  updateOrganizationStatus(
    orgId: string,
    body: { status: "ACTIVE" | "SUSPENDED"; reason: string },
  ) {
    return request(`/organization/status`, {
      method: "PATCH",
      body,
      organizationId: orgId,
      purpose: "organization-management",
    });
  },

  // Facilities
  listFacilities(orgId: string) {
    return request<
      Array<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        administrativeArea?: string;
        address?: string;
        phone?: string;
        openingHours?: Record<string, string>;
        programmeCategories?: string[];
        isTemporary: boolean;
        temporaryUntil?: string;
      }>
    >("/facilities", {
      organizationId: orgId,
      purpose: "facility-management",
    });
  },
  createFacility(
    orgId: string,
    body: {
      name: string;
      code: string;
      administrativeArea?: string;
      address?: string;
      phone?: string;
      openingHours?: Record<string, string>;
      programmeCategories?: string[];
      isTemporary?: boolean;
      temporaryUntil?: string;
    },
  ) {
    return request("/facilities", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "facility-management",
    });
  },
  updateFacility(
    orgId: string,
    facilityId: string,
    body: {
      name?: string;
      administrativeArea?: string;
      address?: string;
      phone?: string;
      openingHours?: Record<string, string>;
      programmeCategories?: string[];
      isTemporary?: boolean;
      temporaryUntil?: string;
      isActive?: boolean;
    },
  ) {
    return request(`/facilities/${encodeURIComponent(facilityId)}`, {
      method: "PATCH",
      body,
      organizationId: orgId,
      purpose: "facility-management",
    });
  },

  // Programmes
  listProgrammes(orgId: string) {
    return request<
      Array<{
        id: string;
        name: string;
        code: string;
        isActive: boolean;
        startsAt?: string;
        endsAt?: string;
      }>
    >("/programmes", {
      organizationId: orgId,
      purpose: "programme-management",
    });
  },
  createProgramme(
    orgId: string,
    body: { name: string; code: string; startsAt?: string; endsAt?: string },
  ) {
    return request("/programmes", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "programme-management",
    });
  },
  updateProgramme(
    orgId: string,
    programmeId: string,
    body: {
      name?: string;
      startsAt?: string;
      endsAt?: string;
      isActive?: boolean;
    },
  ) {
    return request(`/programmes/${encodeURIComponent(programmeId)}`, {
      method: "PATCH",
      body,
      organizationId: orgId,
      purpose: "programme-management",
    });
  },

  // Children
  registerChild(
    orgId: string,
    body: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      sex: string;
      confirmedDistinctFromIds?: string[];
    },
  ) {
    return request<{ id: string; medfinetId: string }>("/children", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "child-registration",
    });
  },
  listChildren(
    orgId: string,
    params?: { cursor?: string; limit?: number; programmeId?: string },
  ) {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.programmeId) q.set("programmeId", params.programmeId);
    const qs = q.toString();
    return request<{
      items: Array<{
        id: string;
        medfinetId: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        sex: string;
        status: string;
        createdAt: string;
      }>;
      nextCursor?: string;
    }>(`/children${qs ? `?${qs}` : ""}`, {
      organizationId: orgId,
      purpose: "child-lookup",
    });
  },
  searchChildren(
    orgId: string,
    query: { firstName: string; lastName: string; dateOfBirth: string },
  ) {
    return request<
      Array<{
        id: string;
        medfinetId: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
      }>
    >(
      `/children/search?firstName=${encodeURIComponent(query.firstName)}&lastName=${encodeURIComponent(query.lastName)}&dateOfBirth=${encodeURIComponent(query.dateOfBirth)}`,
      {
        organizationId: orgId,
        purpose: "child-search",
      },
    );
  },
  getChild(orgId: string, childId: string) {
    return request<{
      id: string;
      medfinetId: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      sex: string;
      status: string;
      createdAt: string;
      caregivers: Array<{
        caregiver: {
          id: string;
          firstName: string;
          lastName: string;
          phone?: string;
        };
        relationship: string;
        isPrimary: boolean;
        hasConsentAuthority: boolean;
      }>;
    }>(`/children/${encodeURIComponent(childId)}`, {
      organizationId: orgId,
      purpose: "child-profile-view",
    });
  },

  // Caregivers
  getMyCaregiverProfile(orgId: string) {
    return request<{
      id: string;
      firstName: string;
      lastName: string;
      preferredLanguage: string;
      phone?: string;
      phoneVerifiedAt?: string;
      email?: string;
      children: Array<{
        relationship: string;
        isPrimary: boolean;
        hasConsentAuthority: boolean;
        child: {
          id: string;
          medfinetId: string;
          firstName: string;
          lastName: string;
          status: string;
        };
      }>;
    }>("/me/caregiver", {
      organizationId: orgId,
      purpose: "caregiver-profile-view",
    });
  },
  createCaregiver(
    orgId: string,
    body: {
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      preferredLanguage?: string;
      subjectId?: string;
    },
  ) {
    return request<{ id: string }>("/caregivers", {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "caregiver-registration",
    });
  },
  linkCaregiver(
    orgId: string,
    childId: string,
    body: {
      caregiverId: string;
      relationship: "MOTHER" | "FATHER" | "GUARDIAN" | "RELATIVE" | "OTHER";
      isPrimary?: boolean;
      hasConsentAuthority?: boolean;
    },
  ) {
    return request(`/children/${encodeURIComponent(childId)}/caregivers`, {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "caregiver-linking",
    });
  },

  // Identity Amendments
  listAmendments(orgId: string, childId: string) {
    return request<
      Array<{
        id: string;
        status: string;
        reason: string;
        requestedAt: string;
        requestedBySubjectId: string;
        previousData?: Record<string, unknown>;
        proposedData: Record<string, unknown>;
        reviewReason?: string;
      }>
    >(`/children/${encodeURIComponent(childId)}/identity-amendments`, {
      organizationId: orgId,
      purpose: "identity-audit",
    });
  },
  requestAmendment(
    orgId: string,
    childId: string,
    body: {
      reason: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      sex?: string;
    },
  ) {
    return request(
      `/children/${encodeURIComponent(childId)}/identity-amendments`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "identity-amendment",
      },
    );
  },
  reviewAmendment(
    orgId: string,
    amendmentId: string,
    body: {
      decision: "APPLY" | "REJECT";
      reviewReason: string;
    },
  ) {
    return request(
      `/identity-amendments/${encodeURIComponent(amendmentId)}/review`,
      {
        method: "POST",
        body,
        organizationId: orgId,
        purpose: "identity-amendment-review",
      },
    );
  },

  // Child Identifiers
  listIdentifiers(orgId: string, childId: string) {
    return request<
      Array<{
        id: string;
        system: string;
        value: string;
        status: string;
        verifiedAt?: string;
        createdBySubjectId: string;
        isPrimary: boolean;
        evidenceReference?: string;
      }>
    >(`/children/${encodeURIComponent(childId)}/identifiers`, {
      organizationId: orgId,
      purpose: "identifier-lookup",
    });
  },
  createIdentifier(
    orgId: string,
    childId: string,
    body: {
      system: string;
      value: string;
      isPrimary?: boolean;
      evidenceReference?: string;
    },
  ) {
    return request(`/children/${encodeURIComponent(childId)}/identifiers`, {
      method: "POST",
      body,
      organizationId: orgId,
      purpose: "identifier-registration",
    });
  },
  verifyIdentifier(orgId: string, identifierId: string) {
    return request(
      `/child-identifiers/${encodeURIComponent(identifierId)}/verify`,
      {
        method: "POST",
        organizationId: orgId,
        purpose: "identifier-verification",
      },
    );
  },
  revokeIdentifier(orgId: string, identifierId: string, reason: string) {
    return request(
      `/child-identifiers/${encodeURIComponent(identifierId)}/revoke`,
      {
        method: "POST",
        body: { reason },
        organizationId: orgId,
        purpose: "identifier-revocation",
      },
    );
  },

  // Memberships
  listMemberships(orgId: string) {
    return request<
      Array<{
        id: string;
        subjectId: string;
        role: string;
        status: string;
        scopeMode: "GLOBAL" | "SCOPED";
        facilityScopes: Array<{ facilityId: string }>;
        programmeScopes: Array<{ programmeId: string }>;
      }>
    >("/organization-memberships", {
      organizationId: orgId,
      purpose: "membership-management",
    });
  },
  upsertMembership(
    orgId: string,
    body: {
      subjectId: string;
      role: string;
      status?: string;
      scopeMode?: "GLOBAL" | "SCOPED";
    },
  ) {
    return request<{
      id: string;
      subjectId: string;
      role: string;
      status: string;
      scopeMode: "GLOBAL" | "SCOPED";
    }>("/organization-memberships", {
      method: "PUT",
      body,
      organizationId: orgId,
      purpose: "membership-management",
    });
  },
  replaceMembershipScopes(
    orgId: string,
    membershipId: string,
    body: { facilityIds: string[]; programmeIds: string[] },
  ) {
    return request(
      `/organization-memberships/${encodeURIComponent(membershipId)}/resource-scopes`,
      {
        method: "PUT",
        body,
        organizationId: orgId,
        purpose: "membership-management",
      },
    );
  },

  // Credentials
  issueCredential(orgId: string, childId: string, body: { kind: string; expiresAt?: string }) {
    return request<{ credential: Record<string, unknown>; token: string }>(
      `/children/${encodeURIComponent(childId)}/credentials`,
      { method: "POST", body, organizationId: orgId, purpose: "credential-issuance" },
    );
  },
  issueCredentialsBulk(orgId: string, body: { credentials: Array<{ childId: string; kind: string; expiresAt?: string }> }) {
    return request<Array<{ childId: string; credential: Record<string, unknown>; token: string }>>(
      "/credentials/bulk",
      { method: "POST", body, organizationId: orgId, purpose: "credential-bulk-issuance" },
    );
  },
  listCredentials(orgId: string, childId?: string) {
    const qs = childId ? `?childId=${encodeURIComponent(childId)}` : "";
    return request<Array<{
      id: string; childId: string; kind: string; status: string;
      issuedBySubjectId: string; issuedAt: string; expiresAt?: string;
    }>>(`/credentials${qs}`, { organizationId: orgId, purpose: "credential-list" });
  },
  getCredential(orgId: string, credentialId: string) {
    return request<{
      id: string; childId: string; kind: string; status: string;
      issuedBySubjectId: string; issuedAt: string; expiresAt?: string;
      child?: { firstName: string; lastName: string; medfinetId: string };
    }>(`/credentials/${encodeURIComponent(credentialId)}`, {
      organizationId: orgId, purpose: "credential-detail",
    });
  },
  resolveCredential(orgId: string, token: string) {
    return request<Record<string, unknown>>("/credentials/resolve", {
      method: "POST", body: { token }, organizationId: orgId, purpose: "credential-resolve",
    });
  },

  // NFC Bindings
  getNfcBinding(orgId: string, bindingId: string) {
    return request<{
      id: string; childId: string; credentialId?: string; publicId: string;
      status: string; activatedAt?: string; revokedAt?: string; createdAt: string;
    }>(`/nfc-bindings/${encodeURIComponent(bindingId)}`, {
      organizationId: orgId, purpose: "nfc-binding-view",
    });
  },
};
