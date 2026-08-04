import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetInvoiceApi = {
  listMarketplace(orgId: string) {
    return request<any[]>('/invoices/marketplace', { organizationId: orgId });
  },
  getInvoice(orgId: string, id: string) {
    return request<any>(`/invoices/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
  fundInvoice(orgId: string, id: string, body: { amount: number; funderWallet: string }) {
    return request<any>(`/invoices/${encodeURIComponent(id)}/fund`, { method: 'POST', body, organizationId: orgId });
  },
  createInvoice(orgId: string, body: any) {
    return request<any>('/invoices', { method: 'POST', body, organizationId: orgId });
  },
  listUserInvoices(orgId: string) {
    return request<any[]>('/invoices/user/invoices', { organizationId: orgId });
  },
};
