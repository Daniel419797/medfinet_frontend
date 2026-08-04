import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetClimateApi = {
  // Climate Profiles
  upsertProfile(orgId: string, childId: string, body: {
    administrativeAreaCode: string; vulnerability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    displaced: boolean; shelterCode?: string; hazardExposure?: Record<string, unknown>; assessedAt: string;
  }) {
    return request(`/children/${encodeURIComponent(childId)}/climate-profile`, {
      method: 'PUT', body, organizationId: orgId, purpose: 'climate-profile-management',
    });
  },

  // Climate Events
  createEvent(orgId: string, body: {
    name: string; eventType: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: string; externalReference?: string; startsAt: string; endsAt?: string;
  }) {
    return request<{ id: string }>('/climate-events', {
      method: 'POST', body, organizationId: orgId, purpose: 'climate-response',
    });
  },
  addAffectedArea(orgId: string, eventId: string, body: {
    administrativeAreaCode: string; administrativeAreaName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; affectedFrom: string;
    affectedUntil?: string; sourceEvidence?: Record<string, unknown>;
  }) {
    return request(`/climate-events/${encodeURIComponent(eventId)}/affected-areas`, {
      method: 'POST', body, organizationId: orgId, purpose: 'climate-response',
    });
  },
  transitionEvent(orgId: string, eventId: string, body: { status: 'ACTIVE' | 'CLOSED' | 'CANCELLED' }) {
    return request(`/climate-events/${encodeURIComponent(eventId)}/status`, {
      method: 'PATCH', body, organizationId: orgId, purpose: 'climate-response',
    });
  },

  // Worklists
  createWorklist(orgId: string, eventId: string, body: {
    name: string; programmeId: string; authorizationBasis: string;
    administrativeAreaCodes: string[]; minimumVulnerability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    displacedOnly: boolean;
  }) {
    return request<{ id: string }>(`/climate-events/${encodeURIComponent(eventId)}/worklists`, {
      method: 'POST', body, organizationId: orgId, purpose: 'climate-response',
    });
  },
  generateWorklist(orgId: string, worklistId: string) {
    return request(`/worklists/${encodeURIComponent(worklistId)}/generate`, {
      method: 'POST', organizationId: orgId, purpose: 'climate-response',
    });
  },
  authorizeWorklist(orgId: string, worklistId: string) {
    return request(`/worklists/${encodeURIComponent(worklistId)}/authorize`, {
      method: 'POST', organizationId: orgId, purpose: 'climate-response',
    });
  },

  // Service Delivery
  recordDelivery(orgId: string, entryId: string, body: {
    category: string; quantity: number; unit: string; deliveredAt: string;
    notes?: string; sourceOperationId: string;
  }) {
    return request(`/worklist-entries/${encodeURIComponent(entryId)}/deliveries`, {
      method: 'POST', body, organizationId: orgId, purpose: 'service-delivery',
    });
  },

  // Referrals
  createReferral(orgId: string, entryId: string, body: {
    referralType: string; destination: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reason: string; sourceOperationId: string;
  }) {
    return request(`/worklist-entries/${encodeURIComponent(entryId)}/referrals`, {
      method: 'POST', body, organizationId: orgId, purpose: 'referral-creation',
    });
  },
  transitionReferral(orgId: string, referralId: string, body: {
    status: 'ACCEPTED' | 'COMPLETED' | 'CANCELLED'; closureNotes?: string;
  }) {
    return request(`/referrals/${encodeURIComponent(referralId)}/status`, {
      method: 'PATCH', body, organizationId: orgId, purpose: 'referral-management',
    });
  },
};
