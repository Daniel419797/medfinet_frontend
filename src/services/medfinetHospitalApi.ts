import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetHospitalApi = {
  register(orgId: string, body: any) {
    return request<any>('/hospitals/register', { method: 'POST', body, organizationId: orgId });
  },
  list(orgId: string) {
    return request<any[]>('/hospitals', { organizationId: orgId });
  },
  get(orgId: string, id: string) {
    return request<any>(`/hospitals/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
};
