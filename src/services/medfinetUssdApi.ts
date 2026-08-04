import { medfinetRequest as request } from './medfinetApiClient';

export type UssdQueueType = 'appointments' | 'callbacks' | 'cards' | 'programmes' | 'deliveries' | 'climate';
export type UssdQueueStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type UssdQueueItem = {
  id: string;
  status: UssdQueueStatus;
  createdAt: string;
  [key: string]: unknown;
};

export const medfinetUssdApi = {
  configureAccess(orgId: string, caregiverId: string, body: { phone: string; pin: string; locale: 'en' | 'ha' | 'yo' | 'ig' }) {
    return request(`/caregivers/${encodeURIComponent(caregiverId)}/ussd-access`, { method: 'PUT', body, organizationId: orgId, purpose: 'ussd-access-administration' });
  },
  publishFacility(orgId: string, facilityId: string) {
    return request(`/facilities/${encodeURIComponent(facilityId)}/ussd-directory`, { method: 'POST', organizationId: orgId, purpose: 'ussd-directory-publication' });
  },
  createConsentRequest(orgId: string, body: {
    childId: string;
    caregiverId: string;
    recipientType: 'ORGANIZATION' | 'PROGRAMME' | 'PARTNER' | 'RESEARCH';
    recipientId: string;
    recipientDisplayName: string;
    purpose: string;
    legalBasis: string;
    policyVersion: string;
    requestedScopes: Array<{ category: string; access: 'READ' }>;
    expiresAt: string;
  }) {
    return request('/ussd/consent-requests', { method: 'POST', body, organizationId: orgId, purpose: 'ussd-consent-request' });
  },
  listQueue(orgId: string, type: UssdQueueType, status: UssdQueueStatus) {
    return request<UssdQueueItem[]>(`/ussd/queues/${type}?status=${status}`, { organizationId: orgId, purpose: 'ussd-operations-review' });
  },
  review(orgId: string, type: UssdQueueType, id: string, body: { status: UssdQueueStatus; notes?: string }) {
    return request(`/ussd/queues/${type}/${encodeURIComponent(id)}/review`, { method: 'POST', body, organizationId: orgId, purpose: 'ussd-operations-review' });
  },
};
