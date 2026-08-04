import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetConsentApi = {
  grantConsent(orgId: string, childId: string, body: {
    caregiverId: string; granteeOrganizationId: string; programmeId?: string;
    purpose: string; dataCategories: string[]; expiresAt?: string;
  }) {
    return request<{ id: string }>(`/children/${encodeURIComponent(childId)}/consents`, {
      method: 'POST', body, organizationId: orgId, purpose: 'consent-grant',
    });
  },
  listConsents(orgId: string, childId: string) {
    return request<Array<{
      id: string; programmeId?: string; purpose: string;
      dataCategories: string[]; status: string; grantedAt: string; expiresAt?: string;
    }>>(`/children/${encodeURIComponent(childId)}/consents`, {
      organizationId: orgId, purpose: 'consent-view',
    });
  },
  withdrawConsent(orgId: string, consentId: string) {
    return request(`/consents/${encodeURIComponent(consentId)}/withdraw`, {
      method: 'POST', organizationId: orgId, purpose: 'consent-withdrawal',
    });
  },
  evaluateDisclosure(orgId: string, childId: string, body: {
    requestingOrganizationId: string; purpose: string; dataCategories: string[];
  }) {
    return request<{
      allowed: boolean; scopedCategories: string[];
      consentId?: string; expiresAt?: string; restrictions: string[];
    }>(`/children/${encodeURIComponent(childId)}/disclosures/evaluate`, {
      method: 'POST', body, organizationId: orgId, purpose: 'disclosure-evaluation',
    });
  },
};