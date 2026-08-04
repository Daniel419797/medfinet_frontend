import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetInsuranceApi = {
  listPolicies(orgId: string) {
    return request<any[]>('/insurance/policies', { organizationId: orgId });
  },
  createPolicy(orgId: string, body: any) {
    return request<any>('/insurance/policies', { method: 'POST', body, organizationId: orgId });
  },
  getPolicy(orgId: string, id: string) {
    return request<any>(`/insurance/policies/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
  listClaims(orgId: string) {
    return request<any[]>('/insurance/claims', { organizationId: orgId });
  },
  submitClaim(orgId: string, body: any) {
    return request<any>('/insurance/claims', { method: 'POST', body, organizationId: orgId });
  },
  getClaim(orgId: string, id: string) {
    return request<any>(`/insurance/claims/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
  listPayments(orgId: string) {
    return request<any[]>('/insurance/payments', { organizationId: orgId });
  },
};
