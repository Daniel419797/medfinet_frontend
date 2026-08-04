import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetTelemedicineApi = {
  listDoctors(orgId: string, params?: { specialty?: string; available?: boolean }) {
    const q = new URLSearchParams();
    if (params?.specialty) q.set('specialty', params.specialty);
    if (params?.available !== undefined) q.set('available', String(params.available));
    const qs = q.toString();
    return request<Array<{
      id: string; name: string; specialty: string; rating: number; experience: number;
      avatar: string; available: boolean; price: number; nextAvailable: string;
    }>>(`/telemedicine/doctors${qs ? `?${qs}` : ''}`, { organizationId: orgId });
  },
  getDoctor(orgId: string, doctorId: string) {
    return request<any>(`/telemedicine/doctors/${encodeURIComponent(doctorId)}`, { organizationId: orgId });
  },
  bookConsultation(orgId: string, body: { doctorId: string; type: string; scheduledAt: string; notes?: string }) {
    return request<any>('/telemedicine/consultations', { method: 'POST', body, organizationId: orgId });
  },
  listConsultations(orgId: string) {
    return request<any[]>('/telemedicine/consultations', { organizationId: orgId });
  },
  getConsultation(orgId: string, id: string) {
    return request<any>(`/telemedicine/consultations/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
};
