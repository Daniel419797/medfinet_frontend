import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetDesignApi = {
  listTemplates(orgId: string, category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<any[]>(`/designs/templates${qs}`, { organizationId: orgId });
  },
  getTemplate(orgId: string, id: string) {
    return request<any>(`/designs/templates/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
  listCategories(orgId: string) {
    return request<string[]>('/designs/categories', { organizationId: orgId });
  },
  listUserDesigns(orgId: string) {
    return request<any[]>('/designs/user-designs', { organizationId: orgId });
  },
  saveDesign(orgId: string, body: { name: string; templateId: string; category: string; content: any }) {
    return request<any>('/designs/user-designs', { method: 'POST', body, organizationId: orgId });
  },
  deleteDesign(orgId: string, id: string) {
    return request<void>(`/designs/user-designs/${encodeURIComponent(id)}`, { method: 'DELETE', organizationId: orgId });
  },
  saveCertificate(orgId: string, body: any) {
    return request<any>('/designs/certificate', { method: 'POST', body, organizationId: orgId });
  },
  exportCertificate(orgId: string, id: string) {
    return request<{ format: string; downloadUrl: string }>(`/designs/certificate/${encodeURIComponent(id)}/export`, { method: 'POST', organizationId: orgId });
  },
};
